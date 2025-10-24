using StackExchange.Redis;
using PWABuilder.Models;

namespace PWABuilder.Services;

/// <summary>
/// Interface for accessing and managing PWABuilder objects (analysis, store packaging jobs, etc.) in the database. 
/// In development, this will use <see cref="InMemoryPWABuilderDb"/>. In production, it will use <see cref="PWABuilderDb"/>, which uses Redis as a backing store.
/// </summary>
public interface IPWABuilderDatabase
{
    /// <summary>
    /// Gets an analysis with the specified ID.
    /// </summary>
    /// <param name="id">The ID of the analysis to load.</param>
    /// <typeparam name="T">The type of the object to load from the database.</typeparam>
    /// <returns>The analysis with the specified ID, or null if it doesn't exist.</returns>
    Task<T?> GetByIdAsync<T>(string id) where T : class;

    /// <summary>
    /// Saves the specified object to the database.
    /// </summary>
    /// <param name="item">The object to save.</param>
    /// <typeparam name="T">The type of the object to save.</typeparam>
    /// <returns></returns>
    Task SaveAsync<T>(string id, T item) where T : class;

    /// <summary>
    /// Enqueues an item onto the end of a list in the database as an atomic operation. If the list doesn't exist, it will be created.
    /// </summary>
    /// <typeparam name="T"></typeparam>
    /// <param name="listId">The ID of the list in the database.</param>
    /// <param name="item">The item to enqueue into the list.</param>
    /// <returns></returns>
    Task EnqueueAsync<T>(string listId, T item) where T : class;

    /// <summary>
    /// Dequeues an item from a list in the database as an atomic operation. If the list is empty or doesn't exist, null will be returned.
    /// </summary>
    /// <typeparam name="T">The type of object to dequeue from the list.</typeparam>
    /// <param name="listId">The ID of the list in the database.</param>
    /// <returns>The first item from the list, or null if the list is empty.</returns>
    Task<T?> DequeueAsync<T>(string listId) where T : class;
}

/// <summary>
/// An in-memory database for storing PWABuilder objects like analyses and store packaging jobs. Useful for local development and testing.
/// </summary>
public class InMemoryPWABuilderDatabase : IPWABuilderDatabase
{
    private readonly System.Collections.Concurrent.ConcurrentDictionary<string, object> store = new();

    public Task<T?> GetByIdAsync<T>(string id)
        where T : class
    {
        store.TryGetValue(id, out var item);
        return Task.FromResult((T?)item);
    }

    public Task SaveAsync<T>(string id, T item) where T : class
    {
        store[id] = item;
        return Task.CompletedTask;
    }

    public Task EnqueueAsync<T>(string listId, T item) where T : class
    {
        var list = (System.Collections.Concurrent.ConcurrentQueue<T>)store.GetOrAdd(listId, _ => new System.Collections.Concurrent.ConcurrentQueue<T>());
        list.Enqueue(item);
        return Task.CompletedTask;
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
}

/// <summary>
/// Queries and stores PWABuilder objects (analyses, store packaging jobs, etc.) in the PWABuilder's Redis cache in Azure.
/// </summary>
public class PWABuilderDatabase : IPWABuilderDatabase
{
    // How long items should remain in the database before expiring.
    private static readonly TimeSpan itemExpiration = TimeSpan.FromDays(7);
    private readonly ILogger<PWABuilderDatabase> logger;
    private readonly IDatabase redis;

    public PWABuilderDatabase(IDatabase redis, ILogger<PWABuilderDatabase> logger)
    {
        this.redis = redis;
        this.logger = logger;
    }

    /// <summary>
    /// Saves a new or existing item to the database.
    /// </summary>
    /// <param name="id">The ID of the item to save. If an item with this ID already exists in the database, it'll be overwritten.</param>
    /// <param name="item">The item to add or update.</param>
    /// <typeparam name="T">The type of the item to save.</typeparam>
    public async Task SaveAsync<T>(string id, T item) where T : class
    {
        try
        {
            if (item is Analysis analysis)
            {
                analysis.LastModifiedAt = DateTime.UtcNow;
            }

            var json = System.Text.Json.JsonSerializer.Serialize(item);
            await this.redis.StringSetAsync(id, json, expiry: itemExpiration);
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
            var json = await this.redis.StringGetAsync(id);
            if (!json.HasValue)
            {
                logger.LogWarning("Attempted to retrieve item {id}, but it does not exist.", id);
                return null;
            }

            // See if we can parse it back into the requested type
            var item = System.Text.Json.JsonSerializer.Deserialize<T>(json!); // we can be sure json isn't null here because we checked for HasValue above.
            return item;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error retrieving item {id} from the database.", id);
            throw;
        }
    }

    /// <summary>
    /// Saves an item to a list in the database as an atomic operation. If the list doesn't exist, it will be created.
    /// </summary>
    /// <typeparam name="T">The type of object to enqueue into the list.</typeparam>
    /// <param name="listId">The ID of the list to enqueue the item onto. It will be added to the back of the list.</param>
    /// <param name="item">The item to enqueue onto the list.</param>
    /// <returns></returns>
    public async Task EnqueueAsync<T>(string listId, T item) where T : class
    {
        try
        {
            var json = System.Text.Json.JsonSerializer.Serialize(item);
            await this.redis.ListRightPushAsync(listId, json);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error enqueuing item to list {listKey} in Redis.", listId);
            throw;
        }
    }

    /// <summary>
    /// Dequeues an item from the front of the specified list in the database as an atomic operation. If the list is empty or doesn't exist, null will be returned.
    /// </summary>
    /// <typeparam name="T">The type of object to dequeue from the list.</typeparam>
    /// <param name="listId">The ID of the list in the database.</param>
    /// <returns>The first item from the list, or null if the list is empty.</returns>
    public async Task<T?> DequeueAsync<T>(string listId) where T : class
    {
        try
        {
            var json = await this.redis.ListLeftPopAsync(listId);
            if (!json.HasValue || string.IsNullOrEmpty(json))
            {
                return null;
            }

            return System.Text.Json.JsonSerializer.Deserialize<T>(json!);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error dequeuing item from list {listKey} in Redis.", listId);
            throw;
        }
    }
}