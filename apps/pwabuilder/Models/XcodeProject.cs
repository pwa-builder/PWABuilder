using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace PWABuilder.IOS.Models
{
    /// <summary>
    /// Represents an XCode project workspace.
    /// Contains helper methods for finding and updating files within the workspace.
    /// </summary>
    public class XcodeProject
    {
        private readonly string rootDirectory;
        private readonly List<XcodeFolder> folders = new(20);
        private readonly List<XcodeFile> files = new(80);

        public XcodeProject(string rootDirectory)
        {
            this.rootDirectory = rootDirectory;
        }

        /// <summary>
        /// Loads all the paths of the files and folders within the workspace.
        /// </summary>
        /// <returns></returns>
        public void Load()
        {
            var directories = new Queue<string>();
            directories.Enqueue(this.rootDirectory);

            // Go through the whole project and push files and folders into our items list.
            while (directories.Count > 0)
            {
                var dir = directories.Dequeue();
                this.folders.Add(new XcodeFolder(dir));

                var subDirs = Directory.EnumerateDirectories(dir);
                foreach (var subDir in subDirs)
                {
                    directories.Enqueue(subDir);
                }

                foreach (var file in Directory.EnumerateFiles(dir))
                {
                    this.files.Add(new XcodeFile(file));
                }
            }
        }

        public XcodeFile GetFile(string fileName)
        {
            var file = this.files.FirstOrDefault(f =>
                string.Equals(f.Name, fileName, StringComparison.OrdinalIgnoreCase)
            );
            if (file == null)
            {
                throw new FileNotFoundException("Unable to find file " + fileName);
            }

            return file;
        }

        public XcodeFile GetFileByPath(string partialOrCompletePath)
        {
            var file = this.files.FirstOrDefault(f =>
                f.ItemPath.Contains(partialOrCompletePath, StringComparison.OrdinalIgnoreCase)
            );
            if (file == null)
            {
                throw new FileNotFoundException(
                    "Unable to find file with path " + partialOrCompletePath
                );
            }

            return file;
        }

        public XcodeFolder GetFolder(string folderName)
        {
            var folder = this.folders.FirstOrDefault(f =>
                string.Equals(f.Name, folderName, StringComparison.OrdinalIgnoreCase)
            );
            if (folder == null)
            {
                throw new FileNotFoundException("Unable to find folder " + folder);
            }

            return folder;
        }

        /// <summary>
        /// Saves all the changes to disk.
        /// </summary>
        /// <returns></returns>
        public async Task Save()
        {
            // Apply the changes to the files.
            foreach (var file in this.files)
            {
                await file.ApplyChanges();
            }

            // Move directories if need.
            foreach (var folder in this.folders)
            {
                folder.ApplyChanges();
            }
        }
    }
}
