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
    /// Creates and tracks temporary files and directories and deletes them when CleanUp() is called.
    /// </summary>
    public class TempDirectory : IDisposable
    {
        private readonly AppSettings settings;
        private readonly List<string> directoriesToCleanUp = new List<string>();
        private readonly List<string> filesToCleanUp = new List<string>();
        private readonly ILogger<TempDirectory> logger;

        public TempDirectory(IOptions<AppSettings> settings, ILogger<TempDirectory> logger)
        {
            this.settings = settings.Value;
            this.logger = logger;
        }

        public string CreateDirectory(string? dirName = null)
        {
            var expandedOutputDir = Environment.ExpandEnvironmentVariables(settings.OutputDirectory);
            if (string.IsNullOrEmpty(dirName))
            {
                dirName = Guid.NewGuid().ToString();
            }
            var outputFolder = Path.Combine(expandedOutputDir, dirName);
            Directory.CreateDirectory(outputFolder);
            directoriesToCleanUp.Add(outputFolder);
            return outputFolder;
        }

        public string CreateFile(string? fileExtension = ".tmp")
        {
            // Make sure the output directory exists
            var expandedOutputDir = Environment.ExpandEnvironmentVariables(settings.OutputDirectory);
            Directory.CreateDirectory(expandedOutputDir);

            var tempFileName = Path.Combine(expandedOutputDir, Guid.NewGuid().ToString() + fileExtension);
            this.filesToCleanUp.Add(tempFileName);

            // Create a zero-byte file.
            File.WriteAllBytes(tempFileName, new byte[0]);

            return tempFileName;
        }

        public void CleanUp()
        {
            foreach (var file in this.filesToCleanUp)
            {
                if (!string.IsNullOrWhiteSpace(file))
                {
                    try
                    {
                        File.Delete(file);
                    }
                    catch (Exception fileDeleteError)
                    {
                        logger.LogWarning(fileDeleteError, "Unable to cleanup {zipFile}", file);
                    }
                }
            }

            foreach (var directory in this.directoriesToCleanUp)
            {
                if (!string.IsNullOrWhiteSpace(directory))
                {
                    try
                    {
                        Directory.Delete(directory, recursive: true);
                    }
                    catch (Exception directoryDeleteError)
                    {
                        logger.LogWarning(directoryDeleteError, "Unable to cleanup {directory}", directory);
                    }
                }
            }
        }

        public void Dispose()
        {
            CleanUp();
            GC.SuppressFinalize(this);
        }
    }
}
