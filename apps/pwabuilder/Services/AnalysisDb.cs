using StackExchange.Redis;
using PWABuilder.Models;

namespace PWABuilder.Services;

/// <summary>
/// Interface for accessing and managing Analysis objects in the database. 
/// In development, this will use <see cref="InMemoryAnalysisDb"/>. In production, it will use <see cref="AnalysisDb"/>, which uses Redis as a backing store.
/// </summary>
public interface IAnalysisDb
{
    /// <summary>
    /// Gets an analysis with the specified ID.
    /// </summary>
    /// <param name="id">The ID of the analysis to load.</param>
    /// <returns>The analysis with the specified ID, or null if it doesn't exist.</returns>
    Task<Analysis?> GetByIdAsync(string id);

    /// <summary>
    /// Saves the specified analysis to the database.
    /// </summary>
    /// <param name="analysis">The analysis to save.</param>
    /// <returns></returns>
    Task SaveAsync(Analysis analysis);
}

/// <summary>
/// An in-memory database for storing <see cref="Analysis"/> objects. Useful for local development and testing.
/// </summary>
public class InMemoryAnalysisDb : IAnalysisDb
{
    private readonly System.Collections.Concurrent.ConcurrentDictionary<string, Analysis> store = new();

    public Task<Analysis?> GetByIdAsync(string id)
    {
        store.TryGetValue(id, out var analysis);
        return Task.FromResult(analysis);
    }

    public Task SaveAsync(Analysis analysis)
    {
        store[analysis.Id] = analysis;
        return Task.CompletedTask;
    }
}

/// <summary>
/// Queries and stores Analysis objects in the PWABuilder's Redis cache in Azure.
/// </summary>
public class AnalysisDb : IAnalysisDb
{
    private static readonly TimeSpan analysisExpiration = TimeSpan.FromDays(7);
    private readonly ILogger<AnalysisDb> logger;
    private readonly IDatabase redis;

    public AnalysisDb(IDatabase redis, ILogger<AnalysisDb> logger)
    {
        this.redis = redis;
        this.logger = logger;
    }

    /// <summary>
    /// Saves a new or existing analysis to the database.
    /// </summary>
    /// <param name="analysis">The AnalysisJob to add or update.</param>
    public async Task SaveAsync(Analysis analysis)
    {
        try
        {
            analysis.LastModifiedAt = DateTime.UtcNow;
            var analysisJson = System.Text.Json.JsonSerializer.Serialize(analysis);
            await this.redis.StringSetAsync(analysis.Id, analysisJson, expiry: analysisExpiration);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error saving Analysis {id} to Redis.", analysis.Id);
            throw;
        }
    }

    /// <summary>
    /// Retrieves an analysis by its ID.
    /// </summary>
    /// <param name="id"></param>
    /// <returns></returns>
    public async Task<Analysis?> GetByIdAsync(string id)
    {
        try
        {
            var analysisJson = await this.redis.StringGetAsync(id);
            if (!analysisJson.HasValue)
            {
                logger.LogWarning("Attempted to retrieve Analysis {id}, but it does not exist.", id);
                return null;
            }

            // See if we can parse it back into an Analysis
            var analysis = System.Text.Json.JsonSerializer.Deserialize<Analysis>(analysisJson!); // we can be sure analysisJson isn't null here because we checked for HasValue above.
            return analysis;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error retrieving Analysis {id} from the database.", id);
            throw;
        }
    }
}