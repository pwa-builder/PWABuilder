using System.Runtime.CompilerServices;
using System.Text.Json;
using PWABuilder.Models;
using PWABuilder.Validations.Models;

namespace PWABuilder.Utils
{
    public class ReportUtils
    {
        private static object? TryParseJson(string? json)
        {
            if (string.IsNullOrWhiteSpace(json))
                return null;
            try
            {
                return JsonSerializer.Deserialize<object>(json);
            }
            catch
            {
                return null;
            }
        }

        private static T? CreateIfNotAllNull<T>(Func<T> factory, params object?[] values)
            where T : class
        {
            bool allNull = values.All(v => v == null);
            return allNull ? null : factory();
        }

        public static string? TryGetServiceWorkerUrl(JsonElement audits)
        {
            return
                audits.TryGetProperty("service-worker-audit", out var swAudit)
                && swAudit.TryGetProperty("details", out var swDetails)
                && swDetails.ValueKind == JsonValueKind.Object
                && swDetails.TryGetProperty("scriptUrl", out var swUrlElem)
                ? swUrlElem.GetString()
                : null;
        }

        public static WebAppManifestDetails? TryGetWebManifest(LighthouseReport report)
        {
            if (report.WebAppManifestAudit != null)
            {
                return new WebAppManifestDetails
                {
                    url = report.WebAppManifestAudit.Details?.ManifestUrl,
                    json = TryParseJson(report.WebAppManifestAudit.Details?.ManifestRaw),
                    raw = report.WebAppManifestAudit?.Details?.ManifestRaw
                };
            }

            return null;
        }

        public static Report MapReportOutput(
            LighthouseReport report,
            WebAppManifestDetails? webAppManifestDetails,
            string? swUrl,
            ServiceWorkerValidationResult? serviceWorkerResult,
            ImagesAudit imagesAudit,
            IEnumerable<Validation> manifestValidations,
            IEnumerable<TestResult> securityValidations
        )
        {
            var iconsValidation = imagesAudit.details?.iconsValidation;
            var screenshotsValidation = imagesAudit.details?.screenshotsValidation;
            var finalImagesDetails = CreateIfNotAllNull(
                () =>
                    new ImagesDetails
                    {
                        iconsValidation = iconsValidation,
                        screenshotsValidation = screenshotsValidation,
                    },
                iconsValidation,
                screenshotsValidation
            );

            var scriptUrl = report.ServiceWorkerAudit?.Details?.ScriptUrl;
            var scopeUrl = report.ServiceWorkerAudit?.Details?.ScopeUrl;
            var error = report.ServiceWorkerAudit?.Details?.Error;
            var finalServiceWorker = CreateIfNotAllNull(
                () =>
                    new ServiceWorkerAudit
                    {
                        url = scriptUrl,
                        scope = scopeUrl,
                        error = error ?? serviceWorkerResult?.Error,
                    },
                scriptUrl,
                scopeUrl,
                error ?? serviceWorkerResult?.Error
            );

            var serviceWorker = !string.IsNullOrEmpty(swUrl)
                ? new ServiceWorker { url = swUrl, raw = [] } //raw = serviceWorkerResult?.SWFeatures?.Raw
                : null;

            var finalArtifacts = CreateIfNotAllNull(
                () =>
                    new Artifacts
                    {
                        webAppManifestDetails = webAppManifestDetails,
                        serviceWorker = serviceWorker,
                    },
                webAppManifestDetails,
                serviceWorker
            );

            return new Report
            {
                manifestValidations = manifestValidations,
                serviceWorkerValidations = serviceWorkerResult?.Validations,
                securityValidations = securityValidations,
                audits = new Audits
                {
                    serviceWorker = finalServiceWorker,
                    images = new ImagesAudit
                    {
                        score = imagesAudit.score,
                        details = finalImagesDetails,
                    },
                },
                artifacts = finalArtifacts,
            };
        }
    }
}
