namespace PWABuilder.MacOS.Models
{
    /// <summary>
    /// Options for creating a macOS PWA package (native WKWebView wrapper).
    /// </summary>
    public class MacOSAppPackageOptions
    {
        /// <summary>
        /// The display name of the app as shown in the Dock and title bar.
        /// </summary>
        public string? Name { get; set; }

        /// <summary>
        /// The bundle ID for the app.
        /// Apple recommends a reverse-domain name style string (e.g. com.domainname.appname).
        /// Must be at least 3 characters and must not contain an asterisk (*).
        /// </summary>
        public string? BundleId { get; set; }

        /// <summary>
        /// Your PWA's start URL, loaded in the WKWebView on launch.
        /// </summary>
        public string? Url { get; set; }

        /// <summary>
        /// URL of a square PNG image (512×512 or larger) used to generate the macOS app icon.
        /// </summary>
        public string? ImageUrl { get; set; }

        /// <summary>
        /// The theme color (hex string, e.g. "#5A0FC8") applied to the NSWindow title bar.
        /// Corresponds to the manifest's <c>theme_color</c> field.
        /// </summary>
        public string? ThemeColor { get; set; }

        /// <summary>
        /// The background color (hex string) shown during the loading splash.
        /// Corresponds to the manifest's <c>background_color</c> field.
        /// </summary>
        public string? BackgroundColor { get; set; }

        /// <summary>
        /// Additional domains the app is permitted to navigate within the WKWebView.
        /// The PWA's own domain is always included automatically.
        /// </summary>
        public List<string>? PermittedUrls { get; set; }

        /// <summary>
        /// The web app manifest.
        /// </summary>
        public PWABuilder.IOS.Models.WebAppManifest? Manifest { get; set; }

        /// <summary>
        /// The absolute URL of the web app manifest.
        /// </summary>
        public string? ManifestUrl { get; set; }

        /// <summary>
        /// Validates the options and returns a strongly-typed <see cref="Validated"/> record.
        /// Throws if required fields are missing or invalid.
        /// </summary>
        public Validated Validate()
        {
            if (!Uri.TryCreate(ManifestUrl, UriKind.Absolute, out var manifestUri))
            {
                throw new ArgumentException("Manifest URL must be a valid, absolute URI.");
            }

            if (string.IsNullOrWhiteSpace(Name))
            {
                throw new ArgumentNullException(nameof(Name));
            }

            if (string.IsNullOrWhiteSpace(Url))
            {
                throw new ArgumentNullException(nameof(Url));
            }

            if (!Uri.TryCreate(manifestUri, Url, out var uri))
            {
                throw new ArgumentException("URL must be a valid, absolute URI.");
            }

            if (string.IsNullOrWhiteSpace(ImageUrl))
            {
                throw new ArgumentNullException(nameof(ImageUrl));
            }

            if (!Uri.TryCreate(manifestUri, ImageUrl, out var imageUri))
            {
                throw new ArgumentException("Image URL must be a valid, absolute URI.");
            }

            if (Manifest is null)
            {
                throw new ArgumentNullException(nameof(Manifest));
            }

            if (string.IsNullOrWhiteSpace(BundleId))
            {
                throw new ArgumentNullException(nameof(BundleId));
            }

            if (BundleId.Length < 3)
            {
                throw new ArgumentOutOfRangeException(
                    nameof(BundleId),
                    BundleId,
                    "Bundle ID must be at least 3 characters."
                );
            }

            if (BundleId.Contains('*'))
            {
                throw new ArgumentOutOfRangeException(
                    nameof(BundleId),
                    BundleId,
                    "Bundle ID cannot contain an asterisk (*)."
                );
            }

            var validThemeColor = GetValidColor(ThemeColor, Manifest.Theme_color, "#000000");
            var validBackgroundColor = GetValidColor(BackgroundColor, Manifest.Background_color, "#ffffff");

            var permittedUris = (PermittedUrls ?? [])
                .Select(GetUriFromWithProtocol)
                .Where(u => u is not null)
                .Select(u => u!)
                .ToList();

            return new Validated(
                Name.Trim(),
                BundleId.Trim(),
                uri,
                imageUri,
                validThemeColor,
                validBackgroundColor,
                permittedUris,
                Manifest,
                manifestUri
            );
        }

        private static PWABuilder.IOS.Models.Color GetValidColor(
            string? desiredColor,
            string? manifestColor,
            string fallbackColor
        )
        {
            foreach (var color in new[] { desiredColor?.Trim(), manifestColor?.Trim(), fallbackColor })
            {
                if (PWABuilder.IOS.Models.Color.TryParseHexColor(color, out var validColor))
                {
                    return validColor;
                }
            }

            throw new ArgumentException("None of the candidate colors were valid hex colors.");
        }

        private static Uri? GetUriFromWithProtocol(string input)
        {
            if (Uri.TryCreate(input, UriKind.Absolute, out var uri))
            {
                return uri;
            }

            if (Uri.TryCreate("https://" + input, UriKind.Absolute, out var httpsUri))
            {
                return httpsUri;
            }

            return null;
        }

        /// <summary>
        /// Validated, strongly-typed version of <see cref="MacOSAppPackageOptions"/>.
        /// </summary>
        public record Validated(
            string Name,
            string BundleId,
            Uri Url,
            Uri ImageUri,
            PWABuilder.IOS.Models.Color ThemeColor,
            PWABuilder.IOS.Models.Color BackgroundColor,
            List<Uri> PermittedUrls,
            PWABuilder.IOS.Models.WebAppManifest Manifest,
            Uri ManifestUri
        );
    }
}
