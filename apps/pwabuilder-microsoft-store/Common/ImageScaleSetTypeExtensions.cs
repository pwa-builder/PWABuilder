using Microsoft.PWABuilder.Windows.Chromium.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Microsoft.PWABuilder.Windows.Chromium.Common
{
    public static class ImageScaleSetTypeExtensions
    {
        public static string ToWindowsImageNamingConventionFileName(this ImageScaleSetType imageSetType, ImageScale scale)
        {
            var scaleString = scale.ToWindowsImageNamingConventionSuffix();
            return imageSetType switch
            {
                ImageScaleSetType.AppIcon => $"Square44x44Logo.scale-{scaleString}.png",
                ImageScaleSetType.LargeTile => $"LargeTile.scale-{scaleString}.png",
                ImageScaleSetType.MediumTile => $"Square150x150Logo.scale-{scaleString}.png",
                ImageScaleSetType.SmallTile => $"SmallTile.scale-{scaleString}.png",
                ImageScaleSetType.SplashScreen => $"SplashScreen.scale-{scaleString}.png",
                ImageScaleSetType.StoreLogo => $"StoreLogo.scale-{scaleString}.png",
                ImageScaleSetType.WideTile => $"Wide310x150Logo.scale-{scaleString}.png",
                _ => throw new NotSupportedException("Unknown image set type " + imageSetType)
            };
        }
    }
}
