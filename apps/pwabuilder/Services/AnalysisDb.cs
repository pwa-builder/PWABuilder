using Azure;
using Azure.Data.Tables;
using Microsoft.Extensions.Options;
using PWABuilder.Models;

namespace PWABuilder.Services;

/// <summary>
/// Queries and stores Analysis objects in the Azure Table database.
/// </summary>
public class AnalysisDb
{
    private readonly TableClient tableClient;
    private readonly ILogger<AnalysisDb> logger;

    public AnalysisDb(IOptions<AppSettings> settings, ILogger<AnalysisDb> logger)
    {
        this.logger = logger;
        var credential = new TableSharedKeyCredential(settings.Value.AzureStorageAccountName, settings.Value.AzureStorageAccessKey);
        var tableUri = new Uri($"https://{settings.Value.AzureStorageAccountName}.table.core.windows.net/{settings.Value.AzureAnalysesTableName}");
        this.tableClient = new TableClient(tableUri, settings.Value.AzureAnalysesTableName, credential);
    }

    /// <summary>
    /// Saves a new or existing analysis to the database.
    /// </summary>
    /// <param name="analysis">The AnalysisJob to add or update.</param>
    public async Task SaveAsync(Analysis analysis)
    {
        try
        {
            await tableClient.UpsertEntityAsync(analysis, TableUpdateMode.Replace);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error saving Analysis {id} to the database.", analysis.Id);
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
            var response = await tableClient.GetEntityAsync<Analysis>(DateTimeOffset.UtcNow.Year.ToString(), id);
            return response.Value;
        }
        catch (RequestFailedException ex) when (ex.Status == 404)
        {
            // Not found, return null
            logger.LogWarning("Attempted to retrieve Analysis {id}, but it does not exist.", id);
            return null;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error retrieving Analysis {id} from the database.", id);
            throw;
        }
    }
}