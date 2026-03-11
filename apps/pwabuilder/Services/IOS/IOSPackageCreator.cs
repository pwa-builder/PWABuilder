using System.IO.Compression;
using Microsoft.Extensions.Options;
using PWABuilder.IOS.Common;
using PWABuilder.IOS.Models;
using PWABuilder.Models;

namespace PWABuilder.IOS.Services
{
    public class IOSPackageCreator
    {
        private readonly IOSImageWriter iosImageWriter;
        private readonly TempDirectory temp;
        private readonly AppSettings appSettings;
        private readonly ILogger<IOSPackageCreator> logger;
        private readonly IWebHostEnvironment env;

        public IOSPackageCreator(
            IOSImageWriter iosImageWriter,
            IOptions<AppSettings> appSettings,
            TempDirectory temp,
            ILogger<IOSPackageCreator> logger,
            IWebHostEnvironment env
        )
        {
            this.iosImageWriter = iosImageWriter;
            this.appSettings = appSettings.Value;
            this.temp = temp;
            this.logger = logger;
            this.env = env;
        }

        /// <summary>
        /// Generates an iOS package.
        /// </summary>
        /// <param name="options">The package creation options.</param>
        /// <returns>The path to a zip file.</returns>
        public async Task<byte[]> Create(IOSAppPackageOptions.Validated options)
        {
            try
            {
                var outputDir = temp.CreateDirectory($"ios-package-{Guid.NewGuid()}");

                if (string.IsNullOrEmpty(appSettings.IOSSourceCodePath))
                {
                    throw new InvalidOperationException($"iOS source code path is not configured for env {env.EnvironmentName}.");
                }

                // Make a copy of the iOS source code.
                new DirectoryInfo(appSettings.IOSSourceCodePath).CopyContents(
                    new DirectoryInfo(outputDir)
                );

                // Create any missing images for the iOS template.
                // This should be done before project.ApplyChanges(). Otherwise, it'll attempt to write the images to the "pwa-shell" directory, which no longer exists after ApplyChanges().
                await iosImageWriter.WriteImages(
                    options,
                    WebAppManifestContext.From(options.Manifest, options.ManifestUri),
                    outputDir
                );

                // Update the source files with the real values from the requested PWA
                var project = new XcodePwaShellProject(options, outputDir);
                project.Load();
                await project.ApplyChanges();

                // Zip it all up.
                var zipFile = CreateZip(outputDir);
                return await File.ReadAllBytesAsync(zipFile);
            }
            catch (Exception error)
            {
                logger.LogError(error, "Error generating iOS package");
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
            zipArchive.CreateEntryFromFile(appSettings.NextStepsPath, "ios-next-steps.html");
            zipArchive.CreateEntryFromDirectory(outputDir, "src");
            return zipFilePath;
        }
    }
}
