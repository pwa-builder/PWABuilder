namespace PWABuilder.Models;

public class AppSettings
{
    public string IOSSourceCodePath { get; set; } = string.Empty;
    public string NextStepsPath { get; set; } = string.Empty;
    public string AnalyticsUrl { get; set; } = string.Empty;
    public string ApplicationInsightsConnectionString { get; set; } = string.Empty;
    public string AzureManagedIdentityApplicationId { get; set; } = string.Empty;
    public string AzureStorageAccountName { get; set; } = string.Empty;
    public string AzureRedisHost { get; set; } = string.Empty;
    public string PWABuilderCliKey { get; set; } = string.Empty;
}
