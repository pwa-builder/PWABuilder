using System.Text.Json;
using PWABuilder.Models;
using PWABuilder.Validations.Models;

namespace PWABuilder.Validations
{
    public static class SecurityValidation
    {
        public static IEnumerable<TestResult> ValidateSecurityAsync(LighthouseReport report)
        {
            // TODO: Adjust this to use the new security audits
            // Installable must be on https, probably mixed content due redirects.

            var isOnHttps = report.HttpsAudit?.Score == 1;
            var installableManifest = report.InstallableManifestAudit?.Score == 1;
            var noMixedContent = report.IsOnHttpsAudit?.Score == 1;
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
        }
    }
}
