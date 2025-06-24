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
            if (parts.Length == 2 && int.TryParse(parts[0], out var width) && int.TryParse(parts[1], out var height))
            {
                return (width, height);
            }
            return null;
        }

        public bool IsPngOrSvg() =>
            Type == "image/png" || Type == "image/svg" ||
            Src.EndsWith(".png", StringComparison.OrdinalIgnoreCase) ||
            Src.EndsWith(".svg", StringComparison.OrdinalIgnoreCase);
    }
}
