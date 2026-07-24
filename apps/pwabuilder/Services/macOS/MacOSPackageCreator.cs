using System.IO.Compression;
using Microsoft.Extensions.Options;
using PWABuilder.IOS.Common;
using PWABuilder.IOS.Models;
using PWABuilder.IOS.Services;
using PWABuilder.MacOS.Models;
using PWABuilder.Models;

namespace PWABuilder.MacOS.Services
{
    /// <summary>
    /// Generates a macOS PWA package (a native WKWebView Xcode project) from the macOS Swift template.
    /// </summary>
    public sealed class MacOSPackageCreator
    {
        private readonly MacOSImageWriter imageWriter;
        private readonly TempDirectory temp;
        private readonly AppSettings appSettings;
        private readonly ILogger<MacOSPackageCreator> logger;
        private readonly IWebHostEnvironment env;

        /// <summary>
        /// Initializes a new instance of <see cref="MacOSPackageCreator"/>.
        /// </summary>
        public MacOSPackageCreator(
            MacOSImageWriter imageWriter,
            IOptions<AppSettings> appSettings,
            TempDirectory temp,
            ILogger<MacOSPackageCreator> logger,
            IWebHostEnvironment env
        )
        {
            this.imageWriter = imageWriter;
            this.appSettings = appSettings.Value;
            this.temp = temp;
            this.logger = logger;
            this.env = env;
        }

        /// <summary>
        /// Generates a macOS Xcode project package as a zip archive.
        /// </summary>
        /// <param name="options">The validated package creation options.</param>
        /// <returns>The raw bytes of a zip file containing the macOS Xcode project.</returns>
        public async Task<byte[]> Create(MacOSAppPackageOptions.Validated options)
        {
            try
            {
                var outputDir = temp.CreateDirectory($"macos-package-{Guid.NewGuid()}");

                if (string.IsNullOrEmpty(appSettings.MacOSSourceCodePath))
                {
                    throw new InvalidOperationException(
                        $"macOS source code path is not configured for environment '{env.EnvironmentName}'."
                    );
                }

                // Copy the macOS template source to the temp directory.
                new DirectoryInfo(appSettings.MacOSSourceCodePath).CopyContents(
                    new DirectoryInfo(outputDir)
                );

                // Generate and write app icons before renaming the project folder.
                // The image writer targets the "pwa-shell/Assets.xcassets/AppIcon.appiconset" path,
                // which must exist before ApplyChanges() renames it.
                await imageWriter.WriteImages(
                    options,
                    WebAppManifestContext.From(options.Manifest, options.ManifestUri),
                    outputDir
                );

                // Apply template substitutions and rename project directories.
                var project = new XcodeMacOSProject(options, outputDir);
                project.Load();
                await project.ApplyChanges();

                // Package everything into a zip and return the bytes.
                var zipPath = CreateZip(outputDir);
                return await File.ReadAllBytesAsync(zipPath);
            }
            catch (Exception error)
            {
                logger.LogError(error, "Error generating macOS package.");
                throw;
            }
            finally
            {
                temp.CleanUp();
            }
        }

        private string CreateZip(string outputDir)
        {
            var zipFilePath = temp.CreateFile();
            using var zipFile = File.Create(zipFilePath);
            using var zipArchive = new ZipArchive(zipFile, ZipArchiveMode.Create);

            // Include the "next steps" HTML if configured.
            if (!string.IsNullOrEmpty(appSettings.MacOSNextStepsPath) &&
                File.Exists(appSettings.MacOSNextStepsPath))
            {
                zipArchive.CreateEntryFromFile(appSettings.MacOSNextStepsPath, "macos-next-steps.html");
            }

            zipArchive.CreateEntryFromDirectory(outputDir, "src");
            return zipFilePath;
        }
    }
}
