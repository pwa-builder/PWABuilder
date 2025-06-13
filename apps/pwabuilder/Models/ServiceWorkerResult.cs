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
}
