using System.Collections.Immutable;
using System.Diagnostics;
using System.Text.Json;
using PWABuilder.Models;
using PWABuilder.Validations.Schema;
using PWABuilder.Validations.Services;

namespace PWABuilder.Services;

/// <summary>
/// Analyzes a PWA's web app manifest to determine web app manifest validity and capabilities.
/// </summary>
public class ManifestAnalyzer
{
    private readonly IImageValidationService imageValidator;
    private readonly Dictionary<PwaCapabilityId, PwaManifestCapabilityCheck> manifestChecks;

    public ManifestAnalyzer(IImageValidationService imageValidator)
    {
        this.imageValidator = imageValidator;
        this.manifestChecks = CreateManifestChecks();
    }

    /// <summary>
    /// Goes through all the manifest-specific capabilities of the specified <paramref name="analysis"/> and checks if the manifest passes.
    /// </summary>
    /// <param name="manifestDetection">The web app manifest detection results. This can be null if no web app manifest was detect.</param>
    /// <param name="cancelToken">The cancellation token.</param>
    /// <param name="logger">The logger to log data to.</param>
    /// <returns>A list of PWA capabilities and their statuses.</returns>
    public async Task<List<PwaCapability>> TryAnalyzeManifestAsync(ManifestDetection? manifestDetection, ILogger logger, CancellationToken cancelToken)
    {
        var manifestCapabilities = PwaCapability.CreateManifestCapabilities();

        // No manifest? Mark all the manifest capabilities as skipped.
        if (manifestDetection == null)
        {
            logger.LogInformation("No manifest to analyze. Skipping manifest capability checks.");

            // Mark the "manifest exists" capability as failed.
            var manifestExistsCapability = manifestCapabilities.First(c => c.Id == PwaCapabilityId.HasManifest);
            manifestExistsCapability.Status = PwaCapabilityCheckStatus.Failed;

            // Mark all other manifest capabilities as skipped.
            manifestCapabilities
                .Except([manifestExistsCapability])
                .ToList()
                .ForEach(c => c.Status = PwaCapabilityCheckStatus.Skipped);

            return manifestCapabilities;
        }

        // We have a manifest. Run each check.
        foreach (var capability in manifestCapabilities)
        {
            if (cancelToken.IsCancellationRequested)
            {
                logger.LogInformation("Manifest analysis cancelled.");
                return manifestCapabilities;
            }

            try
            {
                var manifestCheck = this.manifestChecks[capability.Id];
                var (status, error) = await manifestCheck.Check(manifestDetection, cancelToken);
                capability.Status = error != null ? PwaCapabilityCheckStatus.Failed : status;
                capability.ErrorMessage = error?.Message;
            }
            catch (Exception ex)
            {
                if (ex is KeyNotFoundException && Debugger.IsAttached)
                {
                    // This should never happen: we don't have a check for the PWA capability. You probably forgot to add an entry in the manifestChecks field.
                    Debugger.Break();
                }

                logger.LogError(ex, "Error running manifest check for {capability}", capability.Id);
                capability.Status = PwaCapabilityCheckStatus.Skipped;
                capability.ErrorMessage = "Unable to run manifest check due to an error. " + ex.Message;
                continue;
            }
        }

        return manifestCapabilities;
    }

    private Dictionary<PwaCapabilityId, PwaManifestCapabilityCheck> CreateManifestChecks()
    {
        return PwaCapability.CreateManifestCapabilities().ToDictionary(c => c.Id, CreateCheckForCapability);
    }

