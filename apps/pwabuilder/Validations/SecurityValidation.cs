using System.Text.Json;
using PWABuilder.Validations.Models;

namespace PWABuilder.Validations
{
    public static class SecurityValidation
    {
        public static async Task<IEnumerable<TestResult>> ValidateSecurityAsync(JsonElement audits)
        {
            return await Task.Run<IEnumerable<TestResult>>(() =>
            {
                // TODO: Adjust this to use the new security audits
                // Installable can't be not on https, probably mixed content due redirects.
                var isOnHttps =
                    audits.TryGetProperty("https-audit", out var httpsAudit)
                    && httpsAudit.ValueKind == JsonValueKind.Object
                    && httpsAudit.TryGetProperty("score", out var httpsScoreElem)
                    && httpsScoreElem.ValueKind == JsonValueKind.Number
                    && httpsScoreElem.TryGetDouble(out var httpsScore)
                        ? httpsScore != 0
                        : false;

                var installableManifest =
                    audits.TryGetProperty("installable-manifest", out var installableManifestAudit)
                    && installableManifestAudit.ValueKind == JsonValueKind.Object
                    && installableManifestAudit.TryGetProperty(
                        "score",
                        out var installableScoreElem
                    )
                    && installableScoreElem.ValueKind == JsonValueKind.Number
                    && installableScoreElem.TryGetDouble(out var installableScore)
                        ? installableScore != 0
                        : false;

                var noMixedContent =
                    audits.TryGetProperty("is-on-https", out var mixedContentAudit)
                    && mixedContentAudit.ValueKind == JsonValueKind.Object
                    && mixedContentAudit.TryGetProperty("score", out var mixedScoreElem)
                    && mixedScoreElem.ValueKind == JsonValueKind.Number
                    && mixedScoreElem.TryGetDouble(out var mixedScore)
                        ? mixedScore != 0
                        : false;

                return
                [
                    new()
                    {
                        Result = isOnHttps || installableManifest,
                        InfoString =
                            isOnHttps || installableManifest ? "Uses HTTPS" : "Does not use HTTPS",
                        Category = "required",
                        Member = "https",
                    },
                    new()
                    {
                        Result = isOnHttps || installableManifest,
                        InfoString =
                            isOnHttps || installableManifest
                                ? "Has a valid SSL certificate"
                                : "Does not have a valid SSL certificate",
                        Category = "required",
                        Member = "ssl",
                    },
                    new()
                    {
                        Result = noMixedContent,
                        InfoString = noMixedContent
                            ? "No mixed content on page"
                            : "Uses mixed content on page or http redirect on loads",
                        Category = "required",
                        Member = "mixed_content",
                    },
                ];
            });
        }
    }
}
