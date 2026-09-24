using System.Collections.Concurrent;
using System.Net;
using System.Text;
using System.Text.Json;
using System.Xml.Linq;
using Azure;
using Azure.Core.Pipeline;
using Azure.Storage.Blobs;
using Azure.Storage.Queues;
using Microsoft.Azure.Cosmos;
using PWABuilder.MicrosoftStore.Jobs;
using PWABuilder.MicrosoftStore.Models;
using Xunit;

namespace PWABuilder.MicrosoftStore.Tests;

/// <summary>
/// Exercises the Azure SDK providers without network access or Azure resources.
/// </summary>
public sealed class WindowsPackageJobStorageTests
{
    private const string JobId = "0123456789abcdef0123456789abcdef";

    private const string AttemptId = "fedcba9876543210fedcba9876543210";

    /// <summary>
    /// Private inputs precede the outbox document and preserve raw manifests.
    /// </summary>
    [Fact]
    public async Task CreateAsync_PersistsImmutableInputBeforeCamelCaseJob()
    {
        using var fixture = new Fixture();
        using var manifest = JsonDocument.Parse("""{"name":"Example","icons":[{"src":"/icon.png"}]}""");
        using var store = fixture.CreateStore();
        await store.CreateAsync(CreateJob(), CreateInput(manifest), CancellationToken.None);

        var writes = fixture.Requests.Where(request => request.Method != HttpMethod.Get).ToArray();
        Assert.Equal(2, writes.Length);
        Assert.Equal($"/packages/inputs/{JobId}.json", writes[0].Uri.AbsolutePath);
        Assert.Equal("*", writes[0].Headers["If-None-Match"]);
        using var input = JsonDocument.Parse(writes[0].Body);
        Assert.Equal("Example", input.RootElement.GetProperty("options").GetProperty("manifest").GetProperty("name").GetString());
        Assert.Equal("Partner", input.RootElement.GetProperty("analytics").GetProperty("platformId").GetString());
        using var job = JsonDocument.Parse(writes[1].Body);
        Assert.Equal(JobId, job.RootElement.GetProperty("id").GetString());
        Assert.True(job.RootElement.GetProperty("needsDispatch").GetBoolean());
        Assert.Equal("Queued", job.RootElement.GetProperty("status").GetString());
        Assert.Equal(3600, job.RootElement.GetProperty("ttl").GetInt32());
        Assert.True(job.RootElement.TryGetProperty("createdAt", out _));
        Assert.False(job.RootElement.TryGetProperty("ETag", out _));
        Assert.False(job.RootElement.TryGetProperty("eTag", out _));
        Assert.False(job.RootElement.TryGetProperty("_etag", out _));
        Assert.Equal($"[\"{JobId}\"]", writes[1].Headers["x-ms-documentdb-partitionkey"]);
    }

    /// <summary>
    /// A failed input upload cannot create a dispatchable job.
    /// </summary>
    [Fact]
    public async Task CreateAsync_WhenInputUploadFails_DoesNotWriteJob()
    {
        using var fixture = new Fixture { BlobStatus = HttpStatusCode.PreconditionFailed };
        using var store = fixture.CreateStore();
        await Assert.ThrowsAsync<RequestFailedException>(() => store.CreateAsync(CreateJob(), CreateInput(), CancellationToken.None));
        Assert.DoesNotContain(fixture.Requests, request => request.Uri.Host == "cosmos.invalid" && request.Method == HttpMethod.Post);
    }

    /// <summary>
    /// A failed metadata write leaves an orphan input for lifecycle cleanup.
    /// </summary>
    [Fact]
    public async Task CreateAsync_WhenCosmosWriteFails_DoesNotDeleteInput()
    {
        using var fixture = new Fixture { CosmosStatus = HttpStatusCode.Forbidden };
        using var store = fixture.CreateStore();
        await Assert.ThrowsAsync<CosmosException>(() => store.CreateAsync(CreateJob(), CreateInput(), CancellationToken.None));
        Assert.Contains(fixture.Requests, request => request.Uri.AbsolutePath == $"/packages/inputs/{JobId}.json");
        Assert.DoesNotContain(fixture.Requests, request => request.Method == HttpMethod.Delete);
    }