    private PwaManifestCapabilityCheck CreateCheckForCapability(PwaCapability capability)
    {
        // Ignore the warning about the switch expression not handling unnamed enum values, e.g. casting a random integer to PwaCapabilityId. We don't care about that.
        // However, we want to enable CS8509 which requires that all known enum values are handled.
#pragma warning disable CS8524

        return capability.Id switch
        {
            PwaCapabilityId.HasManifest => new PwaManifestCapabilityCheck(capability, m => m != null ? PwaCapabilityCheckStatus.Passed : PwaCapabilityCheckStatus.InProgress), // If we don't have a manifest, mark only as In Progress. The Lighthouse report will have the final say of whether there's a manifest. 
            PwaCapabilityId.Name => new PwaManifestCapabilityCheck(capability, m => CheckManifestStringField(m.Manifest, "name")),
            PwaCapabilityId.Description => new PwaManifestCapabilityCheck(capability, m => CheckManifestStringField(m.Manifest, "description")),
            PwaCapabilityId.ThemeColor => new PwaManifestCapabilityCheck(capability, m => CheckManifestStringField(m.Manifest, "theme_color", 3)),
            PwaCapabilityId.BackgroundColor => new PwaManifestCapabilityCheck(capability, m => CheckManifestStringField(m.Manifest, "background_color", 3)),
            PwaCapabilityId.Shortcuts => new PwaManifestCapabilityCheck(capability, CheckShortcuts),
            PwaCapabilityId.ShortcutIconsAreFetchable => new PwaManifestCapabilityCheck(capability, (manifest, cancelToken) => CheckImagesAreFetchable(GetShortcutImages(manifest), manifest, cancelToken)),
            PwaCapabilityId.ShortcutIconTypesAreValid => new PwaManifestCapabilityCheck(capability, (manifest, cancelToken) => CheckImageTypesAreValid(GetShortcutImages(manifest), manifest, cancelToken)),
            PwaCapabilityId.ShortcutIconSizesAreValid => new PwaManifestCapabilityCheck(capability, (manifest, cancelToken) => CheckImageSizesAreValid(GetShortcutImages(manifest), manifest, cancelToken)),
            PwaCapabilityId.Categories => new PwaManifestCapabilityCheck(capability, m => CheckManifestStringArrayField(m.Manifest, "categories")),
            PwaCapabilityId.Icons => new PwaManifestCapabilityCheck(capability, m => CheckManifestImageArray(m, "icons")),
            PwaCapabilityId.IconsAreFetchable => new PwaManifestCapabilityCheck(capability, (manifest, cancelToken) => CheckImagesAreFetchable(GetManifestArray("icons", manifest), manifest, cancelToken)),
            PwaCapabilityId.IconTypesAreValid => new PwaManifestCapabilityCheck(capability, (manifest, cancelToken) => CheckImageTypesAreValid(GetManifestArray("icons", manifest), manifest, cancelToken)),
            PwaCapabilityId.IconSizesAreValid => new PwaManifestCapabilityCheck(capability, (manifest, cancelToken) => CheckImageSizesAreValid(GetManifestArray("icons", manifest), manifest, cancelToken)),
            PwaCapabilityId.HasSquare192x192PngAnyPurposeIcon => new PwaManifestCapabilityCheck(capability, m => CheckSquareIconOfMinSizeAndTypeAnyPurpose(m, 192, "image/png")),
            PwaCapabilityId.HasSquare512x512PngAnyPurposeIcon => new PwaManifestCapabilityCheck(capability, m => CheckSquareIconOfMinSizeAndTypeAnyPurpose(m, 512, "image/png")),
            PwaCapabilityId.Screenshots => new PwaManifestCapabilityCheck(capability, m => CheckManifestImageArray(m, "screenshots")),
            PwaCapabilityId.ScreenshotsAreFetchable => new PwaManifestCapabilityCheck(capability, (manifest, cancelToken) => CheckImagesAreFetchable(GetManifestArray("screenshots", manifest), manifest, cancelToken)),
            PwaCapabilityId.ScreenshotTypesAreValid => new PwaManifestCapabilityCheck(capability, (manifest, cancelToken) => CheckImageTypesAreValid(GetManifestArray("screenshots", manifest), manifest, cancelToken)),
            PwaCapabilityId.ScreenshotSizesAreValid => new PwaManifestCapabilityCheck(capability, (manifest, cancelToken) => CheckImageSizesAreValid(GetManifestArray("screenshots", manifest), manifest, cancelToken)),
            PwaCapabilityId.HasWideScreenshot => new PwaManifestCapabilityCheck(capability, m => CheckScreenshotFormFactor(m, "wide")),
            PwaCapabilityId.HasNarrowScreenshot => new PwaManifestCapabilityCheck(capability, m => CheckScreenshotFormFactor(m, "narrow")),
            PwaCapabilityId.FileHandlers => new PwaManifestCapabilityCheck(capability, CheckFileHandlers),
            PwaCapabilityId.LaunchHandler => new PwaManifestCapabilityCheck(capability, CheckLaunchHandler),
            PwaCapabilityId.PreferRelatedApplication => new PwaManifestCapabilityCheck(capability, m => CheckManifestBooleanField(m.Manifest, "prefer_related_applications")),
            PwaCapabilityId.ProtocolHandlers => new PwaManifestCapabilityCheck(capability, CheckProtocolHandlers),
            PwaCapabilityId.RelatedApplications => new PwaManifestCapabilityCheck(capability, CheckRelatedApplications),
            PwaCapabilityId.ShareTarget => new PwaManifestCapabilityCheck(capability, CheckShareTarget),
            PwaCapabilityId.IarcRatingId => new PwaManifestCapabilityCheck(capability, m => CheckManifestStringField(m.Manifest, "iarc_rating_id", 36)),
            PwaCapabilityId.Widgets => new PwaManifestCapabilityCheck(capability, CheckWidgets),
            PwaCapabilityId.EdgeSidePanel => new PwaManifestCapabilityCheck(capability, CheckEdgeSidePanel),
            PwaCapabilityId.DisplayOverride => new PwaManifestCapabilityCheck(capability, m => CheckManifestStringArrayField(m, "display_override", 1)),
            PwaCapabilityId.WindowControlsOverlay => new PwaManifestCapabilityCheck(capability, CheckWindowControlsOverlay),
            PwaCapabilityId.TabbedDisplay => new PwaManifestCapabilityCheck(capability, CheckTabbedDisplay),
            PwaCapabilityId.NoteTaking => new PwaManifestCapabilityCheck(capability, CheckNoteTaking),
            PwaCapabilityId.Scope => new PwaManifestCapabilityCheck(capability, m => CheckManifestStringField(m.Manifest, "scope", 1)),
            PwaCapabilityId.ShortName => new PwaManifestCapabilityCheck(capability, m => CheckManifestStringField(m.Manifest, "short_name", 1)),
            PwaCapabilityId.StartUrl => new PwaManifestCapabilityCheck(capability, m => CheckManifestStringField(m.Manifest, "start_url", 1)),
            PwaCapabilityId.Display => new PwaManifestCapabilityCheck(capability, m => CheckManifestStringField(m.Manifest, "display", 1, ["fullscreen", "standalone", "minimal-ui", "browser", "tabbed", "window-controls-overlay"])),
            PwaCapabilityId.Orientation => new PwaManifestCapabilityCheck(capability, m => CheckManifestStringField(m.Manifest, "orientation", 1, ["any", "natural", "landscape", "landscape-primary", "landscape-secondary", "portrait", "portrait-primary", "portrait-secondary"])),
            PwaCapabilityId.Language => new PwaManifestCapabilityCheck(capability, m => CheckManifestStringField(m.Manifest, "lang", 2)),
            PwaCapabilityId.Direction => new PwaManifestCapabilityCheck(capability, m => CheckManifestStringField(m.Manifest, "dir", 3, ["ltr", "rtl", "auto"])),
            PwaCapabilityId.ScopeExtensions => new PwaManifestCapabilityCheck(capability, CheckScopeExtensions),
            PwaCapabilityId.Id => new PwaManifestCapabilityCheck(capability, m => CheckManifestStringField(m.Manifest, "id", 1)),

            // Service worker capabilities are handled in ServiceWorkerAnalyzer.
            PwaCapabilityId.HasServiceWorker => throw new NotImplementedException(),
            PwaCapabilityId.ServiceWorkerIsNotEmpty => throw new NotImplementedException(),
            PwaCapabilityId.PeriodicSync => throw new NotImplementedException(),
            PwaCapabilityId.BackgroundSync => throw new NotImplementedException(),
            PwaCapabilityId.PushNotifications => throw new NotImplementedException(),
            PwaCapabilityId.OfflineSupport => throw new NotImplementedException(),

            // HTTPS capabilities are handled elsewhere.
            PwaCapabilityId.HasHttps => throw new NotImplementedException(),

            // General capabilities are handled elsewhere.
            PwaCapabilityId.ServesHtml => throw new NotImplementedException()
        };
#pragma warning restore CS8524
    }

