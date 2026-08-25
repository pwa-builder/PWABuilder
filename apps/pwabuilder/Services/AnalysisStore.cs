using System.Collections.Concurrent;
using System.Text.Json;
using Azure.Identity;
using Microsoft.Azure.Cosmos;
using Microsoft.Extensions.Options;
using PWABuilder.Models;

namespace PWABuilder.Services;

/// <summary>
/// Stores and retrieves <see cref="Analysis"/> objects.
/// </summary>
public interface IAnalysisStore
{
    /// <summary>
    /// Gets an analysis by ID.
    /// </summary>
    /// <param name="id">The analysis ID.</param>
    /// <returns>The analysis, or null if it does not exist.</returns>
    Task<Analysis?> GetByIdAsync(string id);

    /// <summary>
    /// Saves an analysis.
    /// </summary>
    /// <param name="analysis">The analysis to save.</param>
    /// <param name="expiration">Optional expiration timespan for the analysis. If not provided, a default expiration will be used based on the implementation.</param>
    /// <param name="cancellationToken">Optional cancellation token.</param>
    /// <returns>A task.</returns>
    Task SaveAsync(Analysis analysis, TimeSpan? expiration = null, CancellationToken cancellationToken = default);
}

/// <summary>
/// In-memory implementation of <see cref="IAnalysisStore"/> for local development.
/// </summary>
public sealed class InMemoryAnalysisStore : IAnalysisStore
{
    private readonly ConcurrentDictionary<string, Analysis> analyses = new();

    /// <inheritdoc/>
    public Task<Analysis?> GetByIdAsync(string id)
    {
        analyses.TryGetValue(id, out var analysis);
        return Task.FromResult(analysis);
    }

    /// <inheritdoc/>
    public Task SaveAsync(Analysis analysis, TimeSpan? expiration = null, CancellationToken cancellationToken = default)
    {
        analysis.LastModifiedAt = DateTimeOffset.UtcNow;
        analyses[analysis.Id] = analysis;
        return Task.CompletedTask;
    }
}

/// <summary>
/// Cosmos DB implementation of <see cref="IAnalysisStore"/>.
/// </summary>
public sealed class CosmosAnalysisStore : IAnalysisStore
{
    private static readonly int DefaultExpirationInSeconds = (int)TimeSpan.FromDays(14).TotalSeconds;

    /// <summary>
    /// The largest analysis we'll attempt to store. Cosmos DB rejects documents larger than 2MB with RequestEntityTooLarge (413),
    /// so we stay comfortably below that limit to leave room for the document wrapper and JSON escaping.
    /// </summary>
    private const long MaxAnalysisSizeInBytes = 1_500_000;

    /// <summary>
    /// The maximum length of a stored log entry or capability error message. Anything longer is truncated,
    /// as such text usually contains a base64-encoded image from the web manifest.
    /// </summary>
    private const int MaxTextLength = 1_000;

    private const string TruncationSuffix = "… (truncated because it was too large to store)";
    private static readonly string Base64ImagesManifestMessage = "The web manifest contains base64-encoded images, making it too large to store. The manifest contents were omitted from this analysis. Use links to external image files in your manifest rather than base64-encoded images.";
    private static readonly string LargeManifestMessage = "The web manifest is too large to store, so its contents were omitted from this analysis.";
    private static readonly JsonSerializerOptions CosmosJsonSerializerOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    private readonly ILogger<CosmosAnalysisStore> logger;
    private readonly Task<Container> containerTask;

    /// <summary>
    /// Creates a Cosmos-backed analysis store.
    /// </summary>
    /// <param name="settings">Application settings.</param>
    /// <param name="logger">Logger instance.</param>
    public CosmosAnalysisStore(IOptions<AppSettings> settings, ILogger<CosmosAnalysisStore> logger)
    {
        this.logger = logger;
        this.containerTask = InitializeContainerAsync(settings.Value);
    }