    /// <summary>
    /// Reads restore revisions from Cosmos response headers.
    /// </summary>
    [Fact]
    public async Task GetAsync_ReturnsResponseETag()
    {
        using var fixture = new Fixture();
        using var store = fixture.CreateStore();
        var job = await store.GetAsync(JobId, CancellationToken.None);
        Assert.Equal(JobId, job!.Id);
        Assert.Equal("\"response-etag\"", job.ETag);
    }

    /// <summary>
    /// Outbox results keep system revisions and use a bounded oldest-first query.
    /// </summary>
    [Fact]
    public async Task GetPendingDispatchAsync_ReturnsProjectedETagFromBoundedQuery()
    {
        using var fixture = new Fixture();
        using var store = fixture.CreateStore();
        var pending = await store.GetPendingDispatchAsync(CancellationToken.None);
        var job = Assert.Single(pending);
        Assert.Equal(JobId, job.Id);
        Assert.Equal("\"outbox-etag\"", job.ETag);
        var request = Assert.Single(fixture.Requests, request =>
            request.Headers.TryGetValue("x-ms-documentdb-isquery", out var value) && value == "True");
        using var query = JsonDocument.Parse(request.Body);
        var text = query.RootElement.GetProperty("query").GetString()!;
        Assert.Contains("TOP 50", text);
        Assert.Contains("c.needsDispatch = true", text);
        Assert.Contains("c.status = @status", text);
        Assert.Contains("ORDER BY c.createdAt", text);
        Assert.Contains("c._etag", text);
    }

    /// <summary>
    /// Continuation pages preserve each job's independent concurrency revision.
    /// </summary>
    [Fact]
    public async Task GetPendingDispatchAsync_ReadsContinuationPages()
    {
        using var fixture = new Fixture { OutboxPages = 2 };
        using var store = fixture.CreateStore();
        var pending = await store.GetPendingDispatchAsync(CancellationToken.None);
        Assert.Equal(2, pending.Count);
        Assert.Equal("\"outbox-etag\"", pending[0].ETag);
        Assert.Equal("\"outbox-etag-1\"", pending[1].ETag);
        Assert.NotEqual(pending[0].Id, pending[1].Id);
    }

    /// <summary>
    /// A full batch does not continue draining the outbox.
    /// </summary>
    [Fact]
    public async Task GetPendingDispatchAsync_StopsAt50Records()
    {
        using var fixture = new Fixture { OutboxPages = 2, OutboxPageSize = 50 };
        using var store = fixture.CreateStore();
        var pending = await store.GetPendingDispatchAsync(CancellationToken.None);
        Assert.Equal(50, pending.Count);
        Assert.Single(fixture.Requests, request => request.Headers.ContainsKey("x-ms-documentdb-isquery"));
    }

    /// <summary>
    /// Only missing metadata is translated into a missing job.
    /// </summary>
    [Theory]
    [InlineData(HttpStatusCode.NotFound)]
    [InlineData(HttpStatusCode.Forbidden)]
    public async Task GetAsync_OnlyNotFoundReturnsNull(HttpStatusCode status)
    {
        using var fixture = new Fixture { CosmosStatus = status };
        using var store = fixture.CreateStore();
        if (status is HttpStatusCode.NotFound)
        {
            Assert.Null(await store.GetAsync(JobId, CancellationToken.None));
        }
        else
        {
            await Assert.ThrowsAsync<CosmosException>(() => store.GetAsync(JobId, CancellationToken.None));
        }
    }

