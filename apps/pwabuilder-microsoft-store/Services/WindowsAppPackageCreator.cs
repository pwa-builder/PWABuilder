using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using PWABuilder.MicrosoftStore.Common;
using PWABuilder.MicrosoftStore.Models;
using System;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;

namespace PWABuilder.MicrosoftStore.Services
{
    /// <summary>
    /// Generates a Windows app package.
    /// </summary>
    public class WindowsAppPackageCreator
    {
        private readonly ModernWindowsPackageCreator modernPackageCreator;
        private readonly ClassicWindowsPackageCreator classicPackageCreator;
        private readonly SpartanWindowsPackageCreator spartanPackageCreator;
        private readonly ImageGenerator imageGenerator;
        private readonly WebManifestFinder manifestFinder;
        private readonly ILogger<WindowsAppPackageCreator> logger;
        private readonly IWebHostEnvironment host;
        private readonly AppSettings settings;
        private readonly TempDirectory temp;
        private readonly Analytics analytics;
        private readonly HttpClient httpNoAutoRedirect;

        private const string devPackagePublisherCommonName = "CN=3a54a224-05dd-42aa-85bd-3f3c1478fdca";

        public WindowsAppPackageCreator(
            ModernWindowsPackageCreator modernPackageCreator,
            ClassicWindowsPackageCreator classicPackageCreator,
            SpartanWindowsPackageCreator spartanPackageCreator,
            WebManifestFinder manifestFinder,
            ImageGenerator imageGenerator,
            TempDirectory temp,
            Analytics urlLogger,
            IWebHostEnvironment host,
            IHttpClientFactory httpFactory,
            IOptions<AppSettings> settings,
            ILogger<WindowsAppPackageCreator> logger)
        {
            this.modernPackageCreator = modernPackageCreator;
            this.classicPackageCreator = classicPackageCreator;
            this.spartanPackageCreator = spartanPackageCreator;
            this.manifestFinder = manifestFinder;
            this.imageGenerator = imageGenerator;
            this.logger = logger;
            this.host = host;
            this.settings = settings.Value;
            this.httpNoAutoRedirect = httpFactory.CreateClient("NoRedirectClient");
            this.httpNoAutoRedirect.AddLatestEdgeUserAgent();
            this.temp = temp;
            this.analytics = urlLogger;
        }

        /// <summary>
        /// Creates the Windows app package.
        /// </summary>
        /// <returns></returns>
        public async Task<WindowsAppPackageResult> CreateAppPackageAsync(WindowsAppPackageOptions options, AnalyticsInfo analyticsInfo, CancellationToken cancelToken)
        {
            ValidateOptions(options);

            // COMMENTED OUT 2/25/2026 - This code had unintended consequences. For example, this code would detect https://app.eyegifs.com redirects to https://app.eyegifs.com/account/login. But if the user is logged in, we want the PWA to keep the original url and not redirect to login.
            // Check for redirects.
            // var redirectUri = await TryCheckForRedirect(options.Url);
            // if (redirectUri != null)
            // {
            //     logger.LogInformation("Detected redirect for {url}, redirecting to {target}. Will use the redirect target for packaging.", options.Url, redirectUri);
            //     options.Url = redirectUri;
            // }

            var packageType = options.Publisher == null || options.Publisher.CommonName == devPackagePublisherCommonName ?
                WindowsPackageType.DeveloperPackage : WindowsPackageType.StorePackage;
            try
            {
                var zipResult = await GenerateZipAsync(options, cancelToken);
                await analytics.RecordStorePackageSuccess(options, packageType, analyticsInfo);
                return zipResult;
            }
            catch (Exception error)
            {
                logger.LogError(error, "Error generating app package for {url}", options.Url);
                await analytics.RecordStorePackageFailure(error, options, packageType, analyticsInfo);
                throw;
            }
            finally
            {
                temp.CleanUp();
            }
        }

        /// <summary>
        /// Creates only the MSIX modern app package.
        /// </summary>
        /// <returns></returns>
        public async Task<MsixResult> CreateMsixAsync(WindowsAppPackageOptions options, CancellationToken cancelToken)
        {
            ValidateOptions(options);
            try
            {
                return await GenerateMsix(options, cancelToken);
            }
            catch (Exception error)
            {
                logger.LogError(error, "Error generating MSIX for {url}", options.Url);
                throw;
            }
            finally
            {
                temp.CleanUp();
            }
        }

        private void ValidateOptions(WindowsAppPackageOptions options)
        {
            var errors = options.GetValidationErrors(this.settings);
            if (errors.Any())
            {
                throw new ArgumentException($"Invalid package creation options: {string.Join(", ", errors)}");
            }
        }

