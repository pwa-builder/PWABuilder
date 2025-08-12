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
            Uri? serviceWorkerUrl,
            Uri appUrl,
            LighthouseReport lighthouseReport,
            ILogger logger,
            CancellationToken cancelToken)
        {
            var serviceWorkerAnalysis = serviceWorkerUrl == null ? null : await serviceWorkerAnalyzer.AnalyzeServiceWorkerAsync(serviceWorkerUrl, appUrl, logger, cancelToken);
            var offlineSupport = lighthouseReport.OfflineAudit?.Score == 1;
            var hasServiceWorker = serviceWorkerUrl != null;
            hasServiceWorker = lighthouseReport.ServiceWorkerAudit?.Score == 1;

            return new ServiceWorkerValidationResult
            {
                SWFeatures = serviceWorkerAnalysis,
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
                        Result = serviceWorkerAnalysis?.PeriodicBackgroundSync ?? false,
                        InfoString =
                            (serviceWorkerAnalysis?.PeriodicBackgroundSync ?? false)
                                ? "Uses Periodic Sync for a rich offline experience"
                                : "Does not use Periodic Sync for a rich offline experience",
                        Category = "optional",
                        Member = "periodic_sync",
                    },
                    new()
                    {
                        Result = serviceWorkerAnalysis?.BackgroundSync ?? false,
                        InfoString =
                            (serviceWorkerAnalysis?.BackgroundSync ?? false)
                                ? "Uses Background Sync for a rich offline experience"
                                : "Does not use Background Sync for a rich offline experience",
                        Category = "optional",
                        Member = "background_sync",
                    },
                    new()
                    {
                        Result = serviceWorkerAnalysis?.PushRegistration ?? false,
                        InfoString =
                            (serviceWorkerAnalysis?.PushRegistration ?? false)
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