    /// <summary>
    /// Updates fence ownership with the supplied ETag and return the new revision.
    /// </summary>
    [Fact]
    public async Task TryReplaceAsync_UsesIfMatchAndReturnsNewETag()
    {
        using var fixture = new Fixture();
        using var store = fixture.CreateStore();
        var updated = await store.TryReplaceAsync(CreateJob() with { ETag = "\"old-etag\"" }, CancellationToken.None);
        var write = Assert.Single(fixture.Requests, request => request.Method == HttpMethod.Put);
        Assert.Equal("\"old-etag\"", write.Headers["If-Match"]);
        Assert.Equal("\"response-etag\"", updated!.ETag);
    }

    /// <summary>
    /// Unconditional metadata overwrites are not permitted.
    /// </summary>
    [Theory]
    [InlineData("")]
    [InlineData(" ")]
    [InlineData("*")]
    public async Task TryReplaceAsync_RejectsMissingETag(string etag)
    {
        using var fixture = new Fixture();
        using var store = fixture.CreateStore();
        await Assert.ThrowsAsync<ArgumentException>(() => store.TryReplaceAsync(CreateJob() with { ETag = etag }, CancellationToken.None));
        Assert.DoesNotContain(fixture.Requests, request => request.Method == HttpMethod.Put);
    }

    /// <summary>
    /// Only failed optimistic concurrency checks represent lost ownership.
    /// </summary>
    [Theory]
    [InlineData(HttpStatusCode.PreconditionFailed)]
    [InlineData(HttpStatusCode.Forbidden)]
    [InlineData(HttpStatusCode.NotFound)]
    public async Task TryReplaceAsync_OnlyPreconditionFailureReturnsNull(HttpStatusCode status)
    {
        using var fixture = new Fixture { CosmosStatus = status };
        using var store = fixture.CreateStore();
        if (status is HttpStatusCode.PreconditionFailed)
        {
            Assert.Null(await store.TryReplaceAsync(CreateJob(), CancellationToken.None));
        }
        else
        {
            await Assert.ThrowsAsync<CosmosException>(() => store.TryReplaceAsync(CreateJob(), CancellationToken.None));
        }
    }

    /// <summary>
    /// Stored input JSON restores the manifest as a usable JsonDocument.
    /// </summary>
    [Fact]
    public async Task ReadInputAsync_DeserializesWebJsonAndManifest()
    {
        using var fixture = new Fixture
        {
            BlobBody = Encoding.UTF8.GetBytes("""{"options":{"url":"https://example.com","manifest":{"name":"Restored"}},"analytics":{"platformId":"Partner"}}""")
        };
        using var store = fixture.CreateStore();
        var input = await store.ReadInputAsync(JobId, CancellationToken.None);
        using var manifest = input.Options.Manifest;
        Assert.Equal("Restored", manifest!.RootElement.GetProperty("name").GetString());
        Assert.Equal("Partner", input.Analytics.PlatformId);
    }

    /// <summary>
    /// Invalid input JSON never becomes a successful empty input.
    /// </summary>
    [Fact]
    public async Task ReadInputAsync_RejectsNullJson()
    {
        using var fixture = new Fixture { BlobBody = Encoding.UTF8.GetBytes("null") };
        using var store = fixture.CreateStore();
        await Assert.ThrowsAsync<JsonException>(() => store.ReadInputAsync(JobId, CancellationToken.None));
    }

    /// <summary>
    /// Artifacts use isolated, immutable attempt paths and streamed contents.
    /// </summary>
    [Fact]
    public async Task UploadArtifactAsync_UploadsFileToAttemptSpecificPath()
    {
        using var fixture = new Fixture();
        using var store = fixture.CreateStore();
        var path = Path.Combine(Directory.GetCurrentDirectory(), $"storage-test-{Guid.NewGuid():N}.zip");
        try
        {
            await File.WriteAllBytesAsync(path, [80, 75, 3, 4]);
            var name = await store.UploadArtifactAsync(JobId, AttemptId, path, CancellationToken.None);
            Assert.Equal($"artifacts/{JobId}/{AttemptId}.zip", name);
            var request = Assert.Single(fixture.Requests, request => request.Uri.Host == "blob.invalid");
            Assert.Equal($"/packages/{name}", request.Uri.AbsolutePath);
            Assert.Equal("*", request.Headers["If-None-Match"]);
            Assert.Equal([80, 75, 3, 4], request.Body);
        }
        finally
        {
            File.Delete(path);
        }
    }