        // COMMENTED OUT: 2/25/2026 - This code had unintended consequences. For example, this code would detect https://app.eyegifs.com redirects to https://app.eyegifs.com/account/login. But if the user is logged in, we want the PWA to keep the original url and not redirect to login.
        // /// <summary>
        // /// Checks if the specified URL results in a redirect (301 or 307). If so, returns the Location target of the redirect.
        // /// </summary>
        // /// <remarks>
        // /// This fixes a bug (https://github.com/pwa-builder/PWABuilder/issues/4956) where if the user packages a URL that causes a redirect, Edge doesn't properly handle the installed PWA.
        // /// We fix the bug by checking if there's a redirect for the URL and if so, returns the redirect target URL.
        // /// An example as of June 2025 is https://microsoftedge.github.io/Demos/wami, which redirects to https://microsoftedge.github.io/Demos/wami/  (notice the ending slash).
        // /// </remarks>
        // /// <param name="options"></param>
        // /// <returns>The redirect target URL if there is one.</returns>
        // private async Task<Uri?> TryCheckForRedirect(Uri uri)
        // {
        //     try
        //     {
        //         var response = await this.httpNoAutoRedirect.GetAsync(uri);
        //         var isRedirect = (int)response.StatusCode >= 300 && (int)response.StatusCode < 400;
        //         if (isRedirect && response.Headers.Location != null)
        //         {
        //             return new Uri(uri, response.Headers.Location);
        //         }
        //     }
        //     catch (Exception httpError)
        //     {
        //         logger.LogWarning(httpError, "Unable to check the URL for redirect due to HTTP error.");
        //     }

        //     return null;
        // }

        private async Task<MsixResult> GenerateMsix(WindowsAppPackageOptions options, CancellationToken cancelToken)
        {
            var manifest = await manifestFinder.Find(options);
            var appImages = await GenerateImages(options, manifest);
            var package = await this.CreateModernWindowsPackage(options, appImages, manifest, cancelToken);
            if (package == null)
            {
                throw new InvalidOperationException("Attempted to generate MSIX file, but passed in options to skip generating the modern package.");
            }

            var msixBytes = await File.ReadAllBytesAsync(package.StoreMsixFilePath);
            return new MsixResult(package, msixBytes);
        }

        private async Task<WindowsAppPackageResult> GenerateZipAsync(WindowsAppPackageOptions options, CancellationToken cancelToken)
        {
            var manifest = await manifestFinder.Find(options);
            var appImages = await GenerateImages(options, manifest);
            //Todo: instead of adding filepath to the options, pass it to the filepath directly
            var modernPackage = await this.CreateModernWindowsPackage(options, appImages, manifest, cancelToken);
            var classicPackage = await CreateClassicWindowsPackage(options, manifest, appImages, modernPackage?.PackageInfo.GetAppId());
            var spartanPackage = await CreateSpartanWindowsPackage(options, manifest, appImages);
            var zipFilePath = await CreateZipPackage(options, modernPackage, classicPackage, spartanPackage);
            var zipBytes = await File.ReadAllBytesAsync(zipFilePath);
            return new WindowsAppPackageResult(modernPackage, classicPackage, spartanPackage, zipBytes);
        }

        private async Task<ModernWindowsPackageResult?> CreateModernWindowsPackage(WindowsAppPackageOptions options, ImageGeneratorResult appImages, WebAppManifestContext webManifest, CancellationToken cancelToken)
        {
            if (options.GenerateModernPackage)
            {
                var outputDirectory = temp.CreateDirectory("modernpackage-" + Guid.NewGuid());
                return await this.modernPackageCreator.Create(options, appImages, webManifest, outputDirectory, cancelToken);
            }

            return null;
        }

        private async Task<ClassicWindowsPackageResult?> CreateClassicWindowsPackage(WindowsAppPackageOptions options, WebAppManifestContext manifest, ImageGeneratorResult appImages, string? edgeAppId)
        {
            if (options.ClassicPackage?.Generate == true)
            {
                var outputDirectory = temp.CreateDirectory("classic-package-" + Guid.NewGuid().ToString());
                return await this.classicPackageCreator.Create(options, manifest, appImages, outputDirectory, edgeAppId);
            }

            return null;
        }

        private async Task<SpartanWindowsPackageResult?> CreateSpartanWindowsPackage(WindowsAppPackageOptions options, WebAppManifestContext webManifest, ImageGeneratorResult appImages)
        {
            if (options.EdgeHtmlPackage?.Generate == true)
            {
                var outputDirectory = temp.CreateDirectory("spartan-package-" + Guid.NewGuid().ToString());
                return await this.spartanPackageCreator.Create(options, webManifest, appImages, outputDirectory);
            }

            return null;
        }


