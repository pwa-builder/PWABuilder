namespace PWABuilder.IOS.Models
{
    /// <summary>
    /// Options for creating an iOS PWA package.
    /// </summary>
    public class IOSAppPackageOptions
    {
        /// <summary>
        /// The app name.
        /// </summary>
        public string? Name { get; set; }

        /// <summary>
        /// The bundle ID to use for the package.
        /// Apple recommends using a reverse-domain name style string (i.e., com.domainname.appname)
        /// This should be at least 3 characters in length. It cannot contain an asterisk (*).
        /// </summary>
        public string? BundleId { get; set; }

        /// <summary>
        /// Your PWA's URL.
        /// </summary>
        public string? Url { get; set; }

        /// <summary>
        /// The URL of image for your app icon. We recommend a 512x512 square PNG or larger.
        /// </summary>
        public string? ImageUrl { get; set; }

        /// <summary>
        /// The color to use as the background of your app's splash screen.
        /// </summary>
        public string? SplashColor { get; set; }

        /// <summary>
        /// The color of the loading progress bar on your app's splash screen.
        /// </summary>
        public string? ProgressBarColor { get; set; }

        /// <summary>
        /// The color of the iOS status bar while your app is running. The status bar shows at the top of the phone, and contains system information reception bars, battery life indicator, time, etc.
        /// This should typically be the prominent background color of your app.
        /// </summary>
        public string? StatusBarColor { get; set; }

        /// <summary>
        /// The name shown under the icon on the home screen (CFBundleDisplayName). Defaults to <see cref="Name"/>.
        /// Apple truncates long display names, so this is usually a shorter version of the app name.
        /// </summary>
        public string? DisplayName { get; set; }

        /// <summary>
        /// How the app fills the screen: "standalone" keeps the iOS status bar, "fullscreen" hides it.
        /// Defaults to the web manifest display value when it is one of those two, otherwise "standalone".
        /// </summary>
        public string? DisplayMode { get; set; }

        /// <summary>
        /// The foreground style of the iOS status bar text and icons: "auto" follows the system theme,
        /// "light" draws light text for a dark app background, "dark" draws dark text for a light app background. Defaults to "auto".
        /// </summary>
        public string? StatusBarStyle { get; set; }

        /// <summary>
        /// The appearance the app runs in: "auto" follows the system light or dark setting (and iOS 15+ follows the web view background),
        /// "light" or "dark" lock the app to that appearance. Defaults to "auto".
        /// </summary>
        public string? Appearance { get; set; }

        /// <summary>
        /// The size in points of the icon shown on the splash (launch) screen. Defaults to 64. Allowed range 32 to 512.
        /// </summary>
        public int? SplashIconSize { get; set; }

        /// <summary>
        /// The list of domains your app is permitted to navigate. This will automatically include <see cref="Url"/>, so no need to include it again.
        /// This should contain any domains you expect your users to navigate to while using your app, for example, account.google.com or other authentication domains.
        /// It is not necessary to include the protocol with the URL.
        /// </summary>
        public List<string>? PermittedUrls { get; set; }

        /// <summary>
        /// Your PWA's web manifest.
        /// </summary>
        public WebAppManifest? Manifest { get; set; }

        /// <summary>
        /// The URL to your PWA's manifest.
        /// </summary>
        public string? ManifestUrl { get; set; }

        public Validated Validate()
        {
            if (!Uri.TryCreate(ManifestUrl, UriKind.Absolute, out var manifestUri))
            {
                throw new ArgumentException("Manifest url must a valid, absolute URI");
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
                throw new ArgumentException("Url must be a valid, absolute URI");
            }
            if (string.IsNullOrWhiteSpace(ImageUrl))
            {
                throw new ArgumentNullException(nameof(ImageUrl));
            }
            if (!Uri.TryCreate(manifestUri, ImageUrl, out var imageUri))
            {
                throw new ArgumentException("Image url must be a valid, absolute URI");
            }
            if (Manifest == null)
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
                    "Bundle ID must be at least 3 characters in length"
                );
            }
            if (BundleId.Contains("*"))
            {
                throw new ArgumentOutOfRangeException(
                    nameof(BundleId),
                    BundleId,
                    "Bundle ID cannot contain an asterisk (*)."
                );
            }

            var validSplashColor = GetValidColor(SplashColor, Manifest.Background_color, "#ffffff");
            var validProgressColor = GetValidColor(
                ProgressBarColor,
                Manifest.Theme_color,
                "#000000"
            );
            var validStatusBarColor = GetValidColor(
                StatusBarColor,
                Manifest.Background_color,
                "#ffffff"
            );
            var permittedUris = (PermittedUrls ?? new List<string>(0))
                .Select(url => GetUriFromWithProtocol(url))
                .Where(url => url != null)
                .Select(url => url!)
                .ToList();
            var displayName = string.IsNullOrWhiteSpace(DisplayName) ? Name.Trim() : DisplayName.Trim();
            var displayMode = GetValidChoice(DisplayMode, ["standalone", "fullscreen"], GetValidChoice(Manifest.Display, ["standalone", "fullscreen"], "standalone"));
            var statusBarStyle = GetValidChoice(StatusBarStyle, ["auto", "light", "dark"], "auto");
            var appearance = GetValidChoice(Appearance, ["auto", "light", "dark"], "auto");
            if (SplashIconSize is < 32 or > 512)
            {
                throw new ArgumentOutOfRangeException(nameof(SplashIconSize), SplashIconSize, "Splash icon size must be between 32 and 512 points");
            }

            return new Validated(
                Name.Trim(),
                BundleId.Trim(),
                uri,
                imageUri,
                validSplashColor,
                validProgressColor,
                validStatusBarColor,
                permittedUris,
                Manifest,
                manifestUri,
                displayName,
                displayMode,
                statusBarStyle,
                appearance,
                SplashIconSize ?? 64
            );
        }

        /// <summary>
        /// Returns the input lower cased and trimmed when it is one of the allowed values, otherwise the fallback.
        /// </summary>
        private static string GetValidChoice(string? input, string[] allowed, string fallback)
        {
            var value = input?.Trim().ToLowerInvariant();
            return value != null && allowed.Contains(value) ? value : fallback;
        }

        private static Color GetValidColor(
            string? desiredColor,
            string? manifestColor,
            string fallbackColor
        )
        {
            var colors = new[] { desiredColor?.Trim(), manifestColor?.Trim(), fallbackColor };
            foreach (var color in colors)
            {
                if (Color.TryParseHexColor(color, out var validColor))
                {
                    return validColor;
                }
            }

            throw new ArgumentException("None of the potential colors were valid hex colors");
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

        public record Validated(
            string Name,
            string BundleId,
            Uri Url,
            Uri ImageUri,
            Color SplashColor,
            Color ProgressBarColor,
            Color StatusBarColor,
            List<Uri> PermittedUrls,
            WebAppManifest Manifest,
            Uri ManifestUri,
            string DisplayName,
            string DisplayMode,
            string StatusBarStyle,
            string Appearance,
            int SplashIconSize
        );
    }
}