    /// <summary>
    /// Download streams remain open until the caller disposes them.
    /// </summary>
    [Fact]
    public async Task OpenArtifactAsync_ReturnsReadableCallerOwnedStream()
    {
        using var fixture = new Fixture { BlobBody = [80, 75, 3, 4] };
        using var store = fixture.CreateStore();
        await using var stream = await store.OpenArtifactAsync($"artifacts/{JobId}/{AttemptId}.zip", CancellationToken.None);
        using var contents = new MemoryStream();
        await stream.CopyToAsync(contents);
        Assert.Equal(fixture.BlobBody, contents.ToArray());
    }

    /// <summary>
    /// Messages contain only the raw reference and do not expire in the queue.
    /// </summary>
    [Fact]
    public async Task SendAsync_UsesRawJobIdAndInfiniteTtl()
    {
        using var fixture = new Fixture();
        var queue = fixture.CreateQueue();
        await queue.SendAsync(JobId, CancellationToken.None);
        var request = Assert.Single(fixture.Requests);
        Assert.Equal(JobId, XDocument.Load(new MemoryStream(request.Body)).Root!.Element("MessageText")!.Value);
        Assert.Contains("messagettl=-1", request.Uri.Query);
        Assert.Equal("/jobs/messages", request.Uri.AbsolutePath);
    }

    /// <summary>
    /// Receiving does not acknowledge, including malformed queue messages.
    /// </summary>
    [Theory]
    [InlineData(JobId)]
    [InlineData("invalid-job-reference")]
    public async Task ReceiveAsync_PreservesMessageWithoutDeleting(string jobId)
    {
        using var fixture = new Fixture { QueueBody = jobId };
        var queue = fixture.CreateQueue();
        var message = await queue.ReceiveAsync(CancellationToken.None);
        Assert.Equal(new PackageJobMessage("message-id", "old-receipt", jobId, 4), message);
        var request = Assert.Single(fixture.Requests);
        Assert.Equal(HttpMethod.Get, request.Method);
        Assert.Contains("visibilitytimeout=120", request.Uri.Query);
    }

    /// <summary>
    /// An empty queue is distinct from a storage failure.
    /// </summary>
    [Fact]
    public async Task ReceiveAsync_EmptyQueueReturnsNull()
    {
        using var fixture = new Fixture { QueueBody = null };
        Assert.Null(await fixture.CreateQueue().ReceiveAsync(CancellationToken.None));
    }

    /// <summary>
    /// Renewals pass the latest receipt to subsequent acknowledgements.
    /// </summary>
    [Fact]
    public async Task RenewAsync_ReturnsNewPopReceiptUsedForDelete()
    {
        using var fixture = new Fixture();
        var queue = fixture.CreateQueue();
        var message = new PackageJobMessage("message-id", "old-receipt", JobId, 4);
        var renewed = await queue.RenewAsync(message, TimeSpan.FromSeconds(90), CancellationToken.None);
        Assert.Equal(message with { PopReceipt = "renewed-receipt" }, renewed);
        await queue.DeleteAsync(renewed, CancellationToken.None);
        Assert.Contains("popreceipt=old-receipt", fixture.Requests.ElementAt(0).Uri.Query);
        Assert.Contains("visibilitytimeout=90", fixture.Requests.ElementAt(0).Uri.Query);
        Assert.Contains("popreceipt=renewed-receipt", fixture.Requests.ElementAt(1).Uri.Query);
    }

