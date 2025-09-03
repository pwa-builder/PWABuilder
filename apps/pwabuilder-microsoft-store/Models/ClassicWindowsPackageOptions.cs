using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PWABuilder.MicrosoftStore.Models
{
    /// <summary>
    /// Options for creating the Windows package that runs on older versions of Windows (prior to 10.0.19041, May 2020 Update).
    /// </summary>
    public class ClassicWindowsPackageOptions
    {
        /// <summary>
        /// Whether to generate the classic app package.
        /// </summary>
        public bool Generate { get; set; }

        /// <summary>
        /// The version of the classic app package.
        /// </summary>
        public string? Version { get; set; } = string.Empty;

        /// <summary>
        /// The URL to use for the classic app package PWA. If null, the URL from the parent WindowsAppPackageOptions will be used.
        /// </summary>
        public string? Url { get; set; }
    }
}
