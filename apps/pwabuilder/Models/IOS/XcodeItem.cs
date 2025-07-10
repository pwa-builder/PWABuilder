namespace PWABuilder.IOS.Models
{
    public abstract class XcodeItem
    {
        protected XcodeItem(string path)
        {
            ItemPath = path;
        }

        public string ItemPath { get; protected init; }

        public abstract string Name { get; protected set; }
    }
}
