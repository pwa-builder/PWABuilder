using PWABuilder.MicrosoftStore.Common;
using System;
using System.Collections.Generic;
using System.IO.Compression;
using System.Linq;
using System.Threading.Tasks;

namespace PWABuilder.MicrosoftStore.Models
{
    public sealed class ImageGeneratorServiceZipFile : IDisposable
    {
        private readonly ZipArchive zip;
        private readonly IReadOnlyDictionary<ImageScaleSetType, string> scaleFileNamePrefixes = new Dictionary<ImageScaleSetType, string>
        {
            { ImageScaleSetType.AppIcon, "Square44x44Logo.scale-" },
            { ImageScaleSetType.LargeTile, "LargeTile.scale-" },
            { ImageScaleSetType.MediumTile, "Square150x150Logo.scale-" },
            { ImageScaleSetType.SmallTile, "SmallTile.scale-" },
            { ImageScaleSetType.SplashScreen, "SplashScreen.scale-" },
            { ImageScaleSetType.StoreLogo, "StoreLogo.scale-" },
            { ImageScaleSetType.WideTile, "Wide310x150Logo.scale-" }
        };

        public ImageGeneratorServiceZipFile(ZipArchive zip)
        {
            this.zip = zip;
        }

        public ZipArchiveEntry? GetScaleSet(ImageScaleSetType type, ImageScale scale)
        {
            if (!scaleFileNamePrefixes.TryGetValue(type, out var prefix))
            {
                throw new NotSupportedException("Unable to find scale set type " + type);
            }

            return zip.GetEntry($"windows/{prefix}{scale.ToWindowsImageNamingConventionSuffix()}.png");
        }

        public ZipArchiveEntry? GetTargetSize(ImageTargetSize size, ImageAltForm altForm)
        {
            // Square44x44Logo isn't a typo here - the image generator service uses those files names, then appends the actual size to the file name.
            return zip.GetEntry($"windows/{altForm.ToWindowsImageNamingConventionString(size)}.png");
        }

        public void Dispose()
        {
            zip.Dispose();
        }
    }
}
