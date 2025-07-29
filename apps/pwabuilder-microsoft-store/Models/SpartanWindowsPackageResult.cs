using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Microsoft.PWABuilder.Windows.Chromium.Models
{
    /// <summary>
    /// The result of an app package generation for a PWA powered by legacy EdgeHTML ("Spartan")-based version of Edge.
    /// </summary>
    public class SpartanWindowsPackageResult
    {
        /// <summary>
        /// The path to the generated appx file.
        /// </summary>
        public string AppxPath { get; set; } = string.Empty;

        /// <summary>
        /// The path of the directory containing the APPX loose files. This can be used to sideload the Spartan package on a developer's machine.
        /// </summary>
        public string AppxLooseFilesDirectory { get; set; } = string.Empty;
    }
}