    private static PwaCapabilityCheckStatus CheckManifestImageArray(JsonElement manifest, string fieldName)
    {
        var hasImages = manifest.TryGetProperty(fieldName, out var images)
            && images.ValueKind == JsonValueKind.Array
            && images.GetArrayLength() > 0
            && images.EnumerateArray().Any(i => i.TryGetProperty("src", out var src) && src.ValueKind == JsonValueKind.String && !string.IsNullOrWhiteSpace(src.GetString()));
        return hasImages ? PwaCapabilityCheckStatus.Passed : PwaCapabilityCheckStatus.Failed;
    }

    private static PwaCapabilityCheckStatus CheckSquareIconOfMinSizeAndTypeAnyPurpose(JsonElement manifest, int minSize, string imageType)
    {
        var hasIcons = manifest.TryGetProperty("icons", out var icons)
            && icons.ValueKind == JsonValueKind.Array
            && icons.GetArrayLength() > 0;
        if (hasIcons)
        {
            foreach (var icon in icons.EnumerateArray())
            {
                var hasTypeProperty = icon.TryGetProperty("type", out var iconType) && iconType.ValueKind == JsonValueKind.String;
                var declaredTypeMatches = hasTypeProperty && string.Equals(iconType.GetString(), imageType, StringComparison.OrdinalIgnoreCase);

                var isDesiredType = false;
                var hasSrcProp = icon.TryGetProperty("src", out var src) && src.ValueKind == JsonValueKind.String;

                if (hasSrcProp)
                {
                    var fileExtension = Path.GetExtension(src.GetString());
                    var extensionMatchesType = fileExtension switch
                    {
                        ".png" => string.Equals(imageType, "image/png", StringComparison.OrdinalIgnoreCase),
                        ".jpg" or ".jpeg" => string.Equals(imageType, "image/jpeg", StringComparison.OrdinalIgnoreCase),
                        ".webp" => string.Equals(imageType, "image/webp", StringComparison.OrdinalIgnoreCase),
                        _ => false
                    };

                    if (hasTypeProperty)
                    {
                        // Both type property and file extension must match the desired type
                        isDesiredType = declaredTypeMatches && extensionMatchesType;
                    }
                    else
                    {
                        // If no type property is defined, fallback to file extension check
                        isDesiredType = extensionMatchesType;
                    }
                }

                if (isDesiredType)
                {
                    var hasSizeProp = icon.TryGetProperty("sizes", out var sizes)
                        && sizes.ValueKind == JsonValueKind.String
                        && !string.IsNullOrWhiteSpace(sizes.GetString());
                    var hasPurposeProp = icon.TryGetProperty("purpose", out var purpose);
                    var hasAnyPurpose = !hasPurposeProp || (purpose.ValueKind == JsonValueKind.String && purpose.GetString()!.Split(' ').Any(p => string.Equals(p, "any")));
                    if (hasSizeProp && hasAnyPurpose)
                    {
                        var sizesList = (sizes.GetString() ?? string.Empty).Split(' ', StringSplitOptions.RemoveEmptyEntries);
                        foreach (var size in sizesList)
                        {
                            var sizeParts = size.Split('x', StringSplitOptions.RemoveEmptyEntries);
                            if (sizeParts.Length == 2 && int.TryParse(sizeParts[0], out var width) && int.TryParse(sizeParts[1], out var height))
                            {
                                var isSquare = width == height;
                                var isLargeEnough = width >= minSize;
                                if (isSquare && isLargeEnough)
                                {
                                    return PwaCapabilityCheckStatus.Passed;
                                }
                            }
                        }
                    }
                }
            }
        }

        return PwaCapabilityCheckStatus.Failed;
    }

