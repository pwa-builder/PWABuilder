using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Microsoft.PWABuilder.Windows.Chromium.Models
{
    public enum PackageType
    {
        /// <summary>
        /// The MSIX file only
        /// </summary>
        MsixOnly,
        /// <summary>
        /// A zip file containing the MSIX file and related artifacts such as the package XML and JSON files.
        /// </summary>
        Zip
    }
}
