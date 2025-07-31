using System.Collections.Generic;

namespace Microsoft.PWABuilder.Windows.Chromium.Models
{
    /// <summary>
    /// Options for generating the legacy EdgeHTML ("Spartan") based PWA app package.
    /// </summary>
    public class SpartanWindowsPackageOptions
    {
        /// <summary>
        /// Whether to generate the EdgeHTML-based PWA app package.
        /// </summary>
        public bool Generate { get; set; }
        /// <summary>
        /// Gets the URL for the package. If null, the URL from <see cref="WindowsAppPackageOptions.Url"/> will be used.
        /// </summary>
        public string? Url { get; set; }

        /// <summary>
        /// The version of the package. If null, the version from <see cref="WindowsAppPackageOptions.Version"/> will be used.
        /// </summary>
        public string? Version { get; set; }

        /// <summary>
        /// The list of URLs the PWA will grant WinRT access to. These can contain wildcard characters (e.g. https://*.microsoft.com).
        /// </summary>
        public List<string> UrlsWithWindowsRuntimeAccess { get; set; } = new List<string>();
    }
}