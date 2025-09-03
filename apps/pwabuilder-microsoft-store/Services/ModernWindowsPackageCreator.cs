using Microsoft.Extensions.Logging;
using PWABuilder.MicrosoftStore.Common;
using PWABuilder.MicrosoftStore.Models;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Threading.Tasks;

namespace PWABuilder.MicrosoftStore.Services
{
    /// <summary>
    /// Service for generating a Windows package that works on Windows version >= 10.0.19041 ("Vibranium", also known as Windows 10 version 2004 May 2020 Update).
    /// This package uses the Hosted App Model released as of Windows 10 Spring 2020 Update.
    /// </summary>
    /// <remarks>
    /// For more information on the Hosted App Model, see https://blogs.windows.com/windowsdeveloper/2020/03/19/hosted-app-model/
    /// </remarks>
    public class ModernWindowsPackageCreator
    {
        private readonly PwaBuilderWrapper pwaBuilder;
        private readonly MakeAppxWrapper makeAppx;
        private readonly MakePriWrapper makePri;
        private readonly ILogger<ModernWindowsPackageCreator> logger;

        public ModernWindowsPackageCreator(
            PwaBuilderWrapper pwaBuilder,
            MakeAppxWrapper makeAppx,
            MakePriWrapper makePri,
            ILogger<ModernWindowsPackageCreator> logger)
        {
            this.makeAppx = makeAppx;
            this.pwaBuilder = pwaBuilder;
            this.makePri = makePri;
            this.logger = logger;
        }

        /// <summary>
        /// Creates the modern Windows hosted app for the PWA.
        /// </summary>
        /// <param name="options"></param>
        /// <param name="outputDirectory"></param>
        /// <returns></returns>
        public async Task<ModernWindowsPackageResult> Create(WindowsAppPackageOptions options, ImageGeneratorResult appImages, WebAppManifestContext webManifest, string outputDirectory)
        {

            // 1. Build the Store package. If widgets are present, build multiple.
            var storeBuilderResult = await BuildStoreReadyPackage(options, appImages, webManifest, outputDirectory);

            // 2. Bundle the Store package.
            var storeBundleFilePath = options.EnableWebAppWidgets != true ? await makeAppx.Bundle(storeBuilderResult.MsixFile, new Version(options.Version).WithZeroRevision()) : await makeAppx.BundlePlatforms(storeBuilderResult.MsixPlatformFiles, outputDirectory, new Version(options.Version).WithZeroRevision());

            // 3. Build the side load package.
            var sideLoadMsixFilePath = await BuildSideloadPackage(options, storeBuilderResult, appImages, webManifest, outputDirectory);

            // 4. Read the generated package info.
            var packageInfo = ReadPackageInfo(storeBuilderResult.AppxManifest);

            return new ModernWindowsPackageResult(storeBundleFilePath, sideLoadMsixFilePath, packageInfo);
        }

        private async Task<PwaBuilderCommandLineResult> BuildStoreReadyPackage(WindowsAppPackageOptions options,
            ImageGeneratorResult appImages,
            WebAppManifestContext webManifest,
            string outputDirectory)
        {
            if (options.EnableWebAppWidgets != true)
            {
                return await BuildStorePackage(options, appImages, webManifest, outputDirectory);
            }
            
            PwaBuilderCommandLineResult result = new();
            Task<PwaBuilderCommandLineResult>[] partialResultTasks = new Task<PwaBuilderCommandLineResult>[3];
            var processors = new string[]{ "x64", "x86", "arm64"};
            for(int i=0;i<processors.Length;i++)
            {
                var subDirectory = Directory.CreateDirectory(Path.Combine(outputDirectory, processors[i])).FullName;
                partialResultTasks[i] =  BuildStorePackage(options, appImages, webManifest, subDirectory, processors[i]);

            }

            await Task.WhenAll(partialResultTasks);
                
            foreach(var task in partialResultTasks)
            {
                result.AppxManifest = task.Result.AppxManifest;
                result.MsixPlatformFiles.Add(task.Result.MsixFile);
            }
                
            return result;
            
        } 

        private async Task<PwaBuilderCommandLineResult> BuildStorePackage(
            WindowsAppPackageOptions options,
            ImageGeneratorResult appImages,
            WebAppManifestContext webManifest,
            string outputDirectory,
            string processor = "")
        {
            // Run pwabuilder command line to generate the package.
            
            var appxResult = options.UsePWABuilderWithCustomManifest switch
            {
                //If offline manifest is provided, run PWABuilder and pass the manifest filepath. If not, the manifest would have been downloaded from the source so use that as a fallback in case pwa_builder.exe can't fetch the manifest on its own"
                true => await pwaBuilder.Run(options, appImages, webManifest, outputDirectory, "", true),
                _ => await RunPwaBuilderWithOfflineManifestFallback(options, appImages, webManifest, outputDirectory, processor)
            };

            // Generate a real resources.pri for the project.
            appxResult.MsixFile = await UpdateMsixWithLegitResources(appxResult, outputDirectory);
            
            return appxResult;
        }

