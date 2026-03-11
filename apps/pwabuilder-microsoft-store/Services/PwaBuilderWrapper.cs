using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using PWABuilder.MicrosoftStore.Common;
using PWABuilder.MicrosoftStore.Models;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace PWABuilder.MicrosoftStore.Services
{
    /// <summary>
    /// Service for invoking the pwa_builder.exe command line tool.
    /// This tool was created by the Edge team (specifically, Mustapha Jaber). 
    /// It shares code with Edge to generate a proper Windows app package that registers itself with Edge.
    /// </summary>
    public class PwaBuilderWrapper
    {
        protected readonly ILogger<PwaBuilderWrapper> logger;
        protected readonly IWebHostEnvironment host;
        protected readonly AppSettings settings;
        protected readonly ProcessRunner procRunner;
        protected readonly HttpClient httpClient;
        protected readonly TempDirectory tempDirectory;
        protected readonly WindowsActionsService windowsActionService;

        public PwaBuilderWrapper(
            IOptions<AppSettings> settings,
            ProcessRunner procRunner,
            IWebHostEnvironment host,
            ILogger<PwaBuilderWrapper> logger,
            IHttpClientFactory httpClientFactory,
            TempDirectory tempDirectory,
            WindowsActionsService windowsActionService)
        {
            this.logger = logger;
            this.procRunner = procRunner;
            this.host = host;
            this.settings = settings.Value;
            this.httpClient = httpClientFactory.CreateClient();
            this.httpClient.AddLatestEdgeUserAgent();
            this.tempDirectory = tempDirectory;
            this.windowsActionService = windowsActionService;
        }

        /// <summary>
        /// Executes the pwa_builder.exe command line tool with the specified options.
        /// </summary>
        /// <param name="options">Windows package options.</param>
        /// <param name="appImages">Any app images to use for the package.</param>
        /// <param name="webManifest">The web manifest of the PWA.</param>
        /// <param name="outputDirectory">The output directory to store the artifacts in.</param>
        /// <param name="processor"></param>
        /// <param name="fallback"></param>
        /// <returns></returns>
        public async Task<PwaBuilderCommandLineResult> Run(
            WindowsAppPackageOptions options,
            ImageGeneratorResult appImages,
            WebAppManifestContext webManifest,
            string outputDirectory,
            string processor,
            bool fallback,
            CancellationToken cancelToken)
        {
            var pwaBuilderFilePath = Path.Combine(host.ContentRootPath, PwaBuilderPath);

            var actionsFiles = await windowsActionService.GetWindowsActionsFilesAsync(options, outputDirectory, cancelToken);
            var pwaBuilderArgs = CreateCommandLineArgs(options, appImages, webManifest, actionsFiles, outputDirectory, processor, fallback);
            return await RunPwabuilderExe(options, appImages, webManifest, actionsFiles, outputDirectory, pwaBuilderFilePath, pwaBuilderArgs);
        }

        private async Task<PwaBuilderCommandLineResult> RunPwabuilderExe(WindowsAppPackageOptions options, ImageGeneratorResult appImages, WebAppManifestContext webManifest, WindowsActionsFiles? actionsFiles, string outputDirectory, string pwaBuilderFilePath, string pwaBuilderArgs)
        {
            ProcessResult procResult;
            try
            {
                procResult = await procRunner.Run(pwaBuilderFilePath, pwaBuilderArgs, TimeSpan.FromMinutes(10));
                logger.LogWarning("Raw args passed to pwa_builder {args}", pwaBuilderArgs);
            }
            catch (Exception error)
            {
                var stdOut = (error as ProcessException)?.StandardOutput;
                var stdErr = (error as ProcessException)?.StandardError;
                throw CreatePwaBuilderCliError(error, error.Message, actionsFiles, outputDirectory, options, stdOut, stdErr, appImages, webManifest);
            }

            // Get the generated files.
            var msixFile = GetRequiredFile(".msix", outputDirectory, procResult.StandardOutput, procResult.StandardError);
            var xmlSourceFile = GetRequiredFile(".xml", outputDirectory, procResult.StandardOutput, procResult.StandardError);
            return new PwaBuilderCommandLineResult
            {
                MsixFile = msixFile,
                AppxManifest = xmlSourceFile,
                OutputDirectory = outputDirectory,
                StandardError = procResult.StandardError,
                StandardOutput = procResult.StandardOutput
            };
        }

        protected virtual string PwaBuilderPath => settings.PwaBuilderPath;

        private ProcessException CreatePwaBuilderCliError(
            Exception innerException,
            string message,
            WindowsActionsFiles? actionFiles,
            string outputDirectory,
            WindowsAppPackageOptions options,
            string? standardOutput,
            string? standardErrorOutput,
            ImageGeneratorResult appImages,
            WebAppManifestContext webManifest)
        {
            var pwabuilderCLIArgs = CreateCommandLineArgs(options, appImages, webManifest, actionFiles, outputDirectory);
            var formattedMessage = string.Join(Environment.NewLine + Environment.NewLine, message, $"Output directory: {outputDirectory}", $"Standard output: {standardOutput}", $"Standard error: {standardErrorOutput}", $"CLI args: {pwabuilderCLIArgs}");
            var toolFailedError = new ProcessException(formattedMessage, innerException, standardOutput, standardErrorOutput);
            toolFailedError.Data.Add("StandardOutput", standardOutput);
            toolFailedError.Data.Add("StandardError", standardErrorOutput);
            toolFailedError.Data.Add("outputDirectory", outputDirectory);
            toolFailedError.Data.Add("pwabuilderCLIArgs", pwabuilderCLIArgs);
            toolFailedError.Data.Add("url", options.Url);
            toolFailedError.Data.Add("appImagesCount", appImages.ImagePaths.Count);
            toolFailedError.Data.Add("appImages", appImages.ImagePaths);
            logger.LogError(toolFailedError, toolFailedError.Message);
            return toolFailedError;
        }

        private string GetRequiredFile(string extension, string directory, string cliOutput, string cliErrorOutput)
        {
            var file = Directory.EnumerateFiles(directory, "*" + extension).FirstOrDefault();
            if (file == null)
            {
                var missingFileError = new FileNotFoundException($"The PWABuilder CLI process didn't generate an {extension} file.");
                missingFileError.Data.Add("pwa_builder.StandardOutput", cliOutput);
                missingFileError.Data.Add("pwa_builder.StandardError", cliErrorOutput);
                logger.LogError(missingFileError, "{fileExtension} file wasn't found after the process closed. Error details: {cliErrorOutput}\n\nCLI standard out: {stdOut}", extension, cliErrorOutput, cliOutput);
                throw missingFileError;
            }

            return file;
        }

        /// <summary>
        /// Creates command line arguments for the pwa_builder.exe command line tool from the specified options.
        /// </summary>
        /// <returns></returns>
        protected virtual string CreateCommandLineArgs(WindowsAppPackageOptions options, ImageGeneratorResult appImages, WebAppManifestContext webManifest, WindowsActionsFiles? actionsFiles, string outputDirectory, string processor = "", bool fallback = false)
        {
            // pwa_builder.exe expects the full version 'x.x.x.x', where the last section (revision) is zero.
            // The store requires the revision to be zero, as it's reserved for store use.
            var rawVersion = new Version(options.Version);
            var versionWithZeroRevision = rawVersion.WithZeroRevision();
            var absoluteStartUrl = options.StartUrl switch
            {
                var startUrl when string.IsNullOrWhiteSpace(startUrl) => null, // If null, pwa_builder.exe will use the start_url from the web manifest.
                _ => options.GetStartUrl(webManifest)
            };
            var args = new Dictionary<string, string?>
            {
                { "url", options.Url.ToString() },
                { "target", outputDirectory },
                { "app-version", versionWithZeroRevision.ToString() },
                { "publisher", options.Publisher?.CommonName },
                { "channel", options.EdgeChannel },
                { "aumid", options.AppUserModelId },
                { "package-id-name", options.PackageId },
                { "launch-args", "--windows-store-app" },
                { "exts", options.Extensions },
                { "display-name", options.Name },
                { "publisher-display-name", options.Publisher?.DisplayName },
                { "icons", Path.GetDirectoryName(appImages.ImagePaths.First()) },
                { "pri", Path.Combine(host.ContentRootPath, settings.PriPath) },
                { "resource-language", GetLanguagesString(options.ResourceLanguage) },
                { "start-url", absoluteStartUrl?.ToString() },
                { "display-mode", webManifest.GetDisplayModeOrNull() ?? "standalone" },
                { "application-id", options.ApplicationId },
                { "web-action-manifest-file", actionsFiles?.ManifestFilePath?.Path },
                { "web-action-custom-entities-file", actionsFiles?.CustomEntitiesFilePath?.Path },
                { "web-action-localized-custom-entities-files", actionsFiles?.CustomEntitiesLocalizationDirectoryPath?.Path },
            };

            if (fallback && options.ManifestFilePath != null)
            {
                args.Add("manifest-file", options.ManifestFilePath);
            }

            if (options.EnableWebAppWidgets != null)
            {
                if (options.EnableWebAppWidgets == true)
                {
                    args.Add("enable-features", "msWebAppWidgets");
                    //For sideload package, there is no processor specification. For store package, there is.
                    if (processor != "")
                    {
                        args.Add("processor-architecture", processor);
                    }
                }
            }

            //Allowed values for targetDeviceFamilies are Holographic, Desktop and Team
            if (options.TargetDeviceFamilies != null)
            {
                string families = string.Join(";", options.TargetDeviceFamilies.Select(family =>
                {
                    switch (family.ToLower())
                    {
                        case "desktop": return "Windows.Desktop";
                        case "holographic": return "Windows.Holographic";
                        case "team": return "Windows.Team";
                        default: return "";
                    }

                }));

                if (families != null && families != "")
                {
                    args.Add("target-device-family", families);
                }

            }


            var builder = new StringBuilder();
            foreach (var arg in args)
            {
                if (!string.IsNullOrWhiteSpace(arg.Value))
                {
                    builder.Append($"--{arg.Key}=\"{arg.Value}\"");
                    builder.Append(' ');
                }
            }

            // One non-string argument: signed-app
            if (options.AllowSigning)
            {
                builder.Append(" --signed-app");
            }

            return builder.ToString();
        }

        // Windows package options will contain languages separated by comma. But pwa_builder.exe expects languages separated by semicolon.
        // Input: "en-us, en-gb"
        // Output: "EN-US;EN-GB"
        protected static string GetLanguagesString(string? rawLanguages)
        {
            if (string.IsNullOrWhiteSpace(rawLanguages))
            {
                return "EN-US";
            }

            var individualLangs = rawLanguages
                .Split(',', StringSplitOptions.RemoveEmptyEntries)
                .Select(l => l.ToUpperInvariant().Trim());
            return string.Join(';', individualLangs);
        }
    }
}
