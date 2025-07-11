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
            filesToCleanUp.Add(tempFileName);
            return tempFileName;
        }

        public void CleanUp()
        {
            foreach (var file in filesToCleanUp)
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

            foreach (var directory in directoriesToCleanUp)
            {
                if (!string.IsNullOrWhiteSpace(directory))
                {
                    try
                    {
                        if (Directory.Exists(directory))
                        {
                            Directory.Delete(directory, recursive: true);
                        }
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
            CleanUp();
            GC.SuppressFinalize(this);
        }
    }
}
