using System.Text.Json.Serialization;

namespace PWABuilder.Models;

/// <summary>
/// A check for a capability of a progressive web app (PWA). For example, the ability to work offline, or the presence of icons in the PWA's manifest.
/// </summary>;
public class PwaCapability
{
    /// <summary>
    /// The type of capability.
    /// </summary>
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public PwaCapabilityLevel Level { get; set; }

    /// <summary>
    /// The category of the capability.
    /// </summary>
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public PwaCapabilityCategory Category { get; set; }

    /// <summary>
    /// The ID of the capability check.
    /// </summary>
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public required PwaCapabilityId Id { get; set; }

    /// <summary>
    /// The manifest field associated with this capability.
    /// </summary>
    public string? Field { get; set; }

    /// <summary>
    /// The proper name the PWA feature. If the <see cref="Level"/> is a <see cref="PwaCapabilityLevel.Feature"/> value, this should be the name of the feature. For example, "Share Target"
    /// </summary>
    public string? FeatureName { get; set; }

    /// <summary>
    /// The URL to an icon representing the feature. If the <see cref="Level"/> is a <see cref="PwaCapabilityLevel.Feature"/> value, this should be the URL of the feature's icon.
    /// </summary>
    public Uri? FeatureIcon { get; set; }

    /// <summary>
    /// A description of the capability. For example, "The manifest file should include screenshots for a richer install experience."
    /// </summary>
    public required string Description { get; set; }

    /// <summary>
    /// A sentence describing the action the user should take to implement the capability. For example, "Let your app work offline", or "Add screenshots".
    /// </summary>
    public required string TodoAction { get; set; }

    /// <summary>
    /// The URL to learn more about the action item.
    /// </summary>
    public Uri? LearnMoreUrl { get; set; }

    /// <summary>
    /// The URL to an image representing the feature. For example, the URL of an image showing PWA shortcuts.
    /// </summary>
    public Uri? ImageUrl { get; set; }

    /// <summary>
    /// The status of the PWA capability check.
    /// </summary>
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public PwaCapabilityCheckStatus Status { get; set; }

    /// <summary>
    /// The error message if the capability was checked and found not to be present.
    /// </summary>
    public string? ErrorMessage { get; set; }

