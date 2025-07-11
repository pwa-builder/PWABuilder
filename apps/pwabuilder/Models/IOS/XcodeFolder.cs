using PWABuilder.IOS.Common;

namespace PWABuilder.IOS.Models
{
    /// <summary>
    /// A folder within an Xcode workspace.
    /// </summary>
    public class XcodeFolder : XcodeItem
    {
        private string? newDirectoryName;

        public XcodeFolder(string directoryPath)
            : base(directoryPath)
        {
            Name = Path.GetFileName(directoryPath.TrimEnd('\\').TrimEnd('/'));
        }

        /// <summary>
        /// Gets the directory name.
        /// </summary>
        public override string Name { get; protected set; }

        public void Rename(string newName)
        {
            newDirectoryName = newName;
        }

        public void ApplyChanges()
        {
            if (string.IsNullOrWhiteSpace(newDirectoryName))
            {
                return;
            }

            new DirectoryInfo(ItemPath).Rename(newDirectoryName);
        }
    }
}