        private async Task<string> BuildSideloadPackage(
            WindowsAppPackageOptions options,
            PwaBuilderCommandLineResult storePackageResult,
            ImageGeneratorResult appImages,
            WebAppManifestContext webManifest,
            string outputDirectory)
        {
            // The sideload package must have AllowSigning = false.
            // This is required for sideloading the package via /Resources/cli/pwainstaller/pwainstaller.exe

            // If the store package we're generating doesn't allow signing (e.g. it's meant for WinGet or some other destination besides the Store), just roll with that.
            if (options.AllowSigning == false)
            {
                return storePackageResult.MsixFile;
            }

            // Otherwise, spit out a new package that disallows signing.
            var sideLoadDirectory = Path.Combine(outputDirectory, "sideload-pkg");
            Directory.CreateDirectory(sideLoadDirectory);
            var sideLoadOptions = options.Clone();
            sideLoadOptions.AllowSigning = false;
            var sideLoadBuilderResult = await RunPwaBuilderWithOfflineManifestFallback(sideLoadOptions, appImages, webManifest, sideLoadDirectory);
            return await UpdateMsixWithLegitResources(sideLoadBuilderResult, sideLoadDirectory);
        }

        /// <summary>
        /// Unzips an .msix file and generates a resources.pri file for it. It then builds a new .msix file with the resources.pri file and returns its path.
        /// </summary>
        /// <param name="msixResult">The path to the new .msix containing the correct resources.pri file.</param>
        /// <param name="outputDirectory">Temp directory where artifacts can be stored during the build process.</param>
        /// <returns></returns>
        private async Task<string> UpdateMsixWithLegitResources(PwaBuilderCommandLineResult msixResult, string outputDirectory)
        {
            // We need to crack open the msix and swap out its resources.pri with
            // a real one generated specifically for this app.
            // Otherwise, the resources.pri contains references to placeholder stuff.

            // Crack open the msix.
            var msixUnpackedDirectory = Directory.CreateDirectory(Path.Combine(outputDirectory, "unpacked")).FullName;
            ZipFile.ExtractToDirectory(msixResult.MsixFile, msixUnpackedDirectory);

            // Delete the placeholder resources.pri file
            File.Delete(Path.Combine(msixUnpackedDirectory, "resources.pri"));

            // Generate a legit resources.pri file.
            await makePri.Execute(msixUnpackedDirectory, Directory.CreateDirectory(Path.Combine(outputDirectory, "pri-config")).FullName);
            // Repackage the msix.
            var repackagedMsixOutputDir = Directory.CreateDirectory(Path.Combine(outputDirectory, "repackaged")).FullName;
            return await makeAppx.Execute(msixUnpackedDirectory, repackagedMsixOutputDir);
        }

        private HostedPackage ReadPackageInfo(string xmlSourceFile)
        {
            var package = HostedPackage.FromFile(xmlSourceFile);
            if (string.IsNullOrEmpty(package.Properties?.DisplayName) ||
                string.IsNullOrEmpty(package.Identity?.Name) ||
                string.IsNullOrEmpty(package.Identity?.Publisher))
            {
                logger.LogWarning("Some app package info couldn't be retrieved from the {package}", package);
            }

            return package;
        }


        /// <summary>
        /// Runs pwa_builder.exe with the specified options. If the run fails to detect the manifest with the error, "Failed to retreive PWA manifest for..."
        /// then we try the old V91 pwa_builder.exe, which lets us specify the manifest URL directly.
        /// </summary>
        /// <returns></returns>
        private async Task<PwaBuilderCommandLineResult> RunPwaBuilderWithOfflineManifestFallback(
            WindowsAppPackageOptions options,
            ImageGeneratorResult appImages,
            WebAppManifestContext webManifest,
            string outputDirectory,
            string processor = "")
        {
            var manifestFetchErrorMessages = new[]
            {
                "Failed to retreive PWA manifest for", // yes, the 'retreive' is misspelled
                "Failed to retrieve PWA manifest for" // in case the spelling is fixed in a future release of pwa_builder.exe :-)
            };

            try
            {
                //If custom manifest is provided 
                if (options.UsePWABuilderWithCustomManifest == true)
                {
                    var customManifestResult = await pwaBuilder.Run(options, appImages, webManifest, outputDirectory, processor, true);
                    logger.LogInformation("Packaged using custom manifest");
                    return customManifestResult;
                }
                return await pwaBuilder.Run(options, appImages, webManifest, outputDirectory, processor, false);
            }
            catch (ProcessException procError)
            when (manifestFetchErrorMessages.Any(m => procError.StandardError?.Contains(m, StringComparison.OrdinalIgnoreCase) == true)) // yes, "retreive" is misspelled. That's the error we're looking for.
            {
                // OK, pwa_builder.exe failed to fetch the manifest.
                // Try passing the manifest file already fetched
                if (options.Manifest != null)
                {
                    logger.LogWarning("pwa_builder.exe was unable to fetch the manifest for {url}. Attempting offline manifest fallback", options.Url);
                    var fallbackResult = await pwaBuilder.Run(options, appImages, webManifest, outputDirectory, processor, true);
                    if (fallbackResult != null)
                    {
                        logger.LogInformation("Offline manifest  fallback succeeded.");
                        return fallbackResult;
                    }
                }

                // Either we don't have a manifest URL, or the v91 fallback failed.
                // Throw the original error.
                throw; 
            }
        }
    }
}