    /// <summary>
    /// Create a list of all progressive web app manifest-based capabilities and validations.
    /// </summary>
    /// <returns></returns>
    public static List<PwaCapability> CreateManifestCapabilities()
    {
        return
        [
            new PwaCapability
            {
                Id = PwaCapabilityId.HasManifest,
                Description = "A web manifest is a JSON text file that provides information about a web app.",
                TodoAction = "Create a web manifest for your web app.",
                Level = PwaCapabilityLevel.Required,
                FeatureName = null,
                FeatureIcon = null,
                ImageUrl = null,
                LearnMoreUrl = new Uri("https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest"),
                Category = PwaCapabilityCategory.WebAppManifest,
                Status = PwaCapabilityCheckStatus.InProgress
            },
            new PwaCapability
            {
                Id = PwaCapabilityId.Name,
                Description = "The name manifest member is used to specify the full name of your web application as it's usually displayed to users, such as in application lists or as a label for your application's icon.",
                TodoAction = "Add a name property to your manifest.",
                Level = PwaCapabilityLevel.Required,
                FeatureName = null,
                FeatureIcon = null,
                ImageUrl = null,
                Field = "name",
                LearnMoreUrl = new Uri("https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest/Reference/name"),
                Category = PwaCapabilityCategory.WebAppManifest,
                Status = PwaCapabilityCheckStatus.InProgress
            },
            new PwaCapability
            {
                Id = PwaCapabilityId.Description,
                Description = "The description manifest member is used to explain the core features or functionality of your web application. This text helps users understand your app's purpose. This string can show up in the browser's PWA installation dialog for your app.",
                TodoAction = "Enrich your PWA's installation experience with a description.",
                Level = PwaCapabilityLevel.Recommended,
                FeatureName = null,
                FeatureIcon = null,
                Field = "description",
                ImageUrl = new Uri("/assets/manifest_examples/rich-install.webp", UriKind.Relative),
                LearnMoreUrl = new Uri("https://docs.pwabuilder.com/#/builder/manifest?id=description-string"),
                Category = PwaCapabilityCategory.WebAppManifest,
                Status = PwaCapabilityCheckStatus.InProgress
            },
            new PwaCapability
            {
                Id = PwaCapabilityId.BackgroundColor,
                Description = "The background_color manifest member is used to specify an initial background color for your web application. This color appears in the application window before your application's stylesheets have loaded.",
                TodoAction = "Add a background_color property to your manifest.",
                FeatureName = null,
                FeatureIcon = null,
                Field = "background_color",
                Level = PwaCapabilityLevel.Recommended,
                LearnMoreUrl = new Uri("https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest/Reference/background_color"),
                Category = PwaCapabilityCategory.WebAppManifest,
                Status = PwaCapabilityCheckStatus.InProgress
            },
            new PwaCapability
            {
                Id = PwaCapabilityId.Icons,
                Description = "The icons member is used to specify the icons for your web app. These icons are used in various places, such as the home screen, task switcher, and more.",
                TodoAction = "Add icons to your manifest.",
                FeatureName = null,
                FeatureIcon = null,
                Field = "icons",
                Level = PwaCapabilityLevel.Required,
                LearnMoreUrl = new Uri("https://docs.pwabuilder.com/#/builder/manifest?id=icons"),
                Category = PwaCapabilityCategory.WebAppManifest,
                Status = PwaCapabilityCheckStatus.InProgress
            },
            new PwaCapability
            {
                Id = PwaCapabilityId.HasSquare192x192PngAnyPurposeIcon,
                Description = "Your PWA must have a square, 192x192 or larger PNG icon with purpose set to any.",
                TodoAction = "Add a 192x192 PNG icon to your manifest.",
                FeatureName = null,
                FeatureIcon = null,
                Field = "icons",
                Level = PwaCapabilityLevel.Required,
                LearnMoreUrl = new Uri("https://docs.pwabuilder.com/#/builder/manifest?id=icons"),
                Category = PwaCapabilityCategory.WebAppManifest,
                Status = PwaCapabilityCheckStatus.InProgress
            },
            new PwaCapability
            {
                Id = PwaCapabilityId.HasSquare512x512PngAnyPurposeIcon,
                Description = "A square, 512x512 or larger PNG image with purpose set to any is recommended for packaging your PWA for app stores.",
                TodoAction = "Add a 512x512 PNG icon to your manifest.",
                FeatureName = null,
                FeatureIcon = null,
                Field = "icons",
                Level = PwaCapabilityLevel.Recommended,
                LearnMoreUrl = new Uri("https://docs.pwabuilder.com/#/builder/manifest?id=icons"),
                Category = PwaCapabilityCategory.WebAppManifest,
                Status = PwaCapabilityCheckStatus.InProgress
            },
            new PwaCapability
            {
                Id = PwaCapabilityId.Shortcuts,
                Description = "The shortcuts member defines an array of shortcuts or links to key tasks or pages within a web app. Shortcuts will show as jumplists on Windows and on the home screen on Android.",
                TodoAction = "Let users jump to key tasks or pages in your app by adding shortcuts to your manifest.",
                Level = PwaCapabilityLevel.Feature,
                FeatureName = "Shortcuts",
                FeatureIcon = new Uri("/assets/new/shortcuts_icon.svg", UriKind.Relative),
                Field = "shortcuts",
                LearnMoreUrl = new Uri("https://docs.pwabuilder.com/#/builder/manifest?id=shortcuts-array"),
                ImageUrl = new Uri("/assets/manifest_examples/shortcuts_example_image.jpg", UriKind.Relative),
                Category = PwaCapabilityCategory.WebAppManifest,
                Status = PwaCapabilityCheckStatus.InProgress
            },
            new PwaCapability
            {
                Id = PwaCapabilityId.Categories,
                Description = "The categories member is an array of strings that represent the categories of the web application.",
                TodoAction = "Enrich your PWA's install experience by adding categories to your manifest.",
                Level = PwaCapabilityLevel.Optional,
                FeatureName = null,
                FeatureIcon = null,
                Field = "categories",
                LearnMoreUrl = new Uri("https://docs.pwabuilder.com/#/builder/manifest?id=categories-array"),
                ImageUrl = null,
                Category = PwaCapabilityCategory.WebAppManifest,
                Status = PwaCapabilityCheckStatus.InProgress
            },
            new PwaCapability
            {
                Id = PwaCapabilityId.FileHandlers,
                Description = "The file_handlers member specifies an array of objects representing the types of files an installed PWA can open.",
                TodoAction = "Enable your PWA to open files by adding file_handlers to your manifest.",
                Level = PwaCapabilityLevel.Feature,
                FeatureName = "File Handlers",
                FeatureIcon = new Uri("/assets/new/file_handlers_icon.svg", UriKind.Relative),
                Field = "file_handlers",
                LearnMoreUrl = new Uri("https://docs.pwabuilder.com/#/builder/manifest?id=file_handlers-array"),
                ImageUrl = null,
                Category = PwaCapabilityCategory.WebAppManifest,
                Status = PwaCapabilityCheckStatus.InProgress
            },
            new PwaCapability
            {
                Id = PwaCapabilityId.LaunchHandler,
                Description = "The launch_handler member specifies how your app will launch when navigated to via URL, share_target etc.",
                TodoAction = "Take control over how your app is launched -- single instance? focus existing? navigate in new window? -- by adding launch_handler to your manifest.",
                Level = PwaCapabilityLevel.Feature,
                FeatureName = "Launch Handler",
                FeatureIcon = new Uri("/assets/new/launch_handler_icon.png", UriKind.Relative),
                Field = "launch_handler",
                LearnMoreUrl = new Uri("https://docs.pwabuilder.com/#/builder/manifest?id=launch_handler-object"),
                ImageUrl = null,
                Category = PwaCapabilityCategory.WebAppManifest,
                Status = PwaCapabilityCheckStatus.InProgress
            },
            new PwaCapability
            {
                Id = PwaCapabilityId.ProtocolHandlers,
                Description = "The protocol_handlers member specifies an array of objects that are protocols which this web app can register and handle. Protocol handlers register the application in an OS's application preferences; the registration associates a specific application with the given protocol scheme. For example, when using the protocol handler mailto:// on a web page, registered email applications open.",
                TodoAction = "Specify whether you want users to use your PWA or your native app.",
                Level = PwaCapabilityLevel.Feature,
                FeatureName = "Protocol Handlers",
                FeatureIcon = new Uri("/assets/new/protocol_handlers_icon.svg", UriKind.Relative),
                Field = "protocol_handlers",
                LearnMoreUrl = new Uri("https://docs.pwabuilder.com/#/builder/manifest?id=protocol_handlers-array"),
                ImageUrl = null,
                Category = PwaCapabilityCategory.WebAppManifest,
                Status = PwaCapabilityCheckStatus.InProgress
            },
            new PwaCapability
            {
                Id = PwaCapabilityId.PreferRelatedApplication,
                Description = "The prefer_related_applications member is a boolean value that specifies that applications listed in related_applications should be preferred over the web application. If the prefer_related_applications member is set to true, the user agent might suggest installing one of the related applications instead of this web app.",
                TodoAction = "Specify whether you want users to use your PWA or your native app.",
                Level = PwaCapabilityLevel.Optional,
                FeatureName = null,
                FeatureIcon = null,
                Field = "prefer_related_applications",
                LearnMoreUrl = new Uri("https://docs.pwabuilder.com/#/builder/manifest?id=prefer_related_applications-boolean"),
                ImageUrl = null,
                Category = PwaCapabilityCategory.WebAppManifest,
                Status = PwaCapabilityCheckStatus.InProgress
            },
            new PwaCapability
            {
                Id = PwaCapabilityId.RelatedApplications,
                Description = "The related_applications member specifies an array of objects that are related applications to the web app. This can include native applications that the user can install or use in conjunction with the web app.",
                TodoAction = "Specify your native app ID by adding related_applications to your manifest.",
                Level = PwaCapabilityLevel.Optional,
                FeatureName = null,
                FeatureIcon = null,
                Field = "related_applications",
                LearnMoreUrl = new Uri("https://docs.pwabuilder.com/#/builder/manifest?id=related_applications-array"),
                ImageUrl = null,
                Category = PwaCapabilityCategory.WebAppManifest,
                Status = PwaCapabilityCheckStatus.InProgress
            },
            new PwaCapability
            {
                Id = PwaCapabilityId.Screenshots,
                Description = "The screenshots member defines an array of screenshots intended to showcase your app.",
                TodoAction = "Add screenshots to showcase your app.",
                Level = PwaCapabilityLevel.Recommended,
                FeatureName = null,
                FeatureIcon = null,
                Field = "screenshots",
                LearnMoreUrl = new Uri("https://docs.pwabuilder.com/#/builder/manifest?id=screenshots-array"),
                ImageUrl = null,
                Category = PwaCapabilityCategory.WebAppManifest,
                Status = PwaCapabilityCheckStatus.InProgress
            },
            new PwaCapability
            {
                Id = PwaCapabilityId.ScreenshotsAreFetchable,
                Description = "The screenshots in your web manifest must be fetchable on the network.",
                TodoAction = "Fix the links to your screenshots..",
                Level = PwaCapabilityLevel.Recommended,
                FeatureName = null,
                FeatureIcon = null,
                Field = "screenshots",
                LearnMoreUrl = new Uri("https://docs.pwabuilder.com/#/builder/manifest?id=screenshots-array"),
                ImageUrl = null,
                Category = PwaCapabilityCategory.WebAppManifest,
                Status = PwaCapabilityCheckStatus.InProgress
            },
            new PwaCapability
            {
                Id = PwaCapabilityId.HasWideScreenshot,
                Description = "At least one screenshot in your manifest should have a wide form_factor, showcasing your app on desktop devices.",
                TodoAction = "Add wide screenshots to your manifest.",
                Level = PwaCapabilityLevel.Optional,
                FeatureName = null,
                FeatureIcon = null,
                Field = "screenshots",
                LearnMoreUrl = new Uri("https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest/Reference/screenshots#form_factor"),
                ImageUrl = null,
                Category = PwaCapabilityCategory.WebAppManifest,
                Status = PwaCapabilityCheckStatus.InProgress
            },
            new PwaCapability
            {
                Id = PwaCapabilityId.HasNarrowScreenshot,
                Description = "At least one screenshot in your manifest should have a narrow form_factor, showcasing your app on mobile devices.",
                TodoAction = "Add narrow screenshots to your manifest.",
                Level = PwaCapabilityLevel.Optional,
                FeatureName = null,
                FeatureIcon = null,
                Field = "screenshots",
                LearnMoreUrl = new Uri("https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest/Reference/screenshots#form_factor"),
                ImageUrl = null,
                Category = PwaCapabilityCategory.WebAppManifest,
                Status = PwaCapabilityCheckStatus.InProgress
            },
            new PwaCapability
            {
                Id = PwaCapabilityId.ShareTarget,
                Description = "share_target enables your app to receive content shared from other apps.",
                TodoAction = "Make your app appear in the OS share tray by adding share_target to your manifest.",
                Level = PwaCapabilityLevel.Feature,
                FeatureName = "Share Target",
                FeatureIcon = new Uri("/assets/manifest_examples/share_target_example_image.jpg", UriKind.Relative),
                Field = "share_target",
                LearnMoreUrl = new Uri("https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest/Reference/screenshots#form_factor"),
                ImageUrl = new Uri("/assets/manifest_examples/share_target_example_image.jpg", UriKind.Relative),
                Category = PwaCapabilityCategory.WebAppManifest,
                Status = PwaCapabilityCheckStatus.InProgress
            },
            new PwaCapability
            {
                Id = PwaCapabilityId.ThemeColor,
                Description = "The theme_color sets the color of the app's title bar and can be reflected in the app's preview in task switchers.",
                TodoAction = "Customize your app's title bar color by adding theme_color to your manifest.",
                Level = PwaCapabilityLevel.Recommended,
                FeatureName = null,
                FeatureIcon = null,
                Field = "theme_color",
                LearnMoreUrl = new Uri("https://docs.pwabuilder.com/#/builder/manifest?id=theme_color-string"),
                ImageUrl = null,
                Category = PwaCapabilityCategory.WebAppManifest,
                Status = PwaCapabilityCheckStatus.InProgress
            },
            new PwaCapability
            {
                Id = PwaCapabilityId.IarcRatingId,
                Description = "The iarc_rating_id member is a string that represents the International Age Rating Coalition (IARC) certification code of the web application. It is intended to be used to determine which ages the web application is appropriate for.",
                TodoAction = "Let users know what ages your app is designed for by adding an IARC rating to your manifest.",
                Level = PwaCapabilityLevel.Optional,
                FeatureName = null,
                FeatureIcon = null,
                Field = "iarc_rating_id",
                LearnMoreUrl = new Uri("https://docs.pwabuilder.com/#/builder/manifest?id=iarc_rating_id-string"),
                ImageUrl = null,
                Category = PwaCapabilityCategory.WebAppManifest,
                Status = PwaCapabilityCheckStatus.InProgress
            },
            new PwaCapability
            {
                Id = PwaCapabilityId.Widgets,
                Description = "Widgets are adaptive cards with text, images, an actions related to your app. On Windows, widgets appear over the desktp when the user clicks the widget taskbar icon or presses Win+W.",
                TodoAction = "Let users add your app as a widget.",
                Level = PwaCapabilityLevel.Feature,
                FeatureName = "Widgets",
                FeatureIcon = new Uri("/assets/new/widgets_icon.svg", UriKind.Relative),
                Field = "widgets",
                LearnMoreUrl = new Uri("https://learn.microsoft.com/en-us/microsoft-edge/progressive-web-apps-chromium/how-to/widgets"),
                ImageUrl = new Uri("/assets/manifest_examples/windows11-widgets.webp", UriKind.Relative),
                Category = PwaCapabilityCategory.WebAppManifest,
                Status = PwaCapabilityCheckStatus.InProgress
            },
            new PwaCapability
            {
                Id = PwaCapabilityId.EdgeSidePanel,
                Description = "The edge_side_panel member specifies if your app supports the side panel in Microsoft Edge.",
                TodoAction = "Make your app pinnable to the sidebar by adding edge_side_panel to your manifest.",
                Level = PwaCapabilityLevel.Feature,
                FeatureName = "Edge Side Panel",
                FeatureIcon = new Uri("/assets/new/edge_side_panel_icon.svg", UriKind.Relative),
                Field = "edge_side_panel",
                LearnMoreUrl = new Uri("https://docs.pwabuilder.com/#/builder/manifest?id=edge_side_panel-object"),
                ImageUrl = new Uri("/assets/manifest_examples/windows11-widgets.webp", UriKind.Relative),
                Category = PwaCapabilityCategory.WebAppManifest,
                Status = PwaCapabilityCheckStatus.InProgress
            },
            new PwaCapability
            {
                Id = PwaCapabilityId.WindowControlsOverlay,
                Description = "The window-controls-overlay display mode allows you to customize your PWA's title bar, enabling a more app-like experience.",
                TodoAction = "Customize your app's title bar by adding windows-control-overlay to your manifest's display_override.",
                Level = PwaCapabilityLevel.Feature,
                FeatureName = "Window Controls Overlay",
                FeatureIcon = new Uri("/assets/new/display_override_icon.svg", UriKind.Relative),
                Field = "display_override",
                LearnMoreUrl = new Uri("https://docs.pwabuilder.com/#/builder/manifest?id=display_override-array"),
                ImageUrl = new Uri("/assets/manifest_examples/display_override_example_image.png", UriKind.Relative),
                Category = PwaCapabilityCategory.WebAppManifest,
                Status = PwaCapabilityCheckStatus.InProgress
            },
            new PwaCapability
            {
                Id = PwaCapabilityId.TabbedDisplay,
                Description = "The tabbed display mode allows your PWA to act as a multi-document interface, allowing for multiple tabs to be opened inside your PWA.",
                TodoAction = "Let users open multiple tabs within your PWA by adding tabbed to your manifest's display_override.",
                Level = PwaCapabilityLevel.Feature,
                FeatureName = "Tabbed Display",
                FeatureIcon = new Uri("/assets/new/tabbed_display_icon.png", UriKind.Relative),
                Field = "display_override",
                LearnMoreUrl = new Uri("https://developer.chrome.com/docs/capabilities/tabbed-application-mode"),
                ImageUrl = new Uri("/assets/manifest_examples/tabbed-display.webp", UriKind.Relative),
                Category = PwaCapabilityCategory.WebAppManifest,
                Status = PwaCapabilityCheckStatus.InProgress
            },
            new PwaCapability
            {
                Id = PwaCapabilityId.Scope,
                Description = "The scope member is a string that represents the name of the web application as it is usually displayed to the user (e.g., amongst a list of other applications, or as a label for an icon).",
                TodoAction = "Define the scope of your PWA by adding a scope field to your manifest.",
                Level = PwaCapabilityLevel.Optional,
                FeatureName = null,
                FeatureIcon = null,
                Field = "scope",
                LearnMoreUrl = new Uri("https://docs.pwabuilder.com/#/builder/manifest?id=scope-string"),
                ImageUrl = null,
                Category = PwaCapabilityCategory.WebAppManifest,
                Status = PwaCapabilityCheckStatus.InProgress
            },
            new PwaCapability
            {
                Id = PwaCapabilityId.ShortName,
                Description = "The short_name member is a string that represents the name of the web application displayed to the user if there is not enough space to display name. This name will show in the start menu on Windows and the homescreen on Android.",
                TodoAction = "Define your app's short name by adding short_name to your manifest.",
                Level = PwaCapabilityLevel.Required,
                FeatureName = null,
                FeatureIcon = null,
                Field = "short_name",
                LearnMoreUrl = new Uri("https://docs.pwabuilder.com/#/builder/manifest?id=short_name-string"),
                ImageUrl = null,
                Category = PwaCapabilityCategory.WebAppManifest,
                Status = PwaCapabilityCheckStatus.InProgress
            }
        ];

        /**

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
        */
    }
}