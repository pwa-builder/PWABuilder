using PWABuilder.IOS.Models;

namespace PWABuilder.IOS.Common
{
    public static class ImageTargetSizeExtensions
    {
        public static string ToFileName(this ImageTargetSize size)
        {
            return size switch
            {
                ImageTargetSize.Size16x16 => "16",
                ImageTargetSize.Size20x20 => "20",
                ImageTargetSize.Size29x29 => "29",
                ImageTargetSize.Size32x32 => "32",
                ImageTargetSize.Size40x40 => "40",
                ImageTargetSize.Size50x50 => "50",
                ImageTargetSize.Size57x57 => "57",
                ImageTargetSize.Size58x58 => "58",
                ImageTargetSize.Size60x60 => "60",
                ImageTargetSize.Size64x64 => "64",
                ImageTargetSize.Size72x72 => "72",
                ImageTargetSize.Size76x76 => "76",
                ImageTargetSize.Size80x80 => "80",
                ImageTargetSize.Size87x87 => "87",
                ImageTargetSize.Size100x100 => "100",
                ImageTargetSize.Size114x114 => "114",
                ImageTargetSize.Size120x120 => "120",
                ImageTargetSize.Size128x128 => "128",
                ImageTargetSize.Size144x144 => "144",
                ImageTargetSize.Size152x152 => "152",
                ImageTargetSize.Size167x167 => "167",
                ImageTargetSize.Size180x180 => "180",
                ImageTargetSize.Size192x192 => "192",
                ImageTargetSize.Size256x256 => "256",
                ImageTargetSize.Size512x512 => "512",
                ImageTargetSize.Size1024x1024 => "1024",
                _ => throw new NotImplementedException("Unexpected target size " + size),
            };
        }

        public static (int width, int height) GetDimensions(this ImageTargetSize size)
        {
            return size switch
            {
                ImageTargetSize.Size16x16 => (16, 16),
                ImageTargetSize.Size20x20 => (20, 20),
                ImageTargetSize.Size29x29 => (29, 29),
                ImageTargetSize.Size32x32 => (32, 32),
                ImageTargetSize.Size40x40 => (40, 40),
                ImageTargetSize.Size50x50 => (50, 50),
                ImageTargetSize.Size57x57 => (57, 57),
                ImageTargetSize.Size58x58 => (58, 58),
                ImageTargetSize.Size60x60 => (60, 60),
                ImageTargetSize.Size64x64 => (64, 64),
                ImageTargetSize.Size72x72 => (72, 72),
                ImageTargetSize.Size76x76 => (76, 76),
                ImageTargetSize.Size80x80 => (80, 80),
                ImageTargetSize.Size87x87 => (87, 87),
                ImageTargetSize.Size100x100 => (100, 100),
                ImageTargetSize.Size114x114 => (114, 114),
                ImageTargetSize.Size120x120 => (120, 120),
                ImageTargetSize.Size128x128 => (128, 128),
                ImageTargetSize.Size144x144 => (144, 144),
                ImageTargetSize.Size152x152 => (152, 152),
                ImageTargetSize.Size167x167 => (167, 167),
                ImageTargetSize.Size180x180 => (180, 180),
                ImageTargetSize.Size192x192 => (192, 192),
                ImageTargetSize.Size256x256 => (256, 256),
                ImageTargetSize.Size512x512 => (512, 512),
                ImageTargetSize.Size1024x1024 => (1024, 1024),
                _ => throw new NotSupportedException("Unknown image target size " + size),
            };
        }

        public static IEnumerable<ImageTargetSize> GetAll()
        {
            return new[]
            {
                ImageTargetSize.Size16x16,
                ImageTargetSize.Size20x20,
                ImageTargetSize.Size29x29,
                ImageTargetSize.Size32x32,
                ImageTargetSize.Size40x40,
                ImageTargetSize.Size50x50,
                ImageTargetSize.Size57x57,
                ImageTargetSize.Size58x58,
                ImageTargetSize.Size60x60,
                ImageTargetSize.Size64x64,
                ImageTargetSize.Size72x72,
                ImageTargetSize.Size76x76,
                ImageTargetSize.Size80x80,
                ImageTargetSize.Size87x87,
                ImageTargetSize.Size100x100,
                ImageTargetSize.Size114x114,
                ImageTargetSize.Size120x120,
                ImageTargetSize.Size128x128,
                ImageTargetSize.Size144x144,
                ImageTargetSize.Size152x152,
                ImageTargetSize.Size167x167,
                ImageTargetSize.Size180x180,
                ImageTargetSize.Size192x192,
                ImageTargetSize.Size256x256,
                ImageTargetSize.Size512x512,
                ImageTargetSize.Size1024x1024,
            };
        }

        public static bool IsLaunchIconSize(this ImageTargetSize targetSize)
        {
            return targetSize switch
            {
                ImageTargetSize.Size64x64 => true,
                ImageTargetSize.Size128x128 => true,
                ImageTargetSize.Size192x192 => true,
                ImageTargetSize.Size256x256 => true,
                ImageTargetSize.Size512x512 => true,
                _ => false,
            };
        }
    }
}
