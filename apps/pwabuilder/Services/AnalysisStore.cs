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

    /// <summary>Gets a sanitized analysis for support within the fourteen-day retention window.</summary>
    Task<SupportAnalysis?> GetSupportByIdAsync(string id, CancellationToken cancellationToken = default);

    /// <summary>Gets at most fifty recent failed analyses, without raw logs, manifests, or errors.</summary>
    Task<IReadOnlyList<SupportAnalysis>> GetRecentFailuresAsync(CancellationToken cancellationToken = default);

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
    public Task<SupportAnalysis?> GetSupportByIdAsync(string id, CancellationToken cancellationToken = default)
    {
        var now = DateTimeOffset.UtcNow;
        var found = analyses.TryGetValue(id, out var analysis)
            && analysis.LastModifiedAt >= now - SupportDiagnosticsService.Retention
            && analysis.LastModifiedAt <= now;
        return Task.FromResult(found ? SupportDiagnosticsService.ProjectAnalysis(analysis!) : null);
    }

    /// <inheritdoc/>
    public Task<IReadOnlyList<SupportAnalysis>> GetRecentFailuresAsync(CancellationToken cancellationToken = default)
    {
        var now = DateTimeOffset.UtcNow;
        IReadOnlyList<SupportAnalysis> results = analyses.Values
            .Where(analysis => analysis.Status is AnalysisStatus.Failed
                && analysis.LastModifiedAt >= now - SupportDiagnosticsService.Retention
                && analysis.LastModifiedAt <= now)
            .OrderByDescending(analysis => analysis.LastModifiedAt)
            .Take(SupportDiagnosticsService.RecentLimit)
            .Select(analysis => SupportDiagnosticsService.ProjectAnalysis(analysis, includeDetails: false)).ToArray();
        return Task.FromResult(results);
    }

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
    private const string SupportProjection = """
        c.id, c.analysis.url AS url, c.analysis.status AS status,
        c.analysis.createdAt AS createdAt, c.analysis.lastModifiedAt AS updatedAt,
        ARRAY(SELECT VALUE { "id": check.id, "status": check.status } FROM check IN c.analysis.capabilities) AS checks
        """;

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
    public async Task<SupportAnalysis?> GetSupportByIdAsync(string id, CancellationToken cancellationToken = default)
    {
        var query = CreateSupportQuery(
            $"SELECT TOP 1 {SupportProjection}, c.analysis.error AS error, ARRAY_SLICE(c.analysis.logs, -100) AS logs FROM c WHERE c.id = @id AND ", "")
            .WithParameter("@id", id);
        var results = await QuerySupportAsync(query, new PartitionKey(id), 1, cancellationToken);
        return results.FirstOrDefault();
    }

    /// <inheritdoc/>
    public Task<IReadOnlyList<SupportAnalysis>> GetRecentFailuresAsync(CancellationToken cancellationToken = default)
    {
        var query = CreateSupportQuery(
            $"SELECT TOP {SupportDiagnosticsService.RecentLimit} {SupportProjection} FROM c WHERE c.analysis.status = @status AND ",
            " ORDER BY c.analysis.lastModifiedAt DESC").WithParameter("@status", nameof(AnalysisStatus.Failed));
        return QuerySupportAsync(query, null, SupportDiagnosticsService.RecentLimit, cancellationToken);
    }

    /// <summary>Adds the fixed retention window to an internal support query.</summary>
    private static QueryDefinition CreateSupportQuery(string prefix, string suffix)
    {
        var now = DateTimeOffset.UtcNow;
        return new QueryDefinition(prefix + "c.analysis.lastModifiedAt >= @cutoff AND c.analysis.lastModifiedAt <= @now" + suffix)
            .WithParameter("@cutoff", (now - SupportDiagnosticsService.Retention).ToString("O"))
            .WithParameter("@now", now.ToString("O"));
    }

    /// <summary>Executes a bounded query and removes input URLs before returning results.</summary>
    private async Task<IReadOnlyList<SupportAnalysis>> QuerySupportAsync(QueryDefinition query, PartitionKey? partitionKey,
        int limit, CancellationToken cancellationToken)
    {
        var container = await containerTask;
        using var iterator = container.GetItemQueryIterator<SupportAnalysisData>(query, requestOptions: new QueryRequestOptions
        {
            PartitionKey = partitionKey,
            MaxItemCount = limit,
            MaxBufferedItemCount = limit,
            MaxConcurrency = 1
        });
        var results = new List<SupportAnalysis>();
        // Bound both results and page requests, even across many partitions or sparse indexes.
        for (var page = 0; iterator.HasMoreResults && results.Count < limit && page < 10; page++)
        {
            var response = await iterator.ReadNextAsync(cancellationToken);
            results.AddRange(response.Take(limit - results.Count).Select(SupportDiagnosticsService.ProjectAnalysis));
        }
        return results;
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

            var document = AnalysisCosmosDocument.Create(analysis, expiration.HasValue ? (int)expiration.Value.TotalSeconds : DefaultExpirationInSeconds);
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

        var cosmosJsonSerializerOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };

        var cosmosClientOptions = new CosmosClientOptions
        {
            Serializer = new SystemTextJsonCosmosSerializer(cosmosJsonSerializerOptions)
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