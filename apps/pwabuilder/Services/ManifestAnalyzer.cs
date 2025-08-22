using System.Collections.Immutable;
using System.Diagnostics;
using System.Text.Json;
using System.Text.RegularExpressions;
using Newtonsoft.Json;
using PWABuilder.Models;
using PWABuilder.Validations.Models;
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

    // public static ValidationsResult ValidateSingleField(string field, JsonElement webManifest)
    // {
    //     var maniTests = GetValidations();

    //     if (webManifest.TryGetProperty(field, out JsonElement value))
    //     {
    //         var fieldTests = maniTests
    //             .FindAll(v => v.Member.Equals(field))
    //             .Select(r =>
    //             {
    //                 var testResult = r.Test != null && r.Test(value);
    //                 return new { Valid = testResult, Error = r.ErrorString };
    //             });

    //         return new ValidationsResult
    //         {
    //             Valid = fieldTests.All(r => r.Valid),
    //             Exists = true,
    //             Errors = fieldTests.Select(r => r.Error ?? string.Empty).Where(e => !string.IsNullOrEmpty(e)),
    //         };
    //     }

    //     return new ValidationsResult
    //     {
    //         Valid = true,
    //         Exists = false,
    //         Errors = ["Field not found"],
    //     };
    // }

    // public static IEnumerable<Validation> ValidateManifest(object? webManifest)
    // {
    //     if (webManifest is not JsonElement webManifestJson)
    //     {
    //         return [];
    //     }

    //     var maniTests = GetValidations();
    //     return maniTests.Select(r =>
    //     {
    //         var propertyExist = webManifestJson.TryGetProperty(
    //             r.Member,
    //             out JsonElement value
    //         );
    //         var testResult = r.Test != null && r.Test(value);
    //         return new Validation
    //         {
    //             Member = r.Member,
    //             DisplayString = r.DisplayString,
    //             InfoString = r.InfoString,
    //             Category = r.Category,
    //             DefaultValue = r.DefaultValue,
    //             DocsLink = r.DocsLink,
    //             ErrorString = r.ErrorString,
    //             QuickFix = r.QuickFix,
    //             TestRequired = r.TestRequired,
    //             Valid = testResult && propertyExist,
    //         };
    //     });
    // }

    /// <summary>
    /// Goes through all the manifest-specific capabilities of the specified <paramref name="analysis"/> and checks if the manifest passes.
    /// </summary>
    /// <param name="analysis"></param>
    /// <param name="logger"></param>
    /// <returns></returns>
    public async Task TryRunManifestChecksAsync(Analysis analysis, ILogger logger, CancellationToken cancelToken)
    {
        var manifestCapabilities = analysis.Capabilities
            .Where(c => c.Category == PwaCapabilityCategory.WebAppManifest);

        // No manifest? Mark all the manifest capabilities as skipped.
        if (analysis.WebManifest == null)
        {
            logger.LogInformation("No manifest to analyze. Skipping manifest checks.");

            // Mark the "manifest exists" capability as failed.
            var manifestExistsCapability = manifestCapabilities.First(c => c.Id == PwaCapabilityId.HasManifest);
            manifestExistsCapability.Status = PwaCapabilityCheckStatus.Failed;

            // Mark all other manifest capabilities as skipped.
            manifestCapabilities
                .Except([manifestExistsCapability])
                .ToList()
                .ForEach(c => c.Status = PwaCapabilityCheckStatus.Skipped);

            return;
        }

        // We have a manifest. Run each check.
        foreach (var capability in manifestCapabilities)
        {
            if (cancelToken.IsCancellationRequested)
            {
                logger.LogInformation("Manifest analysis cancelled.");
                return;
            }

            try
            {
                var manifestCheck = this.manifestChecks[capability.Id];
                var hasCheckPassed = await manifestCheck.Check(analysis.WebManifest, cancelToken);
                capability.Status = hasCheckPassed ? PwaCapabilityCheckStatus.Passed : PwaCapabilityCheckStatus.Failed;
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
            PwaCapabilityId.HasManifest => new PwaManifestCapabilityCheck(capability, m => m != null),
            PwaCapabilityId.Name => new PwaManifestCapabilityCheck(capability, m => CheckManifestStringField(m.Manifest, "name")),
            PwaCapabilityId.Description => new PwaManifestCapabilityCheck(capability, m => CheckManifestStringField(m.Manifest, "description")),
            PwaCapabilityId.ThemeColor => new PwaManifestCapabilityCheck(capability, m => CheckManifestStringField(m.Manifest, "theme_color", 3)),
            PwaCapabilityId.BackgroundColor => new PwaManifestCapabilityCheck(capability, m => CheckManifestStringField(m.Manifest, "background_color", 3)),
            PwaCapabilityId.Shortcuts => new PwaManifestCapabilityCheck(capability, CheckShortcuts),
            PwaCapabilityId.Categories => new PwaManifestCapabilityCheck(capability, m => CheckManifestStringArrayField(m.Manifest, "categories")),
            PwaCapabilityId.Icons => new PwaManifestCapabilityCheck(capability, m => CheckManifestImageArray(m, "icons")),
            PwaCapabilityId.HasSquare192x192PngAnyPurposeIcon => new PwaManifestCapabilityCheck(capability, m => CheckSquareIconOfMinSizeAndTypeAnyPurpose(m, 192, "image/png")),
            PwaCapabilityId.HasSquare512x512PngAnyPurposeIcon => new PwaManifestCapabilityCheck(capability, m => CheckSquareIconOfMinSizeAndTypeAnyPurpose(m, 512, "image/png")),
            PwaCapabilityId.Screenshots => new PwaManifestCapabilityCheck(capability, m => CheckManifestImageArray(m, "screenshots")),
            PwaCapabilityId.IconsAreFetchable => new PwaManifestCapabilityCheck(capability, (manifest, cancelToken) => CheckImagesAreFetchable("icons", manifest, cancelToken)),
            PwaCapabilityId.ScreenshotsAreFetchable => new PwaManifestCapabilityCheck(capability, (manifest, cancelToken) => CheckImagesAreFetchable("screenshots", manifest, cancelToken)),
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
        };
        #pragma warning restore CS8524 
    }

    private static bool CheckManifestImageArray(JsonElement manifest, string fieldName)
    {
        return manifest.TryGetProperty(fieldName, out var images)
            && images.ValueKind == JsonValueKind.Array
            && images.GetArrayLength() > 0
            && images.EnumerateArray().Any(i => i.TryGetProperty("src", out var src) && src.ValueKind == JsonValueKind.String && !string.IsNullOrWhiteSpace(src.GetString()));
    }

    private static bool CheckSquareIconOfMinSizeAndTypeAnyPurpose(JsonElement manifest, int minSize, string imageType)
    {
        var hasIcons = manifest.TryGetProperty("icons", out var icons)
            && icons.ValueKind == JsonValueKind.Array
            && icons.GetArrayLength() > 0;
        if (hasIcons)
        {
            foreach (var icon in icons.EnumerateArray())
            {
                var isDesiredType = icon.TryGetProperty("type", out var iconType) && iconType.ValueKind == JsonValueKind.String && string.Equals(iconType.GetString(), imageType, StringComparison.OrdinalIgnoreCase);
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
                                    return true;
                                }
                            }
                        }
                    }
                }
            }
        }

        return false;
    }

    private static bool CheckScreenshotFormFactor(JsonElement manifest, string desiredFormFactor)
    {
        // Check if the manifest has a screenshots property and if it contains a screenshot with the specified form factor.
        return manifest.TryGetProperty("screenshots", out var screenshots)
            && screenshots.ValueKind == JsonValueKind.Array
            && screenshots.GetArrayLength() > 0
            && screenshots.EnumerateArray().Any(s => s.TryGetProperty("form_factor", out var formFactor) && formFactor.ValueKind == JsonValueKind.String && formFactor.GetString() == desiredFormFactor);
    }

    private async Task<bool> CheckImagesAreFetchable(string fieldName, ManifestDetection manifestContext, CancellationToken cancelToken)
    {
        var manifest = manifestContext.Manifest;
        var hasImagesField = manifestContext.Manifest.TryGetProperty(fieldName, out var images)
            && images.ValueKind == JsonValueKind.Array;
        if (!hasImagesField)
        {
            return false;
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
        var iconUris = images.EnumerateArray()
            .Where(icon => icon.TryGetProperty("src", out var src) && src.ValueKind == JsonValueKind.String)
            .Select(icon => icon.GetProperty("src").GetString())
            .Where(src => !string.IsNullOrWhiteSpace(src))
            .Select(src => new Uri(manifestContext.Url, src));
        var iconFetchTasks = iconUris.Select(uri => this.imageValidator.TryImageExistsAsync(uri, cancelToken));
        var imageExistChecks = await Task.WhenAll(iconFetchTasks);
        return imageExistChecks.All(a => a);
    }

    private static bool CheckManifestStringField(JsonElement manifest, string fieldName, int minLength = 1, params string[] allowedValues)
    {
        var matches = manifest.TryGetProperty(fieldName, out var fieldValue)
            && fieldValue.ValueKind == JsonValueKind.String
            && fieldValue.GetString()?.Length >= minLength
            && (allowedValues == null || allowedValues.Length == 0 || allowedValues.Contains(fieldValue.GetString()));
        return matches;
    }

    private static bool CheckManifestBooleanField(JsonElement manifest, string fieldName)
    {
        return manifest.TryGetProperty(fieldName, out var fieldValue)
            && (fieldValue.ValueKind == JsonValueKind.True || fieldValue.ValueKind == JsonValueKind.False);
    }

    private static bool CheckManifestStringArrayField(JsonElement manifest, string fieldName, int minItemCount = 1)
    {
        var matches = manifest.TryGetProperty(fieldName, out var fieldValue)
            && fieldValue.ValueKind == JsonValueKind.Array
            && fieldValue.GetArrayLength() >= minItemCount
            && fieldValue.EnumerateArray().Any(s => s.ValueKind == JsonValueKind.String && !string.IsNullOrWhiteSpace(s.GetString()));
        return matches;
    }

    private static bool CheckShortcuts(JsonElement manifest)
    {
        var hasValidShortcuts = manifest.TryGetProperty("shortcuts", out var shortcuts)
            && shortcuts.ValueKind == JsonValueKind.Array
            && shortcuts.GetArrayLength() > 0
            && shortcuts.EnumerateArray().Any(s => s.TryGetProperty("name", out var shortcutName) && shortcutName.ValueKind == JsonValueKind.String && !string.IsNullOrWhiteSpace(shortcutName.GetString()))
            && shortcuts.EnumerateArray().Any(s => s.TryGetProperty("url", out var shortcutUrl) && shortcutUrl.ValueKind == JsonValueKind.String && !string.IsNullOrWhiteSpace(shortcutUrl.GetString()));
        return hasValidShortcuts;
    }

    private static bool CheckFileHandlers(JsonElement manifest)
    {
        var hasValidFileHandler = manifest.TryGetProperty("file_handlers", out var fileHandlers)
            && fileHandlers.ValueKind == JsonValueKind.Array
            && fileHandlers.GetArrayLength() > 0
            && fileHandlers.EnumerateArray().Any(h => h.TryGetProperty("action", out var fileHandlerAction) && fileHandlerAction.ValueKind == JsonValueKind.String && !string.IsNullOrWhiteSpace(fileHandlerAction.GetString()))
            && fileHandlers.EnumerateArray().Any(h => h.TryGetProperty("accept", out var fileHandlerAccept) && fileHandlerAccept.ValueKind == JsonValueKind.Object);
        return hasValidFileHandler;
    }

    private static bool CheckLaunchHandler(JsonElement manifest)
    {
        var hasValidFileHandler = manifest.TryGetProperty("launch_handler", out var launchHandler) && launchHandler.ValueKind == JsonValueKind.Object;
        if (hasValidFileHandler)
        {
            // See if it has client mode. It should either be a string or an array of strings.
            var hasClientMode = launchHandler.TryGetProperty("client_mode", out var clientMode);
            if (clientMode.ValueKind == JsonValueKind.String)
            {
                // Client mode is a string, it should not be empty.
                return !string.IsNullOrWhiteSpace(clientMode.GetString());
            }
            else if (clientMode.ValueKind == JsonValueKind.Array)
            {
                return clientMode.EnumerateArray().Any(c => c.ValueKind == JsonValueKind.String && !string.IsNullOrWhiteSpace(c.GetString()));
            }
        }

        return false;
    }

    private static bool CheckProtocolHandlers(JsonElement manifest)
    {
        return manifest.TryGetProperty("protocol_handlers", out var protocolHandlers)
            && protocolHandlers.ValueKind == JsonValueKind.Array
            && protocolHandlers.GetArrayLength() > 0
            && protocolHandlers.EnumerateArray().Any(h => h.TryGetProperty("protocol", out var protocol) && protocol.ValueKind == JsonValueKind.String && !string.IsNullOrWhiteSpace(protocol.GetString()))
            && protocolHandlers.EnumerateArray().Any(h => h.TryGetProperty("url", out var url) && url.ValueKind == JsonValueKind.String && !string.IsNullOrWhiteSpace(url.GetString()));
    }

    private static bool CheckRelatedApplications(JsonElement manifest)
    {
        var hasRelatedApps = manifest.TryGetProperty("related_applications", out var relatedApps)
            && relatedApps.ValueKind == JsonValueKind.Array
            && relatedApps.GetArrayLength() > 0;
        if (hasRelatedApps)
        {
            // Each app must include platform, and either url or id
            return relatedApps.EnumerateArray().All(app =>
                app.TryGetProperty("platform", out var platform) && platform.ValueKind == JsonValueKind.String && !string.IsNullOrWhiteSpace(platform.GetString())
                && (app.TryGetProperty("url", out var appUrl) && appUrl.ValueKind == JsonValueKind.String && !string.IsNullOrWhiteSpace(appUrl.GetString())
                    || app.TryGetProperty("id", out var appId) && appId.ValueKind == JsonValueKind.String && !string.IsNullOrWhiteSpace(appId.GetString())));
        }

        return false;
    }

    private static bool CheckShareTarget(JsonElement manifest)
    {
        return manifest.TryGetProperty("share_target", out var shareTarget)
            && shareTarget.ValueKind == JsonValueKind.Object
            && shareTarget.TryGetProperty("action", out var action) && action.ValueKind == JsonValueKind.String && !string.IsNullOrWhiteSpace(action.GetString());
    }

    private static bool CheckWidgets(JsonElement manifest)
    {
        return manifest.TryGetProperty("widgets", out var widgets)
            && widgets.ValueKind == JsonValueKind.Array
            && WidgetsSchema.ValidateWidgetSchema(widgets.GetRawText());
    }

    private static bool CheckEdgeSidePanel(JsonElement manifest)
    {
        return manifest.TryGetProperty("edge_side_panel", out var sidePanel)
            && sidePanel.ValueKind == JsonValueKind.Object
            && sidePanel.TryGetProperty("preferred_width", out var preferredWidth)
            && preferredWidth.ValueKind == JsonValueKind.Number;
    }

    private static bool CheckWindowControlsOverlay(JsonElement manifest)
    {
        return manifest.TryGetProperty("display_override", out var displayOverride)
            && displayOverride.ValueKind == JsonValueKind.Array
            && displayOverride.EnumerateArray().Any(o => o.ValueKind == JsonValueKind.String && o.GetString() == "window-controls-overlay");
    }

    private static bool CheckTabbedDisplay(JsonElement manifest)
    {
        var hasTabbedDisplayOverride = manifest.TryGetProperty("display_override", out var displayOverride)
            && displayOverride.ValueKind == JsonValueKind.Array
            && displayOverride.EnumerateArray().Any(o => o.ValueKind == JsonValueKind.String && o.GetString() == "tabbed");
        var hasTabStrip = manifest.TryGetProperty("tab_strip", out var tabStrip)
            && tabStrip.ValueKind == JsonValueKind.Object;
        return hasTabbedDisplayOverride && hasTabStrip;
    }

    private static bool CheckNoteTaking(JsonElement manifest)
    {
        return manifest.TryGetProperty("note_taking", out var noteTaking)
            && noteTaking.ValueKind == JsonValueKind.Object
            && noteTaking.TryGetProperty("new_note_url", out var newNoteUrl)
            && newNoteUrl.ValueKind == JsonValueKind.String && !string.IsNullOrWhiteSpace(newNoteUrl.GetString());
    }

    private static bool CheckScopeExtensions(JsonElement manifest)
    {
        return manifest.TryGetProperty("scope_extensions", out var scopeExtensions)
            && scopeExtensions.ValueKind == JsonValueKind.Array
            && scopeExtensions.GetArrayLength() > 0
            // each extension needs a "type" string. 
            && scopeExtensions.EnumerateArray().All(e => e.ValueKind == JsonValueKind.Object && e.TryGetProperty("scope", out var extensionType) && extensionType.ValueKind == JsonValueKind.String && !string.IsNullOrWhiteSpace(extensionType.GetString()))
            // each extension needs a "origin" string which must be a valid URL.
            && scopeExtensions.EnumerateArray().All(e => e.ValueKind == JsonValueKind.Object && e.TryGetProperty("origin", out var extensionOrigin) && extensionOrigin.ValueKind == JsonValueKind.String && Uri.TryCreate(extensionOrigin.GetString(), UriKind.Absolute, out _));
    }

    internal class PwaManifestCapabilityCheck
    {
        public PwaManifestCapabilityCheck(PwaCapability capability, Func<ManifestDetection, CancellationToken, Task<bool>> check)
        {
            Id = capability.Id;
            Check = check;
        }

        public PwaManifestCapabilityCheck(PwaCapability capability, Func<ManifestDetection, Task<bool>> check)
            : this(capability, (manifestContext, _) => check(manifestContext))
        {
        }

        public PwaManifestCapabilityCheck(PwaCapability capability, Func<ManifestDetection, bool> check)
            : this(capability, (manifestContext, _) => Task.FromResult(check(manifestContext)))
        {
        }

        public PwaManifestCapabilityCheck(PwaCapability capability, Func<JsonElement, bool> check)
            : this(capability, (manifestContext, _) => Task.FromResult(check(manifestContext.Manifest)))
        {
        }

        public PwaCapabilityId Id { get; init; }
        public Func<ManifestDetection, CancellationToken, Task<bool>> Check { get; set; }
    }
}
