using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PWABuilder.MicrosoftStore.Models
{
    /// <summary>
    /// Arguments for updating an app package's information.
    /// </summary>
    public class UpdatePackageArgs
    {
        /// <summary>
        /// The app package to update.
        /// </summary>
        public IFormFile? Package { get; set; }

        /// <summary>
        /// The new ID to set on the package.
        /// </summary>
        public string? PackageId { get; set; }

        /// <summary>
        /// The new publisher ID ("CN=ABC123...") to set on the package.
        /// </summary>
        public string? PublisherId { get; set; }

        /// <summary>
        /// The new publisher display name to set on the package.
        /// </summary>
        public string? PublisherDisplayName { get; set; }

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

            if (string.IsNullOrWhiteSpace(PackageId))
            {
                throw new ArgumentNullException("Package ID must not be null");
            }
            if (string.IsNullOrWhiteSpace(PublisherId))
            {
                throw new ArgumentException("Publisher ID must not be null");
            }
            if (string.IsNullOrWhiteSpace(PublisherDisplayName))
            {
                throw new ArgumentNullException("Publisher display name must not be null");
            }

            return new Validated(Package, PackageId, PublisherId, PublisherDisplayName);
        }

        public record Validated(IFormFile Package, string PackageId, string PublisherId, string PublisherDisplayName)
        {
        }
    }
}
