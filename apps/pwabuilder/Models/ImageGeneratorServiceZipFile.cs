using System;
using System.Collections.Generic;
using System.IO.Compression;
using System.Linq;
using System.Threading.Tasks;
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
            // Square44x44Logo isn't a typo here - the image generator service uses those files names, then appends the actual size to the file name.
            return zip.GetEntry($"ios/{size.ToFileName()}.png");
        }

        public void Dispose()
        {
            zip.Dispose();
        }
    }
}