    /// <summary>
    /// Invalid or stale acknowledgement receipts surface to the processor.
    /// </summary>
    [Fact]
    public async Task DeleteAsync_PropagatesStaleReceiptError()
    {
        using var fixture = new Fixture { QueueStatus = HttpStatusCode.BadRequest };
        var queue = fixture.CreateQueue();
        await Assert.ThrowsAsync<RequestFailedException>(() => queue.DeleteAsync(new("message-id", "stale", JobId, 4), CancellationToken.None));
    }

    /// <summary>
    /// Poison messages are bounded references, without acknowledging their source.
    /// </summary>
    [Fact]
    public async Task PoisonAsync_WritesSanitizedDiagnosticWithoutAcknowledging()
    {
        using var fixture = new Fixture();
        var queue = fixture.CreateQueue();
        var message = new PackageJobMessage("message-id\nunsafe", "receipt-secret", new string('x', 5000), 7);
        await queue.PoisonAsync(message, "invalid\n" + new string('!', 5000), CancellationToken.None);
        var request = Assert.Single(fixture.Requests);
        Assert.Equal("/jobs-poison/messages", request.Uri.AbsolutePath);
        Assert.Contains("messagettl=-1", request.Uri.Query);
        var text = XDocument.Load(new MemoryStream(request.Body)).Root!.Element("MessageText")!.Value;
        Assert.True(text.Length < 1024);
        Assert.DoesNotContain("receipt-secret", text);
        using var payload = JsonDocument.Parse(text);
        Assert.True(payload.RootElement.GetProperty("jobId").GetString()!.Length <= 64);
        Assert.DoesNotContain("\n", payload.RootElement.GetProperty("messageId").GetString()!);
        Assert.DoesNotContain("\n", payload.RootElement.GetProperty("reason").GetString()!);
        Assert.Equal(7, payload.RootElement.GetProperty("attempts").GetInt64());
    }

    /// <summary>
    /// Cancelled operations cannot be accepted or acknowledged.
    /// </summary>
    [Theory]
    [InlineData("create")]
    [InlineData("get")]
    [InlineData("pending")]
    [InlineData("replace")]
    [InlineData("input")]
    [InlineData("artifact")]
    [InlineData("send")]
    [InlineData("receive")]
    [InlineData("renew")]
    [InlineData("delete")]
    [InlineData("poison")]
    public async Task CancelledOperations_PropagateCancellation(string operation)
    {
        using var fixture = new Fixture();
        using var store = fixture.CreateStore();
        var queue = fixture.CreateQueue();
        using var cancellation = new CancellationTokenSource();
        cancellation.Cancel();
        var token = cancellation.Token;
        var message = new PackageJobMessage("message-id", "receipt", JobId, 1);
        await Assert.ThrowsAnyAsync<OperationCanceledException>(() => operation switch
        {
            "create" => store.CreateAsync(CreateJob(), CreateInput(), token),
            "get" => store.GetAsync(JobId, token),
            "pending" => store.GetPendingDispatchAsync(token),
            "replace" => store.TryReplaceAsync(CreateJob(), token),
            "input" => store.ReadInputAsync(JobId, token),
            "artifact" => store.OpenArtifactAsync($"artifacts/{JobId}/{AttemptId}.zip", token),
            "send" => queue.SendAsync(JobId, token),
            "receive" => queue.ReceiveAsync(token),
            "renew" => queue.RenewAsync(message, TimeSpan.FromSeconds(120), token),
            "delete" => queue.DeleteAsync(message, token),
            "poison" => queue.PoisonAsync(message, "invalid", token),
            _ => throw new ArgumentOutOfRangeException(nameof(operation))
        });
        Assert.DoesNotContain(fixture.Requests, request =>
            request.Uri.Host is "queue.invalid" or "blob.invalid" || request.Uri.AbsolutePath.Contains("/docs", StringComparison.Ordinal));
    }

