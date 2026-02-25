using System.IO.Compression;
using PWABuilder.IOS.Common;

namespace PWABuilder.IOS.Models
{
    public sealed class ImageGeneratorServiceZipFile : IDisposable
    {
        private readonly ZipArchive zip;

        public ImageGeneratorServiceZipFile(ZipArchive zip)
        {
            this.zip = zip;
        }

        public ZipArchiveEntry? GetTargetSize(ImageTargetSize size)
        {
            return zip.GetEntry($"ios/{size.ToFileName()}.png");
        }

        public void Dispose()
        {
            zip.Dispose();
        }
    }
}
