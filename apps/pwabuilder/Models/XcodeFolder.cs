using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
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
            this.Name = System.IO.Path.GetFileName(directoryPath.TrimEnd('\\').TrimEnd('/'));
        }

        /// <summary>
        /// Gets the directory name.
        /// </summary>
        public override string Name { get; protected set; }

        public void Rename(string newName)
        {
            this.newDirectoryName = newName;
        }

        public void ApplyChanges()
        {
            if (string.IsNullOrWhiteSpace(this.newDirectoryName))
            {
                return;
            }

            new DirectoryInfo(this.ItemPath).Rename(this.newDirectoryName);
        }
    }
}