    /// <inheritdoc/>
    public async Task<Analysis?> GetByIdAsync(string id)
    {
        try
        {
            var container = await containerTask;
            var response = await container.ReadItemAsync<AnalysisCosmosDocument>(id, new PartitionKey(id));
            return response.Resource.Analysis;
        }
        catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
        {
            logger.LogWarning("Attempted to retrieve analysis {id} from Cosmos DB, but it does not exist.", id);
            return null;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error retrieving analysis {id} from Cosmos DB.", id);
            throw;
        }
    }

    /// <inheritdoc/>
    public async Task SaveAsync(Analysis analysis, TimeSpan? expiration = null, CancellationToken cancellationToken = default)
    {
        try
        {
            var container = await containerTask;
            analysis.LastModifiedAt = DateTimeOffset.UtcNow;

            var document = AnalysisCosmosDocument.Create(CreateStorableAnalysis(analysis), expiration.HasValue ? (int)expiration.Value.TotalSeconds : DefaultExpirationInSeconds);
            await container.UpsertItemAsync(document, new PartitionKey(document.Id), cancellationToken: cancellationToken);
            logger.LogInformation("Saved analysis {id} to Cosmos DB.", analysis.Id);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error saving analysis {id} to Cosmos DB.", analysis.Id);
            throw;
        }
    }

    /// <summary>
    /// Creates the analysis to store in Cosmos. Analyses can grow beyond Cosmos DB's maximum document size, causing saves to fail with
    /// RequestEntityTooLarge (413). This most commonly happens when a web manifest embeds base64-encoded images: the manifest itself can be
    /// several megabytes, and those same data URIs are echoed back inside capability error messages and logs.
    /// When the analysis is too large, we progressively drop the largest, least essential data until it fits, so that the analysis
    /// still completes rather than erroring out.
    /// </summary>
    /// <param name="analysis">The analysis to store.</param>
    /// <returns>The original analysis, or a trimmed copy of it if it's too large to store.</returns>
    private Analysis CreateStorableAnalysis(Analysis analysis)
    {
        var hasBase64Images = analysis.WebManifest?.ContainsBase64EncodedImages() == true;
        if (!hasBase64Images && GetJsonSizeInBytes(analysis) <= MaxAnalysisSizeInBytes)
        {
            return analysis;
        }

        // Copy the analysis so that we don't modify the in-memory analysis that's still being processed.
        var storable = CloneAnalysis(analysis);

        // Drop the manifest contents. Manifests with base64-encoded images can be several megabytes on their own.
        if (storable.WebManifest is not null)
        {
            storable.WebManifest = storable.WebManifest.WithoutManifestContents();
            storable.Logs.Add(hasBase64Images ? Base64ImagesManifestMessage : LargeManifestMessage);
        }

        // Data URIs from the manifest are echoed back inside capability error messages, e.g. "Fetching image data:image/png;base64,... failed".
        // Truncate any oversized error message so those don't blow up the document either.
        if (GetJsonSizeInBytes(storable) > MaxAnalysisSizeInBytes)
        {
            storable.Capabilities.ForEach(c => c.ErrorMessage = Truncate(c.ErrorMessage));
            for (var i = 0; i < storable.Logs.Count; i++)
            {
                storable.Logs[i] = Truncate(storable.Logs[i]) ?? string.Empty;
            }
        }

        // Still too large? Drop the service worker contents, which can be a multi-megabyte script bundle.
        if (storable.ServiceWorker is not null && GetJsonSizeInBytes(storable) > MaxAnalysisSizeInBytes)
        {
            storable.ServiceWorker = new ServiceWorkerDetection { Url = storable.ServiceWorker.Url, Raw = string.Empty };
        }

        // Last resort: drop the Lighthouse report, which contains its own copy of the raw manifest.
        var storableSize = GetJsonSizeInBytes(storable);
        if (storable.LighthouseReport is not null && storableSize > MaxAnalysisSizeInBytes)
        {
            storable.LighthouseReport = null;
            storableSize = GetJsonSizeInBytes(storable);
        }

        logger.LogWarning("Analysis {id} was too large to store in Cosmos DB, so parts of it were omitted. Its size is now {size} bytes. Manifest contains base64-encoded images: {hasBase64Images}.", analysis.Id, storableSize, hasBase64Images);
        return storable;
    }

