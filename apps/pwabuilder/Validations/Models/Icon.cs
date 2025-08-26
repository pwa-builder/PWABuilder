namespace PWABuilder.Validations.Models
{
    public class Icon
    {
        public string Src { get; set; } = string.Empty;
        public string Sizes { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public string Purpose { get; set; } = string.Empty;

        public (int Width, int Height)? GetSize()
        {
            var parts = Sizes.Split('x');
            if (
                parts.Length == 2
                && int.TryParse(parts[0], out var width)
                && int.TryParse(parts[1], out var height)
            )
            {
                return (width, height);
            }
            return null;
        }

        public bool IsPngOrSvg() =>
            Type == "image/png"
            || Type == "image/svg"
            || Src.EndsWith(".png", StringComparison.OrdinalIgnoreCase)
            || Src.EndsWith(".svg", StringComparison.OrdinalIgnoreCase);

        public bool IsPng => Type == "image/png" || Src.EndsWith(".png", StringComparison.OrdinalIgnoreCase);

        public bool IsWebp => Type == "image/webp" || Src.EndsWith(".webp", StringComparison.OrdinalIgnoreCase);

        public bool IsJpg => Type == "image/jpg" || Type == "image/jpeg" || Src.EndsWith(".jpg", StringComparison.OrdinalIgnoreCase) || Src.EndsWith(".jpeg", StringComparison.OrdinalIgnoreCase);

        public bool IsSquare => GetSize() is (int width, int height) && width == height;

        public int Width => GetSize()?.Width ?? 0;

        public bool Is512x512 => GetSize() is (int width, int height) && width == 512 && height == 512;

        public bool Is256x256 => GetSize() is (int width, int height) && width == 256 && height == 256;

        public bool Is192x192 => GetSize() is (int width, int height) && width == 192 && height == 192;
    }
}
