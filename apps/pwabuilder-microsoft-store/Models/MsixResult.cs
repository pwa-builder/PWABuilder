using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Microsoft.PWABuilder.Microsoft.Store.Models
{
    /// <summary>
    /// The result of an MSIX package generation.
    /// </summary>
    public class MsixResult
    {
        public MsixResult(ModernWindowsPackageResult package, byte[] msixBytes)
        {
            this.Package = package;
            this.MsixBytes = msixBytes;
        }

        /// <summary>
        /// Gets the app package that runs on modern versions of Windows.
        /// </summary>
        public ModernWindowsPackageResult Package { get; set; }

        /// <summary>
        /// The bytes of the MSIX package.
        /// </summary>
        public byte[] MsixBytes { get; set; }
    }
}