    /// <summary>
    /// Creates a copy of an analysis whose mutable members can be changed without affecting the in-flight analysis.
    /// If new members are added to <see cref="Analysis"/>, they should be copied here as well.
    /// </summary>
    /// <param name="analysis">The analysis to copy.</param>
    /// <returns>The copied analysis.</returns>
    private static Analysis CloneAnalysis(Analysis analysis) => new()
    {
        Id = analysis.Id,
        Url = analysis.Url,
        CreatedAt = analysis.CreatedAt,
        LastModifiedAt = analysis.LastModifiedAt,
        Duration = analysis.Duration,
        Status = analysis.Status,
        Error = analysis.Error,
        WebManifest = analysis.WebManifest,
        ServiceWorker = analysis.ServiceWorker,
        LighthouseReport = analysis.LighthouseReport,
        Logs = [.. analysis.Logs],
        AppStorePackages = [.. analysis.AppStorePackages],
        Capabilities = [.. analysis.Capabilities.Select(CloneCapability)]
    };

    /// <summary>
    /// Creates a copy of a capability check so that it can be modified without affecting the in-flight analysis.
    /// </summary>
    /// <param name="capability">The capability to copy.</param>
    /// <returns>The copied capability.</returns>
    private static PwaCapability CloneCapability(PwaCapability capability)
    {
        var clone = new PwaCapability
        {
            Id = capability.Id,
            Description = capability.Description,
            TodoAction = capability.TodoAction
        };
        clone.Copy(capability);
        return clone;
    }

    /// <summary>
    /// Truncates a string that's too long to store, such as an error message containing a base64-encoded image.
    /// </summary>
    /// <param name="value">The value to truncate.</param>
    /// <returns>The value, truncated if needed.</returns>
    private static string? Truncate(string? value) => value is not null && value.Length > MaxTextLength
        ? string.Concat(value.AsSpan(0, MaxTextLength), TruncationSuffix)
        : value;

    /// <summary>
    /// Gets the size, in bytes, of the JSON representation of the specified value.
    /// </summary>
    /// <param name="value">The value to measure.</param>
    /// <returns>The number of UTF-8 bytes the value serializes to.</returns>
    private static long GetJsonSizeInBytes(Analysis value)
    {
        using var byteCounter = new ByteCountingStream();
        using var writer = new Utf8JsonWriter(byteCounter);
        JsonSerializer.Serialize(writer, value, CosmosJsonSerializerOptions);
        writer.Flush();
        return byteCounter.Length;
    }