    /// <summary>
    /// Builds deterministic metadata for provider tests.
    /// </summary>
    private static WindowsPackageJob CreateJob() => new()
    {
        Id = JobId,
        CreatedAt = DateTimeOffset.Parse("2026-09-08T12:00:00Z"),
        ExpiresAt = DateTimeOffset.Parse("2026-09-08T13:00:00Z"),
        Ttl = 3600,
        ETag = "\"old-etag\""
    };

    /// <summary>
    /// Builds private input with optional manifest data.
    /// </summary>
    private static WindowsPackageJobInput CreateInput(JsonDocument? manifest = null) => new()
    {
        Options = new WindowsAppPackageOptions { Url = new Uri("https://example.com"), Manifest = manifest },
        Analytics = new PackageJobAnalytics { PlatformId = "Partner" }
    };

    /// <summary>
    /// An SDK HTTP fixture whose transport never opens network connections.
    /// </summary>
    private sealed class Fixture : HttpMessageHandler
    {
        private int outboxPage;

        internal readonly ConcurrentQueue<CapturedRequest> Requests = [];

        internal HttpStatusCode BlobStatus = HttpStatusCode.OK;

        internal HttpStatusCode CosmosStatus = HttpStatusCode.OK;

        internal HttpStatusCode QueueStatus = HttpStatusCode.OK;

        internal byte[] BlobBody = [];

        internal string? QueueBody = JobId;

        internal int OutboxPages = 1;

        internal int OutboxPageSize = 1;

        /// <summary>
        /// Constructs the production store against an offline SDK transport.
        /// </summary>
        internal AzureWindowsPackageJobStore CreateStore()
        {
            var options = AzureWindowsPackageJobStore.CreateCosmosClientOptions();
            options.ConnectionMode = ConnectionMode.Gateway;
            options.LimitToEndpoint = true;
            options.HttpClientFactory = () => new HttpClient(this, disposeHandler: false);
            var cosmos = new CosmosClient("https://cosmos.invalid", Convert.ToBase64String(new byte[64]), options);
            var blobOptions = new BlobClientOptions { Transport = new HttpClientTransport(new HttpClient(this, disposeHandler: false)) };
            blobOptions.Retry.MaxRetries = 0;
            var blobs = new BlobContainerClient(new Uri("https://blob.invalid/packages"), blobOptions);
            return new AzureWindowsPackageJobStore(cosmos, blobs, "database", "jobs");
        }

        /// <summary>
        /// Constructs the production queue against an offline SDK transport.
        /// </summary>
        internal AzureWindowsPackageJobQueue CreateQueue()
        {
            var options = new QueueClientOptions
            {
                Transport = new HttpClientTransport(new HttpClient(this, disposeHandler: false)),
                MessageEncoding = QueueMessageEncoding.None
            };
            options.Retry.MaxRetries = 0;
            return new AzureWindowsPackageJobQueue(
                new QueueClient(new Uri("https://queue.invalid/jobs"), options),
                new QueueClient(new Uri("https://queue.invalid/jobs-poison"), options),
                new WindowsPackageJobOptions());
        }

        /// <inheritdoc/>
        protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            cancellationToken.ThrowIfCancellationRequested();
            var body = request.Content is null ? [] : await request.Content.ReadAsByteArrayAsync(cancellationToken);
            var headers = request.Headers.ToDictionary(header => header.Key, header => string.Join(",", header.Value), StringComparer.OrdinalIgnoreCase);
            var captured = new CapturedRequest(request.Method, request.RequestUri!, body, headers);
            Requests.Enqueue(captured);
            if (Requests.Count > 20)
            {
                throw new InvalidOperationException("Excess offline requests: " + string.Join(", ", Requests.Select(item => item.Uri.AbsolutePath)));
            }
            return request.RequestUri!.Host switch
            {
                "cosmos.invalid" => CosmosResponse(captured),
                "blob.invalid" => BlobResponse(captured),
                "queue.invalid" => QueueResponse(captured),
                _ => throw new InvalidOperationException("Unexpected network request.")
            };
        }

