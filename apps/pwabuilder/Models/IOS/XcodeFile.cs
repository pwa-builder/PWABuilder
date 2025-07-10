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
            Name = Path.GetFileName(filePath);
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
            newFileName = newName;
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
                        $"Expected {Name} to contain \"{existing}\", but it did not contain that string."
                    );
                }

                return contents.Replace(existing, replacement);
            });

            if (sourceTransforms == null)
            {
                sourceTransforms = new Queue<Func<string, string>>(2);
            }

            sourceTransforms.Enqueue(replaceFunc);
        }

        /// <summary>
        /// Applies any queued changes to the file.
        /// </summary>
        /// <returns></returns>
        public async Task ApplyChanges()
        {
            if (sourceTransforms == null || sourceTransforms.Count == 0)
            {
                return;
            }

            var contents = await File.ReadAllTextAsync(ItemPath);
            foreach (var transform in sourceTransforms)
            {
                contents = transform(contents);
            }

            sourceTransforms.Clear();
            await File.WriteAllTextAsync(ItemPath, contents);

            // Move the file if need be.
            if (!string.IsNullOrWhiteSpace(newFileName))
            {
                var directoryPath = Path.GetDirectoryName(ItemPath);
                var newFilePath = Path.Combine(directoryPath!, newFileName);
                File.Move(ItemPath, newFilePath);

                newFileName = null;
            }
        }
    }
}
