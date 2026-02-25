using System.Diagnostics;
using System.IO.Compression;
using Microsoft.Extensions.Options;
using PWABuilder.Models;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats.Png;
using SixLabors.ImageSharp.PixelFormats;
using SixLabors.ImageSharp.Processing;
using SkiaSharp;
using Svg.Skia;

namespace PWABuilder.Services;

/// <summary>
/// Service that creates store-ready icons for an app.
/// </summary>
public class StoreImageCreator
{
    private readonly ILogger<StoreImageCreator> logger;
    private const int MaxDimension = 1024;

    public StoreImageCreator(ILogger<StoreImageCreator> logger)
    {
        this.logger = logger;
    }

    /// <summary>
    /// Creates a zip file containing store-ready icons for the specified platforms based on the provided base image, padding, and background color.
    /// </summary>
    /// <param name="options">The store image generation options.</param>
    /// <param name="cancelToken">A cancellation token.</param>
    /// <returns>A zip file containing the store-ready images.</returns>
    public async Task<Stream> CreateStoreImagesZipAsync(Stream baseImageStream, string? baseImageContentType, double padding, string backgroundColor, List<string> platforms, CancellationToken cancelToken)
    {
        // Create an ImageSharp.Image<Rtba32> from the base image stream.
        using var baseImg = baseImageContentType switch
        {
            "image/svg+xml" => ConvertSvgToImageSharp(baseImageStream), // ImageSharp doesn't  natively handle SVG. We must use SkiaSharp to load it and convert it into a ImageSharp.Image<Rgba32>.
            _ => await Image.LoadAsync<Rgba32>(baseImageStream, cancelToken)
        };

        var zipStream = new MemoryStream();
        using (var zip = new ZipArchive(zipStream, ZipArchiveMode.Create, leaveOpen: true))
        {
            foreach (var platform in platforms)
            {
                try
                {
                    await WriteImagesToZip(zip, platform, baseImg, padding, backgroundColor, cancelToken);
                }
                catch (Exception error)
                {
                    logger.LogError(error, "Error generating store images for platform {platform}.", platform);
                    zipStream.Dispose();
                    throw;
                }
            }
        }

        await zipStream.FlushAsync(cancelToken);
        zipStream.Position = 0;
        return zipStream;
    }

    private async Task WriteImagesToZip(ZipArchive zip, string platform, Image<Rgba32> baseImg, double padding, string backgroundColor, CancellationToken cancelToken)
    {
        var bgColor = default(Color?);
        if (Color.TryParse(backgroundColor, out var parsedColor))
        {
            bgColor = parsedColor;
        }

        if (platform is "windows" or "windows11")
        {
            await CreateMicrosoftStoreImages(zip, baseImg, padding, bgColor, cancelToken);
        }
        else if (platform is "android")
        {
            await CreateGooglePlayImages(zip, baseImg, padding, bgColor);
        }
        else if (platform is "ios")
        {
            await CreateIOSAppStoreImages(zip, baseImg, padding, bgColor);
        }
        else
        {
            logger.LogWarning("Unsupported platform {platform} specified for store image generation. Skipping image generation.", platform);
        }
    }

    private async Task CreateMicrosoftStoreImages(ZipArchive zip, Image<Rgba32> baseImg, double padding, Color? backgroundColor, CancellationToken cancelToken)
    {
        // Generate the list of 80 image files used by the Microsoft Store and Windows.
        // For details, see https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/image-recommendations.md#target-size-images
        var imageInfos = new List<MsixImageInfo>(80);
        imageInfos.AddRange(GetMsStoreScaledImages(new MsixImageInfo { FileName = "LargeTile.scale-100.png", Width = 310, Height = 310, Padding = MsixImagePadding.Plated }));
        imageInfos.AddRange(GetMsStoreScaledImages(new MsixImageInfo { FileName = "SmallTile.scale-100.png", Width = 71, Height = 71, Padding = MsixImagePadding.Plated }));
        imageInfos.AddRange(GetMsStoreScaledImages(new MsixImageInfo { FileName = "SplashScreen.scale-100.png", Width = 620, Height = 300, Padding = MsixImagePadding.Plated }));
        imageInfos.AddRange(GetMsStoreScaledImages(new MsixImageInfo { FileName = "Square44x44Logo.scale-100.png", Width = 44, Height = 44, Padding = MsixImagePadding.Plated }));
        imageInfos.AddRange(GetMsStoreScaledImages(new MsixImageInfo { FileName = "Square150x150Logo.scale-100.png", Width = 150, Height = 150, Padding = MsixImagePadding.Plated }));
        imageInfos.AddRange(GetMsStoreScaledImages(new MsixImageInfo { FileName = "StoreLogo.scale-100.png", Width = 50, Height = 50, Padding = MsixImagePadding.Plated }));
        imageInfos.AddRange(GetMsStoreScaledImages(new MsixImageInfo { FileName = "Wide310x150Logo.scale-100.png", Width = 310, Height = 150, Padding = MsixImagePadding.Plated }));
        imageInfos.AddRange(GetMsStoreTargetSizeImages("Square44x44Logo"));

        foreach (var imageInfo in imageInfos)
        {
            if (cancelToken.IsCancellationRequested)
            {
                return;
            }

            // For plated images, use the padding from the API call. For unplated images, use 0 as the padding.
            var platingPadding = imageInfo.Padding == MsixImagePadding.Plated ? padding : 0;

            // Create the entry in the zip.
            var entry = zip.CreateEntry($"windows/{imageInfo.FileName}");
            using var entryStream = entry.Open();
            using var storeImageStream = ConvertToStoreImageWithDimensions(baseImg, imageInfo.Width, imageInfo.Height, platingPadding, backgroundColor);
            await storeImageStream.CopyToAsync(entryStream, cancelToken);
        }
    }

