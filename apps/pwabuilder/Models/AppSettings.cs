namespace PWABuilder.Models;

public class AppSettings
{
    public string IOSSourceCodePath { get; set; } = string.Empty;
    public string MacOSSourceCodePath { get; set; } = string.Empty;
    public string NextStepsPath { get; set; } = string.Empty;
    public string MacOSNextStepsPath { get; set; } = string.Empty;
    public string AnalyticsUrl { get; set; } = string.Empty;
    public string ApplicationInsightsConnectionString { get; set; } = string.Empty;
    public string AzureManagedIdentityApplicationId { get; set; } = string.Empty;
    public string AzureStorageAccountName { get; set; } = string.Empty;
    public string AzureRedisHost { get; set; } = string.Empty;
    public string AzureCosmosAccountEndpoint { get; set; } = string.Empty;
    public string AzureCosmosDatabaseName { get; set; } = string.Empty;
    public string AzureCosmosAnalysesContainerName { get; set; } = string.Empty;
    public string AzureCosmosLocalConnectionString { get; set; } = string.Empty;
    public string AzureStorageQueueUri { get; set; } = string.Empty;
    /// <summary>
    /// Optional analysis job queue name override. PR deployment slots set this so they don't share the staging queue with the preview slot.
    /// When empty, the queue name is derived from the ASP.NET Core environment.
    /// </summary>
    public string AnalysisJobQueueName { get; set; } = string.Empty;
    public string PWABuilderCliKey { get; set; } = string.Empty;
}
