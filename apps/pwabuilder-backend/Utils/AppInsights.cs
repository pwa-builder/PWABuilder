using Microsoft.ApplicationInsights.AspNetCore.Extensions;

namespace PWABuilder.Utils
{
    public static class AppInsights
    {
        public static ApplicationInsightsServiceOptions setUpAppInsights(IConfigurationSection appSettings)
        {
            var connectionString = appSettings["ApplicationInsightsConnectionString"];
            var aiOptions = new ApplicationInsightsServiceOptions();
            aiOptions.EnableRequestTrackingTelemetryModule = false;
            aiOptions.EnableDependencyTrackingTelemetryModule = true;
            aiOptions.EnableHeartbeat = false;
            aiOptions.EnableAzureInstanceMetadataTelemetryModule = false;
            aiOptions.EnableActiveTelemetryConfigurationSetup = false;
            aiOptions.EnableAdaptiveSampling = false;
            aiOptions.EnableAppServicesHeartbeatTelemetryModule = false;
            aiOptions.EnableAuthenticationTrackingJavaScript = false;
            aiOptions.ConnectionString = connectionString;
            return aiOptions;
        }
    }
}
