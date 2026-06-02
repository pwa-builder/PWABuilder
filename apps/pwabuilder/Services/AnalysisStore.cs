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
    /// <returns>A task.</returns>
    Task SaveAsync(Analysis analysis);
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
    public Task SaveAsync(Analysis analysis)
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
    // 13 months expressed as 395 days.
    private static readonly int AnalysisTtlInSeconds = (int)TimeSpan.FromDays(365).TotalSeconds;

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
    public async Task SaveAsync(Analysis analysis)
    {
        try
        {
            var container = await containerTask;
            analysis.LastModifiedAt = DateTimeOffset.UtcNow;

            var document = AnalysisCosmosDocument.Create(analysis, AnalysisTtlInSeconds);
            await container.UpsertItemAsync(document, new PartitionKey(document.Id));
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