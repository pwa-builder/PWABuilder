using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Microsoft.PWABuilder.Windows.Chromium.Models;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace Microsoft.PWABuilder.Windows.Chromium.Services
{
    /// <summary>
    /// Wraps the MakePri.exe Windows SDK tool.
    /// </summary>
    public class MakePriWrapper
    {
        private readonly AppSettings settings;
        private readonly ProcessRunner procRunner;
        private readonly ILogger<MakePriWrapper> logger;

        public MakePriWrapper(
            IOptions<AppSettings> settings, 
            ProcessRunner procRunner,
            ILogger<MakePriWrapper> logger)
        {
            this.settings = settings.Value;
            this.procRunner = procRunner;
            this.logger = logger;
        }

        /// <summary>
        /// Generates a PRI resources file for the specified MSIX/APPX unpacked project directory. The directory should have an Images subdirectory containing the images for the app.
        /// </summary>
        /// <param name="appxProjectDirectory">The unzipped appx or msix directory. It should contain AppxManifest.xml and an Images directory.</param>
        /// <param name="outputDirectory">The directory in which to create temporary files.</param>
        /// <returns>The file path to the generated resources.pri file.</returns>
        public async Task<string> Execute(string appxProjectDirectory, string outputDirectory)
        {
            // Delete any existing .pri file. Without this, we get duplicated resources in final resources.pri file.
            File.Delete(Path.Combine(appxProjectDirectory, "resources.pri"));

            // Create priconfig.xml resource config file.
            var priConfigPath = Path.Combine(outputDirectory, "priconfig.xml");
            await RunMakePri($"createconfig /cf \"{priConfigPath}\" /dq en-US /o /v /pv 10.0.0", appxProjectDirectory);

            // Remove the <autoResourcePackage qualifier="Scale"/> line from the pri config file.
            // Without this, multiple resources files (one for each Windows DPI scale) are generated, e.g. resources.scale-200.pri, resources.scale-400.pri, etc.
            // By removing this line, all the images will be packed into a single resources.pri.
            await RemoveScaleQualifier(priConfigPath);

            // Generate the actual resource file, resources.pri
            await RunMakePri($"new /pr \"{appxProjectDirectory}\" /cf \"{priConfigPath}\" /v /o", appxProjectDirectory);

            return Path.Combine(appxProjectDirectory, "resources.pri");
        }

        private Task<ProcessResult> RunMakePri(string args, string workingDirectory)
        {
            var makePriPath = Path.Combine(this.settings.WindowsSdkDirectory, "makepri.exe");
            return procRunner.Run(makePriPath, args, TimeSpan.FromMinutes(5), workingDirectory, System.Text.Encoding.Unicode);
        }

        private async Task RemoveScaleQualifier(string priConfigPath)
        {
            // We want to remove the line: <autoResourcePackage qualifier="Scale"/>
            // Removing this line enables the resources to be packed into a single .pri file, regardless of app icon scales.
            var scaleQualifierLine = "<autoResourcePackage qualifier=\"Scale\"/>";
            var lines = await File.ReadAllLinesAsync(priConfigPath);
            var linesWithoutScaleQualifier = lines
                .Where(l => !l.Contains(scaleQualifierLine, StringComparison.InvariantCultureIgnoreCase))
                .ToArray();

            // Sanity check: was it removed?
            if (lines.Length == linesWithoutScaleQualifier.Length)
            {
                logger.LogWarning("Unable to remove the scale qualifier line from the resources. Icons for different DPI scales will not be used in the app.");
            }

            await File.WriteAllLinesAsync(priConfigPath, linesWithoutScaleQualifier);
        }
    }
}
