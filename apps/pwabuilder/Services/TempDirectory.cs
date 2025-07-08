using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using PWABuilder.IOS.Models;

namespace PWABuilder.IOS.Services
{
    /// <summary>
    /// Creates and tracks temporary files and directories and deletes them when CleanUp() is called.
    /// </summary>
    public class TempDirectory : IDisposable
    {
        private readonly List<string> directoriesToCleanUp = new();
        private readonly List<string> filesToCleanUp = new();
        private readonly ILogger<TempDirectory> logger;

        public TempDirectory(ILogger<TempDirectory> logger)
        {
            this.logger = logger;
        }

        public string CreateDirectory(string dirName)
        {
            var outputFolder = Path.Combine(Path.GetTempPath(), dirName);
            Directory.CreateDirectory(outputFolder);
            directoriesToCleanUp.Add(outputFolder);
            return outputFolder;
        }

        public string CreateFile()
        {
            var tempFileName = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString() + ".tmp");
            this.filesToCleanUp.Add(tempFileName);
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
                        logger.LogWarning(
                            directoryDeleteError,
                            "Unable to cleanup {directory}",
                            directory
                        );
                    }
                }
            }
        }

        public void Dispose()
        {
            this.CleanUp();
            GC.SuppressFinalize(this);
        }
    }
}