        /// <summary>
        /// Emulates Cosmos metadata discovery and point document operations.
        /// </summary>
        private HttpResponseMessage CosmosResponse(CapturedRequest request)
        {
            if (request.Uri.AbsolutePath is "/")
            {
                return JsonResponse(HttpStatusCode.OK, """
                    {"id":"offline","_rid":"AAAAAA==","writableLocations":[{"name":"West US","databaseAccountEndpoint":"https://cosmos.invalid/"}],"readableLocations":[{"name":"West US","databaseAccountEndpoint":"https://cosmos.invalid/"}],"userConsistencyPolicy":{"defaultConsistencyLevel":"Session"},"queryEngineConfiguration":"{\"maxSqlQueryInputLength\":262144}"}
                    """);
            }
            if (request.Method == HttpMethod.Get && request.Uri.AbsolutePath.TrimEnd('/') is "/dbs/database/colls/jobs")
            {
                return JsonResponse(HttpStatusCode.OK, """
                    {"id":"jobs","_rid":"PaYSALITqjg=","_self":"dbs/PaYSAA==/colls/PaYSALITqjg=/","partitionKey":{"paths":["/id"],"kind":"Hash","version":2}}
                    """);
            }
            if (request.Uri.AbsolutePath.EndsWith("/pkranges", StringComparison.Ordinal))
            {
                if (request.Headers.ContainsKey("If-None-Match"))
                {
                    return new HttpResponseMessage(HttpStatusCode.NotModified);
                }
                var ranges = JsonResponse(HttpStatusCode.OK, """
                    {"_rid":"PaYSALITqjg=","PartitionKeyRanges":[{"id":"0","minInclusive":"","maxExclusive":"FF"}],"_count":1}
                    """);
                ranges.Headers.TryAddWithoutValidation("ETag", "\"ranges-etag\"");
                return ranges;
            }
            if (request.Uri.AbsolutePath.Contains("/docs", StringComparison.Ordinal))
            {
                if (request.Headers.ContainsKey("x-ms-documentdb-isquery"))
                {
                    var documents = Enumerable.Range(outboxPage * OutboxPageSize, OutboxPageSize).Select(index =>
                    {
                        var rid = Convert.FromBase64String("PaYSALITqjgBAAAAAAAAAA==");
                        BitConverter.GetBytes(index + 1).CopyTo(rid, 8);
                        return new
                        {
                            _rid = Convert.ToBase64String(rid),
                            orderByItems = new[] { new { item = DateTimeOffset.Parse("2026-09-08T12:00:00Z").AddSeconds(index).ToString("O") } },
                            payload = new
                            {
                                job = new { id = index is 0 ? JobId : index.ToString("x32"), status = "Queued", needsDispatch = true },
                                _etag = index is 0 ? "\"outbox-etag\"" : $"\"outbox-etag-{index}\""
                            }
                        };
                    });
                    var page = JsonResponse(HttpStatusCode.OK, JsonSerializer.Serialize(new { Documents = documents, _count = OutboxPageSize }));
                    if (++outboxPage < OutboxPages)
                    {
                        page.Headers.TryAddWithoutValidation("x-ms-continuation", "next-page");
                    }
                    return page;
                }
                var content = request.Method == HttpMethod.Get
                    ? $$"""{"id":"{{JobId}}","status":"Queued","needsDispatch":true,"_etag":"\"document-etag\""}"""
                    : Encoding.UTF8.GetString(request.Body);
                var response = JsonResponse(CosmosStatus, content);
                response.Headers.TryAddWithoutValidation("etag", "\"response-etag\"");
                response.Headers.TryAddWithoutValidation("x-ms-request-charge", "1");
                response.Headers.TryAddWithoutValidation("x-ms-activity-id", "00000000-0000-0000-0000-000000000001");
                return response;
            }
            throw new InvalidOperationException($"Unexpected Cosmos request: {request.Method} {request.Uri}");
        }