    /// <summary>
    /// Initializes the Cosmos DB container used for analyses.
    /// </summary>
    /// <param name="settings">Application settings.</param>
    /// <returns>The initialized container.</returns>
    private static async Task<Container> InitializeContainerAsync(AppSettings settings)
    {
        if (string.IsNullOrWhiteSpace(settings.AzureCosmosAccountEndpoint)
            || string.IsNullOrWhiteSpace(settings.AzureCosmosDatabaseName)
            || string.IsNullOrWhiteSpace(settings.AzureCosmosAnalysesContainerName))
        {
            throw new InvalidOperationException("Cosmos DB settings are missing. Please configure AppSettings.AzureCosmosAccountEndpoint, AppSettings.AzureCosmosDatabaseName, and AppSettings.AzureCosmosAnalysesContainerName.");
        }

        var cosmosClientOptions = new CosmosClientOptions
        {
            Serializer = new SystemTextJsonCosmosSerializer(CosmosJsonSerializerOptions)
        };

        // Use connection string for localhost/loopback (emulator), managed identity otherwise.
        var isLocalEmulator = Uri.TryCreate(settings.AzureCosmosAccountEndpoint, UriKind.Absolute, out var endpointUri)
            && endpointUri.IsLoopback;

        CosmosClient cosmosClient;
        if (isLocalEmulator)
        {
            if (string.IsNullOrWhiteSpace(settings.AzureCosmosLocalConnectionString))
            {
                throw new InvalidOperationException("Local Cosmos emulator detected but AppSettings.AzureCosmosLocalConnectionString is not configured.");
            }

            cosmosClientOptions.HttpClientFactory = () => new HttpClient(new HttpClientHandler
            {
                ServerCertificateCustomValidationCallback = HttpClientHandler.DangerousAcceptAnyServerCertificateValidator
            });
            cosmosClient = new CosmosClient(settings.AzureCosmosLocalConnectionString, cosmosClientOptions);
        }
        else
        {
            if (string.IsNullOrWhiteSpace(settings.AzureManagedIdentityApplicationId))
            {
                throw new InvalidOperationException("AppSettings.AzureManagedIdentityApplicationId is required for non-local Cosmos endpoints.");
            }

            var credential = new ManagedIdentityCredential(clientId: settings.AzureManagedIdentityApplicationId);
            cosmosClient = new CosmosClient(settings.AzureCosmosAccountEndpoint, credential, cosmosClientOptions);
        }

        var database = await cosmosClient.CreateDatabaseIfNotExistsAsync(settings.AzureCosmosDatabaseName);
        var containerProperties = new ContainerProperties(settings.AzureCosmosAnalysesContainerName, "/id")
        {
            // Enable TTL and control retention per-item via each document's "ttl" property.
            DefaultTimeToLive = -1
        };

        var container = await database.Database.CreateContainerIfNotExistsAsync(containerProperties);
        return container.Container;
    }

    private sealed class AnalysisCosmosDocument
    {
        public required string Id { get; init; }

        public required Analysis Analysis { get; init; }

        public int Ttl { get; init; }

        public static AnalysisCosmosDocument Create(Analysis analysis, int timeToLiveInSeconds) =>
            new()
            {
                Id = analysis.Id,
                Analysis = analysis,
                Ttl = timeToLiveInSeconds
            };
    }

    /// <summary>
    /// A write-only stream that counts the bytes written to it. Used to measure the serialized size of an analysis
    /// without allocating a buffer for the entire document.
    /// </summary>
    private sealed class ByteCountingStream : Stream
    {
        private long length;

        public override bool CanRead => false;

        public override bool CanSeek => false;

        public override bool CanWrite => true;

        public override long Length => length;

        public override long Position
        {
            get => length;
            set => throw new NotSupportedException();
        }

        public override void Flush()
        {
        }

        public override int Read(byte[] buffer, int offset, int count) => throw new NotSupportedException();

        public override long Seek(long offset, SeekOrigin origin) => throw new NotSupportedException();

        public override void SetLength(long value) => throw new NotSupportedException();

        public override void Write(byte[] buffer, int offset, int count) => length += count;

        public override void Write(ReadOnlySpan<byte> buffer) => length += buffer.Length;

        public override void WriteByte(byte value) => length++;
    }

    private sealed class SystemTextJsonCosmosSerializer : CosmosSerializer
    {
        private readonly JsonSerializerOptions serializerOptions;

        public SystemTextJsonCosmosSerializer(JsonSerializerOptions serializerOptions)
        {
            this.serializerOptions = serializerOptions;
        }

        public override T FromStream<T>(Stream stream)
        {
            if (stream.CanSeek && stream.Length == 0)
            {
                return default!;
            }

            if (typeof(Stream).IsAssignableFrom(typeof(T)))
            {
                return (T)(object)stream;
            }

            using (stream)
            {
                return JsonSerializer.Deserialize<T>(stream, serializerOptions)!;
            }
        }

        public override Stream ToStream<T>(T input)
        {
            var stream = new MemoryStream();
            JsonSerializer.Serialize(stream, input, serializerOptions);
            stream.Position = 0;
            return stream;
        }
    }
}