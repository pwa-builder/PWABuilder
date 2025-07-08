using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

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

            var validSplashColor = GetValidColor(
                this.SplashColor,
                this.Manifest.Background_color,
                "#ffffff"
            );
            var validProgressColor = GetValidColor(
                this.ProgressBarColor,
                this.Manifest.Theme_color,
                "#000000"
            );
            var validStatusBarColor = GetValidColor(
                this.StatusBarColor,
                this.Manifest.Background_color,
                "#ffffff"
            );
            var permittedUris = (PermittedUrls ?? new List<string>(0))
                .Select(url => GetUriFromWithProtocol(url))
                .Where(url => url != null)
                .Select(url => url!)
                .ToList();
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
                manifestUri
            );
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
            Uri ManifestUri
        );
    }
}