        /// <summary>
        /// Emulates immutable uploads and streaming downloads.
        /// </summary>
        private HttpResponseMessage BlobResponse(CapturedRequest request)
        {
            var response = new HttpResponseMessage(BlobStatus is HttpStatusCode.OK && request.Method == HttpMethod.Put ? HttpStatusCode.Created : BlobStatus)
            {
                Content = new ByteArrayContent(request.Method == HttpMethod.Get ? BlobBody : [])
            };
            response.Headers.TryAddWithoutValidation("ETag", "\"blob-etag\"");
            response.Content.Headers.TryAddWithoutValidation("Last-Modified", "Tue, 08 Sep 2026 12:00:00 GMT");
            response.Headers.TryAddWithoutValidation("x-ms-blob-type", "BlockBlob");
            response.Content.Headers.ContentLength = request.Method == HttpMethod.Get ? BlobBody.Length : 0;
            return response;
        }

        /// <summary>
        /// Emulates queue receipts, sends, and explicit acknowledgements.
        /// </summary>
        private HttpResponseMessage QueueResponse(CapturedRequest request)
        {
            if (QueueStatus is not HttpStatusCode.OK)
            {
                return new HttpResponseMessage(QueueStatus)
                {
                    Content = new StringContent("<Error><Code>PopReceiptMismatch</Code><Message>Receipt mismatch.</Message></Error>", Encoding.UTF8, "application/xml")
                };
            }
            var content = request.Method == HttpMethod.Get && QueueBody is not null
                ? new XElement("QueueMessagesList", new XElement("QueueMessage",
                    new XElement("MessageId", "message-id"),
                    new XElement("PopReceipt", "old-receipt"),
                    new XElement("InsertionTime", "Tue, 08 Sep 2026 12:00:00 GMT"),
                    new XElement("ExpirationTime", "Fri, 31 Dec 9999 23:59:59 GMT"),
                    new XElement("TimeNextVisible", "Tue, 08 Sep 2026 12:02:00 GMT"),
                    new XElement("DequeueCount", 4),
                    new XElement("MessageText", QueueBody))).ToString()
                : "<QueueMessagesList />";
            if (request.Method == HttpMethod.Post)
            {
                content = """
                    <QueueMessagesList><QueueMessage><MessageId>message-id</MessageId><InsertionTime>Tue, 08 Sep 2026 12:00:00 GMT</InsertionTime><ExpirationTime>Fri, 31 Dec 9999 23:59:59 GMT</ExpirationTime><PopReceipt>old-receipt</PopReceipt><TimeNextVisible>Tue, 08 Sep 2026 12:02:00 GMT</TimeNextVisible></QueueMessage></QueueMessagesList>
                    """;
            }
            var status = request.Method == HttpMethod.Post ? HttpStatusCode.Created
                : request.Method == HttpMethod.Put || request.Method == HttpMethod.Delete ? HttpStatusCode.NoContent
                : HttpStatusCode.OK;
            var response = new HttpResponseMessage(status) { Content = new StringContent(content, Encoding.UTF8, "application/xml") };
            response.Headers.TryAddWithoutValidation("x-ms-popreceipt", "renewed-receipt");
            response.Headers.TryAddWithoutValidation("x-ms-time-next-visible", "Tue, 08 Sep 2026 12:03:00 GMT");
            return response;
        }

        /// <summary>
        /// Creates a JSON response for the SDK.
        /// </summary>
        private static HttpResponseMessage JsonResponse(HttpStatusCode status, string json) =>
            new(status) { Content = new StringContent(json, Encoding.UTF8, "application/json") };
    }

    /// <summary>
    /// A captured outbound SDK request.
    /// </summary>
    private sealed record CapturedRequest(HttpMethod Method, Uri Uri, byte[] Body, Dictionary<string, string> Headers);
}
