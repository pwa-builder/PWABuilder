using Microsoft.Extensions.Logging;
using PWABuilder.MicrosoftStore.Common;
using PWABuilder.MicrosoftStore.Models;
using System;
using System.IO;
using System.Threading.Tasks;

namespace PWABuilder.MicrosoftStore
{
    /// <summary>
    /// Service that bundles a .msix or .appx file into a .msixbundle or .appxbundle.
    /// </summary>
    public class WindowsAppPackageBundler
    {
        private readonly MakeAppxWrapper makeAppx;
        private readonly TempDirectory temp;

        public WindowsAppPackageBundler(
            MakeAppxWrapper makeAppx, 
            TempDirectory temp)
        {
            this.makeAppx = makeAppx;
            this.temp = temp;
        }

        /// <summary>
        /// Bundles the package and returns a stream to the new bundle file.
        /// </summary>
        /// <param name="bundleArgs">The bundling arguments containing the package file and desired bundle version.</param>
        /// <returns>A stream to the new bundle file. Callers are responsible for disposal.</returns>
        public async Task<Stream> Bundle(BundlePackageArgs.Validated bundleArgs)
        {
            // Copy the package to a temp directory.
            var tempDirectory = temp.CreateDirectory();
            var packageFilePath = temp.CreateFile(".msix");
            using (var packageFile = File.OpenWrite(packageFilePath))
            {
                await bundleArgs.Package.CopyToAsync(packageFile);
            }

            // Move the file into the temp directory so we can package cleanly.
            // Otherwise, the bundle command will look for other files in temp.
            var packageFilePathInTempDirectory = Path.Combine(tempDirectory, "App.msix");
            File.Move(packageFilePath, packageFilePathInTempDirectory);

            // Run MakeAppx to bundle it.
            var bundleFilePath = await makeAppx.Bundle(packageFilePathInTempDirectory, bundleArgs.Version.WithZeroRevision());
            return File.OpenRead(bundleFilePath);
        }
    }
}
