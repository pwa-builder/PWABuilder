using Newtonsoft.Json;
using PWABuilder.Validations.Models;
using PWABuilder.Validations.Schema;
using System.Text.Json;
using System.Text.RegularExpressions;

namespace PWABuilder.Validations
{
    public static class ManifestValidations
    {
        public static List<ManifestSingleField> GetValidations()
        {

            var manifestValidations = new List<ManifestSingleField>();

            var nameValidation = new ManifestSingleField
            {
                InfoString = "The name member is a string that represents the name of the web application...",
                DisplayString = "Manifest has name field",
                Category = "required",
                Member = "name",
                DefaultValue = "cool PWA",
                DocsLink = "https://docs.pwabuilder.com/#/builder/manifest?id=name-string",
                ErrorString = "name is required and can not be empty",
                QuickFix = true,
                Test = (value) =>
                {
                    if (value is not JsonElement jsonElement || jsonElement.ValueKind != JsonValueKind.String || string.IsNullOrWhiteSpace(jsonElement.GetString()))
                    {
                        return false;
                    }
                    var strValue = jsonElement.GetString();
                    return strValue.Equals(strValue.Trim());
                }
            };
            manifestValidations.Add(nameValidation);

            var backGroundColorValidation = new ManifestSingleField
            {
                InfoString = "The background_color member defines a placeholder background color for the application page to display before its stylesheet is loaded.",
                DisplayString = "Manifest has hex encoded background_color",
                Category = "recommended",
                Member = "background_color",
                DefaultValue = "#000000",
                DocsLink = "https://docs.pwabuilder.com/#/builder/manifest?id=background_color-string",
                ErrorString = "background_color should be a valid hex color",
                QuickFix = true,
                Test = (value) =>
                {
                    if (value is not JsonElement jsonElement || jsonElement.ValueKind != JsonValueKind.String)
                    {
                        return false;
                    }

                    if (jsonElement.GetString() is string colorValue)
                    {
                        return Regex.IsMatch(colorValue, "^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$");
                    }

                    return false;
                }
            };
            manifestValidations.Add(backGroundColorValidation);

            var shortcutsValidation = new ManifestSingleField
            {
                InfoString = "The shortcuts member defines an array of shortcuts or links...",
                DisplayString = "Manifest has shortcuts field",
                Category = "enhancement",
                Member = "shortcuts",
                DefaultValue = new List<object>(),
                DocsLink = "https://docs.pwabuilder.com/#/builder/manifest?id=shortcuts-array",
                ErrorString = string.Empty,
                QuickFix = true,
                Test = (value) =>
                {
                    if (value is not JsonElement jsonElement || jsonElement.ValueKind != JsonValueKind.Array)
                    {
                        return false;
                    }

                    foreach (var shortcut in jsonElement.EnumerateArray())
                    {
                        if (shortcut.TryGetProperty("icons", out var iconsObj) && iconsObj.ValueKind == JsonValueKind.Array)
                        {
                            foreach (var icon in iconsObj.EnumerateArray())
                            {
                                if (!icon.TryGetProperty("type", out var type) || type.ValueKind != JsonValueKind.String || type.GetString() is not string typeIcon || typeIcon != "image/webp" || typeIcon != "image/svg+xml")
                                    return false;
                            }
                        }
                    }
                    return true;
                }
            };
            manifestValidations.Add(shortcutsValidation);

            var categoryValidation = new ManifestSingleField
            {
                InfoString = "The categories member is an array of strings that represent the categories of the web application.",
                DisplayString = "Manifest has categories field",
                Category = "optional",
                Member = "categories",
                DefaultValue = new List<string>(),
                DocsLink = "https://docs.pwabuilder.com/#/builder/manifest?id=categories-array",
                ErrorString = "Categories should be an array of string category values",
                QuickFix = true,
                Test = (value) =>
                {
                    if (value is not JsonElement jsonElement || jsonElement.ValueKind != JsonValueKind.Array)
                    {
                        return false;
                    }

                    if (jsonElement.EnumerateArray().All(v => v.ValueKind == JsonValueKind.String))
                    {
                        return true;
                    }

                    return false;
                }
            };
            manifestValidations.Add(categoryValidation);

            var descriptionValidation = new ManifestSingleField
            {
                Member = "description",
                DisplayString = "Manifest has description field",
                InfoString = "The description member is a string that represents the description of your PWA.",
                Category = "recommended",
                DefaultValue = string.Empty,
                DocsLink = "https://docs.pwabuilder.com/#/builder/manifest?id=description-string",
                ErrorString = string.Empty,
                QuickFix = true,
            };
            descriptionValidation.Test = (value) =>
            {
                if (value is not JsonElement jsonElement || jsonElement.ValueKind != JsonValueKind.String || string.IsNullOrWhiteSpace(jsonElement.GetString()))
                {
                    descriptionValidation.ErrorString = "description must be a string with a length > 0";
                    return false;
                }

                var strValue = jsonElement.GetString();

                if (!strValue.Equals(strValue.Trim()))
                {
                    descriptionValidation.ErrorString = "description should not have any leading or trailing whitespace";
                    return false;
                }

                descriptionValidation.ErrorString = string.Empty;
                return true;
            };
            manifestValidations.Add(descriptionValidation);

            var fileHandlerValidation = new ManifestSingleField
            {
                Member = "file_handlers",
                DisplayString = "Manifest has file_handlers field",
                InfoString = "The file_handlers member specifies an array of objects representing the types of files an installed PWA can handle",
                Category = "enhancement",
                DefaultValue = new List<object>(),
                DocsLink = "https://docs.pwabuilder.com/#/builder/manifest?id=file_handlers-array",
                ErrorString = "file_handlers array should have objects with action and accept fields",
                QuickFix = true,
                Test = (value) =>
                {
                    if (value is not JsonElement jsonElement)
                    {
                        return false;
                    }
                    var result = FileHandlerSchema.ValidateFileHandlerSchema(jsonElement.GetRawText());
                    return result;
                }
            };
            manifestValidations.Add(fileHandlerValidation);

            var launchHandlerValidation = new ManifestSingleField
            {
                Member = "launch_handler",
                DisplayString = "Manifest has launch_handler field",
                InfoString = "The launch_handler member specifies how your app will launch when navigated to via URL, share_target etc.",
                Category = "recommended",
                DefaultValue = string.Empty,
                DocsLink = "https://docs.pwabuilder.com/#/builder/manifest?id=launch_handlers-string-array",
                ErrorString = string.Empty,
                QuickFix = false,
            };
            launchHandlerValidation.Test = (value) =>
            {
                if (value is not JsonElement jsonElement || jsonElement.ValueKind != JsonValueKind.Object)
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
                Member = "prefer_related_applications",
                DisplayString = "Manifest properly sets prefer_related_applications field",
                InfoString = "The prefer_related_applications member is a boolean value that specifies that applications listed in related_applications should be preferred over the web application. If the prefer_related_applications member is set to true, the user agent might suggest installing one of the related applications instead of this web app.",
                Category = "optional",
                DefaultValue = false,
                DocsLink = "https://docs.pwabuilder.com/#/builder/manifest?id=prefer_related_applications-boolean",
                ErrorString = string.Empty,
                QuickFix = false,
            };
            preferRelatedAppsValidation.Test = (value) =>
            {
                if (value is null)
                {
                    preferRelatedAppsValidation.ErrorString = "prefer_related_applications should be set to a boolean value";
                    return false;
                }

                if (value is bool)
                {
                    preferRelatedAppsValidation.ErrorString = string.Empty;
                    return true;
                }

                preferRelatedAppsValidation.ErrorString = "prefer_related_applications should be set to a boolean value";
                return false;
            };
            manifestValidations.Add(preferRelatedAppsValidation);

            var protocolHandlersValidation = new ManifestSingleField
            {
                Member = "protocol_handlers",
                DisplayString = "Manifest has protocol_handlers field",
                InfoString = "The protocol_handlers member specifies an array of objects that are protocols which this web app can register and handle. Protocol handlers register the application in an OS's application preferences; the registration associates a specific application with the given protocol scheme. For example, when using the protocol handler mailto:// on a web page, registered email applications open.",
                Category = "enhancement",
                DefaultValue = Array.Empty<object>(),
                DocsLink = "https://docs.pwabuilder.com/#/builder/manifest?id=protocol_handlers-array",
                ErrorString = string.Empty,
                QuickFix = true,
            };
            protocolHandlersValidation.Test = (value) =>
            {
                if (value is not JsonElement jsonElement || jsonElement.ValueKind != JsonValueKind.Array)
                {
                    protocolHandlersValidation.ErrorString = "protocol_handlers should be a non-empty array";
                    return false;
                }

                foreach (var item in jsonElement.EnumerateArray())
                {
                    if (item.ValueKind != JsonValueKind.Object)
                    {
                        protocolHandlersValidation.ErrorString = "Each protocol_handler must be a JSON object";
                        return false;
                    }

                    if (!item.TryGetProperty("protocol", out var protocolProp) || protocolProp.ValueKind != JsonValueKind.String)
                    {
                        protocolHandlersValidation.ErrorString = "Each protocol_handler must have a valid 'protocol'";
                        return false;
                    }

                    var protocol = protocolProp.GetString();
                    if (string.IsNullOrWhiteSpace(protocol) || !protocol.StartsWith("web+"))
                    {
                        protocolHandlersValidation.ErrorString = "Each protocol_handler must have a valid 'protocol'";
                        return false;
                    }

                    if (!item.TryGetProperty("url", out var urlProp) || urlProp.ValueKind != JsonValueKind.String)
                    {
                        protocolHandlersValidation.ErrorString = "Each protocol_handler must have a valid 'url'";
                        return false;
                    }

                    var url = urlProp.GetString();
                    if (string.IsNullOrWhiteSpace(url) || !(url.StartsWith("/") || url.StartsWith("./") || url.StartsWith("../")))
                    {
                        protocolHandlersValidation.ErrorString = "Each protocol_handler must have a relative 'url' (starting with '/', './', or '../')";
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
                InfoString = "The related_applications field is an array of objects specifying native applications that are installable by, or accessible to, the underlying platform — for example, a platform-specific (native) Windows application.",
                Category = "optional",
                DefaultValue = Array.Empty<object>(),
                DocsLink = "https://docs.pwabuilder.com/#/builder/manifest?id=related_applications-array",
                ErrorString = string.Empty,
                QuickFix = true,
            };
            relatedApplicationsValidation.Test = (value) =>
            {
                if (value is not JsonElement jsonElement ||
                    (jsonElement.ValueKind != JsonValueKind.Array && jsonElement.ValueKind != JsonValueKind.Null))
                {
                    relatedApplicationsValidation.ErrorString = "related_applications should contain a valid store, url and id";
                    return false;
                }

                if (jsonElement.ValueKind == JsonValueKind.Array && jsonElement.GetArrayLength() == 0)
                {
                    relatedApplicationsValidation.ErrorString = string.Empty;
                    return true;
                }

                foreach (var app in jsonElement.EnumerateArray())
                {
                    if (!app.TryGetProperty("platform", out var _) ||
                        !app.TryGetProperty("url", out var _) ||
                        !app.TryGetProperty("id", out var _))
                    {
                        relatedApplicationsValidation.ErrorString = "related_applications should contain a valid store, url and id";
                        return false;
                    }
                }

                relatedApplicationsValidation.ErrorString = string.Empty;
                return true;
            };
            manifestValidations.Add(relatedApplicationsValidation);

            var screenshotsValidation = new ManifestSingleField
            {
                Member = "screenshots",
                DisplayString = "Manifest has screenshots field",
                InfoString = "The screenshots member defines an array of screenshots intended to showcase the application.",
                Category = "recommended",
                DefaultValue = JsonConvert.SerializeObject(new[]
                {
                    new
                    {
                        src = "https://www.pwabuilder.com/assets/screenshots/screen1.png",
                        sizes = "2880x1800",
                        type = "image/png",
                        description = "PWABuilder Home Screen"
                    },
                    new
                    {
                        src = "https://www.pwabuilder.com/assets/screenshots/screen2.png",
                        sizes = "2880/1800",
                        type = "image/png",
                        description = "PWABuilder Report Card"
                    },
                    new
                    {
                        src = "https://www.pwabuilder.com/assets/screenshots/screen3.png",
                        sizes = "2880x1800",
                        type = "image/png",
                        description = "Manifest information on the Report Card"
                    }
                }),
                DocsLink = "https://docs.pwabuilder.com/#/builder/manifest?id=screenshots",
                ErrorString = "Screenshots must be an array of screenshot objects",
                QuickFix = true,
            };
            screenshotsValidation.Test = (value) =>
            {
                if (value is not JsonElement jsonElement || jsonElement.ValueKind != JsonValueKind.Array)
                {
                    screenshotsValidation.TestRequired = true;
                    screenshotsValidation.ErrorString = "Screenshots must be an array of screenshot objects";
                    return false;
                }

                screenshotsValidation.TestRequired = true;
                screenshotsValidation.ErrorString = string.Empty;
                return true;
            };
            manifestValidations.Add(screenshotsValidation);

            var shareTargetValidation = new ManifestSingleField
            {
                Member = "share_target",
                DisplayString = "Manifest has share_target field",
                InfoString = "share_target enables your app to get shared content from other apps",
                Category = "enhancement",
                DefaultValue = JsonConvert.SerializeObject(new
                {
                    action = "/share-target/",
                    methods = new[] { "GET" },
                    @params = new
                    {
                        title = "title",
                        text = "text",
                        url = "url"
                    }
                }),
                DocsLink = "https://docs.pwabuilder.com/#/home/native-features?id=web-share-api",
                ErrorString = "share_target must be an object",
                QuickFix = true,
            };
            shareTargetValidation.Test = (value) =>
            {
                if (value is not JsonElement jsonElement || jsonElement.ValueKind != JsonValueKind.Object)
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
                InfoString = "The theme_color member is a string that defines the default theme color for the application.",
                Category = "recommended",
                DefaultValue = "#000000",
                DocsLink = "https://docs.pwabuilder.com/#/builder/manifest?id=theme_color-string",
                ErrorString = "theme_color should be a valid hex color",
                QuickFix = true,
            };
            themeColorValidation.Test = (value) =>
            {
                if (value is not JsonElement jsonElement || jsonElement.ValueKind != JsonValueKind.String || string.IsNullOrWhiteSpace(jsonElement.GetString()))
                {
                    themeColorValidation.ErrorString = "theme_color should be a valid hex color";
                    return false;
                }

                var hexRegex = new Regex("^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$");
                var isValid = hexRegex.IsMatch(jsonElement.GetString());

                if (!isValid)
                {
                    themeColorValidation.ErrorString = "theme_color should be a valid hex color";
                }
                else
                {
                    themeColorValidation.ErrorString = string.Empty;
                }

                return isValid;
            };
            manifestValidations.Add(themeColorValidation);

            var iarcRatingIdValidation = new ManifestSingleField
            {
                Member = "iarc_rating_id",
                DisplayString = "Manifest has iarc_rating_id field",
                InfoString = "The iarc_rating_id member is a string that represents the International Age Rating Coalition (IARC) certification code of the web application. It is intended to be used to determine which ages the web application is appropriate for.",
                Category = "optional",
                DefaultValue = string.Empty,
                DocsLink = "https://docs.pwabuilder.com/#/builder/manifest?id=iarc_rating_id-string",
                ErrorString = "iarc_rating_id must be a string with a length > 0",
                QuickFix = true,
            };
            iarcRatingIdValidation.Test = (value) =>
            {
                if (value is string strValue && strValue.Length > 0)
                {
                    iarcRatingIdValidation.ErrorString = string.Empty;
                    return true;
                }

                iarcRatingIdValidation.ErrorString = "iarc_rating_id must be a string with a length > 0";
                return false;
            };
            manifestValidations.Add(iarcRatingIdValidation);

            var widgetValidation = new ManifestSingleField
            {
                Member = "widgets",
                DisplayString = "Manifest has widgets field",
                InfoString = "Enable Windows 11 widgets board support",
                Category = "enhancement",
                DefaultValue = new List<object>(),
                DocsLink = "https://learn.microsoft.com/en-us/microsoft-edge/progressive-web-apps-chromium/how-to/widgets",
                QuickFix = true,
                ErrorString = "widgets should be an array of valid objects",
                Test = (value) =>
                {
                    if (value is not JsonElement jsonElement)
                    {
                        return false;
                    }
                    var validation = WidgetsSchema.ValidateWidgetSchema(jsonElement.GetRawText());
                    return validation;
                }
            };
            manifestValidations.Add(widgetValidation);

            var iconsValidation = new ManifestSingleField
            {
                Member = "icons",
                DisplayString = "Manifest has icons field",
                InfoString = "The icons member specifies an array of objects representing image files that can serve as application icons for different contexts.",
                Category = "required",
                DefaultValue = JsonConvert.SerializeObject(new[]
                {
                    new Icon { Src = "https://www.pwabuilder.com/assets/icons/icon_192.png", Sizes = "192x192", Type = "image/png", Purpose = "any" },
                    new Icon { Src = "https://www.pwabuilder.com/assets/icons/icon_512.png", Sizes = "512x512", Type = "image/png", Purpose = "maskable" }
                }),
                DocsLink = "https://docs.pwabuilder.com/#/builder/manifest?id=icons",
                ErrorString = string.Empty,
                QuickFix = true,
            };
            iconsValidation.Test = (value) =>
            {
                if (value is not JsonElement jsonElement || jsonElement.ValueKind != JsonValueKind.Array || jsonElement.GetArrayLength() == 0)
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
                    iconsValidation.ErrorString = "Separate icons are needed for both maskable and any";
                    return false;
                }

                var icon512 = icons.FirstOrDefault(icon =>
                {
                    var size = icon.GetSize();
                    return size.HasValue && size.Value.Width >= 512 && size.Value.Height >= 512 && icon.IsPngOrSvg();
                });

                if (icon512 == null)
                {
                    iconsValidation.ErrorString = "Need at least one PNG or SVG icon 512x512 or larger";
                    return false;
                }

                iconsValidation.ErrorString = string.Empty;
                return true;
            };
            manifestValidations.Add(iconsValidation);

            var iconsPurposeAnyValidation = new ManifestSingleField
            {
                Member = "icons",
                DisplayString = "Icons have at least one icon with purpose any",
                InfoString = "The icons member specifies an array of objects representing image files that can serve as application icons for different contexts.",
                Category = "recommended",
                DefaultValue = iconsValidation.DefaultValue,
                DocsLink = "https://docs.pwabuilder.com/#/builder/manifest?id=icons",
                ErrorString = "Need at least one icon with purpose set to any",
                QuickFix = true,
            };
            iconsPurposeAnyValidation.Test = (value) =>
            {
                if (value is not JsonElement jsonElement || jsonElement.ValueKind != JsonValueKind.Array || jsonElement.GetArrayLength() == 0)
                    return false;

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
                Member = "edge_side_panel",
                DisplayString = "Manifest has edge_side_panel field",
                InfoString = "The edge_side_panel member specifies if your app supports the side panel in the Edge browser.",
                Category = "enhancement",
                DefaultValue = string.Empty,
                DocsLink = "https://docs.pwabuilder.com/#/builder/manifest?id=edge_side_panel-object",
                ErrorString = "The value entered for edge_side_panel.preferred_width should be a number",
                QuickFix = false,
            };
            edgeSidePanelValidation.Test = (value) =>
            {
                if (value is not JsonElement jsonElement || jsonElement.ValueKind != JsonValueKind.Object)
                {
                    edgeSidePanelValidation.ErrorString = "edge_side_panel should be an object";
                    return false;
                }

                if (jsonElement.TryGetProperty("preferred_width", out var widthProp))
                {
                    if (widthProp.ValueKind != JsonValueKind.Number)
                    {
                        edgeSidePanelValidation.ErrorString = "The value entered for edge_side_panel.preferred_width should be a number";
                        return false;
                    }
                }

                edgeSidePanelValidation.ErrorString = string.Empty;
                return true;
            };
            manifestValidations.Add(edgeSidePanelValidation);

            var displayOverrideValidation = new ManifestSingleField
            {
                Member = "display_override",
                DisplayString = "Manifest has display_override field",
                InfoString = "Its value is an array of display modes that are considered in-order, and the first supported display mode is applied.",
                Category = "enhancement",
                DefaultValue = Array.Empty<string>(),
                DocsLink = "https://docs.pwabuilder.com/#/builder/manifest?id=display_override-array",
                ErrorString = string.Empty,
                QuickFix = true,
            };
            displayOverrideValidation.Test = (value) =>
            {
                if (value is not JsonElement jsonElement || jsonElement.ValueKind != JsonValueKind.Array)
                {
                    displayOverrideValidation.ErrorString = "display_override must be a non-empty array";
                    return false;
                }

                bool hasOverlay = false;
                foreach (var item in jsonElement.EnumerateArray())
                {
                    if (item.ValueKind == JsonValueKind.String && item.GetString() == "window-controls-overlay")
                    {
                        hasOverlay = true;
                        break;
                    }
                }

                if (!hasOverlay)
                {
                    displayOverrideValidation.ErrorString = "display_override array should have window-controls-overlay value";
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
                InfoString = "The handle_links field specifies how links to your app are opened, either in your app itself or in the users browser",
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
                    handleLinksValidation.ErrorString = "handle_links should be either auto, preferred or not-preferred";
                    return false;
                }

                var allowedValues = new[] { "auto", "preferred", "not-preferred" };
                if (!allowedValues.Contains(strValue))
                {
                    handleLinksValidation.ErrorString = "handle_links should be either auto, preferred or not-preferred";
                    return false;
                }

                handleLinksValidation.ErrorString = string.Empty;
                return true;
            };
            manifestValidations.Add(handleLinksValidation);


            return manifestValidations;
        }

        public static ValidationsResult ValidateSingleField(string field, JsonElement webManifest)
        {
            var maniTests = GetValidations();

            if(webManifest.TryGetProperty(field, out JsonElement value))
            {
                var fieldTests = maniTests.FindAll(v => v.Member.Equals(field)).Select(r =>
                {
                    var testResult = r.Test(value);
                    return new { Valid = testResult, Error = r.ErrorString };
                });

                return new ValidationsResult { Valid = fieldTests.All(r => r.Valid), Exists = true, Errors = fieldTests.Select(r => r.Error) };
            }

            return new ValidationsResult { Valid = true, Exists = false, Errors = ["Field not found"] };
        }
    }
}
