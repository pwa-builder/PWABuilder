using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Microsoft.PWABuilder.Windows.Chromium.Models
{
    /// <summary>
    /// Publisher information for a Windows app package.
    /// </summary>
    public class Publisher
    {
        /// <summary>
        /// The name of the publisher as displayed in the Store.
        /// </summary>
        public string? DisplayName { get; set; }

        /// <summary>
        /// The common name of the publisher. Typically, this is GUID from the developer's Windows Dev Center account, e.g. "CN=3a54a224-05dd-42aa-85bd-3f3c1478fdca"
        /// See https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/find-publisher.md
        /// </summary>
        public string? CommonName { get; set; }

        public static Publisher? FromDistinguishedName(string? distinguishedName)
        {
            if (string.IsNullOrWhiteSpace(distinguishedName))
            {
                return null;
            }

            var cn = distinguishedName.Split(',').FirstOrDefault(part => part.StartsWith("CN=", StringComparison.InvariantCultureIgnoreCase));
            if (!string.IsNullOrWhiteSpace(cn))
            {
                return new Publisher
                {
                    CommonName = cn
                };
            }

            return null;
        }
    }
}
