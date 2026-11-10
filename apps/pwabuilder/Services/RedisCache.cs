using PWABuilder.Models;
using Microsoft.Extensions.Options;
using Azure.Identity;
using Microsoft.Azure.StackExchangeRedis;
using Microsoft.Extensions.Logging;
using StackExchange.Redis;
using System.Text.Json;

namespace PWABuilder.Services;

/// <summary>
/// Interface for accessing and managing PWABuilder objects (analysis, store packaging jobs, etc.) in a cache. 
/// In development, this will use <see cref="InMemoryRedisCache"/>. In production, it will use <see cref="RedisCache"/>, which uses Redis as a backing store.
/// </summary>
public interface IRedisCache
{
    /// <summary>
    /// Gets an analysis with the specified ID.
    /// </summary>
    /// <param name="id">The ID of the analysis to load.</param>
    /// <typeparam name="T">The type of the object to load from the Redis cache.</typeparam>
    /// <returns>The analysis with the specified ID, or null if it doesn't exist.</returns>
    Task<T?> GetByIdAsync<T>(string id) where T : class;

    /// <summary>Reads only the separate diagnostics key for a validated support UUID.</summary>
    Task<PackageDiagnosticsData?> GetPackageDiagnosticsAsync(Guid supportReference);

    /// <summary>Reads up to fifty UUIDs from the fourteen-day failed diagnostics sorted-set window.</summary>
    Task<IReadOnlyList<string>> GetRecentFailedPackageReferencesAsync();

    /// <summary>Pages through the bounded failed index by score and UUID, without scanning Redis keys.</summary>
    Task<SupportPage<SupportPackageIndexEntry>> GetFailedPackageReferencesPageAsync(SupportPageRequest request);

    /// <summary>
    /// Saves the specified object to the Redis cache.
    /// </summary>
    /// <param name="item">The object to save.</param>
    /// <param name="expiration">The expiration time for the cached item. If null, the default expiration time will be used.</param>
    /// <param name="id">The ID of the object to save.</param>
    /// <typeparam name="T">The type of the object to save.</typeparam>
    /// <returns></returns>
    Task SaveAsync<T>(string id, T item, TimeSpan? expiration = null) where T : class;

    /// <summary>
    /// Enqueues an item onto the end of a list in the Redis cache as an atomic operation. If the list doesn't exist, it will be created.
    /// </summary>
    /// <typeparam name="T"></typeparam>
    /// <param name="listId">The ID of the list in the Redis cache.</param>
    /// <param name="item">The item to enqueue into the list.</param>
    /// <returns>The new length of the list after the item has been enqueued.</returns>
    Task<long> EnqueueAsync<T>(string listId, T item) where T : class;

    /// <summary>
    /// Dequeues an item from a list in the Redis cache as an atomic operation. If the list is empty or doesn't exist, null will be returned.
    /// </summary>
    /// <typeparam name="T">The type of object to dequeue from the list.</typeparam>
    /// <param name="listId">The ID of the list in the Redis cache.</param>
    /// <returns>The first item from the list, or null if the list is empty.</returns>
    Task<T?> DequeueAsync<T>(string listId) where T : class;

    /// <summary>
    /// Gets the length of a list in the Redis cache.
    /// </summary>
    /// <param name="listId">The ID of the list in the Redis cache.</param>
    /// <returns>The number of items in the list.</returns>
    Task<long> GetQueueLength(string listId);
}

/// <summary>
/// An in-memory cache for storing PWABuilder objects like analyses and store packaging jobs. Useful for local development and testing.
/// </summary>
public class InMemoryRedisCache : IRedisCache
{
    private readonly System.Collections.Concurrent.ConcurrentDictionary<string, object> store = new();

    /// <inheritdoc/>
    public Task<PackageDiagnosticsData?> GetPackageDiagnosticsAsync(Guid supportReference) =>
        GetByIdAsync<PackageDiagnosticsData>($"package-diagnostics:{supportReference:D}");

    /// <inheritdoc/>
    public async Task<IReadOnlyList<string>> GetRecentFailedPackageReferencesAsync() =>
        (await GetFailedPackageReferencesPageAsync(new SupportPageRequest(DateTimeOffset.UtcNow))).Items
            .Select(entry => entry.Reference).ToArray();

    /// <inheritdoc/>
    public Task<SupportPage<SupportPackageIndexEntry>> GetFailedPackageReferencesPageAsync(SupportPageRequest request)
    {
        var references = store
            .Where(item => item.Key.StartsWith("package-diagnostics:", StringComparison.Ordinal))
            .Select(item => item.Value).OfType<PackageDiagnosticsData>()
            .Where(item => item.Status is "Failed" && item.UpdatedAt >= request.Cutoff
                && item.UpdatedAt <= request.UpperBound)
            .Select(item => new SupportPackageIndexEntry(item.SupportReference, item.UpdatedAt.ToUnixTimeMilliseconds()));
        return Task.FromResult(SupportPackagePaging.Select(references, request));
    }

