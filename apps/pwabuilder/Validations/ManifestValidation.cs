using System.Text.Json;
using System.Text.RegularExpressions;
using Newtonsoft.Json;
using PWABuilder.Validations.Models;
using PWABuilder.Validations.Schema;

namespace PWABuilder.Validations
{
    public static class ManifestValidations
    {
        public static List<ManifestSingleField> GetValidations()
        {
            var manifestValidations = new List<ManifestSingleField>();

            var nameValidation = new ManifestSingleField
            {
                InfoString =
                    "The name member is a string that represents the name of the web application as it is usually displayed to the user (e.g., amongst a list of other applications, or as a label for an icon)",
                DisplayString = "Manifest has name field",
                Category = "required",
                Member = "name",
                DefaultValue = "cool PWA",
                DocsLink = "https://docs.pwabuilder.com/#/builder/manifest?id=name-string",
                ErrorString = "",
                QuickFix = true,
            };
            nameValidation.Test = (value) =>
            {
                if (
                    value is not JsonElement jsonElement
                    || jsonElement.ValueKind != JsonValueKind.String
                    || string.IsNullOrWhiteSpace(jsonElement.GetString())
                )
                {
                    nameValidation.ErrorString = "name is required and can not be empty";
                    return false;
                }
                var strValue = jsonElement.GetString();
                return strValue.Equals(strValue.Trim());
            };
            manifestValidations.Add(nameValidation);

            var backGroundColorValidation = new ManifestSingleField
            {
                InfoString =
                    "The background_color member defines a placeholder background color for the application page to display before its stylesheet is loaded.",
                DisplayString = "Manifest has hex encoded background_color",
                Category = "recommended",
                Member = "background_color",
                DefaultValue = "#000000",
                DocsLink =
                    "https://docs.pwabuilder.com/#/builder/manifest?id=background_color-string",
                ErrorString = string.Empty,
                QuickFix = true,
                TestRequired = false,
            };
            backGroundColorValidation.Test = (value) =>
            {
                if (
                    value is not JsonElement jsonElement
                    || jsonElement.ValueKind != JsonValueKind.String
                )
                {
                    backGroundColorValidation.ErrorString =
                        "background_color should be a valid hex color";
                    return false;
                }

                backGroundColorValidation.TestRequired = true;
                if (jsonElement.GetString() is string colorValue)
                {
                    return Regex.IsMatch(colorValue, "^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$");
                }
                return false;
            };
            manifestValidations.Add(backGroundColorValidation);

            var shortcutsValidation = new ManifestSingleField
            {
                InfoString =
                    "The shortcuts member defines an array of shortcuts or links to key tasks or pages within a web app. Shortcuts will show as jumplists on Windows and on the home screen on Android.",
                DisplayString = "Manifest has shortcuts field",
                Category = "enhancement",
                Member = "shortcuts",
                DefaultValue = new List<object>(),
                DocsLink = "https://docs.pwabuilder.com/#/builder/manifest?id=shortcuts-array",
                ErrorString = string.Empty,
                QuickFix = true,
            };
            shortcutsValidation.Test = (value) =>
            {
                if (
                    value is not JsonElement jsonElement
                    || jsonElement.ValueKind != JsonValueKind.Array
                )
                {
                    shortcutsValidation.ErrorString =
                        "shortcuts must be an array of shortcut objects";
                    return false;
                }

                var supportedFormats = jsonElement
                    .EnumerateArray()
                    .All(shortcuts =>
                    {
                        if (!shortcuts.TryGetProperty("icons", out var iconsObj))
                        {
                            return true;
                        }
                        if (iconsObj.ValueKind != JsonValueKind.Array)
                        {
                            return false;
                        }
                        return iconsObj
                            .EnumerateArray()
                            .All(icon =>
                            {
                                if (icon.TryGetProperty("type", out var type))
                                {
                                    var invalidValues = new[] { "image/webp", "image/svg+xml" };
                                    return type.ValueKind == JsonValueKind.String
                                        && type.GetString() is string typeIcon
                                        && !invalidValues.Contains(typeIcon);
                                }
                                return true;
                            });
                    });
                if (!supportedFormats)
                {
                    shortcutsValidation.ErrorString =
                        "shortcuts cannot contain icons with type image/webp or image/svg+xml";
                    return false;
                }
                return true;
            };
            manifestValidations.Add(shortcutsValidation);

            var categoryValidation = new ManifestSingleField
            {
                InfoString =
                    "The categories member is an array of strings that represent the categories of the web application.",
                DisplayString = "Manifest has categories field",
                Category = "optional",
                Member = "categories",
                DefaultValue = new List<string>(),
                DocsLink = "https://docs.pwabuilder.com/#/builder/manifest?id=categories-array",
                ErrorString = string.Empty,
                QuickFix = true,
                TestRequired = false,
            };
            categoryValidation.Test = (value) =>
            {
                if (
                    value is not JsonElement jsonElement
                    || jsonElement.ValueKind == JsonValueKind.Undefined
                    || jsonElement.ValueKind == JsonValueKind.Null
                )
                {
                    categoryValidation.TestRequired = false;
                    return false;
                }

                categoryValidation.TestRequired = true;

                return jsonElement.ValueKind == JsonValueKind.Array
                    && jsonElement.EnumerateArray().All(v => v.ValueKind == JsonValueKind.String);
            };
            manifestValidations.Add(categoryValidation);

            var descriptionValidation = new ManifestSingleField
            {
                InfoString =
                    "The description member is a string that represents the description of your PWA.",
                DisplayString = "Manifest has description field",
                Category = "recommended",
                Member = "description",
                DefaultValue = string.Empty,
                DocsLink = "https://docs.pwabuilder.com/#/builder/manifest?id=description-string",
                ErrorString = string.Empty,
                QuickFix = true,
            };
            descriptionValidation.Test = (value) =>
            {
                if (
                    value is not JsonElement jsonElement
                    || jsonElement.ValueKind != JsonValueKind.String
                    || string.IsNullOrWhiteSpace(jsonElement.GetString())
                )
                {
                    descriptionValidation.ErrorString =
                        "description must be a string with a length > 0";
                    return false;
                }

                var strValue = jsonElement.GetString();

                if (!strValue.Equals(strValue.Trim()))
                {
                    descriptionValidation.ErrorString =
                        "description should not have any leading or trailing whitespace";
                    return false;
                }

                descriptionValidation.ErrorString = string.Empty;
                return true;
            };
            manifestValidations.Add(descriptionValidation);

            var fileHandlerValidation = new ManifestSingleField
            {
                InfoString =
                    "The file_handlers member specifies an array of objects representing the types of files an installed PWA can handle",
                DisplayString = "Manifest has file_handlers field",
                Category = "enhancement",
                Member = "file_handlers",
                DefaultValue = new List<object>(),
                DocsLink = "https://docs.pwabuilder.com/#/builder/manifest?id=file_handlers-array",
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

            var launchHandlerValidation = new ManifestSingleField
            {
                InfoString =
                    "The launch_handler member specifies how your app will launch when navigated to via URL, share_target etc.",
                DisplayString = "Manifest has launch_handler field",
                Category = "recommended",
                Member = "launch_handler",
                DefaultValue = string.Empty,
                DocsLink =
                    "https://docs.pwabuilder.com/#/builder/manifest?id=launch_handlers-string-array",
                ErrorString = string.Empty,
                QuickFix = false,
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

            var preferRelatedAppsValidation = new ManifestSingleField
            {
                InfoString =
                    "The prefer_related_applications member is a boolean value that specifies that applications listed in related_applications should be preferred over the web application. If the prefer_related_applications member is set to true, the user agent might suggest installing one of the related applications instead of this web app.",
                DisplayString = "Manifest properly sets prefer_related_applications field",
                Category = "optional",
                Member = "prefer_related_applications",
                DefaultValue = false,
                DocsLink =
                    "https://docs.pwabuilder.com/#/builder/manifest?id=prefer_related_applications-boolean",
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

            var protocolHandlersValidation = new ManifestSingleField
            {
                InfoString =
                    "The protocol_handlers member specifies an array of objects that are protocols which this web app can register and handle. Protocol handlers register the application in an OS's application preferences; the registration associates a specific application with the given protocol scheme. For example, when using the protocol handler mailto:// on a web page, registered email applications open.",
                DisplayString = "Manifest has protocol_handlers field",
                Category = "enhancement",
                Member = "protocol_handlers",
                DefaultValue = Array.Empty<object>(),
                DocsLink =
                    "https://docs.pwabuilder.com/#/builder/manifest?id=protocol_handlers-array",
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

            var relatedApplicationsValidation = new ManifestSingleField
            {
                Member = "related_applications",
                DisplayString = "Manifest has related_applications field",
                InfoString =
                    "The related_applications field is an array of objects specifying native applications that are installable by, or accessible to, the underlying platform — for example, a platform-specific (native) Windows application.",
                Category = "optional",
                DefaultValue = Array.Empty<object>(),
                DocsLink =
                    "https://docs.pwabuilder.com/#/builder/manifest?id=related_applications-array",
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

            var screenshotsValidation = new ManifestSingleField
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
                DocsLink = "https://docs.pwabuilder.com/#/builder/manifest?id=screenshots",
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

            var shareTargetValidation = new ManifestSingleField
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
                DocsLink = "https://docs.pwabuilder.com/#/home/native-features?id=web-share-api",
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

            var themeColorValidation = new ManifestSingleField
            {
                Member = "theme_color",
                DisplayString = "Manifest has hex encoded theme_color",
                InfoString =
                    "The theme_color member is a string that defines the default theme color for the application.",
                Category = "recommended",
                DefaultValue = "#000000",
                DocsLink = "https://docs.pwabuilder.com/#/builder/manifest?id=theme_color-string",
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
                return hexRegex.IsMatch(jsonElement.GetString());
            };
            manifestValidations.Add(themeColorValidation);

            var iarcRatingIdValidation = new ManifestSingleField
            {
                Member = "iarc_rating_id",
                DisplayString = "Manifest has iarc_rating_id field",
                InfoString =
                    "The iarc_rating_id member is a string that represents the International Age Rating Coalition (IARC) certification code of the web application. It is intended to be used to determine which ages the web application is appropriate for.",
                Category = "optional",
                DefaultValue = string.Empty,
                DocsLink =
                    "https://docs.pwabuilder.com/#/builder/manifest?id=iarc_rating_id-string",
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

            var widgetValidation = new ManifestSingleField
            {
                InfoString = "Enable Windows 11 widgets board support",
                DisplayString = "Manifest has widgets field",
                Category = "enhancement",
                Member = "widgets",
                DefaultValue = new List<object>(),
                DocsLink =
                    "https://learn.microsoft.com/en-us/microsoft-edge/progressive-web-apps-chromium/how-to/widgets",
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

            var iconsValidation = new ManifestSingleField
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
                DocsLink = "https://docs.pwabuilder.com/#/builder/manifest?id=icons",
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

            var iconsPurposeAnyValidation = new ManifestSingleField
            {
                InfoString =
                    "The icons member specifies an array of objects representing image files that can serve as application icons for different contexts.",
                DisplayString = "Icons have at least one icon with purpose any",
                Category = "recommended",
                Member = "icons",
                DefaultValue = iconsValidation.DefaultValue,
                DocsLink = "https://docs.pwabuilder.com/#/builder/manifest?id=icons",
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

            var edgeSidePanelValidation = new ManifestSingleField
            {
                InfoString =
                    "The edge_side_panel member specifies if your app supports the side panel in the Edge browser.",
                DisplayString = "Manifest has edge_side_panel field",
                Category = "enhancement",
                Member = "edge_side_panel",
                DefaultValue = string.Empty,
                DocsLink =
                    "https://docs.pwabuilder.com/#/builder/manifest?id=edge_side_panel-object",
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

            var displayOverrideValidation = new ManifestSingleField
            {
                Member = "display_override",
                DisplayString = "Manifest has display_override field",
                InfoString =
                    "Its value is an array of display modes that are considered in-order, and the first supported display mode is applied.",
                Category = "enhancement",
                DefaultValue = Array.Empty<string>(),
                DocsLink =
                    "https://docs.pwabuilder.com/#/builder/manifest?id=display_override-array",
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

            var handleLinksValidation = new ManifestSingleField
            {
                Member = "handle_links",
                DisplayString = "Manifest has handle_links field",
                InfoString =
                    "The handle_links field specifies how links to your app are opened, either in your app itself or in the users browser",
                Category = "enhancement",
                DefaultValue = "auto",
                DocsLink = "https://docs.pwabuilder.com/#/builder/manifest?id=handle_links-string",
                ErrorString = string.Empty,
                QuickFix = true,
            };
            handleLinksValidation.Test = (value) =>
            {
                if (value is not string strValue)
                {
                    handleLinksValidation.ErrorString =
                        "handle_links should be either auto, preferred or not-preferred";
                    return false;
                }

                var allowedValues = new[] { "auto", "preferred", "not-preferred" };
                if (!allowedValues.Contains(strValue))
                {
                    handleLinksValidation.ErrorString =
                        "handle_links should be either auto, preferred or not-preferred";
                    return false;
                }

                handleLinksValidation.ErrorString = string.Empty;
                return true;
            };
            manifestValidations.Add(handleLinksValidation);

            var scopeValidation = new ManifestSingleField
            {
                InfoString =
                    "The scope member is a string that represents the name of the web application as it is usually displayed to the user (e.g., amongst a list of other applications, or as a label for an icon)",
                DisplayString = "Manifest has scope field",
                Category = "optional",
                Member = "scope",
                DefaultValue = "/",
                DocsLink = "https://docs.pwabuilder.com/#/builder/manifest?id=scope-string",
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

            var shortNameValidation = new ManifestSingleField
            {
                InfoString =
                    "The short_name member is a string that represents the name of the web application displayed to the user if there is not enough space to display name. This name will show in the start menu on Windows and the homescreen on Android.",
                DisplayString = "Manifest has a short_name field",
                Category = "required",
                Member = "short_name",
                DefaultValue = "placeholder",
                DocsLink = "https://docs.pwabuilder.com/#/builder/manifest?id=short_name-string",
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

            var startUrlValidation = new ManifestSingleField
            {
                InfoString =
                    "The start_url member is a string that represents the start URL of the web application — the preferred URL that should be loaded when the user launches the web application",
                DisplayString = "Manifest has start_url field",
                Category = "required",
                Member = "start_url",
                DefaultValue = "/",
                DocsLink = "https://docs.pwabuilder.com/#/builder/manifest?id=start_url-string",
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

            var displayValidation = new ManifestSingleField
            {
                InfoString =
                    "The display member is a string that determines the developers' preferred display mode for the website. The display mode changes how much of browser UI is shown to the user and can range from browser (when the full browser window is shown) to fullscreen (when the app is fullscreened).",
                DisplayString = "Manifest has display field",
                Category = "recommended",
                Member = "display",
                DefaultValue = "standalone",
                DocsLink = "https://docs.pwabuilder.com/#/builder/manifest?id=display-string",
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

            var orientationValidation = new ManifestSingleField
            {
                InfoString =
                    "The orientation mode changes the default orientation of the app. For example, if set to 'portrait', the app will be displayed in landscape mode by default.",
                DisplayString = "Manifest has orientation field",
                Category = "recommended",
                Member = "orientation",
                DefaultValue = "any",
                DocsLink = "https://docs.pwabuilder.com/#/builder/manifest?id=orientation-string",
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

            var langValidation = new ManifestSingleField
            {
                InfoString =
                    "The lang member is a string that represents the default language of your PWA.",
                DisplayString = "Manifest specifies a language",
                Category = "optional",
                Member = "lang",
                DefaultValue = "en",
                DocsLink = "https://docs.pwabuilder.com/#/builder/manifest?id=lang-string",
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

            var dirValidation = new ManifestSingleField
            {
                InfoString =
                    "The dir member is a string that represents the default text direction of your PWA.",
                DisplayString = "Manifest specifies a default direction of text",
                Category = "optional",
                Member = "dir",
                DefaultValue = "ltr",
                DocsLink = "https://docs.pwabuilder.com/#/builder/manifest?id=dir-string",
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

            var scopeExtensionsValidation = new ManifestSingleField
            {
                InfoString =
                    "Allow PWA that control multiple subdomains and top level domains to behave as one contiguous app. E.g. a site may span example.com, example.co.uk and support.example.com",
                DisplayString = "Manifest has scope_extensions field",
                Category = "optional",
                Member = "scope_extensions",
                DefaultValue = new List<object>(),
                DocsLink =
                    "https://docs.pwabuilder.com/#/builder/manifest?id=scope_extensions-array",
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

            var idValidation = new ManifestSingleField
            {
                Member = "id",
                DisplayString = "Manifest has an app ID",
                InfoString =
                    "The id member is a string that represents the unique identifier of your PWA to the browser.",
                Category = "recommended",
                DefaultValue = "/",
                DocsLink = "https://developer.chrome.com/blog/pwa-manifest-id",
                ErrorString = string.Empty,
                QuickFix = true,
            };
            idValidation.Test = (value) =>
            {
                if (
                    value is not JsonElement jsonElement
                    || jsonElement.ValueKind != JsonValueKind.String
                    || string.IsNullOrWhiteSpace(jsonElement.GetString())
                )
                {
                    idValidation.ErrorString = "id must be a string with a length > 0";
                    return false;
                }

                return true;
            };
            manifestValidations.Add(idValidation);

            return manifestValidations;
        }

        public static ValidationsResult ValidateSingleField(string field, JsonElement webManifest)
        {
            var maniTests = GetValidations();

            if (webManifest.TryGetProperty(field, out JsonElement value))
            {
                var fieldTests = maniTests
                    .FindAll(v => v.Member.Equals(field))
                    .Select(r =>
                    {
                        var testResult = r.Test(value);
                        return new { Valid = testResult, Error = r.ErrorString };
                    });

                return new ValidationsResult
                {
                    Valid = fieldTests.All(r => r.Valid),
                    Exists = true,
                    Errors = fieldTests.Select(r => r.Error),
                };
            }

            return new ValidationsResult
            {
                Valid = true,
                Exists = false,
                Errors = ["Field not found"],
            };
        }

        public static IEnumerable<Validation> ValidateManifest(object? webManifest)
        {            
            if (webManifest is not JsonElement webManifestJson)
            {
                return [];
            }

            var maniTests = GetValidations();
            return maniTests.Select(r =>
            {
                var propertyExist = webManifestJson.TryGetProperty(
                    r.Member,
                    out JsonElement value
                );
                var testResult = r.Test(value);
                return new Validation
                {
                    Member = r.Member,
                    DisplayString = r.DisplayString,
                    InfoString = r.InfoString,
                    Category = r.Category,
                    DefaultValue = r.DefaultValue,
                    DocsLink = r.DocsLink,
                    ErrorString = r.ErrorString,
                    QuickFix = r.QuickFix,
                    TestRequired = r.TestRequired,
                    Valid = testResult && propertyExist,
                };
            });
        }
    }
}