    private IEnumerable<MsixImageInfo> GetMsStoreScaledImages(MsixImageInfo baseImageInfo)
    {
        // In: Square44x44Logo.scale-100.png, 44, 44, Plated 
        // Out: [
        //  Square44x44Logo.scale-100.png, 44, 44, Plated 
        //  Square44Logo.scale-125.png, 55, 55, Plated, 
        //  Square44x44Logo.scale-150.png, 66, 66, Plated, 
        //  Square44x44Logo.scale-200.png, 88, 88, Plated,
        //  Square44x44Logo.scale-400.png, 176, 176, Plated
        // ]

        if (!baseImageInfo.FileName.Contains("scale-100"))
        {
            this.logger.LogWarning("Store image generation skipped generating scaled image variants for {image} because it didn't have the 'scale-100' naming convention.", baseImageInfo.FileName);
            yield return baseImageInfo;
        }

        var scaleFactors = new[] { 1.0, 1.25, 1.5, 2.0, 4.0 };
        foreach (var scale in scaleFactors)
        {
            yield return new MsixImageInfo
            {
                FileName = baseImageInfo.FileName.Replace("scale-100", $"scale-{(int)(scale * 100)}"),
                Width = (int)(baseImageInfo.Width * scale),
                Height = (int)(baseImageInfo.Height * scale),
                Padding = baseImageInfo.Padding
            };
        }
    }

    private IEnumerable<MsixImageInfo> GetMsStoreTargetSizeImages(string baseName)
    {
        // In: "Square44x44Logo",
        // Out [
        //  Square44x44Logo.targetsize-16.png, 16, 16, Plated
        //  ... 20, 24, 30, 32, 36, 40, 44, 48, 60, 64, 72, 80, 96, 256
        //  Square44x44Logo.altform-unplated_targetsize-16.png, 16, 16, Unplated
        //  ... 20, 24, 30, 32, 36, 40, 44, 48, 60, 64, 72, 80, 96, 256
        //  Square44x44Logo.altform-lightunplated_targetsize-16.png, 16, 16, Unplated
        //  ... 20, 24, 30, 32, 36, 40, 44, 48, 60, 64, 72, 80, 96, 256
        // ]
        var targetSizes = new[] { 16, 20, 24, 30, 32, 36, 40, 44, 48, 60, 64, 72, 80, 96, 256 };
        foreach (var size in targetSizes)
        {
            // Target size.
            yield return new MsixImageInfo
            {
                FileName = $"{baseName}.targetsize-{size}.png",
                Width = size,
                Height = size,
                Padding = MsixImagePadding.Plated
            };

            // Target size + unplated
            yield return new MsixImageInfo
            {
                FileName = $"{baseName}.altform-unplated_targetsize-{size}.png",
                Width = size,
                Height = size,
                Padding = MsixImagePadding.Unplated
            };

            // Target size + light unplated
            yield return new MsixImageInfo
            {
                FileName = $"{baseName}.altform-lightunplated_targetsize-{size}.png",
                Width = size,
                Height = size,
                Padding = MsixImagePadding.Unplated
            };
        }
    }

    private static async Task CreateGooglePlayImages(ZipArchive zip, Image<Rgba32> baseImg, double padding, Color? backgroundColor)
    {
        var imageSizes = new[] { 48, 72, 96, 144, 192, 512 };
        foreach (var size in imageSizes)
        {
            var entry = zip.CreateEntry($"android/launchericon-{size}x{size}.png");
            using var entryStream = entry.Open();
            using var storeImageStream = ConvertToStoreImageWithDimensions(baseImg, size, size, padding, backgroundColor);
            await storeImageStream.CopyToAsync(entryStream);
            await entryStream.FlushAsync();
        }
    }

