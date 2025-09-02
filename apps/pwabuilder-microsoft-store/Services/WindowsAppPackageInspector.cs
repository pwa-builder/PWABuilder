using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Threading.Tasks;

namespace Microsoft.PWABuilder.Microsoft.Store.Services
{
    /// <summary>
    /// Inspects an .msix, .msixbundle, .appx, or .appxbundle.
    /// </summary>
    public class WindowsAppPackageInspector : IDisposable
    {
        private readonly TempDirectory temp;
        private readonly ILogger<WindowsAppPackageInspector> logger;

        private const string appxManifestName = "AppxManifest.xml";

        public WindowsAppPackageInspector(
            TempDirectory temp,
            ILogger<WindowsAppPackageInspector> logger)
        {
            this.temp = temp;
            this.logger = logger;
        }

        /// <summary>
        /// Determines whether the stream of bytes is an app package for a PWA.
        /// </summary>
        /// <param name="packageStream">Bytes stream for the app package.</param>
        /// <returns>True if <paramref name="packageStream"/> contains an app package for a PWA, otherwise false.</returns>
        public async Task<bool> IsPwa(Stream packageStream)
        {
            using var zip = await TryLoadZip(packageStream);
            if (zip == null)
            {
                return false;
            }

            var appxManifestContents = await TryLoadAppxManifest(zip);
            if (appxManifestContents == null)
            {
                return false;
            }

            return CheckManifestHasPWAMarkers(appxManifestContents);
        }

        private async Task<ZipArchive?> TryLoadZip(Stream packageStream)
        {
            // If it's more than 10MB, it's not a PWA package.
            // PWA packages are typically about 1.5 MB.
            if (packageStream.Length > 10_000_000)
            {
                logger.LogInformation("Checked if package is a PWA package, but saw it is {size} bytes, which is too large to be a PWA package", packageStream.Length);
                return null;
            }

            // Copy it to a memory stream, as the source stream may not be seekable.
            var memoryStream = new MemoryStream((int)packageStream.Length);
            await packageStream.CopyToAsync(memoryStream);

            // Reset the stream position, as we're about to load it into a zip archive.
            await memoryStream.FlushAsync();
            memoryStream.Position = 0;

            try
            {
                return new ZipArchive(memoryStream, ZipArchiveMode.Read);
            }
            catch (Exception zipError)
            {
                logger.LogWarning(zipError, "Checked if package stream was a PWA, but the stream doesn't appear to be a zip file.");
                return null;
            }
        }

        private async Task<string?> TryLoadAppxManifest(ZipArchive zip)
        {
            try
            {
                var appxManifest = zip.Entries
                    .FirstOrDefault(e => string.Equals(e.Name, appxManifestName, StringComparison.OrdinalIgnoreCase));

                // If we didn't find an AppxManifest.xml, it may mean we're looking at bundle file (.msixbundle or .appxbundle).
                // In that case, we need to crack open .msix or .appx located inside the bundle.
                if (appxManifest == null)
                {
                    // Find the .msix or .appx package entry.
                    var packageEntry = zip.Entries
                        .FirstOrDefault(e => e.Name.EndsWith(".msix", StringComparison.OrdinalIgnoreCase) || e.Name.EndsWith(".appx"));
                    if (packageEntry != null)
                    {
                        return await TryLoadAppxManifestFromEntry(packageEntry);
                    }
                }
                else
                {
                    return await TryReadAppxManifestString(appxManifest);
                }
            }
            catch (Exception zipEntriesError)
            {
                logger.LogWarning(zipEntriesError, "Checked if package stream was PWA, but encountered an error when searching through the zip's entries.");
                return null;
            }

            return null;
        }

        private async Task<string?> TryLoadAppxManifestFromEntry(ZipArchiveEntry packageEntry)
        {
            try
            {
                using var packageStream = packageEntry.Open();
                using var packageZip = new ZipArchive(packageStream);
                var appxManifestEntry = packageZip.Entries
                    .FirstOrDefault(e => string.Equals(e.Name, appxManifestName, StringComparison.OrdinalIgnoreCase));
                if (appxManifestEntry == null)
                {
                    logger.LogInformation("Checking if package stream was PWA. Couldn't find AppxManifest.xml inside the {name} entry.", packageEntry.Name);
                    return null;
                }

                return await TryReadAppxManifestString(appxManifestEntry);
            }
            catch (Exception packageStreamError)
            {
                logger.LogWarning(packageStreamError, "Checking if package stream was PWA, but encountered an error when loading appx manifest from zip entry {name}.", packageEntry.Name);
                return null;
            }
        }

        private async Task<string?> TryReadAppxManifestString(ZipArchiveEntry appxManifestEntry)
        {
            try
            {
                using var streamReader = new StreamReader(appxManifestEntry.Open());
                return await streamReader.ReadToEndAsync();
            }
            catch (Exception streamError)
            {
                logger.LogWarning(streamError, "Checking if package stream was PWA, we found the entry {name}, but couldn't read its contents", appxManifestEntry.Name);
                return null;
            }
        }

        private bool CheckManifestHasPWAMarkers(string appxManifestContents)
        {
            // PWAs can be either modern or classic
            // - Modern uses the Hosted App Runtime, where the host is Edge. Runs on Windows 10 May 2020 Update or later.
            // - Classic will have special PWABuilder metadata in it. Runs on versions of Windows 10 prior to May 2020 update.

            // Hosted runtime tag looks something like this:
            //      <uap10:HostRuntimeDependency Name="Microsoft.MicrosoftEdge.Stable" Publisher="CN=Microsoft Corporation, O=Microsoft Corporation, L=Redmond, S=Washington, C=US" MinVersion="1.0.0.0"/></Dependencies>
            var isHostedRuntime = appxManifestContents.Contains("HostRuntimeDependency");
            var isHostedByEdge = isHostedRuntime && appxManifestContents.Contains("Name=\"Microsoft.MicrosoftEdge");
            if (isHostedByEdge)
            {
                // OK, we're a Hosted App and Edge is the host. 
                // We should also have a PWA tag that looks something like this:
                //      <Application uap10:Parameters="--app-id=ohfljfkffdbgccddogapelmkekjfbckf --ip-edge-aumid=Microsoft.MicrosoftEdge.Stable_8wekyb3d8bbwe!MSEDGE --app-fallback-url=https://messianicradio.com/ --display-mode=minimal-ui --windows-store-app" uap10:HostId="PWA" Id="App">
                return appxManifestContents.Contains("HostId=\"PWA\"");
            }

            // We're not a hosted app. See if we're a classic PWA.
            // Classic PWA packages are marked with:
            //      <build:Item Name="PWABuilder" Value="f1942deb-3436-4ccd-bcf7-87abc78105b7"/>
            var pwaBuilderSignature = "f1942deb-3436-4ccd-bcf7-87abc78105b7";
            return appxManifestContents.Contains(pwaBuilderSignature);
        }

        public void Dispose()
        {
            this.temp.CleanUp();
            GC.SuppressFinalize(this);
        }
    }
}
