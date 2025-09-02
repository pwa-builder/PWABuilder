using System;
using System.Collections.Generic;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Reflection.PortableExecutable;
using System.Threading.Tasks;

namespace Microsoft.PWABuilder.Microsoft.Store.Common
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
        public static void CreateEntryFromDirectory(this ZipArchive zip, string directory, string entryName)
        {
            if (Directory.Exists(directory))
            {
                var files = Directory.GetFiles(directory);
                foreach (var file in files)
                {
                    zip.CreateEntryFromFile(file, $"{entryName}\\{Path.GetFileName(file)}");
                }

                var directories = Directory.GetDirectories(directory);
                foreach (var subDirectory in directories)
                {
                    var dirEntryName = $"{entryName}\\{new DirectoryInfo(subDirectory).Name}";
                    zip.CreateEntryFromDirectory(subDirectory, dirEntryName);
                }
            }
        }

        /// <summary>
        /// Creates a new file in a zip and writes the contents to it.
        /// </summary>
        /// <param name="zip">The zip to add the file to.</param>
        /// <param name="fileContents">The string contents of the file.</param>
        /// <param name="entryName">The name of the entry in the zip file.</param>
        /// <returns>A new zip entry.</returns>
        public static async Task<ZipArchiveEntry> CreateEntryFromString(this ZipArchive zip, string fileContents, string entryName)
        {
            var entry = zip.CreateEntry(entryName);
            var encoding = new System.Text.UTF8Encoding(encoderShouldEmitUTF8Identifier: true); // necessary for the "install.ps1" powershell script to work with Unicode app names
            using (var installStream = new StreamWriter(entry.Open(), encoding))
            {
                await installStream.WriteAsync(fileContents);
            }

            return entry;
        }
    }
}