    private static PwaCapabilityCheckStatus CheckScreenshotFormFactor(JsonElement manifest, string desiredFormFactor)
    {
        // Check if the manifest has a screenshots property and if it contains a screenshot with the specified form factor.
        var hasScreenshots = manifest.TryGetProperty("screenshots", out var screenshots)
            && screenshots.ValueKind == JsonValueKind.Array
            && screenshots.GetArrayLength() > 0;

        if (!hasScreenshots)
        {
            return PwaCapabilityCheckStatus.Skipped;
        }

        var hasDesiredFormFactor = screenshots.EnumerateArray()
            .Any(s => s.TryGetProperty("form_factor", out var formFactor) && formFactor.ValueKind == JsonValueKind.String && formFactor.GetString() == desiredFormFactor);
        return hasDesiredFormFactor ? PwaCapabilityCheckStatus.Passed : PwaCapabilityCheckStatus.Failed;
    }

    private static IEnumerable<JsonElement> GetManifestArray(string fieldName, ManifestDetection manifestContext)
    {
        var hasImagesField = manifestContext.Manifest.TryGetProperty(fieldName, out var array)
            && array.ValueKind == JsonValueKind.Array;
        if (hasImagesField)
        {
            return array.EnumerateArray();
        }

        return [];
    }

    private static IEnumerable<JsonElement> GetShortcutImages(ManifestDetection manifestContext)
    {
        var shortcuts = GetManifestArray("shortcuts", manifestContext);
        return shortcuts.SelectMany(s =>
        {
            var hasShortcutIcons = s.TryGetProperty("icons", out var icons);
            if (hasShortcutIcons && icons.ValueKind == JsonValueKind.Array)
            {
                return icons.EnumerateArray();
            }

            return [];
        });
    }

