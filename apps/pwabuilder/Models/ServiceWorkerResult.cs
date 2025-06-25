namespace PWABuilder.Models
{
    public class ServiceWorkerBodyErrorResult
    {
        public object? Error { get; set; }
        public string Message { get; set; }
    }

    public class ServiceWorkerContentResult
    {
        public string Raw { get; set; }
        public Uri Url { get; set; }
    }

    public class ServiceWorkerBodyResult
    {
        public ServiceWorkerContentResult? Content { get; set; }
        public ServiceWorkerBodyErrorResult? Error { get; set; }
    }

    public class ServiceWorkerResult
    {
        public int Status { get; set; }
        public ServiceWorkerBodyResult Body { get; set; }
    }

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
}
