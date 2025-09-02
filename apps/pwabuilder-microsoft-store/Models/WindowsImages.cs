using Microsoft.PWABuilder.Microsoft.Store.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Microsoft.PWABuilder.Microsoft.Store.Models
{
    /// <summary>
    /// Contains images for a Windows app package.
    /// </summary>
    /// <remarks>
    /// See the following for documentation about Windows app package images:
    /// https://docs.microsoft.com/en-us/windows/uwp/design/style/app-icons-and-logos
    /// https://docs.microsoft.com/en-us/windows/uwp/app-resources/tailor-resources-lang-scale-contrast
    /// https://docs.microsoft.com/en-us/windows/uwp/app-resources/images-tailored-for-scale-theme-contrast
    /// </remarks>
    public class WindowsImages
    {
        private static readonly IReadOnlyDictionary<ImageScale, string> SplashScreenDimensions = new Dictionary<ImageScale, string>
        {
            { ImageScale.X1, "620x300" },
            { ImageScale.X125, "775x375" },
            { ImageScale.X150, "930x450" },
            { ImageScale.X200, "1240x600" },
            { ImageScale.X400, "2480x1200" }
        };
        private static readonly IReadOnlyDictionary<ImageScale, string> AppIconDimensions = new Dictionary<ImageScale, string>
        {
            { ImageScale.X1, "44x44" },
            { ImageScale.X125, "55x55" },
            { ImageScale.X150, "66x66" },
            { ImageScale.X200, "88x88" },
            { ImageScale.X400, "176x176" }
        };
        private static readonly IReadOnlyDictionary<ImageScale, string> SmallTileDimensions = new Dictionary<ImageScale, string>
        {
            { ImageScale.X1, "71x71" },
            { ImageScale.X125, "89x89" },
            { ImageScale.X150, "107x107" },
            { ImageScale.X200, "142x142" },
            { ImageScale.X400, "284x284" }
        };
        private static readonly IReadOnlyDictionary<ImageScale, string> MediumTileDimensions = new Dictionary<ImageScale, string>
        {
            { ImageScale.X1, "150x150" },
            { ImageScale.X125, "188x188" },
            { ImageScale.X150, "225x225" },
            { ImageScale.X200, "300x300" },
            { ImageScale.X400, "600x600" }
        };
        private static readonly IReadOnlyDictionary<ImageScale, string> LargeTileDimensions = new Dictionary<ImageScale, string>
        {
            { ImageScale.X1, "310x310" },
            { ImageScale.X125, "388x388" },
            { ImageScale.X150, "465x465" },
            { ImageScale.X200, "620x620" },
            { ImageScale.X400, "1240x1240" }
        };
        private static readonly IReadOnlyDictionary<ImageScale, string> WideTileDimensions = new Dictionary<ImageScale, string>
        {
            { ImageScale.X1, "310x150" },
            { ImageScale.X125, "388x188" },
            { ImageScale.X150, "465x225" },
            { ImageScale.X200, "620x300" },
            { ImageScale.X400, "1240x600" }
        };
        private static readonly IReadOnlyDictionary<ImageScale, string> StoreLogoDimensions = new Dictionary<ImageScale, string>
        {
            { ImageScale.X1, "50x50" },
            { ImageScale.X125, "63x63" },
            { ImageScale.X150, "75x75" },
            { ImageScale.X200, "100x100" },
            { ImageScale.X400, "200x200" }
        };

        /// <summary>
        /// The URI of the image to use to generate all missing images.
        /// If null, the largest square image from the manifest will be used as the base image.
        /// </summary>
        public Uri? BaseImage { get; set; }

        /// <summary>
        /// The hex color to use as the background for the images, or 'transparent'. If null, the (0,0) pixel of the base image will be used.
        /// </summary>
        public string? BackgroundColor { get; set; }

        /// <summary>
        /// The padding to use around the generated icons. 0 is no padding, 1 is 100% of the source image. Defaults to 0.0.
        /// </summary>
        public double Padding { get; set; } = 0.0; // Used to be 0.3, but Windows 11 launch told partners not to have padding. So, switching to 0.0.

        /// <summary>
        /// The image to use for the app splash screen. 
        /// Sizes: 620x300 is typical, with DPI scales of 775x375, 930x450, 1240x600, and 2480x1200.
        /// 
        /// Note: the modern (VB+) package doesn't support splash screens at this time. Leaving this here because it can still work for the classic package.
        /// </summary>
        public ImageScaleSet? SplashScreen { get; set; }

        /// <summary>
        /// The image set to use for the extra small app icon. Typically shown in the start menu, task bar, and task manager.
        /// Sizes: 44x44, with scales of 55x55, 66x66, 88x88, 176x176.
        /// </summary>
        public ImageScaleSet? AppIcon { get; set; }

        /// <summary>
        /// The image set to use for the small tile shown in the start menu.
        /// Sizes: 71x71, with scale sets of 89x89, 107x107, 142x142, 284x284.
        /// </summary>
        public ImageScaleSet? SmallTile { get; set; }

        /// <summary>
        /// The image set used for the medium tile shown in the start menu.
        /// Sizes: 150x150, with scale sets of 188x188, 225x225, 300x300, 600x600.
        /// </summary>
        public ImageScaleSet? MediumTile { get; set; }

        /// <summary>
        /// The image set used for the large tile shown in the start menu.
        /// Sizes: 310x310, with scale sets of 388x388, 465x465, 620x620, 1240x1240.
        /// </summary>
        public ImageScaleSet? LargeTile { get; set; }

        /// <summary>
        /// The image set used for the wide tile shown in the start menu.
        /// Sizes: 310x150, 388x188, 465x225, 620x300, 1240x600.
        /// </summary>
        public ImageScaleSet? WideTile { get; set; }

        /// <summary>
        /// The image set used for the store logo and package logo. 
        /// Shown in App installer, Partner Center, the "Report an app" option in the Store, the "Write a review" option in the Store.
        /// Sizes: 50x50, with scale sets of 63x63, 75x75, 100x100, 200x200.
        /// </summary>
        public ImageScaleSet? StoreLogo { get; set; }

        /// <summary>
        /// The 16x16 app icon set used in start menu, task bar, task manager.
        /// </summary>
        public ImageTargetSizeSet? AppIcon16 { get; set; }

        /// <summary>
        /// The 20x20 app icon set used in start menu, task bar, task manager.
        /// </summary>
        public ImageTargetSizeSet? AppIcon20 { get; set; }

        /// <summary>
        /// The 24x24 app icon set used in start menu, task bar, task manager.
        /// </summary>
        public ImageTargetSizeSet? AppIcon24 { get; set; }

        /// <summary>
        /// The 30x30 app icon set used in start menu, task bar, task manager.
        /// </summary>
        public ImageTargetSizeSet? AppIcon30 { get; set; }

        /// <summary>
        /// The 32x32 app icon set used in start menu, task bar, task manager.
        /// </summary>
        public ImageTargetSizeSet? AppIcon32 { get; set; }

        /// <summary>
        /// The 36x36 app icon set used in start menu, task bar, task manager.
        /// </summary>
        public ImageTargetSizeSet? AppIcon36 { get; set; }

        /// <summary>
        /// The 40x40 app icon set used in start menu, task bar, task manager.
        /// </summary>
        public ImageTargetSizeSet? AppIcon40 { get; set; }

        /// <summary>
        /// The 44x44 app icon set used in start menu, task bar, task manager.
        /// </summary>
        public ImageTargetSizeSet? AppIcon44 { get; set; }

        /// <summary>
        /// The 48x48 app icon set used in start menu, task bar, task manager.
        /// </summary>
        public ImageTargetSizeSet? AppIcon48 { get; set; }

        /// <summary>
        /// The 60x60 app icon set used in start menu, task bar, task manager.
        /// </summary>
        public ImageTargetSizeSet? AppIcon60 { get; set; }

        /// <summary>
        /// The 64x64 app icon set used in start menu, task bar, task manager.
        /// </summary>
        public ImageTargetSizeSet? AppIcon64 { get; set; }

        /// <summary>
        /// The 72x72 app icon set used in start menu, task bar, task manager.
        /// </summary>
        public ImageTargetSizeSet? AppIcon72 { get; set; }

        /// <summary>
        /// The 80x80 app icon set used in start menu, task bar, task manager.
        /// </summary>
        public ImageTargetSizeSet? AppIcon80 { get; set; }

        /// <summary>
        /// The 96x96 app icon set used in start menu, task bar, task manager.
        /// </summary>
        public ImageTargetSizeSet? AppIcon96 { get; set; }

        /// <summary>
        /// The 256x256 app icon set used in start menu, task bar, task manager.
        /// </summary>
        public ImageTargetSizeSet? AppIcon256 { get; set; }

        /// <summary>
        /// Gets an image URI from the specified scale set.
        /// </summary>
        /// <param name="setType"></param>
        /// <param name="scale"></param>
        /// <param name="manifest"></param>
        /// <returns></returns>
        public Uri? GetUriFromScale(ImageScaleSetType setType, ImageScale scale, WebAppManifestContext manifest)
        {
            return setType switch
            {
                ImageScaleSetType.AppIcon => AppIcon?.GetImageForScale(scale, manifest),
                ImageScaleSetType.LargeTile => LargeTile?.GetImageForScale(scale, manifest),
                ImageScaleSetType.MediumTile => MediumTile?.GetImageForScale(scale, manifest),
                ImageScaleSetType.SmallTile => SmallTile?.GetImageForScale(scale, manifest),
                ImageScaleSetType.SplashScreen => SplashScreen?.GetImageForScale(scale, manifest),
                ImageScaleSetType.StoreLogo => StoreLogo?.GetImageForScale(scale, manifest),
                ImageScaleSetType.WideTile => WideTile?.GetImageForScale(scale, manifest),
                _ => throw new NotSupportedException("Unknown image scale set type " + setType)
            };
        }

        /// <summary>
        /// Gets an image URI from the specified target size and alt form.
        /// </summary>
        /// <returns></returns>
        public Uri? GetUriFromTargetSize(ImageTargetSize targetSize, ImageAltForm altForm)
        {
            return targetSize.GetWindowsImage(this)?.GetImageForAltForm(altForm);
        }

        public static string GetDimensionFromScale(ImageScaleSetType type, ImageScale scale)
        {
            var dimensions = type switch
            {
                ImageScaleSetType.AppIcon => AppIconDimensions,
                ImageScaleSetType.LargeTile => LargeTileDimensions,
                ImageScaleSetType.MediumTile => MediumTileDimensions,
                ImageScaleSetType.SmallTile => SmallTileDimensions,
                ImageScaleSetType.SplashScreen => SplashScreenDimensions,
                ImageScaleSetType.StoreLogo => StoreLogoDimensions,
                ImageScaleSetType.WideTile => WideTileDimensions,
                _ => throw new NotSupportedException("Unknown image scale set type " + type)
            };

            if (!dimensions.TryGetValue(scale, out var dimension))
            {
                throw new NotSupportedException($"Unable to find scale {scale} in dimensions {dimensions}");
            }

            return dimension;
        }
    }
}