    private async Task<Result<PwaCapabilityCheckStatus>> CheckImagesAreFetchable(IEnumerable<JsonElement> images, ManifestDetection manifestContext, CancellationToken cancelToken)
    {
        if (!images.Any())
        {
            return PwaCapabilityCheckStatus.Skipped; // Skip this check if there are no images in this field.
        }

        // Grab the icon values. They should look like: 
        /**
           [
              {
                 "src": "/images/foo.png",
                 "sizes": "16x16",
                 "purpose": "any"
              }
           ]
        */
        var iconUris = images
            .Where(icon => icon.TryGetProperty("src", out var src) && src.ValueKind == JsonValueKind.String)
            .Select(icon => icon.GetProperty("src").GetString())
            .Where(src => !string.IsNullOrWhiteSpace(src))
            .Select(src => new Uri(manifestContext.Url, src));
        var iconFetchTasks = iconUris.Select(uri => this.imageValidator.TryImageExistsAsync(uri, cancelToken));
        var imageExistChecks = await Task.WhenAll(iconFetchTasks);
        var imageWithError = imageExistChecks
            .Select(c => c.Error)
            .FirstOrDefault(e => e != null);
        if (imageWithError != null)
        {
            return imageWithError;
        }

        return PwaCapabilityCheckStatus.Passed;
    }

    /// <summary>
    /// Validates that the declared types of images in the manifest match their actual file types.
    /// </summary>
    private async Task<Result<PwaCapabilityCheckStatus>> CheckImageTypesAreValid(IEnumerable<JsonElement> images, ManifestDetection manifestContext, CancellationToken cancelToken)
    {
        if (!images.Any())
        {
            return PwaCapabilityCheckStatus.Skipped; // Skip this check if there are no images in this field.
        }

        var imageValidationTasks = new List<Task<Result<bool>>>();

        foreach (var image in images)
        {
            // Only validate if both src and type are present
            var hasSrc = image.TryGetProperty("src", out var src) && src.ValueKind == JsonValueKind.String && !string.IsNullOrWhiteSpace(src.GetString());
            var hasType = image.TryGetProperty("type", out var type) && type.ValueKind == JsonValueKind.String && !string.IsNullOrWhiteSpace(type.GetString());
            var hasUri = Uri.TryCreate(manifestContext.Url, src.GetString(), out var imageUri) && hasSrc;
            if (hasSrc && hasType && hasUri && imageUri != null)
            {
                var declaredType = type.GetString();
                imageValidationTasks.Add(this.imageValidator.TryValidateImageTypeAsync(imageUri, declaredType, cancelToken));
            }
        }

        if (imageValidationTasks.Count == 0)
        {
            return PwaCapabilityCheckStatus.Skipped; // No images with type declarations to validate
        }

        var results = await Task.WhenAll(imageValidationTasks);
        var imageTypeFailure = results.Select(r => r.Error).FirstOrDefault(e => e != null);
        if (imageTypeFailure != null)
        {
            // If it's a 403 Forbidden error, skip the check. We'll surface errors via CheckImagesAreFetchable instead.
            if (imageTypeFailure is HttpRequestException httpRequestException && httpRequestException.StatusCode == System.Net.HttpStatusCode.Forbidden)
            {
                return PwaCapabilityCheckStatus.Skipped;
            }

            return imageTypeFailure;
        }

        return PwaCapabilityCheckStatus.Passed;
    }

    /// <summary>
    /// Validates that the declared sizes of images in the manifest match their actual dimensions.
    /// </summary>
    private async Task<Result<PwaCapabilityCheckStatus>> CheckImageSizesAreValid(IEnumerable<JsonElement> images, ManifestDetection manifestContext, CancellationToken cancelToken)
    {
        if (!images.Any())
        {
            return PwaCapabilityCheckStatus.Skipped; // Skip this check if there are no images in this field.
        }

        var imageValidationTasks = new List<Task<Result<bool>>>();

        foreach (var image in images)
        {
            // Only validate if both src and sizes are present
            var hasSrc = image.TryGetProperty("src", out var src) && src.ValueKind == JsonValueKind.String && !string.IsNullOrWhiteSpace(src.GetString());
            var hasSizes = image.TryGetProperty("sizes", out var sizes) && sizes.ValueKind == JsonValueKind.String && !string.IsNullOrWhiteSpace(sizes.GetString());
            var hasUri = Uri.TryCreate(manifestContext.Url, src.GetString(), out var imageUri) && hasSrc;
            if (hasSrc && hasSizes && hasUri && imageUri != null)
            {
                var declaredSizes = sizes.GetString();
                imageValidationTasks.Add(this.imageValidator.TryValidateImageSizeAsync(imageUri, declaredSizes, cancelToken));
            }
        }

        if (imageValidationTasks.Count == 0)
        {
            return PwaCapabilityCheckStatus.Skipped; // No images with size declarations to validate
        }

        var results = await Task.WhenAll(imageValidationTasks);
        var firstImageError = results.Select(r => r.Error).FirstOrDefault(e => e != null);
        if (firstImageError != null)
        {
            // If it's a 403 error, skip the check. We'll surface errors via CheckImagesAreFetchable instead.
            if (firstImageError is HttpRequestException httpRequestException && httpRequestException.StatusCode == System.Net.HttpStatusCode.Forbidden)
            {
                return PwaCapabilityCheckStatus.Skipped;
            }

            return firstImageError;
        }
        else
        {
            return PwaCapabilityCheckStatus.Passed;
        }
    }

