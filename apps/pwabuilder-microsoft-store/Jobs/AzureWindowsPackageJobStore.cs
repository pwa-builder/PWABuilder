using System;
using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Runtime.CompilerServices;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Azure;
using Azure.Identity;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Microsoft.Azure.Cosmos;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using PWABuilder.MicrosoftStore.Models;
using JsonSerializer = System.Text.Json.JsonSerializer;

[assembly: InternalsVisibleTo("PWABuilder.MicrosoftStore.Tests")]

namespace PWABuilder.MicrosoftStore.Jobs;

/// <summary>Persists private packaging inputs and artifacts in Blob Storage and job state in Cosmos DB.</summary>
/// <remarks>Requires pre-provisioned resources. Register as a singleton so the dedicated Cosmos client is reused and disposed.</remarks>
public sealed class AzureWindowsPackageJobStore : IWindowsPackageJobStore, IDisposable
{
    private static readonly JsonSerializerOptions InputJsonOptions = new(JsonSerializerDefaults.Web);

    private readonly CosmosClient cosmosClient;
    private readonly Container jobs;
    private readonly BlobContainerClient blobs;

    /// <summary>Connects to pre-provisioned resources using the configured managed identity.</summary>
    public AzureWindowsPackageJobStore(IOptions<WindowsPackageJobOptions> options, IOptions<AppSettings> appSettings)
    {
        var settings = appSettings.Value;
        var configuration = options.Value;
        ArgumentException.ThrowIfNullOrWhiteSpace(configuration.BlobContainerName);
        ArgumentException.ThrowIfNullOrWhiteSpace(configuration.CosmosContainerName);
        ArgumentException.ThrowIfNullOrWhiteSpace(settings.CosmosDbDatabaseName);
        var credential = string.IsNullOrWhiteSpace(settings.AzureManagedIdentityApplicationId)
            ? new ManagedIdentityCredential()
            : new ManagedIdentityCredential(settings.AzureManagedIdentityApplicationId);
        blobs = new BlobServiceClient(new Uri(configuration.BlobServiceUri), credential)
            .GetBlobContainerClient(configuration.BlobContainerName);
        cosmosClient = new CosmosClient(settings.CosmosDbEndpoint, credential, CreateCosmosClientOptions());
        jobs = cosmosClient.GetContainer(settings.CosmosDbDatabaseName, configuration.CosmosContainerName);
    }

    /// <summary>Uses supplied SDK clients, taking ownership of the dedicated Cosmos client.</summary>
    internal AzureWindowsPackageJobStore(CosmosClient cosmosClient, BlobContainerClient blobs, string databaseName, string containerName)
    {
        this.cosmosClient = cosmosClient;
        this.blobs = blobs;
        jobs = cosmosClient.GetContainer(databaseName, containerName);
    }

    /// <inheritdoc/>
    public async Task CreateAsync(WindowsPackageJob job, WindowsPackageJobInput input, CancellationToken token)
    {
        await using var content = new MemoryStream();
        await JsonSerializer.SerializeAsync(content, input, InputJsonOptions, token);
        content.Position = 0;
        await blobs.GetBlobClient($"inputs/{job.Id}.json").UploadAsync(content, new BlobUploadOptions
        {
            Conditions = new BlobRequestConditions { IfNoneMatch = ETag.All },
            HttpHeaders = new BlobHttpHeaders { ContentType = "application/json" }
        }, token);

        // Never delete the input after an ambiguous Cosmos failure; storage lifecycle rules reclaim orphans.
        await jobs.CreateItemAsync(job, new PartitionKey(job.Id), cancellationToken: token);
    }

    /// <inheritdoc/>
    public async Task<WindowsPackageJob?> GetAsync(string id, CancellationToken token)
    {
        try
        {
            var response = await jobs.ReadItemAsync<WindowsPackageJob>(id, new PartitionKey(id), cancellationToken: token);
            return response.Resource with { ETag = response.ETag };
        }
        catch (CosmosException exception) when (exception.StatusCode is HttpStatusCode.NotFound)
        {
            return null;
        }
    }

