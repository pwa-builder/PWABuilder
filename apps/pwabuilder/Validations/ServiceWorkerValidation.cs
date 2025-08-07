using System.Text.Json;
using PWABuilder.Models;
using PWABuilder.Services;
using PWABuilder.Validations.Models;

namespace PWABuilder.Validations
{
    public static class ServiceWorkerValidation
    {
        public static async Task<ServiceWorkerValidationResult> ValidateServiceWorkerAsync(
            IServiceWorkerAnalyzer serviceWorkerAnalyzer,
            string? serviceWorkerUrl,
            LighthouseReport lighthouseReport)
        {
            var response = string.IsNullOrWhiteSpace(serviceWorkerUrl)
                ? null
                : await serviceWorkerAnalyzer.AnalyzeServiceWorkerAsync(serviceWorkerUrl);
            var offlineSupport = lighthouseReport.OfflineAudit?.Score == 1;
            var hasServiceWorker = response != null && response?.Error == null;
            hasServiceWorker = lighthouseReport.ServiceWorkerAudit?.Score == 1;

            return new ServiceWorkerValidationResult
            {
                SWFeatures = response,
                Validations =
                [
                    new()
                    {
                        Result = hasServiceWorker,
                        InfoString = hasServiceWorker
                            ? "Has a Service Worker"
                            : "Does not have a Service Worker",
                        Category = "highly recommended",
                        Member = "has_service_worker",
                    },
                    new()
                    {
                        Result = response?.DetectedPeriodicBackgroundSync ?? false,
                        InfoString =
                            (response?.DetectedPeriodicBackgroundSync ?? false)
                                ? "Uses Periodic Sync for a rich offline experience"
                                : "Does not use Periodic Sync for a rich offline experience",
                        Category = "optional",
                        Member = "periodic_sync",
                    },
                    new()
                    {
                        Result = response?.DetectedBackgroundSync ?? false,
                        InfoString =
                            (response?.DetectedBackgroundSync ?? false)
                                ? "Uses Background Sync for a rich offline experience"
                                : "Does not use Background Sync for a rich offline experience",
                        Category = "optional",
                        Member = "background_sync",
                    },
                    new()
                    {
                        Result = response?.DetectedPushRegistration ?? false,
                        InfoString =
                            (response?.DetectedPushRegistration ?? false)
                                ? "Uses Push Notifications"
                                : "Does not use Push Notifications",
                        Category = "optional",
                        Member = "push_notifications",
                    },
                    new()
                    {
                        Result = offlineSupport && hasServiceWorker,
                        InfoString =
                            offlineSupport && hasServiceWorker
                                ? "Has offline support"
                                : "Does not have offline support",
                        Category = "optional",
                        Member = "offline_support",
                    },
                ],
            };
        }
    }
}
