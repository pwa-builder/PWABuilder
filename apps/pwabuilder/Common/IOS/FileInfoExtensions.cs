namespace PWABuilder.IOS.Common
{
    /// <summary>
    /// Extensions for FileInfo
    /// </summary>
    public static class FileInfoExtensions
    {
        /// <summary>
        /// Renames the specified file.
        /// </summary>
        /// <param name="file"></param>
        /// <param name="newName"></param>
        public static void Rename(this FileInfo file, string newName)
        {
            var directory = file.DirectoryName ?? string.Empty;
            var newFullPath = Path.Combine(directory, newName);
            file.MoveTo(newFullPath);
        }
    }
}
