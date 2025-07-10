using System.IO.Compression;

namespace PWABuilder.IOS.Common
{
    public static class ZipArchiveExtensions
    {
        /// <summary>
        /// Adds a directory and all its contents to a zip file.
        /// </summary>
        /// <param name="zip"></param>
        /// <param name="directory"></param>
        /// <param name="entryName"></param>
        /// <returns></returns>
        public static void CreateEntryFromDirectory(
            this ZipArchive zip,
            string directory,
            string entryName
        )
        {
            if (Directory.Exists(directory))
            {
                var files = Directory.GetFiles(directory);
                foreach (var file in files)
                {
                    zip.CreateEntryFromFile(file, $"{entryName}/{Path.GetFileName(file)}");
                }

                var directories = Directory.GetDirectories(directory);
                foreach (var subDirectory in directories)
                {
                    var dirEntryName = $"{entryName}/{new DirectoryInfo(subDirectory).Name}";
                    zip.CreateEntryFromDirectory(subDirectory, dirEntryName);
                }
            }
        }
    }
}
