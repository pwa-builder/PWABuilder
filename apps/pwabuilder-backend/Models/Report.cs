namespace PWABuilder.Models
{
    public class AnalyzeServiceWorkerResponse
    {
        public bool? DetectedBackgroundSync { get; set; }
        public bool? DetectedPeriodicBackgroundSync { get; set; }
        public bool? DetectedPushRegistration { get; set; }
        public bool? DetectedSignsOfLogic { get; set; }
        public bool? DetectedEmpty { get; set; }
        public List<string>? Raw { get; set; }
        public string? Error { get; set; }
    }

    public class Report
    {
        public Audits? audits { get; set; }
        public Artifacts? artifacts { get; set; }
    }

    public class Audits
    {
        public ScoreObj? isOnHttps { get; set; }
        public ScoreObj? noMixedContent { get; set; }
        public InstallableManifestAudit? installableManifest { get; set; }
        public ServiceWorkerAudit? serviceWorker { get; set; }
        public ScoreObj? offlineSupport { get; set; }
        public ImagesAudit? images { get; set; }
    }

    public class ScoreObj
    {
        public bool score { get; set; }
    }

    public class InstallableManifestAudit
    {
        public bool score { get; set; }
        public InstallableManifestDetails? details { get; set; }
    }

    public class InstallableManifestDetails
    {
        public string? url { get; set; }
        public object? validation { get; set; }
    }

    public class ServiceWorkerAudit
    {
        public bool score { get; set; }
        public ServiceWorkerDetails? details { get; set; }
    }

    public class ServiceWorkerDetails
    {
        public string? url { get; set; }
        public string? scope { get; set; }
        public object? features { get; set; }
        public object? error { get; set; }
    }

    public class ImagesAudit
    {
        public bool score { get; set; }
        public ImagesDetails? details { get; set; }
    }

    public class ImagesDetails
    {
        public object? iconsValidation { get; set; }
        public object? screenshotsValidation { get; set; }
    }

    public class Artifacts
    {
        public WebAppManifest? webAppManifest { get; set; }
        public ServiceWorker? serviceWorker { get; set; }
    }

    public class WebAppManifest
    {
        public string? url { get; set; }
        public string? raw { get; set; }
        public object? json { get; set; }
    }

    public class ServiceWorker
    {
        public string? url { get; set; }
        public List<string>? raw { get; set; }
    }
}