    private static async Task CreateIOSAppStoreImages(ZipArchive zip, Image<Rgba32> baseImg, double padding, Color? backgroundColor)
    {
        // Apple doesn't permit transparency in app icons. If the background color is transparent, use white instead.
        if (backgroundColor == null || backgroundColor == Color.Transparent)
        {
            backgroundColor = Color.White;
        }

        var imageSizes = new[] { 16, 20, 29, 32, 40, 50, 57, 58, 60, 64, 72, 76, 80, 87, 100, 114, 120, 128, 144, 152, 167, 180, 192, 256, 512, 1024 };
        foreach (var size in imageSizes)
        {
            var entry = zip.CreateEntry($"ios/{size}.png");
            using var entryStream = entry.Open();
            using var storeImageStream = ConvertToStoreImageWithDimensions(baseImg, size, size, padding, backgroundColor);
            await storeImageStream.CopyToAsync(entryStream);
        }
    }

    private static MemoryStream ConvertToStoreImageWithDimensions(Image<Rgba32> baseImage, int desiredWidth, int desiredHeight, double padding, Color? backgroundColor)
    {
        int adjustWidth;
        int adjustedHeight;
        var processedImage = baseImage.Clone();

        if (padding > 0)
        {
            adjustWidth = desiredWidth - (int)(padding * desiredWidth * 0.5);
            adjustedHeight = desiredHeight - (int)(padding * desiredHeight * 0.5);
        }
        else
        {
            adjustWidth = desiredWidth;
            adjustedHeight = desiredHeight;
        }

        processedImage.Mutate(x => x.Resize(new ResizeOptions
        {
            Size = new Size(adjustWidth, adjustedHeight),
            Mode = ResizeMode.Pad,
            Sampler = KnownResamplers.Lanczos3
        }));

        if (backgroundColor != null)
        {
            processedImage.Mutate(x => x.BackgroundColor((Color)backgroundColor));
        }

        if (padding > 0)
        {
            processedImage.Mutate(x => x.Resize(
                new ResizeOptions
                {
                    Size = new Size(desiredWidth, desiredHeight),
                    Mode = ResizeMode.BoxPad,
                    PadColor = backgroundColor ?? Color.Transparent
                })
            );
        }

        var outputImage = new MemoryStream();
        processedImage.Save(outputImage, new PngEncoder());
        outputImage.Position = 0;

        return outputImage;
    }

    /// <summary>
    /// Converts an SVG stream to an <see cref="Image{Rgba32}"/> using SkiaSharp for rendering.
    /// The resulting image's largest dimension will be <see cref="MaxDimension"/> pixels.
    /// </summary>
    /// <param name="svgStream">The SVG image stream to convert.</param>
    /// <returns>An <see cref="Image{Rgba32}"/> rendered from the SVG.</returns>
    private static Image<Rgba32> ConvertSvgToImageSharp(Stream svgStream)
    {
        using var svg = new SKSvg();
        svg.Load(svgStream);

        var picture = svg.Picture ?? throw new InvalidOperationException("Failed to load SVG: the parsed picture was null.");

        // Scale so the largest dimension is 1024px.
        var bounds = picture.CullRect;
        var scale = MaxDimension / Math.Max(bounds.Width, bounds.Height);
        var width = (int)Math.Round(bounds.Width * scale);
        var height = (int)Math.Round(bounds.Height * scale);

        // Render the SVG onto an SkiaSharp bitmap.
        using var bitmap = new SKBitmap(width, height);
        using var canvas = new SKCanvas(bitmap);
        canvas.Clear(SKColors.Transparent);
        canvas.Scale(scale);
        canvas.DrawPicture(picture);
        canvas.Flush();

        // Encode to PNG in memory, then decode into an ImageSharp Image<Rgba32>.
        using var pngData = bitmap.Encode(SKEncodedImageFormat.Png, 100);
        using var pngStream = new MemoryStream();
        pngData.SaveTo(pngStream);
        pngStream.Position = 0;

        return Image.Load<Rgba32>(pngStream);
    }

    internal enum MsixImagePadding
    {
        /// <summary>
        /// The image is plated, meaning any padding supplied by the API call will be applied to the image.
        /// </summary>
        Plated,
        /// <summary>
        /// The image is unplated, no padding will be applied to the image.
        /// </summary>
        Unplated
    }

    internal readonly struct MsixImageInfo
    {
        public string FileName { get; init; }
        public int Width { get; init; }
        public int Height { get; init; }
        public MsixImagePadding Padding { get; init; }
    }
}