    public Task<T?> GetByIdAsync<T>(string id)
        where T : class
    {
        store.TryGetValue(id, out var item);
        return Task.FromResult((T?)item);
    }

    public Task SaveAsync<T>(string id, T item, TimeSpan? expiration = null) where T : class
    {
        store[id] = item;
        return Task.CompletedTask;
    }

    public Task<long> EnqueueAsync<T>(string listId, T item) where T : class
    {
        var list = (System.Collections.Concurrent.ConcurrentQueue<T>)store.GetOrAdd(listId, _ => new System.Collections.Concurrent.ConcurrentQueue<T>());
        list.Enqueue(item);
        return Task.FromResult((long)list.Count);
    }

    public Task<T?> DequeueAsync<T>(string listId) where T : class
    {
        if (store.TryGetValue(listId, out var obj) && obj is System.Collections.Concurrent.ConcurrentQueue<T> list)
        {
            if (list.TryDequeue(out var item))
            {
                return Task.FromResult((T?)item);
            }
        }

        return Task.FromResult((T?)null);
    }

    public Task<long> GetQueueLength(string listId)
    {
        if (store.TryGetValue(listId, out var obj) && obj is System.Collections.Concurrent.ConcurrentQueue<string> list)
        {
            return Task.FromResult((long)list.Count);
        }

        return Task.FromResult(0L);
    }
}

