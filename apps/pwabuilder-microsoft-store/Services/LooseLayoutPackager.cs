using Microsoft.Extensions.Logging;
using Microsoft.PWABuilder.Microsoft.Store.Common;
using Microsoft.PWABuilder.Microsoft.Store.Models;
using System;
using System.IO;
using System.IO.Compression;
using System.Threading.Tasks;

namespace Microsoft.PWABuilder.Microsoft.Store.Services
{
    /// <summary>
    /// Service that packages up a loose layout into an .msix package.
    /// </summary>
    /// <remarks>
    /// A loose layout is an unpackaged .msix or .appx. See https://docs.microsoft.com/en-us/windows/uwp/debug-test-perf/loose-file-registration#what-is-a-loose-file-layout
    /// </remarks>
    public class LooseLayoutPackager
    {
        private readonly MakeAppxWrapper makeAppx;
        private readonly TempDirectory temp;
        private readonly MakePriWrapper makePri;

        public LooseLayoutPackager(
            MakeAppxWrapper makeAppx,
            MakePriWrapper makePri,
            TempDirectory temp)
        {
            this.makeAppx = makeAppx;
            this.makePri = makePri;
            this.temp = temp;
        }

        /// <summary>
        /// Creates an .msix package from the loose file layout.
        /// </summary>
        /// <param name="bundleArgs">The arguments containing a zip file which holds the loose file layout.</param>
        /// <returns>A stream to the new .msix file. Callers are responsible for disposal.</returns>
        public async Task<Stream> Create(LoosePackageArgs.Validated bundleArgs)
        {
            // Copy the zip file to a local file on disk. 
            // Needed because extracting zip requires seekable stream, and the POSTed stream is not seekable.
            var zipFilePath = temp.CreateFile();
            using (var zipFile = File.OpenWrite(zipFilePath))
            {
                await bundleArgs.LooseLayoutZip.CopyToAsync(zipFile);
            }

            // Unzip the loose package into a temp directory.
            var looseDirectory = temp.CreateDirectory();
            ZipFile.ExtractToDirectory(zipFilePath, looseDirectory);

            // Regenerate the PRI in case the images have changed.
            var priConfigDir = temp.CreateDirectory();
            await makePri.Execute(looseDirectory, priConfigDir);

            // Run MakeAppx to package it.
            var packagedDirectory = temp.CreateDirectory();
            var msixFilePath = await makeAppx.Execute(looseDirectory, packagedDirectory);
            return File.OpenRead(msixFilePath);
        }
    }
}