    private static PwaCapabilityCheckStatus CheckManifestStringField(JsonElement manifest, string fieldName, int minLength = 1, params string[] allowedValues)
    {
        var matches = manifest.TryGetProperty(fieldName, out var fieldValue)
            && fieldValue.ValueKind == JsonValueKind.String
            && fieldValue.GetString()?.Length >= minLength
            && (allowedValues == null || allowedValues.Length == 0 || allowedValues.Contains(fieldValue.GetString()));
        return matches ? PwaCapabilityCheckStatus.Passed : PwaCapabilityCheckStatus.Failed;
    }

    private static PwaCapabilityCheckStatus CheckManifestBooleanField(JsonElement manifest, string fieldName)
    {
        var hasBooleanField = manifest.TryGetProperty(fieldName, out var fieldValue)
            && (fieldValue.ValueKind == JsonValueKind.True || fieldValue.ValueKind == JsonValueKind.False);
        return hasBooleanField ? PwaCapabilityCheckStatus.Passed : PwaCapabilityCheckStatus.Failed;
    }

    private static PwaCapabilityCheckStatus CheckManifestStringArrayField(JsonElement manifest, string fieldName, int minItemCount = 1)
    {
        var matches = manifest.TryGetProperty(fieldName, out var fieldValue)
            && fieldValue.ValueKind == JsonValueKind.Array
            && fieldValue.GetArrayLength() >= minItemCount
            && fieldValue.EnumerateArray().Any(s => s.ValueKind == JsonValueKind.String && !string.IsNullOrWhiteSpace(s.GetString()));
        return matches ? PwaCapabilityCheckStatus.Passed : PwaCapabilityCheckStatus.Failed;
    }

    private static PwaCapabilityCheckStatus CheckShortcuts(JsonElement manifest)
    {
        var hasValidShortcuts = manifest.TryGetProperty("shortcuts", out var shortcuts)
            && shortcuts.ValueKind == JsonValueKind.Array
            && shortcuts.GetArrayLength() > 0
            && shortcuts.EnumerateArray().Any(s => s.TryGetProperty("name", out var shortcutName) && shortcutName.ValueKind == JsonValueKind.String && !string.IsNullOrWhiteSpace(shortcutName.GetString()))
            && shortcuts.EnumerateArray().Any(s => s.TryGetProperty("url", out var shortcutUrl) && shortcutUrl.ValueKind == JsonValueKind.String && !string.IsNullOrWhiteSpace(shortcutUrl.GetString()));
        return hasValidShortcuts ? PwaCapabilityCheckStatus.Passed : PwaCapabilityCheckStatus.Failed;
    }

    private static PwaCapabilityCheckStatus CheckFileHandlers(JsonElement manifest)
    {
        var hasValidFileHandler = manifest.TryGetProperty("file_handlers", out var fileHandlers)
            && fileHandlers.ValueKind == JsonValueKind.Array
            && fileHandlers.GetArrayLength() > 0
            && fileHandlers.EnumerateArray().Any(h => h.TryGetProperty("action", out var fileHandlerAction) && fileHandlerAction.ValueKind == JsonValueKind.String && !string.IsNullOrWhiteSpace(fileHandlerAction.GetString()))
            && fileHandlers.EnumerateArray().Any(h => h.TryGetProperty("accept", out var fileHandlerAccept) && fileHandlerAccept.ValueKind == JsonValueKind.Object);
        return hasValidFileHandler ? PwaCapabilityCheckStatus.Passed : PwaCapabilityCheckStatus.Failed;
    }