        private async Task<string> CreateZipPackage(WindowsAppPackageOptions options, ModernWindowsPackageResult? modernPackage, ClassicWindowsPackageResult? classicPackage, SpartanWindowsPackageResult? spartanPackage)
        {
            var zipFilePath = temp.CreateFile();
            using var zipFile = File.Create(zipFilePath);
            using var zipArchive = new ZipArchive(zipFile, ZipArchiveMode.Create);

            var appName = options.Name ??
                modernPackage?.PackageInfo.Properties?.DisplayName ??
                Path.GetFileNameWithoutExtension(modernPackage?.StoreMsixFilePath) ??
                "My PWA";
            var appFileName = GetSanitizedPackageFileName(appName);

            // Append the modern package.
            if (modernPackage != null)
            {
                var msixFileName = $"{appFileName}.msixbundle";
                zipArchive.CreateEntryFromFile(modernPackage.StoreMsixFilePath, msixFileName);

                // Append the sideload msix for developer testing on a Windows box.
                var sideLoadMsixFileName = $"{appFileName}.sideload.msix";
                zipArchive.CreateEntryFromFile(modernPackage.SideLoadMsixFilePath, sideLoadMsixFileName);

                // Append the install.ps1 script for installing the sideload modern app package.
                var powerShellInstallScriptTemplate = await File.ReadAllTextAsync(settings.InstallScriptPath);
                var powerShellInstallScript = MaterializePowershellTemplate(powerShellInstallScriptTemplate, appName, sideLoadMsixFileName);
                await zipArchive.CreateEntryFromString(powerShellInstallScript, "install.ps1");

                // Append the pwainstaller.exe tool which the install.ps1 script uses to install the app locally.
                var installerPath = Path.Combine(host.ContentRootPath, settings.PwaInstallerPath);
                zipArchive.CreateEntryFromFile(installerPath, "utils\\pwainstaller.exe");

                // Append next-steps readme
                zipArchive.CreateEntryFromFile(settings.ReadmePath, "readme.html");
            }

            // Append the classic package.
            if (classicPackage != null)
            {
                zipArchive.CreateEntryFromFile(classicPackage.AppxFilePath, $"{appFileName}.classic.appxbundle");
            }

            // Append the EdgeHTML (Spartan) package.
            if (spartanPackage != null)
            {
                // The package itself.
                zipArchive.CreateEntryFromFile(spartanPackage.AppxPath, $"{appFileName}.edgehtml.appxbundle");

                // The directory used for sideloading the app.
                zipArchive.CreateEntryFromDirectory(spartanPackage.AppxLooseFilesDirectory, "EdgeHTML-sideload");

                // The sideload install script.
                var powerShellInstallScriptTemplate = await File.ReadAllTextAsync(settings.SpartanInstallScriptPath);
                var powerShellInstallScript = MaterializePowershellTemplate(powerShellInstallScriptTemplate, appName, string.Empty);
                await zipArchive.CreateEntryFromString(powerShellInstallScript, "install-edgehtml.ps1");

                // The Spartan next steps readme.
                zipArchive.CreateEntryFromFile(settings.SpartanReadmePath, options.GenerateModernPackage ? "readme-edgehtml.html" : "readme.html");
            }

            return zipFilePath;
        }

        private Task<ImageGeneratorResult> GenerateImages(WindowsAppPackageOptions options, WebAppManifestContext manifest)
        {
            var imagesDir = temp.CreateDirectory("app-images-" + Guid.NewGuid());
            return this.imageGenerator.Generate(options, manifest, imagesDir);
        }

        private string MaterializePowershellTemplate(string powerShellTemplate, string appName, string msixFileName)
        {
            return powerShellTemplate
                .Replace("$$APP_DISPLAY_NAME$$", appName)
                .Replace("$$MSIX_FILE_NAME$$", msixFileName);
        }

        private string GetSanitizedPackageFileName(string desiredFileName)
        {
            // Best case: no invalid chars.
            var invalidChars = Path.GetInvalidFileNameChars();
            if (desiredFileName.IndexOfAny(invalidChars) == -1)
            {
                return desiredFileName;
            }

            var builder = new System.Text.StringBuilder(desiredFileName.Length);
            foreach (var c in desiredFileName)
            {
                if (!invalidChars.Contains(c))
                {
                    builder.Append(c);
                }
                else
                {
                    builder.Append('_');
                }
            }

            return builder.ToString();
        }
    }
}
