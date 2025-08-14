namespace PWABuilder.Models
{
    public class AppSettings
    {
        public string IOSSourceCodePath { get; set; } = string.Empty;
        public string NextStepsPath { get; set; } = string.Empty;
        public string ImageGeneratorApiUrl { get; set; } = string.Empty;
        public string AnalyticsUrl { get; set; } = string.Empty;
        public string ApplicationInsightsConnectionString { get; set; } = string.Empty;
        public string AzureStorageAccountName { get; set; } = string.Empty;
        public string AzureManagedIdentityApplicationId { get; set; } = string.Empty;
        public string AzureAnalysesQueueName { get; set; } = string.Empty;
        public string AnalysisDbRedisConnectionString { get; set; } = string.Empty;
    }
}