    private static PwaCapabilityCheckStatus CheckLaunchHandler(JsonElement manifest)
    {
        var hasValidFileHandler = manifest.TryGetProperty("launch_handler", out var launchHandler) && launchHandler.ValueKind == JsonValueKind.Object;
        if (hasValidFileHandler)
        {
            // See if it has client mode. It should either be a string or an array of strings.
            var hasClientMode = launchHandler.TryGetProperty("client_mode", out var clientMode);
            if (clientMode.ValueKind == JsonValueKind.String)
            {
                // Client mode is a string, it should not be empty.
                var hasClientModeString = !string.IsNullOrWhiteSpace(clientMode.GetString());
                return hasClientModeString ? PwaCapabilityCheckStatus.Passed : PwaCapabilityCheckStatus.Failed;
            }
            else if (clientMode.ValueKind == JsonValueKind.Array)
            {
                var hasClientModeArray = clientMode.EnumerateArray().Any(c => c.ValueKind == JsonValueKind.String && !string.IsNullOrWhiteSpace(c.GetString()));
                return hasClientModeArray ? PwaCapabilityCheckStatus.Passed : PwaCapabilityCheckStatus.Failed;
            }
        }

        return PwaCapabilityCheckStatus.Failed;
    }

    private static PwaCapabilityCheckStatus CheckProtocolHandlers(JsonElement manifest)
    {
        var hasProtocolHandlers = manifest.TryGetProperty("protocol_handlers", out var protocolHandlers)
            && protocolHandlers.ValueKind == JsonValueKind.Array
            && protocolHandlers.GetArrayLength() > 0
            && protocolHandlers.EnumerateArray().Any(h => h.TryGetProperty("protocol", out var protocol) && protocol.ValueKind == JsonValueKind.String && !string.IsNullOrWhiteSpace(protocol.GetString()))
            && protocolHandlers.EnumerateArray().Any(h => h.TryGetProperty("url", out var url) && url.ValueKind == JsonValueKind.String && !string.IsNullOrWhiteSpace(url.GetString()));
        return hasProtocolHandlers ? PwaCapabilityCheckStatus.Passed : PwaCapabilityCheckStatus.Failed;
    }

    private static PwaCapabilityCheckStatus CheckRelatedApplications(JsonElement manifest)
    {
        var hasRelatedApps = manifest.TryGetProperty("related_applications", out var relatedApps)
            && relatedApps.ValueKind == JsonValueKind.Array
            && relatedApps.GetArrayLength() > 0;
        if (hasRelatedApps)
        {
            // Each app must include platform, and either url or id
            var hasValidRelatedApps = relatedApps.EnumerateArray().All(app =>
                app.TryGetProperty("platform", out var platform) && platform.ValueKind == JsonValueKind.String && !string.IsNullOrWhiteSpace(platform.GetString())
                && (app.TryGetProperty("url", out var appUrl) && appUrl.ValueKind == JsonValueKind.String && !string.IsNullOrWhiteSpace(appUrl.GetString())
                    || app.TryGetProperty("id", out var appId) && appId.ValueKind == JsonValueKind.String && !string.IsNullOrWhiteSpace(appId.GetString())));
            return hasValidRelatedApps ? PwaCapabilityCheckStatus.Passed : PwaCapabilityCheckStatus.Failed;
        }

        return PwaCapabilityCheckStatus.Failed;
    }

    private static PwaCapabilityCheckStatus CheckShareTarget(JsonElement manifest)
    {
        var hasShareTarget = manifest.TryGetProperty("share_target", out var shareTarget)
            && shareTarget.ValueKind == JsonValueKind.Object
            && shareTarget.TryGetProperty("action", out var action) && action.ValueKind == JsonValueKind.String && !string.IsNullOrWhiteSpace(action.GetString());
        return hasShareTarget ? PwaCapabilityCheckStatus.Passed : PwaCapabilityCheckStatus.Failed;
    }

    private static PwaCapabilityCheckStatus CheckWidgets(JsonElement manifest)
    {
        var hasWidgets = manifest.TryGetProperty("widgets", out var widgets)
            && widgets.ValueKind == JsonValueKind.Array
            && WidgetsSchema.ValidateWidgetSchema(widgets.GetRawText());
        return hasWidgets ? PwaCapabilityCheckStatus.Passed : PwaCapabilityCheckStatus.Failed;
    }

    private static PwaCapabilityCheckStatus CheckEdgeSidePanel(JsonElement manifest)
    {
        var hasEdgeSidePanel = manifest.TryGetProperty("edge_side_panel", out var sidePanel)
            && sidePanel.ValueKind == JsonValueKind.Object
            && sidePanel.TryGetProperty("preferred_width", out var preferredWidth)
            && preferredWidth.ValueKind == JsonValueKind.Number;
        return hasEdgeSidePanel ? PwaCapabilityCheckStatus.Passed : PwaCapabilityCheckStatus.Failed;
    }

