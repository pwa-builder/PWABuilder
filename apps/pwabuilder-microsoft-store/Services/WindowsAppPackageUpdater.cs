using Microsoft.Extensions.Logging;
using PWABuilder.MicrosoftStore.Common;
using PWABuilder.MicrosoftStore.Models;
using System;
using System.Collections.Generic;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Threading.Tasks;
using System.Xml;

namespace PWABuilder.MicrosoftStore
{
    /// <summary>
    /// Services that takes an existing Windows App Package (.msix, .appx, .msixbundle, or .appxbundle) 
    /// and updates its package ID, publisher ID, and publisher display name.
    /// </summary>
    /// <remarks>
    /// This is used by Windows Partner Center to automatically fill in PWA package information.
    /// </remarks>
    public class WindowsAppPackageUpdater : IDisposable
    {
        private readonly TempDirectory temp;
        private readonly MakeAppxWrapper makeAppx;

        public WindowsAppPackageUpdater(
            TempDirectory temp,
            MakeAppxWrapper makeAppx,
            ILogger<WindowsAppPackageUpdater> logger)
        {
            this.temp = temp;
            this.makeAppx = makeAppx;
        }

        /// <summary>
        /// Takes in a stream of an app package and updates 
        /// </summary>
        /// <param name="appPackage">The updates to apply.</param>
        /// <returns>Returns a stream to the updated package.</returns>
        public async Task<Stream> UpdatePackage(UpdatePackageArgs.Validated update)
        {
            using var stream = update.Package.OpenReadStream();
            var packageDirectory = await UnzipPackage(stream);
            return await UpdatePackageOrBundle(packageDirectory, update);
        }

        private async Task<Stream> UpdatePackageOrBundle(string packageDirectory, UpdatePackageArgs.Validated update)
        {
            // See if we have a .appx or .msix in the directory.
            // If so, we're a bundle file (.appxbundle or .msixbundle).
            var appxOrMsix = FindAppxOrMsix(packageDirectory);
            if (appxOrMsix != null)
            {
                return await UpdatePackageBundle(appxOrMsix, update);
            }

            // If it's not a bundle, it's a real package file.
            // Update it, rebuild it, and return the rebuilt package.
            UpdateAppxOrMsix(packageDirectory, update);
            var packageFilePath = await BuildPackage(packageDirectory);
            return File.OpenRead(packageFilePath);
        }

        private async Task<Stream> UpdatePackageBundle(string msixFilePath, UpdatePackageArgs.Validated update)
        {
            // Extract the real package to its own directory.
            using var packageStream = File.OpenRead(msixFilePath);
            var packageDirectory = await UnzipPackage(packageStream);

            // Do the update
            var packageVersion = UpdateAppxOrMsix(packageDirectory, update);

            // Re-package
            var packageFilePath = await BuildPackage(packageDirectory);

            // Re-bundle
            var bundleFilePath = await BundlePackage(packageFilePath, packageVersion);

            return File.OpenRead(bundleFilePath);
        }

        /// <summary>
        /// Updates the AppxManifest.xml file with the specified updates. Returns the package's version.
        /// </summary>
        /// <param name="packageDirectory">The directory containined the AppxManifest.xml and other package files.</param>
        /// <param name="update">The updates to apply to the AppxManifest.xml</param>
        /// <returns>The version of the package.</returns>
        private static Version UpdateAppxOrMsix(string packageDirectory, UpdatePackageArgs.Validated update)
        {
            var appxManifestFilePath = Path.Combine(packageDirectory, "AppxManifest.xml");
            if (!File.Exists(appxManifestFilePath))
            {
                throw new FileNotFoundException("Couldn't find AppxManifest.xml inside package", appxManifestFilePath);
            }

            var manifestDoc = new XmlDocument();
            manifestDoc.Load(appxManifestFilePath);

            // Grab the Identity element. It should look like:
            //   <Identity Name="com.messianicradio.edge" Publisher="CN=3a54a224-05dd-42aa-85bd-3f3c1478fdca" Version="1.0.1.0" ProcessorArchitecture="neutral"/>
            var identityElement = manifestDoc.GetRequiredElementByTagName("Identity");

            // Update the Package ID
            var packageIdAttribute = identityElement.GetRequiredAttribute("Name");
            packageIdAttribute.Value = update.PackageId;

            // Update the Publisher ID
            var publisherAttribute = identityElement.GetRequiredAttribute("Publisher");
            publisherAttribute.Value = update.PublisherId;

            // Update the PublisherDisplayName
            var publisherDisplayNameElement = manifestDoc.GetRequiredElementByTagName("PublisherDisplayName");
            publisherDisplayNameElement.InnerText = update.PublisherDisplayName;

            var versionAttribute = identityElement.GetRequiredAttribute("Version");
            var version = Version.Parse(versionAttribute.Value);

            // Overwrite the AppxManifest.xml file
            manifestDoc.Save(appxManifestFilePath);

            return version;
        }

        private async Task<string> UnzipPackage(Stream appPackage)
        {
            // First write the zip stream to a file.
            // Needed because the source stream may not be seekable.
            var zipFilePath = temp.CreateFile();
            using (var zipFileStream = File.OpenWrite(zipFilePath))
            {
                await appPackage.CopyToAsync(zipFileStream);
                await zipFileStream.FlushAsync();
            }

            // Create a directory to hold our zip contents
            var extractedDirectory = temp.CreateDirectory();

            // Extract zip into directory.
            ZipFile.ExtractToDirectory(zipFilePath, extractedDirectory);

            return extractedDirectory;
        }

        private static string? FindAppxOrMsix(string packageDirectory)
        {
            return Directory.EnumerateFiles(packageDirectory)
                .FirstOrDefault(f => f.EndsWith(".appx", StringComparison.OrdinalIgnoreCase) || f.EndsWith(".msix", StringComparison.OrdinalIgnoreCase));
        }

        private Task<string> BuildPackage(string packageDirectory)
        {
            var outputDir = temp.CreateDirectory();
            return this.makeAppx.Execute(packageDirectory, outputDir);
        }

        private Task<string> BundlePackage(string packageFilePath, Version packageVersion)
        {
            return this.makeAppx.Bundle(packageFilePath, packageVersion);
        }

        public void Dispose()
        {
            this.temp.CleanUp();
            GC.SuppressFinalize(this);
        }
    }
}
