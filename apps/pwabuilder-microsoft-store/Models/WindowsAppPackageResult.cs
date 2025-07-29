using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Microsoft.PWABuilder.Windows.Chromium.Models
{
    /// <summary>
    /// Contains information about an app package generation.
    /// </summary>
    public class WindowsAppPackageResult : PwaBuilderCommandLineResult
    {
        public WindowsAppPackageResult(ModernWindowsPackageResult? modernAppPackage, ClassicWindowsPackageResult? classicAppPackage, SpartanWindowsPackageResult? edgeHtmlAppPackage, byte[] packageBytes)
        {
            this.ModernAppPackage = modernAppPackage;
            this.ClassicAppPackage = classicAppPackage;
            this.EdgeHtmlAppPackage = edgeHtmlAppPackage;
            this.PackageBytes = packageBytes;
        }

        /// <summary>
        /// Gets the app package that runs on modern versions of Windows.
        /// </summary>
        public ModernWindowsPackageResult? ModernAppPackage { get; set; }

        /// <summary>
        /// Gets the app package that runs on classic versions of Windows. This can be null if the user didn't request the classic package to be generated.
        /// </summary>
        public ClassicWindowsPackageResult? ClassicAppPackage { get; set; }

        /// <summary>
        /// Gets the app package powered by legacy EdgeHTML ("Spartan")-based Edge.
        /// </summary>
        public SpartanWindowsPackageResult? EdgeHtmlAppPackage { get; set; }

        /// <summary>
        /// The bytes of the generated zip package containing the modern app (.msix), the classic app (.appx), and related artifacts such as readme.
        /// </summary>
        public byte[] PackageBytes { get; set; }
    }
}
