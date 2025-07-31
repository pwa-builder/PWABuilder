using Microsoft.PWABuilder.Windows.Chromium.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Microsoft.PWABuilder.Windows.Chromium.Common
{
    public static class ImageTargetSizeExtensions
    {
        public static ImageTargetSizeSet? GetWindowsImage(this ImageTargetSize size, WindowsImages images)
        {
            return size switch
            {
                ImageTargetSize.Size16x16 => images.AppIcon16,
                ImageTargetSize.Size20x20 => images.AppIcon20,
                ImageTargetSize.Size24x24 => images.AppIcon24,
                ImageTargetSize.Size30x30 => images.AppIcon30,
                ImageTargetSize.Size32x32 => images.AppIcon32,
                ImageTargetSize.Size36x36 => images.AppIcon36,
                ImageTargetSize.Size40x40 => images.AppIcon40,
                ImageTargetSize.Size44x44 => images.AppIcon44,
                ImageTargetSize.Size48x48 => images.AppIcon48,
                ImageTargetSize.Size60x60 => images.AppIcon60,
                ImageTargetSize.Size64x64 => images.AppIcon64,
                ImageTargetSize.Size72x72 => images.AppIcon72,
                ImageTargetSize.Size80x80 => images.AppIcon80,
                ImageTargetSize.Size96x96 => images.AppIcon96,
                ImageTargetSize.Size256x256 => images.AppIcon256,
                _ => throw new NotSupportedException("Unknown image target size " + size)
            };
        }

        public static IEnumerable<ImageTargetSize> GetAll()
        {
            return new[]
            {
                ImageTargetSize.Size16x16,
                ImageTargetSize.Size20x20,
                ImageTargetSize.Size24x24,
                ImageTargetSize.Size32x32,
                ImageTargetSize.Size30x30,
                ImageTargetSize.Size36x36,
                ImageTargetSize.Size40x40,
                ImageTargetSize.Size44x44,
                ImageTargetSize.Size48x48,
                ImageTargetSize.Size60x60,
                ImageTargetSize.Size64x64,
                ImageTargetSize.Size72x72,
                ImageTargetSize.Size80x80,
                ImageTargetSize.Size96x96,
                ImageTargetSize.Size256x256
            };
        }

        public static (int width, int height) GetDimensions(this ImageTargetSize size)
        {
            return size switch
            {
                ImageTargetSize.Size16x16 => (16, 16),
                ImageTargetSize.Size20x20 => (20, 20),
                ImageTargetSize.Size24x24 => (24, 24),
                ImageTargetSize.Size30x30 => (30, 30),
                ImageTargetSize.Size32x32 => (32, 32),
                ImageTargetSize.Size36x36 => (36, 36),
                ImageTargetSize.Size40x40 => (40, 40),
                ImageTargetSize.Size44x44 => (44, 44),
                ImageTargetSize.Size48x48 => (48, 48),
                ImageTargetSize.Size60x60 => (60, 60),
                ImageTargetSize.Size64x64 => (64, 64),
                ImageTargetSize.Size72x72 => (72, 72),
                ImageTargetSize.Size80x80 => (80, 80),
                ImageTargetSize.Size96x96 => (96, 96),
                ImageTargetSize.Size256x256 => (256, 256),
                _ => throw new NotSupportedException("Unknown image target size " + size)
            };
        }

        public static string ToSuffix(this ImageTargetSize size)
        {
            return size.GetDimensions().width.ToString();
        }
    }
}
