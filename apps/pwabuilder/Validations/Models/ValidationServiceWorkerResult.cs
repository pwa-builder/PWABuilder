using PWABuilder.Models;

namespace PWABuilder.Validations.Models
{
    public class ServiceWorkerValidationResult
    {
        public List<TestResult>? Validations { get; set; }
        public ServiceWorkerFeatures? SWFeatures { get; set; }
        public string? Error { get; set; }
    }
}
