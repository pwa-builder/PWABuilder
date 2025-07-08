using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace PWABuilder.IOS.Models
{
    /// <summary>
    /// A file within an XCode workspace.
    /// </summary>
    public class XcodeFile : XcodeItem
    {
        private Queue<Func<string, string>>? sourceTransforms;
        private string? newFileName;

        public XcodeFile(string filePath)
            : base(filePath)
        {
            this.Name = Path.GetFileName(filePath);
        }

        /// <summary>
        /// Gets the file name.
        /// </summary>
        public override string Name { get; protected set; }

        /// <summary>
        /// Queues an update to rename the file. The update will be applied when <see cref="ApplyChanges"/> is called.
        /// </summary>
        /// <param name="newName">The new name.</param>
        public void Rename(string newName)
        {
            this.newFileName = newName;
        }

        /// <summary>
        /// Queues an update to the file that replaces a string with another string. The update will be applied when <see cref="ApplyChanges"/> is called.
        /// </summary>
        /// <param name="existing">The string to replace.</param>
        /// <param name="replacement">The replacement string.</param>
        public void Replace(string existing, string replacement)
        {
            var replaceFunc = new Func<string, string>(contents =>
            {
                if (!contents.Contains(existing))
                {
                    throw new ArgumentException(
                        $"Expected {this.Name} to contain \"{existing}\", but it did not contain that string."
                    );
                }

                return contents.Replace(existing, replacement);
            });

            if (this.sourceTransforms == null)
            {
                this.sourceTransforms = new Queue<Func<string, string>>(2);
            }

            this.sourceTransforms.Enqueue(replaceFunc);
        }

        /// <summary>
        /// Applies any queued changes to the file.
        /// </summary>
        /// <returns></returns>
        public async Task ApplyChanges()
        {
            if (this.sourceTransforms == null || this.sourceTransforms.Count == 0)
            {
                return;
            }

            var contents = await File.ReadAllTextAsync(this.ItemPath);
            foreach (var transform in this.sourceTransforms)
            {
                contents = transform(contents);
            }

            sourceTransforms.Clear();
            await File.WriteAllTextAsync(this.ItemPath, contents);

            // Move the file if need be.
            if (!string.IsNullOrWhiteSpace(this.newFileName))
            {
                var directoryPath = Path.GetDirectoryName(this.ItemPath);
                var newFilePath = Path.Combine(directoryPath!, this.newFileName);
                File.Move(this.ItemPath, newFilePath);

                this.newFileName = null;
            }
        }
    }
}
