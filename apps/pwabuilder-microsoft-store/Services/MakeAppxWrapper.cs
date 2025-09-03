using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Microsoft.PWABuilder.Microsoft.Store.Models;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace PWABuilder.MicrosoftStore
{
    /// <summary>
    /// Wraps the makeappx.exe Windows SDK tool.
    /// </summary>
    public class MakeAppxWrapper
    {
        private readonly AppSettings settings;
        private readonly ILogger<MakeAppxWrapper> logger;
        private readonly ProcessRunner procRunner;

        public MakeAppxWrapper(
            IOptions<AppSettings> settings,
            ProcessRunner procRunner,
            ILogger<MakeAppxWrapper> logger)
        {
            this.settings = settings.Value;
            this.procRunner = procRunner;
            this.logger = logger;
        }

        /// <summary>
        /// Packages up a directory containing APPX files, like AppManifest.xml, images directory, and more, and packages it as an .appx file.
        /// </summary>
        /// <param name="outputDirectory">The directory in which to create temporary files.</param>
        /// <param name="appxProjectDirectory">The unzipped appx or msix directory. It should contain AppxManifest.xml and an Images directory.</param>
        /// <returns>The file path to the generated .appx file.</returns>
        public Task<string> Execute(string appxProjectDirectory, string outputDirectory)
        {
            return MakeAppx(appxProjectDirectory, outputDirectory);
        }

        /// <summary>
        /// Generates a bundle from an existing appx or msix file.
        /// </summary>
        /// <param name="packageFilePath">The path to the .msix or .appx file.</param>
        /// <param name="version">The version of the app. This is needed to mark the bundle version.</param>
        /// <returns></returns>
        public async Task<string> Bundle(string packageFilePath, Version version)
        {
            var appxDirectory = Path.GetDirectoryName(packageFilePath);
            if (appxDirectory == null)
            {
                throw new InvalidOperationException("Couldn't find the directory for file path " + packageFilePath);
            }

            // Copy the .appx into its own directory. Otherwise the bundle command can try to pick up other files that cause issues with the command.
            var bundleDirectory = Path.Combine(appxDirectory, "bundle");
            Directory.CreateDirectory(bundleDirectory);
            var inputPath = Path.Combine(bundleDirectory, Path.GetFileName(packageFilePath));
            File.Copy(packageFilePath, inputPath);

            var appxFileNameWithoutExt = Path.GetFileNameWithoutExtension(packageFilePath);
            var outputBundlePath = Path.Combine(bundleDirectory, appxFileNameWithoutExt + ".appxbundle");            
            var bundleArgs = $"bundle /bv {version} /d \"{bundleDirectory}\" /p \"{outputBundlePath}\"";
            var procResult = await this.procRunner.Run(MakeAppxPath, bundleArgs, TimeSpan.FromMinutes(5));

            if (!File.Exists(outputBundlePath))
            {
                var bundleError = new FileNotFoundException($"makeappx was unable to bundle the package. {Environment.NewLine}{Environment.NewLine}Standard error: {procResult.StandardError}{Environment.NewLine}{Environment.NewLine}Standard output: {procResult.StandardOutput}");
                bundleError.Data.Add("arguments", bundleArgs);
                bundleError.Data.Add("standard error", procResult.StandardError);
                bundleError.Data.Add("standard output", procResult.StandardOutput);
                throw bundleError;
            }

            return outputBundlePath;
        }

        /// <summary>
        /// When Widgets are enabled, we need to bundle all the platform MSIXs together.
        /// </summary>
        /// <param name="packageFilePaths"></param>
        /// <param name="outputDirectory"></param>
        /// <param name="version"></param>
        /// <returns></returns>
        /// <exception cref="InvalidOperationException"></exception>
        public async Task<string> BundlePlatforms(List<string> packageFilePaths, string appxDirectory, Version version)
        {
            if (appxDirectory == null)
            {
                throw new InvalidOperationException("Couldn't find the directory" + appxDirectory);
            }

            // Copy the .appx into its own directory. Otherwise the bundle command can try to pick up other files that cause issues with the command.
            var bundleDirectory = Path.Combine(appxDirectory, "bundle");
            Directory.CreateDirectory(bundleDirectory);

            var appxFileNameWithoutExt = Path.GetFileNameWithoutExtension(packageFilePaths[0]);
            var outputBundlePath = Path.Combine(bundleDirectory, appxFileNameWithoutExt + ".appxbundle");
            foreach (string packageFilePath in packageFilePaths)
            {

                var inputPath = Path.Combine(bundleDirectory, Path.GetFileName(packageFilePath));
                File.Copy(packageFilePath, inputPath);

            }
            var bundleArgs = $"bundle /bv {version} /d \"{bundleDirectory}\" /p \"{outputBundlePath}\"";
            var procResult = await this.procRunner.Run(MakeAppxPath, bundleArgs, TimeSpan.FromMinutes(5));

            if (!File.Exists(outputBundlePath))
            {
                var bundleError = new FileNotFoundException($"makeappx was unable to bundle the package. {Environment.NewLine}{Environment.NewLine}Standard error: {procResult.StandardError}{Environment.NewLine}{Environment.NewLine}Standard output: {procResult.StandardOutput}");
                bundleError.Data.Add("arguments", bundleArgs);
                bundleError.Data.Add("standard error", procResult.StandardError);
                bundleError.Data.Add("standard output", procResult.StandardOutput);
                throw bundleError;
            }

            return outputBundlePath;
        }

        private async Task<string> MakeAppx(string projectDirectory, string outputDirectory)
        {
            var appxFilePath = Path.Combine(outputDirectory, $"{Guid.NewGuid()}.appx");
            var makeAppxArgs = $"pack /o /d \"{projectDirectory}\" /p \"{appxFilePath}\"";
            var procResult = await procRunner.Run(MakeAppxPath, makeAppxArgs, TimeSpan.FromMinutes(5));

            if (!File.Exists(appxFilePath))
            {
                var makeAppxError = new FileNotFoundException($"makeappx was unable to generate the package. {Environment.NewLine}{Environment.NewLine}Standard error: {procResult.StandardError}{Environment.NewLine}{Environment.NewLine}Standard output: {procResult.StandardOutput}");
                makeAppxError.Data.Add("arguments", makeAppxArgs);
                makeAppxError.Data.Add("standard error", procResult.StandardError);
                makeAppxError.Data.Add("standard output", procResult.StandardOutput);
                throw makeAppxError;
            }

            return appxFilePath;
        }

        private string MakeAppxPath => Path.Combine(this.settings.WindowsSdkDirectory, "makeappx.exe");
    }
}
