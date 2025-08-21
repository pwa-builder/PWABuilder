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

    public List<ManifestSingleFieldValidation> GetValidations()
    {
        var manifestValidations = new List<ManifestSingleFieldValidation>();
        var fileHandlerValidation = new ManifestSingleFieldValidation
        {
            InfoString =
                "The file_handlers member specifies an array of objects representing the types of files an installed PWA can handle",
            DisplayString = "Manifest has file_handlers field",
            Category = "enhancement",
            Member = "file_handlers",
            DefaultValue = new List<object>(),
            DocsLink = new Uri("https://docs.pwabuilder.com/#/builder/manifest?id=file_handlers-array"),
            ErrorString =
                "file_handlers array should have objects with action and accept fields",
            QuickFix = true,
            Test = (value) =>
            {
                if (
                    value is not JsonElement jsonElement
                    || jsonElement.ValueKind != JsonValueKind.Array
                )
                {
                    return false;
                }
                var result = FileHandlerSchema.ValidateFileHandlerSchema(
                    jsonElement.GetRawText()
                );
                return result;
            },
        };
        manifestValidations.Add(fileHandlerValidation);

        var launchHandlerValidation = new ManifestSingleFieldValidation
        {
            InfoString =
                "The launch_handler member specifies how your app will launch when navigated to via URL, share_target etc.",
            DisplayString = "Manifest has launch_handler field",
            Category = "recommended",
            Member = "launch_handler",
            DefaultValue = string.Empty,
            DocsLink = new Uri("https://docs.pwabuilder.com/#/builder/manifest?id=launch_handler-object"),
            ErrorString = string.Empty,
            QuickFix = false
        };
        launchHandlerValidation.Test = (value) =>
        {
            if (
                value is not JsonElement jsonElement
                || jsonElement.ValueKind != JsonValueKind.Object
            )
            {
                launchHandlerValidation.ErrorString = "launch_handler should be object";
                return false;
            }

            if (!jsonElement.TryGetProperty("client_mode", out _))
            {
                launchHandlerValidation.ErrorString = "launch_handler should have client_mode";
                return false;
            }

            launchHandlerValidation.ErrorString = string.Empty;
            return true;
        };
        manifestValidations.Add(launchHandlerValidation);

        var preferRelatedAppsValidation = new ManifestSingleFieldValidation
        {
            InfoString =
                "The prefer_related_applications member is a boolean value that specifies that applications listed in related_applications should be preferred over the web application. If the prefer_related_applications member is set to true, the user agent might suggest installing one of the related applications instead of this web app.",
            DisplayString = "Manifest properly sets prefer_related_applications field",
            Category = "optional",
            Member = "prefer_related_applications",
            DefaultValue = false,
            DocsLink = new Uri("https://docs.pwabuilder.com/#/builder/manifest?id=prefer_related_applications-boolean"),
            ErrorString = string.Empty,
            QuickFix = false,
            TestRequired = false,
        };
        preferRelatedAppsValidation.Test = (value) =>
        {
            if (
                value is not JsonElement jsonElement
                || jsonElement.ValueKind == JsonValueKind.Null
                || jsonElement.ValueKind == JsonValueKind.Undefined
            )
            {
                preferRelatedAppsValidation.TestRequired = false;
                preferRelatedAppsValidation.ErrorString =
                    "prefer_related_applications should be set to a boolean value";
                return false;
            }

            preferRelatedAppsValidation.TestRequired = true;
            return jsonElement.ValueKind == JsonValueKind.True
                || jsonElement.ValueKind == JsonValueKind.False;
        };
        manifestValidations.Add(preferRelatedAppsValidation);

        var protocolHandlersValidation = new ManifestSingleFieldValidation
        {
            InfoString =
                "The protocol_handlers member specifies an array of objects that are protocols which this web app can register and handle. Protocol handlers register the application in an OS's application preferences; the registration associates a specific application with the given protocol scheme. For example, when using the protocol handler mailto:// on a web page, registered email applications open.",
            DisplayString = "Manifest has protocol_handlers field",
            Category = "enhancement",
            Member = "protocol_handlers",
            DefaultValue = Array.Empty<object>(),
            DocsLink = new Uri("https://docs.pwabuilder.com/#/builder/manifest?id=protocol_handlers-array"),
            ErrorString = string.Empty,
            QuickFix = true,
        };
        protocolHandlersValidation.Test = (value) =>
        {
            if (
                value is not JsonElement jsonElement
                || jsonElement.ValueKind != JsonValueKind.Array
            )
            {
                protocolHandlersValidation.ErrorString =
                    "protocol_handlers should be a non-empty array";
                return false;
            }

            foreach (var item in jsonElement.EnumerateArray())
            {
                if (item.ValueKind != JsonValueKind.Object)
                {
                    protocolHandlersValidation.ErrorString =
                        "Each protocol_handler must be a JSON object";
                    return false;
                }

                if (
                    !item.TryGetProperty("protocol", out var protocolProp)
                    || protocolProp.ValueKind != JsonValueKind.String
                )
                {
                    protocolHandlersValidation.ErrorString =
                        "Each protocol_handler must have a valid 'protocol'";
                    return false;
                }

                var protocol = protocolProp.GetString();
                if (string.IsNullOrWhiteSpace(protocol) || !protocol.StartsWith("web+"))
                {
                    protocolHandlersValidation.ErrorString =
                        "Each protocol_handler must have a valid 'protocol'";
                    return false;
                }

                if (
                    !item.TryGetProperty("url", out var urlProp)
                    || urlProp.ValueKind != JsonValueKind.String
                )
                {
                    protocolHandlersValidation.ErrorString =
                        "Each protocol_handler must have a valid 'url'";
                    return false;
                }

                var url = urlProp.GetString();
                if (
                    string.IsNullOrWhiteSpace(url)
                    || !(url.StartsWith("/") || url.StartsWith("./") || url.StartsWith("../"))
                )
                {
                    protocolHandlersValidation.ErrorString =
                        "Each protocol_handler must have a relative 'url' (starting with '/', './', or '../')";
                    return false;
                }
            }

            protocolHandlersValidation.ErrorString = string.Empty;
            return true;
        };
        manifestValidations.Add(protocolHandlersValidation);

        var relatedApplicationsValidation = new ManifestSingleFieldValidation
        {
            Member = "related_applications",
            DisplayString = "Manifest has related_applications field",
            InfoString =
                "The related_applications field is an array of objects specifying native applications that are installable by, or accessible to, the underlying platform — for example, a platform-specific (native) Windows application.",
            Category = "optional",
            DefaultValue = Array.Empty<object>(),
            DocsLink = new Uri("https://docs.pwabuilder.com/#/builder/manifest?id=related_applications-array"),
            ErrorString = string.Empty,
            QuickFix = true,
        };
        relatedApplicationsValidation.Test = (value) =>
        {
            if (
                value is not JsonElement jsonElement
                || (
                    jsonElement.ValueKind != JsonValueKind.Array
                    && jsonElement.ValueKind != JsonValueKind.Null
                )
            )
            {
                relatedApplicationsValidation.ErrorString =
                    "related_applications should contain a valid store, url and id";
                return false;
            }

            if (
                jsonElement.ValueKind == JsonValueKind.Array
                && jsonElement.GetArrayLength() == 0
            )
            {
                relatedApplicationsValidation.ErrorString = string.Empty;
                return true;
            }

            return jsonElement
                .EnumerateArray()
                .All(app =>
                {
                    if (
                        !app.TryGetProperty("platform", out var _)
                        || !app.TryGetProperty("url", out var _)
                        || !app.TryGetProperty("id", out var _)
                    )
                    {
                        relatedApplicationsValidation.ErrorString =
                            "related_applications should contain a valid store, url and id";
                        return false;
                    }

                    return true;
                });
        };
        manifestValidations.Add(relatedApplicationsValidation);

        var screenshotsValidation = new ManifestSingleFieldValidation
        {
            InfoString =
                "The screenshots member defines an array of screenshots intended to showcase the application.",
            DisplayString = "Manifest has screenshots field",
            Category = "recommended",
            Member = "screenshots",
            DefaultValue = JsonConvert.SerializeObject(
                new[]
                {
                    new
                    {
                        src = "https://www.pwabuilder.com/assets/screenshots/screen1.png",
                        sizes = "2880x1800",
                        type = "image/png",
                        description = "PWABuilder Home Screen",
                    },
                    new
                    {
                        src = "https://www.pwabuilder.com/assets/screenshots/screen2.png",
                        sizes = "2880/1800",
                        type = "image/png",
                        description = "PWABuilder Report Card",
                    },
                    new
                    {
                        src = "https://www.pwabuilder.com/assets/screenshots/screen3.png",
                        sizes = "2880x1800",
                        type = "image/png",
                        description = "Manifest information on the Report Card",
                    },
                }
            ),
            DocsLink = new Uri("https://docs.pwabuilder.com/#/builder/manifest?id=screenshots"),
            ErrorString = "Screenshots must be an array of screenshot objects",
            QuickFix = true,
            TestRequired = false,
        };
        screenshotsValidation.Test = (value) =>
        {
            if (
                value is not JsonElement jsonElement
                || jsonElement.ValueKind == JsonValueKind.Null
                || jsonElement.ValueKind == JsonValueKind.Undefined
            )
            {
                screenshotsValidation.TestRequired = false;
                return false;
            }

            screenshotsValidation.TestRequired = true;
            return jsonElement.ValueKind == JsonValueKind.Array;
        };
        manifestValidations.Add(screenshotsValidation);

        var shareTargetValidation = new ManifestSingleFieldValidation
        {
            Member = "share_target",
            DisplayString = "Manifest has share_target field",
            InfoString = "share_target enables your app to get shared content from other apps",
            Category = "enhancement",
            DefaultValue = JsonConvert.SerializeObject(
                new
                {
                    action = "/share-target/",
                    methods = new[] { "GET" },
                    @params = new
                    {
                        title = "title",
                        text = "text",
                        url = "url",
                    },
                }
            ),
            DocsLink = new Uri("https://docs.pwabuilder.com/#/home/native-features?id=web-share-api"),
            ErrorString = "share_target must be an object",
            QuickFix = true,
        };
        shareTargetValidation.Test = (value) =>
        {
            if (
                value is not JsonElement jsonElement
                || jsonElement.ValueKind != JsonValueKind.Object
            )
            {
                shareTargetValidation.ErrorString = "share_target must be an object";
                return false;
            }

            shareTargetValidation.ErrorString = string.Empty;
            return true;
        };
        manifestValidations.Add(shareTargetValidation);

        var themeColorValidation = new ManifestSingleFieldValidation
        {
            Member = "theme_color",
            DisplayString = "Manifest has hex encoded theme_color",
            InfoString =
                "The theme_color member is a string that defines the default theme color for the application.",
            Category = "recommended",
            DefaultValue = "#000000",
            DocsLink = new Uri("https://docs.pwabuilder.com/#/builder/manifest?id=theme_color-string"),
            ErrorString = "theme_color should be a valid hex color",
            QuickFix = true,
            TestRequired = false,
        };
        themeColorValidation.Test = (value) =>
        {
            if (
                value is not JsonElement jsonElement
                || jsonElement.ValueKind == JsonValueKind.Null
                || jsonElement.ValueKind == JsonValueKind.Undefined
            )
            {
                themeColorValidation.TestRequired = false;
                return false;
            }

            themeColorValidation.TestRequired = true;
            if (
                jsonElement.ValueKind != JsonValueKind.String
                || string.IsNullOrWhiteSpace(jsonElement.GetString())
            )
            {
                return false;
            }

            var hexRegex = new Regex("^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$");
            return hexRegex.IsMatch(jsonElement.GetString() ?? string.Empty);
        };
        manifestValidations.Add(themeColorValidation);

        var iarcRatingIdValidation = new ManifestSingleFieldValidation
        {
            Member = "iarc_rating_id",
            DisplayString = "Manifest has iarc_rating_id field",
            InfoString =
                "The iarc_rating_id member is a string that represents the International Age Rating Coalition (IARC) certification code of the web application. It is intended to be used to determine which ages the web application is appropriate for.",
            Category = "optional",
            DefaultValue = string.Empty,
            DocsLink = new Uri("https://docs.pwabuilder.com/#/builder/manifest?id=iarc_rating_id-string"),
            ErrorString = "iarc_rating_id must be a string with a length > 0",
            QuickFix = true,
        };
        iarcRatingIdValidation.Test = (value) =>
        {
            if (
                value is JsonElement strValue
                && strValue.ValueKind == JsonValueKind.String
                && string.IsNullOrWhiteSpace(strValue.GetString())
            )
            {
                iarcRatingIdValidation.ErrorString = string.Empty;
                return true;
            }

            iarcRatingIdValidation.ErrorString =
                "iarc_rating_id must be a string with a length > 0";
            return false;
        };
        manifestValidations.Add(iarcRatingIdValidation);

        var widgetValidation = new ManifestSingleFieldValidation
        {
            InfoString = "Enable Windows 11 widgets board support",
            DisplayString = "Manifest has widgets field",
            Category = "enhancement",
            Member = "widgets",
            DefaultValue = new List<object>(),
            DocsLink = new Uri("https://learn.microsoft.com/en-us/microsoft-edge/progressive-web-apps-chromium/how-to/widgets"),
            QuickFix = true,
            ErrorString = "widgets should be an array of valid objects",
            Test = (value) =>
            {
                if (
                    value is not JsonElement jsonElement
                    || jsonElement.ValueKind != JsonValueKind.Array
                )
                {
                    return false;
                }
                var validation = WidgetsSchema.ValidateWidgetSchema(jsonElement.GetRawText());
                return validation;
            },
        };
        manifestValidations.Add(widgetValidation);

        var iconsValidation = new ManifestSingleFieldValidation
        {
            InfoString =
                "The icons member specifies an array of objects representing image files that can serve as application icons for different contexts.",
            DisplayString = "Manifest has icons field",
            Category = "required",
            Member = "icons",
            DefaultValue = JsonConvert.SerializeObject(
                new[]
                {
                    new Icon
                    {
                        Src = "https://www.pwabuilder.com/assets/icons/icon_192.png",
                        Sizes = "192x192",
                        Type = "image/png",
                        Purpose = "any",
                    },
                    new Icon
                    {
                        Src = "https://www.pwabuilder.com/assets/icons/icon_512.png",
                        Sizes = "512x512",
                        Type = "image/png",
                        Purpose = "maskable",
                    },
                }
            ),
            DocsLink = new Uri("https://docs.pwabuilder.com/#/builder/manifest?id=icons"),
            ErrorString = string.Empty,
            QuickFix = true,
        };
        iconsValidation.Test = (value) =>
        {
            if (
                value is not JsonElement jsonElement
                || jsonElement.ValueKind != JsonValueKind.Array
                || jsonElement.GetArrayLength() == 0
            )
            {
                iconsValidation.ErrorString = "icons is required and must be non-empty array";
                return false;
            }

            var icons = JsonConvert.DeserializeObject<List<Icon>>(jsonElement.GetRawText());
            if (icons == null)
            {
                iconsValidation.ErrorString = "icons array is malformed";
                return false;
            }

            if (icons.Any(i => i.Purpose == "any maskable"))
            {
                iconsValidation.ErrorString =
                    "Separate icons are needed for both maskable and any";
                return false;
            }

            var icon512 = icons.FirstOrDefault(icon =>
            {
                var size = icon.GetSize();
                return size.HasValue
                    && size.Value.Width >= 512
                    && size.Value.Height >= 512
                    && icon.IsPngOrSvg();
            });

            if (icon512 == null)
            {
                iconsValidation.ErrorString =
                    "Need at least one PNG or SVG icon 512x512 or larger";
                return false;
            }

            iconsValidation.ErrorString = string.Empty;
            return true;
        };
        manifestValidations.Add(iconsValidation);

        var iconsPurposeAnyValidation = new ManifestSingleFieldValidation
        {
            InfoString =
                "The icons member specifies an array of objects representing image files that can serve as application icons for different contexts.",
            DisplayString = "Icons have at least one icon with purpose any",
            Category = "recommended",
            Member = "icons",
            DefaultValue = iconsValidation.DefaultValue,
            DocsLink = new Uri("https://docs.pwabuilder.com/#/builder/manifest?id=icons"),
            ErrorString = "Need at least one icon with purpose set to any",
            QuickFix = true,
        };
        iconsPurposeAnyValidation.Test = (value) =>
        {
            if (
                value is not JsonElement jsonElement
                || jsonElement.ValueKind != JsonValueKind.Array
                || jsonElement.GetArrayLength() == 0
            )
            {
                return false;
            }

            var icons = JsonConvert.DeserializeObject<List<Icon>>(jsonElement.GetRawText());
            if (icons == null)
                return false;

            var hasAny = icons.Any(i => i.Purpose == "any");
            var hasMaskable = icons.Any(i => i.Purpose == "maskable");

            return hasAny || !hasMaskable;
        };
        manifestValidations.Add(iconsPurposeAnyValidation);

        var edgeSidePanelValidation = new ManifestSingleFieldValidation
        {
            InfoString =
                "The edge_side_panel member specifies if your app supports the side panel in the Edge browser.",
            DisplayString = "Manifest has edge_side_panel field",
            Category = "enhancement",
            Member = "edge_side_panel",
            DefaultValue = string.Empty,
            DocsLink = new Uri("https://docs.pwabuilder.com/#/builder/manifest?id=edge_side_panel-object"),
            ErrorString = string.Empty,
            QuickFix = false,
        };
        edgeSidePanelValidation.Test = (value) =>
        {
            if (
                value is not JsonElement jsonElement
                || jsonElement.ValueKind != JsonValueKind.Object
            )
            {
                edgeSidePanelValidation.ErrorString =
                    "The value entered for edge_side_panel.preferred_width should be a number";
                return false;
            }

            if (jsonElement.TryGetProperty("preferred_width", out var widthProp))
            {
                if (widthProp.ValueKind != JsonValueKind.Number)
                {
                    edgeSidePanelValidation.ErrorString =
                        "The value entered for edge_side_panel.preferred_width should be a number";
                    return false;
                }
            }
            return true;
        };
        manifestValidations.Add(edgeSidePanelValidation);

        var displayOverrideValidation = new ManifestSingleFieldValidation
        {
            Member = "display_override",
            DisplayString = "Manifest has display_override field",
            InfoString =
                "Its value is an array of display modes that are considered in-order, and the first supported display mode is applied.",
            Category = "enhancement",
            DefaultValue = Array.Empty<string>(),
            DocsLink = new Uri("https://docs.pwabuilder.com/#/builder/manifest?id=display_override-array"),
            ErrorString = string.Empty,
            QuickFix = true,
        };
        displayOverrideValidation.Test = (value) =>
        {
            if (
                value is not JsonElement jsonElement
                || jsonElement.ValueKind != JsonValueKind.Array
            )
            {
                displayOverrideValidation.ErrorString =
                    "display_override must be a non-empty array";
                return false;
            }

            bool hasOverlay = false;
            foreach (var item in jsonElement.EnumerateArray())
            {
                if (
                    item.ValueKind == JsonValueKind.String
                    && item.GetString() == "window-controls-overlay"
                )
                {
                    hasOverlay = true;
                    break;
                }
            }

            if (!hasOverlay)
            {
                displayOverrideValidation.ErrorString =
                    "display_override array should have window-controls-overlay value";
                return false;
            }

            displayOverrideValidation.ErrorString = string.Empty;
            return true;
        };
        manifestValidations.Add(displayOverrideValidation);

        var handleLinksValidation = new ManifestSingleFieldValidation
        {
            Member = "launch_handler",
            DisplayString = "Manifest has launch_handler field",
            InfoString =
                "The launch_handler field specifies how links to your app are opened. It must be an object (or array of objects) with a client_mode value indicating how to handle navigations.",
            Category = "enhancement",
            DefaultValue = "{ client_mode: 'auto' }",
            DocsLink = new Uri("https://docs.pwabuilder.com/#/builder/manifest?id=launch_handler-object"),
            ErrorString = string.Empty,
            QuickFix = true,
        };
        handleLinksValidation.Test = (value) =>
        {
            static bool HasValidClientMode(JsonElement clientModeEl)
            {
                var allowed = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
                {
                    "auto",
                    "navigate-new",
                    "navigate-existing",
                    "focus-existing"
                };

                if (clientModeEl.ValueKind == JsonValueKind.String)
                {
                    var s = clientModeEl.GetString();
                    return s is not null && allowed.Contains(s);
                }

                if (clientModeEl.ValueKind == JsonValueKind.Array)
                {
                    foreach (var item in clientModeEl.EnumerateArray())
                    {
                        if (item.ValueKind == JsonValueKind.String)
                        {
                            var s = item.GetString();
                            if (s is not null && allowed.Contains(s))
                            {
                                return true;
                            }
                        }
                    }
                    return false;
                }

                return false;
            }

            if (value is not JsonElement json)
            {
                handleLinksValidation.ErrorString =
                    " must be an object containing 'client_mode'.";
                return false;
            }

            if (json.ValueKind == JsonValueKind.Object)
            {
                if (!json.TryGetProperty("client_mode", out var clientMode) || !HasValidClientMode(clientMode))
                {
                    handleLinksValidation.ErrorString =
                        "launch_handler.client_mode must be a string or array containing one of: auto, navigate-new, navigate-existing, focus-existing.";
                    return false;
                }

                handleLinksValidation.ErrorString = string.Empty;
                return true;
            }

            if (json.ValueKind == JsonValueKind.Array)
            {
                foreach (var el in json.EnumerateArray())
                {
                    if (el.ValueKind == JsonValueKind.Object && el.TryGetProperty("client_mode", out var cm) && HasValidClientMode(cm))
                    {
                        handleLinksValidation.ErrorString = string.Empty;
                        return true;
                    }
                }

                handleLinksValidation.ErrorString =
                    "launch_handler must have client_mode as a string or array of strings containing one of: auto, navigate-new, navigate-existing, focus-existing.";
                return false;
            }

            handleLinksValidation.ErrorString =
                "launch_handler must be an object containing 'client_mode'.";
            return false;
        };
        manifestValidations.Add(handleLinksValidation);

        var scopeValidation = new ManifestSingleFieldValidation
        {
            InfoString =
                "The scope member is a string that represents the name of the web application as it is usually displayed to the user (e.g., amongst a list of other applications, or as a label for an icon)",
            DisplayString = "Manifest has scope field",
            Category = "optional",
            Member = "scope",
            DefaultValue = "/",
            DocsLink = new Uri("https://docs.pwabuilder.com/#/builder/manifest?id=scope-string"),
            ErrorString = string.Empty,
            QuickFix = true,
        };
        scopeValidation.Test = (value) =>
        {
            if (
                value is not JsonElement jsonElement
                || jsonElement.ValueKind != JsonValueKind.String
                || string.IsNullOrWhiteSpace(jsonElement.GetString())
            )
            {
                scopeValidation.ErrorString = "scope must be a string with a length > 0";
                return false;
            }

            return true;
        };
        manifestValidations.Add(scopeValidation);

        var shortNameValidation = new ManifestSingleFieldValidation
        {
            InfoString =
                "The short_name member is a string that represents the name of the web application displayed to the user if there is not enough space to display name. This name will show in the start menu on Windows and the homescreen on Android.",
            DisplayString = "Manifest has a short_name field",
            Category = "required",
            Member = "short_name",
            DefaultValue = "placeholder",
            DocsLink = new Uri("https://docs.pwabuilder.com/#/builder/manifest?id=short_name-string"),
            ErrorString = string.Empty,
            QuickFix = true,
        };
        shortNameValidation.Test = (value) =>
        {
            if (
                value is not JsonElement jsonElement
                || jsonElement.ValueKind != JsonValueKind.String
            )
            {
                shortNameValidation.ErrorString = "short_name must be a string";
                return false;
            }

            var name = jsonElement.GetString();

            if (string.IsNullOrWhiteSpace(name) || name.Length < 3)
            {
                shortNameValidation.ErrorString =
                    "short_name is required and must be a string with a length >= 3";
                return false;
            }

            if (name != name.Trim())
            {
                shortNameValidation.ErrorString =
                    "short_name should not have any leading or trailing whitespace";
                return false;
            }

            shortNameValidation.ErrorString = string.Empty;
            return true;
        };
        manifestValidations.Add(shortNameValidation);

        var startUrlValidation = new ManifestSingleFieldValidation
        {
            InfoString =
                "The start_url member is a string that represents the start URL of the web application — the preferred URL that should be loaded when the user launches the web application",
            DisplayString = "Manifest has start_url field",
            Category = "required",
            Member = "start_url",
            DefaultValue = "/",
            DocsLink = new Uri("https://docs.pwabuilder.com/#/builder/manifest?id=start_url-string"),
            ErrorString = string.Empty,
            QuickFix = true,
        };
        startUrlValidation.Test = (value) =>
        {
            if (
                value is not JsonElement jsonElement
                || jsonElement.ValueKind != JsonValueKind.String
            )
            {
                startUrlValidation.ErrorString =
                    "start_url is required and must be a string with a length > 0";
                return false;
            }

            var url = jsonElement.GetString();
            if (string.IsNullOrWhiteSpace(url))
            {
                startUrlValidation.ErrorString =
                    "start_url is required and must be a string with a length > 0";
                return false;
            }

            // TODO: Add relative URL validation against scope if needed
            return true;
        };
        manifestValidations.Add(startUrlValidation);

        var displayValidation = new ManifestSingleFieldValidation
        {
            InfoString =
                "The display member is a string that determines the developers' preferred display mode for the website. The display mode changes how much of browser UI is shown to the user and can range from browser (when the full browser window is shown) to fullscreen (when the app is fullscreened).",
            DisplayString = "Manifest has display field",
            Category = "recommended",
            Member = "display",
            DefaultValue = "standalone",
            DocsLink = new Uri("https://docs.pwabuilder.com/#/builder/manifest?id=display-string"),
            ErrorString = string.Empty,
            QuickFix = true,
        };
        displayValidation.Test = (value) =>
        {
            if (
                value is not JsonElement jsonElement
                || jsonElement.ValueKind != JsonValueKind.String
            )
            {
                displayValidation.ErrorString = "display must be a string";
                return false;
            }

            var allowedValues = new[] { "fullscreen", "standalone", "minimal-ui", "browser" };
            var str = jsonElement.GetString();

            if (!allowedValues.Contains(str))
            {
                displayValidation.ErrorString =
                    "display must be one of the following strings: fullscreen, standalone, minimal-ui, browser";
                return false;
            }

            return true;
        };
        manifestValidations.Add(displayValidation);

        var orientationValidation = new ManifestSingleFieldValidation
        {
            InfoString =
                "The orientation mode changes the default orientation of the app. For example, if set to 'portrait', the app will be displayed in landscape mode by default.",
            DisplayString = "Manifest has orientation field",
            Category = "recommended",
            Member = "orientation",
            DefaultValue = "any",
            DocsLink = new Uri("https://docs.pwabuilder.com/#/builder/manifest?id=orientation-string"),
            ErrorString = string.Empty,
            QuickFix = true,
        };
        orientationValidation.Test = (value) =>
        {
            if (
                value is not JsonElement jsonElement
                || jsonElement.ValueKind != JsonValueKind.String
            )
            {
                orientationValidation.ErrorString =
                    "orientation must be one of the following strings: any, natural, landscape, landscape-primary, landscape-secondary, portrait, portrait-primary, portrait-secondary";
                return false;
            }

            var str = jsonElement.GetString();
            var validOptions = new[]
            {
                "any",
                "natural",
                "landscape",
                "landscape-primary",
                "landscape-secondary",
                "portrait",
                "portrait-primary",
                "portrait-secondary",
            };

            var isValid = validOptions.Contains(str);
            if (!isValid)
            {
                orientationValidation.ErrorString =
                    "orientation must be one of the following strings: any, natural, landscape, landscape-primary, landscape-secondary, portrait, portrait-primary, portrait-secondary";
            }

            return isValid;
        };
        manifestValidations.Add(orientationValidation);

        var langValidation = new ManifestSingleFieldValidation
        {
            InfoString =
                "The lang member is a string that represents the default language of your PWA.",
            DisplayString = "Manifest specifies a language",
            Category = "optional",
            Member = "lang",
            DefaultValue = "en",
            DocsLink = new Uri("https://docs.pwabuilder.com/#/builder/manifest?id=lang-string"),
            ErrorString = string.Empty,
            QuickFix = true,
        };
        langValidation.Test = (value) =>
        {
            if (
                value is not JsonElement jsonElement
                || jsonElement.ValueKind != JsonValueKind.String
            )
            {
                langValidation.ErrorString = "lang should be set to a valid language code";
                return false;
            }

            var str = jsonElement.GetString();
            if (string.IsNullOrWhiteSpace(str) || !Languages.IsValidLanguageCode(str))
            {
                langValidation.ErrorString = "lang should be set to a valid language code";
                return false;
            }

            return true;
        };
        manifestValidations.Add(langValidation);

        var dirValidation = new ManifestSingleFieldValidation
        {
            InfoString =
                "The dir member is a string that represents the default text direction of your PWA.",
            DisplayString = "Manifest specifies a default direction of text",
            Category = "optional",
            Member = "dir",
            DefaultValue = "ltr",
            DocsLink = new Uri("https://docs.pwabuilder.com/#/builder/manifest?id=dir-string"),
            ErrorString = string.Empty,
            QuickFix = true,
        };
        dirValidation.Test = (value) =>
        {
            if (
                value is not JsonElement jsonElement
                || jsonElement.ValueKind != JsonValueKind.String
            )
            {
                dirValidation.ErrorString =
                    "dir must be one of the following strings: ltr, rtl, or auto";
                return false;
            }

            var dirValue = jsonElement.GetString();
            var validValues = new[] { "ltr", "rtl", "auto" };
            var isValid =
                !string.IsNullOrWhiteSpace(dirValue) && validValues.Contains(dirValue);

            if (!isValid)
            {
                dirValidation.ErrorString =
                    "dir must be one of the following strings: ltr, rtl, or auto";
            }

            return isValid;
        };
        manifestValidations.Add(dirValidation);

        var scopeExtensionsValidation = new ManifestSingleFieldValidation
        {
            InfoString =
                "Allow PWA that control multiple subdomains and top level domains to behave as one contiguous app. E.g. a site may span example.com, example.co.uk and support.example.com",
            DisplayString = "Manifest has scope_extensions field",
            Category = "optional",
            Member = "scope_extensions",
            DefaultValue = new List<object>(),
            DocsLink = new Uri("https://docs.pwabuilder.com/#/builder/manifest?id=scope_extensions-array"),
            ErrorString = string.Empty,
            QuickFix = true,
        };
        scopeExtensionsValidation.Test = (value) =>
        {
            if (
                value is not JsonElement jsonElement
                || jsonElement.ValueKind != JsonValueKind.Array
            )
            {
                scopeExtensionsValidation.ErrorString =
                    "scope_extensions should be a valid array with origin";
                return false;
            }

            var allValid = jsonElement
                .EnumerateArray()
                .All(extension =>
                    extension.ValueKind == JsonValueKind.Object
                    && extension.TryGetProperty("origin", out JsonElement originElement)
                    && originElement.ValueKind == JsonValueKind.String
                );

            if (!allValid)
            {
                scopeExtensionsValidation.ErrorString =
                    "scope_extensions should be a valid array with origin";
            }

            return allValid;
        };
        manifestValidations.Add(scopeExtensionsValidation);

        var idValidation = new ManifestSingleFieldValidation
        {
            Member = "id",
            DisplayString = "Manifest has an app ID",
            InfoString =
                "The id member is a string that represents the unique identifier of your PWA to the browser.",
            Category = "recommended",
            DefaultValue = "/",
            DocsLink = new Uri("https://developer.chrome.com/blog/pwa-manifest-id"),
            ErrorString = string.Empty,
            QuickFix = true,
        };
        idValidation.Test = (value) =>
        {
            if (value is not JsonElement jsonElement || jsonElement.ValueKind == JsonValueKind.Undefined || jsonElement.ValueKind == JsonValueKind.Null)
            {
                idValidation.ErrorString = "Your manifest should have an id member";
                return false;
            }
            if (jsonElement.ValueKind != JsonValueKind.String || string.IsNullOrWhiteSpace(jsonElement.GetString()))
            {
                idValidation.ErrorString = "Your manifest's ID must be a string with at least one character";
                return false;
            }

            return true;
        };
        manifestValidations.Add(idValidation);

        return manifestValidations;
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
            PwaCapabilityId.BackgroundColor => new PwaManifestCapabilityCheck(capability, m => CheckManifestStringField(m.Manifest, "background_color")),
            PwaCapabilityId.Shortcuts => new PwaManifestCapabilityCheck(capability, CheckShortcuts),
            PwaCapabilityId.Categories => new PwaManifestCapabilityCheck(capability, m => CheckManifestStringArrayField(m.Manifest, "categories")),
            PwaCapabilityId.Icons => new PwaManifestCapabilityCheck(capability, m => CheckManifestImageArray(m, "icons")),
            PwaCapabilityId.Screenshots => new PwaManifestCapabilityCheck(capability, m => CheckManifestImageArray(m, "screenshots")),
            PwaCapabilityId.IconsAreFetchable => new PwaManifestCapabilityCheck(capability, (manifest, cancelToken) => CheckImagesAreFetchable("icons", manifest, cancelToken)),
            PwaCapabilityId.ScreenshotsAreFetchable => new PwaManifestCapabilityCheck(capability, (manifest, cancelToken) => CheckImagesAreFetchable("screenshots", manifest, cancelToken))
        };
        #pragma warning restore CS8524 
    }

    private static bool CheckManifestImageArray(JsonElement manifest, string fieldName)
    {
        return manifest.TryGetProperty(fieldName, out var icons)
            && icons.ValueKind != JsonValueKind.Array
            && icons.GetArrayLength() > 0
            && icons.EnumerateArray().Any(i => i.TryGetProperty("src", out var src) && src.ValueKind == JsonValueKind.String && !string.IsNullOrWhiteSpace(src.GetString()));
    }

    private async Task<bool> CheckImagesAreFetchable(string fieldName, ManifestDetection manifestContext, CancellationToken cancelToken)
    {
        var manifest = manifestContext.Manifest;
        var hasImagesField = manifestContext.Manifest.TryGetProperty(fieldName, out var images)
            && images.ValueKind != JsonValueKind.Array;
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

    private static bool CheckManifestStringField(JsonElement manifest, string fieldName, int minLength = 1)
    {
        var matches = manifest.TryGetProperty(fieldName, out var fieldValue)
            && fieldValue.ValueKind == JsonValueKind.String
            && fieldValue.GetString()?.Length >= minLength;
        return matches;
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
