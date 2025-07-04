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
            AnalyzeServiceWorkerResponse? swFeatures,
            ImagesAudit imagesAudit,
            IEnumerable<ManifestSingleField>? manifestValidations = null
        )
        {
            audits.TryGetProperty("installable-manifest", out var installableManifestAudit);
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

            var manifestUrl =
                installableManifestAudit.ValueKind == JsonValueKind.Object
                && installableManifestAudit.TryGetProperty("details", out var imDetailsObj)
                && imDetailsObj.ValueKind == JsonValueKind.Object
                && imDetailsObj.TryGetProperty("debugData", out var debugData)
                && debugData.ValueKind == JsonValueKind.Object
                && debugData.TryGetProperty("manifestUrl", out var manifestUrlElem)
                    ? manifestUrlElem.GetString()
                    : null;

            var validation =
                installableManifestAudit.ValueKind == JsonValueKind.Object
                && installableManifestAudit.TryGetProperty("details", out var imDetailsObj2)
                && imDetailsObj2.ValueKind == JsonValueKind.Object
                && imDetailsObj2.TryGetProperty("validation", out var validationElem)
                    ? validationElem.ToString()
                    : null;

            var finalInstallableManifestDetails = CreateIfNotAllNull(
                () => new InstallableManifestDetails { url = manifestUrl, validation = validation },
                manifestUrl,
                validation
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

            var filteredSwFeatures =
                swFeatures == null
                    ? null
                    : new AnalyzeServiceWorkerResponse
                    {
                        DetectedBackgroundSync = swFeatures.DetectedBackgroundSync,
                        DetectedPeriodicBackgroundSync = swFeatures.DetectedPeriodicBackgroundSync,
                        DetectedPushRegistration = swFeatures.DetectedPushRegistration,
                        DetectedSignsOfLogic = swFeatures.DetectedSignsOfLogic,
                        DetectedEmpty = swFeatures.DetectedEmpty,
                        Error = swFeatures.Error,
                    };

            var finalServiceWorkerDetails = CreateIfNotAllNull(
                () =>
                    new ServiceWorkerDetails
                    {
                        url = scriptUrl,
                        scope = scopeUrl,
                        features = filteredSwFeatures,
                        error = error,
                    },
                scriptUrl,
                scopeUrl,
                filteredSwFeatures,
                error
            );

            var serviceWorker = !string.IsNullOrEmpty(swUrl)
                ? new ServiceWorker { url = swUrl, raw = swFeatures?.Raw }
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
                validations = manifestValidations,
                audits = new Audits
                {
                    isOnHttps = new ScoreObj
                    {
                        score =
                            audits.TryGetProperty("https-audit", out var httpsAudit)
                            && httpsAudit.ValueKind == JsonValueKind.Object
                            && httpsAudit.TryGetProperty("score", out var httpsScoreElem)
                            && httpsScoreElem.TryGetDouble(out var httpsScore)
                                ? httpsScore != 0
                                : false,
                    },
                    noMixedContent = new ScoreObj
                    {
                        score =
                            audits.TryGetProperty("is-on-https", out var mixedContentAudit)
                            && mixedContentAudit.ValueKind == JsonValueKind.Object
                            && mixedContentAudit.TryGetProperty("score", out var mixedScoreElem)
                            && mixedScoreElem.TryGetDouble(out var mixedScore)
                                ? mixedScore != 0
                                : false,
                    },
                    installableManifest = new InstallableManifestAudit
                    {
                        score =
                            installableManifestAudit.ValueKind == JsonValueKind.Object
                            && installableManifestAudit.TryGetProperty(
                                "score",
                                out var installableScoreElem
                            )
                            && installableScoreElem.TryGetDouble(out var installableScore)
                                ? installableScore != 0
                                : false,
                        details = finalInstallableManifestDetails,
                    },
                    serviceWorker = new ServiceWorkerAudit
                    {
                        score =
                            swAudit.ValueKind == JsonValueKind.Object
                            && swAudit.TryGetProperty("score", out var swScoreElem)
                            && swScoreElem.TryGetDouble(out var swScore)
                                ? swScore != 0
                                : false,
                        details = finalServiceWorkerDetails,
                    },
                    offlineSupport = new ScoreObj
                    {
                        score =
                            audits.TryGetProperty("offline-audit", out var offlineAudit)
                            && offlineAudit.ValueKind == JsonValueKind.Object
                            && offlineAudit.TryGetProperty("score", out var offlineScoreElem)
                            && offlineScoreElem.TryGetDouble(out var offlineScore)
                                ? offlineScore != 0
                                : false,
                    },
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
