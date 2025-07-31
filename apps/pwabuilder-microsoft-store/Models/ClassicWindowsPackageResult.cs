using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Microsoft.PWABuilder.Windows.Chromium.Models
{
    /// <summary>
    /// Result of an app package generation for a PWA powered by Chromium-based Edge that works on versions of Windows prior to May 2020 update.
    /// </summary>
    public class ClassicWindowsPackageResult
    {
        public string AppxFilePath { get; set; } = string.Empty;
    }
}
