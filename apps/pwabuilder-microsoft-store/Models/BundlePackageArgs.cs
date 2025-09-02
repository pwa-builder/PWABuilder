using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Microsoft.PWABuilder.Microsoft.Store.Models
{
    /// <summary>
    /// Arguments for bundling an app package.
    /// </summary>
    public class BundlePackageArgs
    {
        /// <summary>
        /// The app package to update.
        /// </summary>
        public IFormFile? Package { get; set; }

        /// <summary>
        /// The version to set on the bundle.
        /// </summary>
        public string? Version { get; set; }

        /// <summary>
        /// Validates all the properties. An ArgumentException is thrown if any props are invalid.
        /// </summary>
        /// <returns></returns>
        public Validated Validate()
        {
            if (Package == null)
            {
                throw new ArgumentException("Package must not be null");
            }
            if (Package.Length > 10_000_000)
            {
                throw new ArgumentException("Package length cannot be more than 10 MB");
            }

            if (string.IsNullOrWhiteSpace(Version))
            {
                throw new ArgumentNullException("Version must not be null");
            }

            if (!System.Version.TryParse(Version, out var validVersion))
            {
                throw new ArgumentException("Version must be a valid version, in the form of X.X.X.X");
            }

            if (validVersion.Revision != 0 && validVersion.Revision != -1)
            {
                throw new ArgumentOutOfRangeException("Version revision is reserved for Store use. Use 0 or omit the revision, e.g. 'X.X.X.0' or 'X.X.X'");
            }

            return new Validated(Package, validVersion);
        }

        public record Validated(IFormFile Package, Version Version)
        {
        }
    }
}
