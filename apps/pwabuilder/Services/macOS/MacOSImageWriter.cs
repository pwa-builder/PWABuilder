using System.IO.Compression;
using PWABuilder.Common;
using PWABuilder.IOS.Common;
using PWABuilder.IOS.Models;
using PWABuilder.MacOS.Models;
using PWABuilder.Services;

namespace PWABuilder.MacOS.Services
{
    /// <summary>
    /// Generates the macOS app icon images and writes them to the Xcode project template directory.
    /// </summary>
    public sealed class MacOSImageWriter
    {
        /// <summary>
        /// macOS requires these pixel sizes in the AppIcon.appiconset.
        /// The Contents.json maps them to the logical point sizes Xcode expects.
        /// </summary>
        private static readonly ImageTargetSize[] MacOSIconSizes =
        [
            ImageTargetSize.Size16x16,
            ImageTargetSize.Size32x32,
            ImageTargetSize.Size64x64,
            ImageTargetSize.Size128x128,
            ImageTargetSize.Size256x256,
            ImageTargetSize.Size512x512,
            ImageTargetSize.Size1024x1024,
        ];

        private readonly StoreImageCreator storeImageCreator;
        private readonly HttpClient http;
        private readonly ILogger<MacOSImageWriter> logger;

        /// <summary>
        /// Initializes a new instance of <see cref="MacOSImageWriter"/>.
        /// </summary>
        public MacOSImageWriter(
            StoreImageCreator storeImageCreator,
            IHttpClientFactory httpClientFactory,
            ILogger<MacOSImageWriter> logger
        )
        {
            this.storeImageCreator = storeImageCreator;
            this.http = httpClientFactory.CreateClient(Constants.PwaBuilderAgentHttpClient);
            this.logger = logger;
        }

        /// <summary>
        /// Downloads a base image, generates macOS icon files from it, and writes them to the
        /// <c>Assets.xcassets/AppIcon.appiconset</c> directory inside <paramref name="outputDirectory"/>.
        /// </summary>
        /// <param name="options">The validated package options.</param>
        /// <param name="manifest">The web app manifest context (used to locate fallback images).</param>
        /// <param name="outputDirectory">Root directory of the copied template.</param>
        public async Task WriteImages(
            MacOSAppPackageOptions.Validated options,
            WebAppManifestContext manifest,
            string outputDirectory
        )
        {
            byte[] baseImageBytes;
            try
            {
                baseImageBytes = await GetBaseImage(options, manifest);
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "Could not obtain a base image for macOS icons; skipping icon generation.");
                return;
            }

            using var generatedZip = await GenerateMacOSIconsZip(baseImageBytes);
            await WriteMacOSIcons(generatedZip, outputDirectory);
        }

        private async Task<byte[]> GetBaseImage(
            MacOSAppPackageOptions.Validated options,
            WebAppManifestContext webManifest
        )
        {
            var candidates = new (Uri? source, string description)[]
            {
                (options.ImageUri,                                   "user-supplied image URL"),
                (webManifest.GetIconSuitableForIOSApps(1024),        "manifest square PNG ≥ 1024px"),
                (webManifest.GetIconSuitableForIOSApps(512),         "manifest square PNG ≥ 512px"),
                (webManifest.GetIconSuitableForIOSApps(256),         "manifest square PNG ≥ 256px"),
                (webManifest.GetIconSuitableForIOSApps(0),           "manifest largest square PNG"),
            };

            if (candidates.All(c => c.source is null))
            {
                throw new InvalidOperationException(
                    "No suitable base image found. Ensure the web app manifest contains a square 512×512 or larger PNG icon."
                );
            }

            foreach (var (source, description) in candidates)
            {
                if (source is null) continue;

                var bytes = await TryDownloadImageBytes(source, description);
                if (bytes is not null)
                {
                    return bytes;
                }
            }

            throw new InvalidOperationException(
                "Could not download a suitable base image for macOS icon generation."
            );
        }

        private async Task<ImageGeneratorServiceZipFile> GenerateMacOSIconsZip(byte[] imageBytes)
        {
            using var stream = new MemoryStream(imageBytes);
            // Use "ios" platform which produces the shared icon sizes (including the macOS ones we need).
            var zipStream = await storeImageCreator.CreateStoreImagesZipAsync(
                stream, null, padding: 0, backgroundColor: "white", ["ios"], CancellationToken.None
            );
            var zip = new ZipArchive(zipStream, ZipArchiveMode.Read, leaveOpen: false);
            return new ImageGeneratorServiceZipFile(zip);
        }

        private async Task WriteMacOSIcons(
            ImageGeneratorServiceZipFile generatedZip,
            string outputDirectory
        )
        {
            var iconDir = Path.Combine(outputDirectory, "pwa-shell", "Assets.xcassets", "AppIcon.appiconset");

            foreach (var size in MacOSIconSizes)
            {
                var fileName = size.ToFileName() + ".png";
                var zipEntry = generatedZip.GetTargetSize(size);
                if (zipEntry is null)
                {
                    logger.LogWarning("No generated icon found for macOS size {size}.", size);
                    continue;
                }

                var destPath = Path.Combine(iconDir, fileName);
                try
                {
                    using var src = zipEntry.Open();
                    using var dst = File.Create(destPath);
                    await src.CopyToAsync(dst);
                }
                catch (Exception ex)
                {
                    logger.LogWarning(ex, "Failed to write macOS icon {file}.", destPath);
                }
            }
        }

        private async Task<byte[]?> TryDownloadImageBytes(Uri imageUri, string description)
        {
            try
            {
                using var request = new HttpRequestMessage(HttpMethod.Get, imageUri) { Version = new Version(2, 0) };
                using var response = await http.SendAsync(request);
                if (!response.IsSuccessStatusCode)
                {
                    logger.LogWarning(
                        "Could not download image from {url} ({description}): {status}",
                        imageUri, description, response.StatusCode
                    );
                    return null;
                }

                return await response.Content.ReadAsByteArrayAsync();
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "Exception downloading image from {url} ({description}).", imageUri, description);
                return null;
            }
        }
    }
}
