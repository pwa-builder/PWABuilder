namespace PWABuilder.Models
{
    public class AnalyticsInfo
    {
        public Uri? Url { get; set; }
        public string? PlatformId { get; set; }
        public string? PlatformIdVersion { get; set; }
        public string? CorrelationId { get; set; }
        public string? Referrer { get; set; } = null;
        public IDictionary<string, string>? Properties { get; set; }
    }
}
