using Azure;
using StackExchange.Redis;
using Microsoft.Extensions.Options;
using PWABuilder.Models;

namespace PWABuilder.Services;

/// <summary>
/// Queries and stores Analysis objects in the PWABuilder's Redis cache in Azure.
/// </summary>
public class AnalysisDb
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