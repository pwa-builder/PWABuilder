using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Microsoft.PWABuilder.Windows.Chromium.Models
{
    /// <summary>
    /// The type of package that was generated. Used in URL analysis logging.
    /// </summary>
    public enum WindowsPackageType
    {
        DeveloperPackage,
        StorePackage
    }
}
