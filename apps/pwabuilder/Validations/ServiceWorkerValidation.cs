using System.Text.Json;
using PWABuilder.Services;
using PWABuilder.Validations.Models;

namespace PWABuilder.Validations
{
    public static class ServiceWorkerValidation
    {
        public static async Task<ServiceWorkerValidationResult> ValidateServiceWorkerAsync(
            IServiceWorkerAnalyzer serviceWorkerAnalyzer,
            string? serviceWorkerUrl,
            JsonElement? audits = null
        )
        {
            var response = string.IsNullOrWhiteSpace(serviceWorkerUrl)
                ? null
                : await serviceWorkerAnalyzer.AnalyzeServiceWorkerAsync(serviceWorkerUrl);

            var offlineSupport =
                audits != null
                && audits.Value.TryGetProperty("offline-audit", out var offlineAudit)
                && offlineAudit.ValueKind == JsonValueKind.Object
                && offlineAudit.TryGetProperty("score", out var offlineScoreElem)
                && offlineScoreElem.ValueKind == JsonValueKind.Number
                && offlineScoreElem.TryGetDouble(out var offlineScore)
                    ? offlineScore != 0
                    : false;

            var hasServiceWorker = response?.Error == null;

            if (
                audits != null
                && audits.Value.TryGetProperty("service-worker-audit", out var swAudit)
            )
            {
                hasServiceWorker =
                    swAudit.ValueKind == JsonValueKind.Object
                    && swAudit.TryGetProperty("score", out var swScoreElem)
                    && swScoreElem.ValueKind == JsonValueKind.Number
                    && swScoreElem.TryGetDouble(out var swScore)
                        ? swScore != 0
                        : false;
            }

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
                        Result = offlineSupport,
                        InfoString = offlineSupport
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
