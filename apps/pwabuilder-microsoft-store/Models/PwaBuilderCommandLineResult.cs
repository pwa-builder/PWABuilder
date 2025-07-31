using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Microsoft.PWABuilder.Windows.Chromium.Models
{
    /// <summary>
    /// Result from running the pwa_builder command line tool.
    /// </summary>
    public class PwaBuilderCommandLineResult : ProcessResult
    {
        /// <summary>
        /// The generated MSIX file.
        /// </summary>
        public string MsixFile { get; set; } = string.Empty;

        /// <summary>
        /// Generated MSIX files for each platform if app contains widgets
        /// </summary>
        public List<string> MsixPlatformFiles { get; set; } = new ();

        /// <summary>
        /// The Appx Manifest file containing app package information formatted as XML.
        /// </summary>
        public string AppxManifest { get; set; } = string.Empty;

        /// <summary>
        /// Gets the output directory containing the .msix and artifacts.
        /// </summary>
        public string OutputDirectory { get; set; } = string.Empty;
    }
}
