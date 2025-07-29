using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Microsoft.PWABuilder.Windows.Chromium.Models
{
    /// <summary>
    /// Arguments for generating a Windows app package from a loose file layout.
    /// </summary>
    /// <remarks>
    /// A loose file layout is an unpackaged .msix or .appx. See https://docs.microsoft.com/en-us/windows/uwp/debug-test-perf/loose-file-registration#what-is-a-loose-file-layout
    /// </remarks>
    public class LoosePackageArgs
    {
        /// <summary>
        /// The zip file containing the loose files and directories.
        /// </summary>
        public IFormFile? LooseFileLayoutZip { get; set; }

        /// <summary>
        /// Validates all the properties. An ArgumentException is thrown if any props are invalid.
        /// </summary>
        /// <returns></returns>
        public Validated Validate()
        {
            if (LooseFileLayoutZip == null)
            {
                throw new ArgumentException("Loose file layout zip must not be null");
            }
            if (LooseFileLayoutZip.Length > 10_000_000)
            {
                throw new ArgumentException("Loose file layout zip length cannot be more than 10 MB");
            }

            return new Validated(LooseFileLayoutZip);
        }

        public record Validated(IFormFile LooseLayoutZip)
        {
        }
    }
}