    /// <inheritdoc/>
    public async Task<IReadOnlyList<WindowsPackageJob>> GetPendingDispatchAsync(CancellationToken token)
    {
        var query = new QueryDefinition(
            "SELECT TOP 50 c AS job, c._etag FROM c WHERE c.needsDispatch = true AND c.status = @status ORDER BY c.createdAt")
            .WithParameter("@status", WindowsPackageJob.Queued);
        using var iterator = jobs.GetItemQueryIterator<DispatchRecord>(query, requestOptions: new QueryRequestOptions
        {
            MaxItemCount = 50
        });
        var pending = new List<WindowsPackageJob>(50);
        while (iterator.HasMoreResults && pending.Count < 50)
        {
            var page = await iterator.ReadNextAsync(token);
            foreach (var record in page)
            {
                pending.Add(record.Job with { ETag = record.ETag });
                if (pending.Count is 50)
                {
                    break;
                }
            }
        }
        return pending;
    }

    /// <inheritdoc/>
    public async Task<WindowsPackageJob?> TryReplaceAsync(WindowsPackageJob job, CancellationToken token)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(job.ETag);
        if (job.ETag is "*")
        {
            throw new ArgumentException("A specific job revision is required.", nameof(job));
        }
        try
        {
            var response = await jobs.ReplaceItemAsync(job, job.Id, new PartitionKey(job.Id),
                new ItemRequestOptions { IfMatchEtag = job.ETag }, token);
            return response.Resource with { ETag = response.ETag };
        }
        catch (CosmosException exception) when (exception.StatusCode is HttpStatusCode.PreconditionFailed)
        {
            return null;
        }
    }

    /// <inheritdoc/>
    public async Task<WindowsPackageJobInput> ReadInputAsync(string id, CancellationToken token)
    {
        var response = await blobs.GetBlobClient($"inputs/{id}.json").DownloadStreamingAsync(cancellationToken: token);
        await using var content = response.Value.Content;
        return await JsonSerializer.DeserializeAsync<WindowsPackageJobInput>(content, InputJsonOptions, token)
            ?? throw new System.Text.Json.JsonException("The stored packaging input is null.");
    }

    /// <inheritdoc/>
    public async Task<string> UploadArtifactAsync(string id, string attemptId, string path, CancellationToken token)
    {
        var name = $"artifacts/{id}/{attemptId}.zip";
        await using var content = new FileStream(path, FileMode.Open, FileAccess.Read, FileShare.Read,
            bufferSize: 81920, FileOptions.Asynchronous | FileOptions.SequentialScan);
        await blobs.GetBlobClient(name).UploadAsync(content, new BlobUploadOptions
        {
            Conditions = new BlobRequestConditions { IfNoneMatch = ETag.All },
            HttpHeaders = new BlobHttpHeaders { ContentType = "application/zip" }
        }, token);
        return name;
    }

    /// <inheritdoc/>
    public async Task<Stream> OpenArtifactAsync(string name, CancellationToken token)
    {
        var response = await blobs.GetBlobClient(name).DownloadStreamingAsync(cancellationToken: token);
        return response.Value.Content;
    }

    /// <inheritdoc/>
    public void Dispose() => cosmosClient.Dispose();

    /// <summary>Keeps Cosmos' Newtonsoft serializer and the job contract's JSON attributes authoritative.</summary>
    internal static CosmosClientOptions CreateCosmosClientOptions() => new()
    {
        SerializerOptions = new CosmosSerializationOptions { PropertyNamingPolicy = CosmosPropertyNamingPolicy.CamelCase }
    };

    /// <summary>Projects Cosmos' system ETag separately from the job's ignored ETag property.</summary>
    private sealed class DispatchRecord
    {
        /// <summary>Gets the job selected by the outbox query.</summary>
        [JsonProperty("job")]
        public required WindowsPackageJob Job { get; init; }

        /// <summary>Gets the persisted revision for a conditional outbox update.</summary>
        [JsonProperty("_etag")]
        public required string ETag { get; init; }
    }
}
