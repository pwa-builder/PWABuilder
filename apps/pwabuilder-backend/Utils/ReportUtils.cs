using System.Text.Json;
using PWABuilder.Models;

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

        public static Report MapReport(JsonElement audits, JsonElement artifacts_lh)
        {
            audits.TryGetProperty("images-audit", out var imagesAudit);
            audits.TryGetProperty("installable-manifest", out var installableManifestAudit);
            audits.TryGetProperty("service-worker-audit", out var swAudit);

            string? swUrl =
                swAudit.ValueKind == JsonValueKind.Object
                && swAudit.TryGetProperty("details", out var swDetails)
                && swDetails.ValueKind == JsonValueKind.Object
                && swDetails.TryGetProperty("scriptUrl", out var swUrlElem)
                    ? swUrlElem.GetString()
                    : null;
            object? swFeatures = null;

            var iconsValidation =
                imagesAudit.ValueKind == JsonValueKind.Object
                && imagesAudit.TryGetProperty("details", out var imagesDetailsObj)
                && imagesDetailsObj.ValueKind == JsonValueKind.Object
                && imagesDetailsObj.TryGetProperty("iconsValidation", out var iconsValidationElem)
                    ? iconsValidationElem.ToString()
                    : null;

            var screenshotsValidation =
                imagesAudit.ValueKind == JsonValueKind.Object
                && imagesAudit.TryGetProperty("details", out var imagesDetailsObj2)
                && imagesDetailsObj2.ValueKind == JsonValueKind.Object
                && imagesDetailsObj2.TryGetProperty(
                    "screenshotsValidation",
                    out var screenshotsValidationElem
                )
                    ? screenshotsValidationElem.ToString()
                    : null;

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

            var finalServiceWorkerDetails = CreateIfNotAllNull(
                () =>
                    new ServiceWorkerDetails
                    {
                        url = scriptUrl,
                        scope = scopeUrl,
                        features = swFeatures,
                        error = error,
                    },
                scriptUrl,
                scopeUrl,
                swFeatures,
                error
            );

            return new Report
            {
                audits = new Audits
                {
                    isOnHttps = new ScoreObj
                    {
                        score =
                            audits.TryGetProperty("https-audit", out var httpsAudit)
                            && httpsAudit.ValueKind == JsonValueKind.Object
                            && httpsAudit.TryGetProperty("score", out var scoreProp)
                            && scoreProp.ValueKind == JsonValueKind.True,
                    },
                    noMixedContent = new ScoreObj
                    {
                        score =
                            audits.TryGetProperty("is-on-https", out var mixedContentAudit)
                            && mixedContentAudit.ValueKind == JsonValueKind.Object
                            && mixedContentAudit.TryGetProperty("score", out var mixedScore)
                            && (
                                mixedScore.ValueKind == JsonValueKind.True
                                || mixedScore.ValueKind == JsonValueKind.False
                            ),
                    },
                    installableManifest = new InstallableManifestAudit
                    {
                        score =
                            installableManifestAudit.ValueKind == JsonValueKind.Object
                            && installableManifestAudit.TryGetProperty("score", out var imScore)
                            && (
                                imScore.ValueKind == JsonValueKind.True
                                || imScore.ValueKind == JsonValueKind.False
                            ),
                        details = finalInstallableManifestDetails,
                    },
                    serviceWorker = new ServiceWorkerAudit
                    {
                        score =
                            swAudit.ValueKind == JsonValueKind.Object
                            && swAudit.TryGetProperty("score", out var swScore)
                            && (
                                swScore.ValueKind == JsonValueKind.True
                                || swScore.ValueKind == JsonValueKind.False
                            ),
                        details = finalServiceWorkerDetails,
                    },
                    offlineSupport = new ScoreObj
                    {
                        score =
                            audits.TryGetProperty("offline-audit", out var offlineAudit)
                            && offlineAudit.ValueKind == JsonValueKind.Object
                            && offlineAudit.TryGetProperty("score", out var offlineScore)
                            && (
                                offlineScore.ValueKind == JsonValueKind.True
                                || offlineScore.ValueKind == JsonValueKind.False
                            ),
                    },
                    images = new ImagesAudit
                    {
                        score =
                            imagesAudit.ValueKind == JsonValueKind.Object
                            && imagesAudit.TryGetProperty("score", out var imagesScore)
                            && (
                                imagesScore.ValueKind == JsonValueKind.True
                                || imagesScore.ValueKind == JsonValueKind.False
                            ),
                        details = finalImagesDetails,
                    },
                },
                artifacts = new Artifacts
                {
                    webAppManifest =
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
                            : null,
                    serviceWorker = !string.IsNullOrEmpty(swUrl)
                        ? new ServiceWorker { url = swUrl }
                        : null,
                },
            };
        }
    }
}
