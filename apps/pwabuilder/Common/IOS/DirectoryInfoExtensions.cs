namespace PWABuilder.IOS.Common
{
    public static class DirectoryInfoExtensions
    {
        /// <summary>
        /// Copies the contents of a directory to another directory.
        /// </summary>
        /// <param name="source">The source directory whose contents will be copied.</param>
        /// <param name="target">The destination directory to receive the contents of the <paramref name="source"/>.</param>
        public static void CopyContents(this DirectoryInfo source, DirectoryInfo target)
        {
            var directoriesToCopy = new Queue<(DirectoryInfo source, DirectoryInfo target)>();
            var enqueueSubdirectories = new Action<DirectoryInfo, DirectoryInfo>(
                (currentSource, currentTarget) =>
                {
                    // Create the target directory.
                    Directory.CreateDirectory(currentTarget.FullName);

                    // Copy each file into the new directory.
                    foreach (var file in currentSource.EnumerateFiles())
                    {
                        file.CopyTo(Path.Combine(currentTarget.FullName, file.Name), true);
                    }

                    // Enqueue the subdirectories.
                    foreach (var subDir in currentSource.GetDirectories())
                    {
                        var nextTargetSubDir = currentTarget.CreateSubdirectory(subDir.Name);
                        directoriesToCopy.Enqueue((subDir, nextTargetSubDir));
                    }
                }
            );

            enqueueSubdirectories(source, target);
            while (directoriesToCopy.Count > 0)
            {
                var (currentSrc, currentTarget) = directoriesToCopy.Dequeue();
                enqueueSubdirectories(currentSrc, currentTarget);
            }
        }

        /// <summary>
        /// Renames a directory.
        /// </summary>
        /// <param name="directory">The directory to rename.</param>
        /// <param name="newName">The new name.</param>
        public static void Rename(this DirectoryInfo directory, string newName)
        {
            var parentPath = directory.Parent?.FullName ?? string.Empty;
            var destination = Path.Combine(parentPath, newName);
            directory.MoveTo(destination);
        }
    }
}
