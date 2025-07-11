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

        public static WebAppManifest? TryGetWebManifest(JsonElement artifacts_lh)
        {
            return
                artifacts_lh.ValueKind == JsonValueKind.Object
                && artifacts_lh.TryGetProperty("Manifest", out var manifestElem)
                && manifestElem.ValueKind == JsonValueKind.Object
                ? new WebAppManifest
                {
                    url = manifestElem.TryGetProperty("url", out var urlElem)
                        ? urlElem.GetString()
                        : null,
                    raw = manifestElem.TryGetProperty("raw", out var rawElem)
                        ? rawElem.GetString()
                        : null,
                    json =
                        manifestElem.TryGetProperty("raw", out var rawElem2)
                        && rawElem2.ValueKind == JsonValueKind.String
                            ? TryParseJson(rawElem2.GetString())
                            : null,
                }
                : null;
        }

        public static Report MapReportOutput(
            JsonElement audits,
            WebAppManifest? webAppManifest,
            string? swUrl,
            ServiceWorkerValidationResult? serviceWorkerResult,
            ImagesAudit imagesAudit,
            IEnumerable<Validation> manifestValidations,
            IEnumerable<TestResult> securityValidations
        )
        {
            audits.TryGetProperty("service-worker-audit", out var swAudit);

            var iconsValidation =
                imagesAudit.details != null ? imagesAudit.details.iconsValidation : null;
            var screenshotsValidation =
                imagesAudit.details != null ? imagesAudit.details.screenshotsValidation : null;
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

            var scriptUrl =
                swAudit.ValueKind == JsonValueKind.Object
                && swAudit.TryGetProperty("details", out var swDetailsObj)
                && swDetailsObj.ValueKind == JsonValueKind.Object
                && swDetailsObj.TryGetProperty("scriptUrl", out var scriptUrlElem)
                    ? scriptUrlElem.GetString()
                    : null;

            var scopeUrl =
                swAudit.ValueKind == JsonValueKind.Object
                && swAudit.TryGetProperty("details", out var swDetailsObj2)
                && swDetailsObj2.ValueKind == JsonValueKind.Object
                && swDetailsObj2.TryGetProperty("scopeUrl", out var scopeUrlElem)
                    ? scopeUrlElem.GetString()
                    : null;

            var error =
                swAudit.ValueKind == JsonValueKind.Object
                && swAudit.TryGetProperty("details", out var swDetailsObj3)
                && swDetailsObj3.ValueKind == JsonValueKind.Object
                && swDetailsObj3.TryGetProperty("error", out var errorElem)
                    ? errorElem.GetString()
                    : null;

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
                ? new ServiceWorker { url = swUrl, raw = serviceWorkerResult?.SWFeatures?.Raw }
                : null;

            var finalArtifacts = CreateIfNotAllNull(
                () =>
                    new Artifacts
                    {
                        webAppManifest = webAppManifest,
                        serviceWorker = serviceWorker,
                    },
                webAppManifest,
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
