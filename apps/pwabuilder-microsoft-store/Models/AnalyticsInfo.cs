namespace Microsoft.PWABuilder.Windows.Chromium.Models
{
    public class AnalyticsInfo
    {
        public string? platformId { get; set; } = null;
        public string? platformIdVersion { get; set; } = null;
        public string? correlationId { get; set; } = null; 
        public string? referrer { get; set; } = null;
    }
}
