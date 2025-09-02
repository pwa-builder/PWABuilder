using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Microsoft.PWABuilder.Microsoft.Store.Models
{
    /// <summary>
    /// The result of a modern Windows app package generation.
    /// </summary>
    public class ModernWindowsPackageResult
    {
        public ModernWindowsPackageResult(string storeMsixFilePath, string sideLoadMsixFilePath, HostedPackage packageInfo)
        {
            this.StoreMsixFilePath = storeMsixFilePath;
            this.SideLoadMsixFilePath = sideLoadMsixFilePath;
            this.PackageInfo = packageInfo;
        }

        /// <summary>
        /// The path to the generated MSIX package file to be published to the Store.
        /// </summary>
        public string StoreMsixFilePath { get; }

        /// <summary>
        /// The path to the generated MSIX package file used for side loading / testing on a developer's machine.
        /// </summary>
        public string SideLoadMsixFilePath { get; }

        /// <summary>
        /// Information about the MSIX hosted app.
        /// </summary>
        public HostedPackage PackageInfo { get; }
    }
}