    private static PwaCapabilityCheckStatus CheckWindowControlsOverlay(JsonElement manifest)
    {
        var hasWindowControlsOverlay = manifest.TryGetProperty("display_override", out var displayOverride)
            && displayOverride.ValueKind == JsonValueKind.Array
            && displayOverride.EnumerateArray().Any(o => o.ValueKind == JsonValueKind.String && o.GetString() == "window-controls-overlay");
        return hasWindowControlsOverlay ? PwaCapabilityCheckStatus.Passed : PwaCapabilityCheckStatus.Failed;
    }

    private static PwaCapabilityCheckStatus CheckTabbedDisplay(JsonElement manifest)
    {
        var hasTabbedDisplayOverride = manifest.TryGetProperty("display_override", out var displayOverride)
            && displayOverride.ValueKind == JsonValueKind.Array
            && displayOverride.EnumerateArray().Any(o => o.ValueKind == JsonValueKind.String && o.GetString() == "tabbed");
        var hasTabStrip = manifest.TryGetProperty("tab_strip", out var tabStrip)
            && tabStrip.ValueKind == JsonValueKind.Object;
        return hasTabbedDisplayOverride && hasTabStrip ? PwaCapabilityCheckStatus.Passed : PwaCapabilityCheckStatus.Failed;
    }

    private static PwaCapabilityCheckStatus CheckNoteTaking(JsonElement manifest)
    {
        var hasNoteTaking = manifest.TryGetProperty("note_taking", out var noteTaking)
            && noteTaking.ValueKind == JsonValueKind.Object
            && noteTaking.TryGetProperty("new_note_url", out var newNoteUrl)
            && newNoteUrl.ValueKind == JsonValueKind.String && !string.IsNullOrWhiteSpace(newNoteUrl.GetString());
        return hasNoteTaking ? PwaCapabilityCheckStatus.Passed : PwaCapabilityCheckStatus.Failed;
    }

    private static PwaCapabilityCheckStatus CheckScopeExtensions(JsonElement manifest)
    {
        var hasScopeExtensions = manifest.TryGetProperty("scope_extensions", out var scopeExtensions)
            && scopeExtensions.ValueKind == JsonValueKind.Array
            && scopeExtensions.GetArrayLength() > 0
            // each extension needs a "type" string. 
            && scopeExtensions.EnumerateArray().All(e => e.ValueKind == JsonValueKind.Object && e.TryGetProperty("type", out var extensionType) && extensionType.ValueKind == JsonValueKind.String && !string.IsNullOrWhiteSpace(extensionType.GetString()))
            // each extension needs a "origin" string which must be a valid URL.
            && scopeExtensions.EnumerateArray().All(e => e.ValueKind == JsonValueKind.Object && e.TryGetProperty("origin", out var extensionOrigin) && extensionOrigin.ValueKind == JsonValueKind.String && Uri.TryCreate(extensionOrigin.GetString(), UriKind.Absolute, out _));
        return hasScopeExtensions ? PwaCapabilityCheckStatus.Passed : PwaCapabilityCheckStatus.Failed;
    }

    internal class PwaManifestCapabilityCheck
    {
        public PwaManifestCapabilityCheck(PwaCapability capability, Func<ManifestDetection, CancellationToken, Task<Result<PwaCapabilityCheckStatus>>> check)
        {
            Id = capability.Id;
            Check = check;
        }

        public PwaManifestCapabilityCheck(PwaCapability capability, Func<ManifestDetection, Task<PwaCapabilityCheckStatus>> check)
            : this(capability, (manifestContext, _) => check(manifestContext).ContinueWith(t => Result.From(t.Result)))
        {
        }

        public PwaManifestCapabilityCheck(PwaCapability capability, Func<ManifestDetection, PwaCapabilityCheckStatus> check)
            : this(capability, (manifestContext, _) => Task.FromResult(Result.From(check(manifestContext))))
        {
        }

        public PwaManifestCapabilityCheck(PwaCapability capability, Func<JsonElement, PwaCapabilityCheckStatus> check)
            : this(capability, (manifestContext, _) => Task.FromResult(Result.From(check(manifestContext.Manifest))))
        {
        }

        public PwaCapabilityId Id { get; init; }
        public Func<ManifestDetection, CancellationToken, Task<Result<PwaCapabilityCheckStatus>>> Check { get; set; }
    }
}