/// <summary>
/// Queries and stores PWABuilder objects (analyses, store packaging jobs, etc.) in the PWABuilder's Redis cache in Azure.
/// </summary>
public class RedisCache : IRedisCache
{
    // How long items should remain in the cache before expiring.
    private static readonly TimeSpan itemExpiration = TimeSpan.FromDays(3);
    private static readonly JsonSerializerOptions diagnosticsJsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        NumberHandling = System.Text.Json.Serialization.JsonNumberHandling.AllowReadingFromString
    };
    private readonly ILogger<RedisCache> logger;
    private readonly Task<IDatabase> redisTask;

    public RedisCache(IOptions<AppSettings> options, ILogger<RedisCache> logger)
    {
        this.redisTask = InitializeRedis(options);
        this.logger = logger;
    }

    /// <inheritdoc/>
    public async Task<PackageDiagnosticsData?> GetPackageDiagnosticsAsync(Guid supportReference)
    {
        if (supportReference == Guid.Empty)
        {
            return null;
        }
        var redis = await redisTask;
        var json = await redis.StringGetAsync($"package-diagnostics:{supportReference:D}");
        return DeserializePackageDiagnostics(json.ToString());
    }

    /// <summary>Deserializes Node camelCase separately, preserving existing cache serialization behavior.</summary>
    public static PackageDiagnosticsData? DeserializePackageDiagnostics(string json)
    {
        // The producer permits 100 logs and 20 errors of 4,000 characters each, plus metadata.
        if (string.IsNullOrWhiteSpace(json) || json.Length > 600 * 1024)
        {
            return null;
        }
        try
        {
            return JsonSerializer.Deserialize<PackageDiagnosticsData>(json, diagnosticsJsonOptions);
        }
        catch (JsonException)
        {
            return null;
        }
    }

    /// <inheritdoc/>
    public async Task<IReadOnlyList<string>> GetRecentFailedPackageReferencesAsync() =>
        (await GetFailedPackageReferencesPageAsync(new SupportPageRequest(DateTimeOffset.UtcNow))).Items
            .Select(entry => entry.Reference).ToArray();

    /// <inheritdoc/>
    public async Task<SupportPage<SupportPackageIndexEntry>> GetFailedPackageReferencesPageAsync(SupportPageRequest request)
    {
        var redis = await redisTask;
        // The producer caps this index at 500. Reading that bounded set preserves score ties without KEYS scans.
        var values = await redis.SortedSetRangeByScoreWithScoresAsync("package-diagnostics:failed",
            start: request.Cutoff.ToUnixTimeMilliseconds(), stop: request.UpperBound.ToUnixTimeMilliseconds(),
            order: Order.Descending, take: SupportPackagePaging.IndexLimit);
        return SupportPackagePaging.Select(values.Select(value =>
            new SupportPackageIndexEntry(value.Element.ToString(), value.Score)), request);
    }

    /// <summary>
    /// Saves a new or existing item to the cache.
    /// </summary>
    /// <param name="id">The ID of the item to save. If an item with this ID already exists in the cache, it'll be overwritten.</param>
    /// <param name="item">The item to add or update.</param>
    /// <typeparam name="T">The type of the item to save.</typeparam>
    public async Task SaveAsync<T>(string id, T item, TimeSpan? expiration = null) where T : class
    {
        try
        {
            if (item is Analysis analysis)
            {
                analysis.LastModifiedAt = DateTime.UtcNow;
            }

            // If it's already a string, just save it directly; forget JSON serialization.
            var redis = await this.redisTask;
            if (item is string strItem)
            {
                await redis.StringSetAsync(id, strItem, expiry: expiration ?? itemExpiration);
                return;
            }

            var json = System.Text.Json.JsonSerializer.Serialize(item);
            await redis.StringSetAsync(id, json, expiry: expiration ?? itemExpiration);
            logger.LogInformation("Saved item {id} to Redis cache.", id);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error saving item {id} to Redis.", id);
            throw;
        }
    }

    /// <summary>
    /// Retrieves an analysis by its ID.
    /// </summary>
    /// <param name="id"></param>
    /// <returns></returns>
    public async Task<T?> GetByIdAsync<T>(string id) where T : class
    {
        try
        {
            var redis = await this.redisTask;
            var json = await redis.StringGetAsync(id);
            if (!json.HasValue)
            {
                logger.LogWarning("Attempted to retrieve item {id} from Redis cache, but it does not exist.", id);
                return null;
            }

            // If it's a string, just return it directly; forget JSON deserialization.
            if (typeof(T) == typeof(string))
            {
                return json as T;
            }

            // See if we can parse it back into the requested type
            var item = JsonSerializer.Deserialize<T>(json.ToString());
            return item;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error retrieving item {id} from the Redis cache.", id);
            throw;
        }
    }

    /// <summary>
    /// Saves an item to a list in the Redis cache as an atomic operation. If the list doesn't exist, it will be created.
    /// </summary>
    /// <typeparam name="T">The type of object to enqueue into the list.</typeparam>
    /// <param name="listId">The ID of the list to enqueue the item onto. It will be added to the back of the list.</param>
    /// <param name="item">The item to enqueue onto the list.</param>
    /// <returns></returns>
    public async Task<long> EnqueueAsync<T>(string listId, T item) where T : class
    {
        try
        {
            var redis = await this.redisTask;
            var json = JsonSerializer.Serialize(item);
            var queueLength = await redis.ListRightPushAsync(listId, json);
            logger.LogInformation("Enqueued item {id} onto list {listKey} in Redis. New queue length: {queueLength}", (item as AnalysisJob)?.Id ?? "[unknown ID]", listId, queueLength);
            return queueLength;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error enqueuing item to list {listKey} in Redis.", listId);
            throw;
        }
    }

    /// <summary>
    /// Dequeues an item from the front of the specified list in the Redis cache as an atomic operation. If the list is empty or doesn't exist, null will be returned.
    /// </summary>
    /// <typeparam name="T">The type of object to dequeue from the list.</typeparam>
    /// <param name="listId">The ID of the list in the Redis cache.</param>
    /// <returns>The first item from the list, or null if the list is empty.</returns>
    public async Task<T?> DequeueAsync<T>(string listId) where T : class
    {
        try
        {
            var redis = await this.redisTask;
            var json = await redis.ListLeftPopAsync(listId);
            if (!json.HasValue || string.IsNullOrEmpty(json))
            {
                logger.LogInformation("Attempted to dequeue item from list {listKey} in Redis, but the list is empty.", listId);
                return null;
            }

            return JsonSerializer.Deserialize<T>(json.ToString());
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error dequeuing item from list {listKey} in Redis.", listId);
            throw;
        }
    }

    /// <summary>
    /// Gets the length of the specified list in the Redis cache.
    /// </summary>
    /// <param name="listId">The ID of the list in the Redis cache.</param>
    /// <returns>The number of items in the list.</returns>
    public async Task<long> GetQueueLength(string listId)
    {
        try
        {
            var redis = await this.redisTask;
            return await redis.ListLengthAsync(listId);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error getting queue length of {listId} from Redis.", listId);
            throw;
        }
    }

    private static async Task<IDatabase> InitializeRedis(IOptions<AppSettings> options)
    {
        var configurationOptions = ConfigurationOptions.Parse(options.Value.AzureRedisHost);
        configurationOptions.Ssl = true;
        configurationOptions.AbortOnConnectFail = false;

        // Use the user-assigned managed identity for Entra ID authentication.
        // DefaultAzureCredential without a client ID would use the system-assigned identity,
        // which does not have a Redis access policy assigned.
        var managedIdentityAppId = options.Value.AzureManagedIdentityApplicationId;
        var credential = new ManagedIdentityCredential(clientId: managedIdentityAppId);
        await configurationOptions.ConfigureForAzureWithTokenCredentialAsync(credential);

        var connection = await ConnectionMultiplexer.ConnectAsync(configurationOptions);
        return connection.GetDatabase();
    }
}