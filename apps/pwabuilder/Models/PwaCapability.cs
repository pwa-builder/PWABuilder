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
    /// Indicates whether the capability check is for the existence of a manifest field. This should be true for checks like "does your manifest have a display field?" It should be false for checks like, "Do you have a 512x512 PNG icon in your manifest?"
    /// </summary>
    public bool IsFieldExistenceCheck { get; set; }

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
    /// Copies descriptive fields from another capability.
    /// </summary>
    /// <param name="other"></param>
    public void Copy(PwaCapability other)
    {
        // Copy all writable instance properties from the other capability to this one.
        var properties = typeof(PwaCapability).GetProperties(System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.Instance)
            .Where(p => p.CanWrite);
        foreach (var prop in properties)
        {
            var value = prop.GetValue(other);
            prop.SetValue(this, value);
        }
    }

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
                TodoAction = "Create a web app manifest.",
                Level = PwaCapabilityLevel.Required,
                FeatureName = null,
                FeatureIcon = null,
                ImageUrl = null,
                Field = null,
                IsFieldExistenceCheck = false,
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
                IsFieldExistenceCheck = true,
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
                IsFieldExistenceCheck = true,
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
                IsFieldExistenceCheck = true,
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
                IsFieldExistenceCheck = true,
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
                IsFieldExistenceCheck = false,
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
                IsFieldExistenceCheck = false,
                Level = PwaCapabilityLevel.Recommended,
                LearnMoreUrl = new Uri("https://docs.pwabuilder.com/#/builder/manifest?id=icons"),
                Category = PwaCapabilityCategory.WebAppManifest,
                Status = PwaCapabilityCheckStatus.InProgress
            },
            new PwaCapability
            {
                Id = PwaCapabilityId.IconsAreFetchable,
                Description = "The icons in your web manifest must be fetchable and must have an image content-type.",
                TodoAction = "Fix the links to your icons in your web manifest.",
                Level = PwaCapabilityLevel.Required,
                FeatureName = null,
                FeatureIcon = null,
                IsFieldExistenceCheck = false,
                Field = "icons",
                LearnMoreUrl = new Uri("https://docs.pwabuilder.com/#/builder/manifest?id=icons"),
                ImageUrl = null,
                Category = PwaCapabilityCategory.WebAppManifest,
                Status = PwaCapabilityCheckStatus.InProgress
            },
            new PwaCapability
            {
                Id = PwaCapabilityId.IconTypesAreValid,
                Description = "The declared types of icons in your web manifest must match their actual file types.",
                TodoAction = "Fix the icon types in your web manifest.",
                Level = PwaCapabilityLevel.Required,
                FeatureName = null,
                FeatureIcon = null,
                IsFieldExistenceCheck = false,
                Field = "icons",
                LearnMoreUrl = new Uri("https://docs.pwabuilder.com/#/builder/manifest?id=icons"),
                ImageUrl = null,
                Category = PwaCapabilityCategory.WebAppManifest,
                Status = PwaCapabilityCheckStatus.InProgress
            },
            new PwaCapability
            {
                Id = PwaCapabilityId.IconSizesAreValid,
                Description = "The declared sizes of icons in your web manifest must match their actual dimensions.",
                TodoAction = "Fix the icon sizes in your web app manifest.",
                Level = PwaCapabilityLevel.Recommended,
                FeatureName = null,
                FeatureIcon = null,
                IsFieldExistenceCheck = false,
                Field = "icons",
                LearnMoreUrl = new Uri("https://docs.pwabuilder.com/#/builder/manifest?id=icons"),
                ImageUrl = null,
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
                IsFieldExistenceCheck = true,
                LearnMoreUrl = new Uri("https://docs.pwabuilder.com/#/builder/manifest?id=shortcuts-array"),
                ImageUrl = new Uri("/assets/manifest_examples/shortcuts_example_image.jpg", UriKind.Relative),
                Category = PwaCapabilityCategory.WebAppManifest,
                Status = PwaCapabilityCheckStatus.InProgress
            },
            new PwaCapability
            {
                Id = PwaCapabilityId.ShortcutIconsAreFetchable,
                Description = "The icons of shortcuts in your web manifest must be fetchable on the network.",
                TodoAction = "Fix the links to your shortcut icons in your web manifest.",
                Level = PwaCapabilityLevel.Required,
                FeatureName = null,
                FeatureIcon = null,
                IsFieldExistenceCheck = false,
                Field = "shortcuts",
                LearnMoreUrl = new Uri("https://docs.pwabuilder.com/#/builder/manifest?id=shortcuts-array"),
                ImageUrl = null,
                Category = PwaCapabilityCategory.WebAppManifest,
                Status = PwaCapabilityCheckStatus.InProgress
            },
            new PwaCapability
            {
                Id = PwaCapabilityId.ShortcutIconTypesAreValid,
                Description = "The declared types of shortcut icons in your web manifest must match their actual file types.",
                TodoAction = "Ensure that shortcut icon type declarations match the actual file types (e.g., if type is 'image/png', the file should actually be a PNG).",
                Level = PwaCapabilityLevel.Recommended,
                FeatureName = null,
                FeatureIcon = null,
                IsFieldExistenceCheck = false,
                Field = "shortcuts",
                LearnMoreUrl = new Uri("https://docs.pwabuilder.com/#/builder/manifest?id=shortcuts-array"),
                ImageUrl = null,
                Category = PwaCapabilityCategory.WebAppManifest,
                Status = PwaCapabilityCheckStatus.InProgress
            },
            new PwaCapability
            {
                Id = PwaCapabilityId.ShortcutIconSizesAreValid,
                Description = "The declared sizes of shortcut icons in your web manifest must match their actual dimensions.",
                TodoAction = "Ensure that shortcut icon size declarations match the actual image dimensions (e.g., if sizes is '64x64', the image should actually be 64x64 pixels).",
                Level = PwaCapabilityLevel.Recommended,
                FeatureName = null,
                FeatureIcon = null,
                IsFieldExistenceCheck = false,
                Field = "shortcuts",
                LearnMoreUrl = new Uri("https://docs.pwabuilder.com/#/builder/manifest?id=shortcuts-array"),
                ImageUrl = null,
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
                IsFieldExistenceCheck = true,
                LearnMoreUrl = new Uri("https://docs.pwabuilder.com/#/builder/manifest?id=categories-array"),
                ImageUrl = null,
                Category = PwaCapabilityCategory.WebAppManifest,
                Status = PwaCapabilityCheckStatus.InProgress
            },
            new PwaCapability
            {
                Id = PwaCapabilityId.FileHandlers,
                Description = "The file_handlers member specifies an array of objects representing the types of files an installed PWA can open.",
                TodoAction = "Let users open files with your PWA by adding file_handlers to your manifest.",
                Level = PwaCapabilityLevel.Feature,
                FeatureName = "File Handlers",
                FeatureIcon = new Uri("/assets/new/file_handlers_icon.svg", UriKind.Relative),
                Field = "file_handlers",
                IsFieldExistenceCheck = true,
                LearnMoreUrl = new Uri("https://docs.pwabuilder.com/#/builder/manifest?id=file_handlers-array"),
                ImageUrl = null,
                Category = PwaCapabilityCategory.WebAppManifest,
                Status = PwaCapabilityCheckStatus.InProgress
            },
            new PwaCapability
            {
                Id = PwaCapabilityId.LaunchHandler,
                Description = "The launch_handler member specifies how your app will launch when navigated. For example, you can specify that navigations to your PWA domain should focus an existing instance of your app (single-instance app), navigate in an existing instance, or open a new instance of your app.",
                TodoAction = "Take control over how your app is launched -- single instance, focus existing, or navigate in new window -- by adding launch_handler to your manifest.",
                Level = PwaCapabilityLevel.Feature,
                FeatureName = "Launch Handler",
                FeatureIcon = new Uri("/assets/new/launch_handler_icon.png", UriKind.Relative),
                Field = "launch_handler",
                IsFieldExistenceCheck = true,
                LearnMoreUrl = new Uri("https://docs.pwabuilder.com/#/builder/manifest?id=launch_handler-object"),
                ImageUrl = null,
                Category = PwaCapabilityCategory.WebAppManifest,
                Status = PwaCapabilityCheckStatus.InProgress
            },
            new PwaCapability
            {
                Id = PwaCapabilityId.ProtocolHandlers,
                Description = "The protocol_handlers member specifies an array of objects that are protocols which this web app can register and handle. Protocol handlers register the application in an OS's application preferences; the registration associates a specific application with the given protocol scheme. For example, when using the protocol handler mailto:// on a web page, registered email applications open.",
                TodoAction = "Let your app handle protocols like mailto: or sms:, or custom protocols like web+mypwa:, by adding protocol_handlers to your manifest.",
                Level = PwaCapabilityLevel.Feature,
                FeatureName = "Protocol Handlers",
                FeatureIcon = new Uri("/assets/new/protocol_handlers_icon.svg", UriKind.Relative),
                Field = "protocol_handlers",
                IsFieldExistenceCheck = true,
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
                IsFieldExistenceCheck = true,
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
                IsFieldExistenceCheck = true,
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
                IsFieldExistenceCheck = true,
                LearnMoreUrl = new Uri("https://docs.pwabuilder.com/#/builder/manifest?id=screenshots-array"),
                ImageUrl = null,
                Category = PwaCapabilityCategory.WebAppManifest,
                Status = PwaCapabilityCheckStatus.InProgress
            },
            new PwaCapability
            {
                Id = PwaCapabilityId.ScreenshotsAreFetchable,
                Description = "The screenshots in your web manifest must be fetchable on the network.",
                TodoAction = "Fix the links to your screenshots.",
                Level = PwaCapabilityLevel.Recommended,
                FeatureName = null,
                FeatureIcon = null,
                IsFieldExistenceCheck = false,
                Field = "screenshots",
                LearnMoreUrl = new Uri("https://docs.pwabuilder.com/#/builder/manifest?id=screenshots-array"),
                ImageUrl = null,
                Category = PwaCapabilityCategory.WebAppManifest,
                Status = PwaCapabilityCheckStatus.InProgress
            },
            new PwaCapability
            {
                Id = PwaCapabilityId.ScreenshotTypesAreValid,
                Description = "The declared types of screenshots in your web manifest must match their actual file types.",
                TodoAction = "Ensure that screenshot type declarations match the actual file types (e.g., if type is 'image/png', the file should actually be a PNG).",
                Level = PwaCapabilityLevel.Recommended,
                FeatureName = null,
                FeatureIcon = null,
                IsFieldExistenceCheck = false,
                Field = "screenshots",
                LearnMoreUrl = new Uri("https://docs.pwabuilder.com/#/builder/manifest?id=screenshots-array"),
                ImageUrl = null,
                Category = PwaCapabilityCategory.WebAppManifest,
                Status = PwaCapabilityCheckStatus.InProgress
            },
            new PwaCapability
            {
                Id = PwaCapabilityId.ScreenshotSizesAreValid,
                Description = "The declared sizes of screenshots in your web manifest must match their actual dimensions.",
                TodoAction = "Ensure that screenshot size declarations match the actual image dimensions (e.g., if sizes is '1920x1080', the image should actually be 1920x1080 pixels).",
                Level = PwaCapabilityLevel.Recommended,
                FeatureName = null,
                FeatureIcon = null,
                IsFieldExistenceCheck = false,
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
                IsFieldExistenceCheck = false,
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
                IsFieldExistenceCheck = false,
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
                FeatureIcon = new Uri("/assets/new/share_target_icon.svg", UriKind.Relative),
                Field = "share_target",
                IsFieldExistenceCheck = true,
                LearnMoreUrl = new Uri("https://developer.chrome.com/docs/capabilities/web-apis/web-share-target"),
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
                IsFieldExistenceCheck = true,
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
                IsFieldExistenceCheck = true,
                LearnMoreUrl = new Uri("https://docs.pwabuilder.com/#/builder/manifest?id=iarc_rating_id-string"),
                ImageUrl = new Uri("/assets/manifest_examples/iarc_example_image.jpg", UriKind.Relative),
                Category = PwaCapabilityCategory.WebAppManifest,
                Status = PwaCapabilityCheckStatus.InProgress
            },
            new PwaCapability
            {
                Id = PwaCapabilityId.Widgets,
                Description = "Widgets are adaptive cards with text, images, an actions related to your app. On Windows, widgets appear over the desktop when the user clicks the widget taskbar icon or presses Win+W.",
                TodoAction = "Let users add your app as a widget.",
                Level = PwaCapabilityLevel.Feature,
                FeatureName = "Widgets",
                FeatureIcon = new Uri("/assets/new/widgets_icon.svg", UriKind.Relative),
                Field = "widgets",
                IsFieldExistenceCheck = true,
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
                IsFieldExistenceCheck = true,
                LearnMoreUrl = new Uri("https://docs.pwabuilder.com/#/builder/manifest?id=edge_side_panel-object"),
                ImageUrl = new Uri("/assets/manifest_examples/edge-sidepanel-example.webp", UriKind.Relative),
                Category = PwaCapabilityCategory.WebAppManifest,
                Status = PwaCapabilityCheckStatus.InProgress
            },
            new PwaCapability
            {
                Id = PwaCapabilityId.DisplayOverride,
                Description = "The display_override lets the developer provide a sequence of display modes that the browser will consider before using the display member.",
                TodoAction = "Control how your app is displayed by adding display_override to your manifest.",
                Level = PwaCapabilityLevel.Optional,
                FeatureName = null,
                FeatureIcon = null,
                Field = "display_override",
                IsFieldExistenceCheck = true,
                LearnMoreUrl = new Uri("https://docs.pwabuilder.com/#/builder/manifest?id=display_override-array"),
                ImageUrl = null,
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
                IsFieldExistenceCheck = false,
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
                IsFieldExistenceCheck = false,
                LearnMoreUrl = new Uri("https://developer.chrome.com/docs/capabilities/tabbed-application-mode"),
                ImageUrl = new Uri("/assets/manifest_examples/tabbed-display.webp", UriKind.Relative),
                Category = PwaCapabilityCategory.WebAppManifest,
                Status = PwaCapabilityCheckStatus.InProgress
            },
            new PwaCapability
            {
                Id = PwaCapabilityId.NoteTaking,
                Description = "The note_taking member identifies a web app as a note-taking app and defines related information, for example a URL pointing to functionality for taking a new note. This enables operating systems to integrate the app's note taking functionality, for example including a \"New note\" option in the app's context menu, or providing the app as an option for taking a note in other apps.",
                TodoAction = "Register as a notes app to integrate with the OS's note-taking capabilities.",
                Level = PwaCapabilityLevel.Feature,
                FeatureName = "Note Taking",
                FeatureIcon = new Uri("/assets/new/note_taking_icon.png", UriKind.Relative),
                Field = "note_taking",
                IsFieldExistenceCheck = true,
                LearnMoreUrl = new Uri("https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest/Reference/note_taking"),
                ImageUrl = null,
                Category = PwaCapabilityCategory.WebAppManifest,
                Status = PwaCapabilityCheckStatus.InProgress
            },
            new PwaCapability
            {
                Id = PwaCapabilityId.Scope,
                Description = "The scope member is a string that represents the name of the web application as it is usually displayed to the user (e.g., amongst a list of other applications, or as a label for an icon).",
                TodoAction = "Provide a top-level URL path of your PWA by adding a scope field to your manifest.",
                Level = PwaCapabilityLevel.Optional,
                FeatureName = null,
                FeatureIcon = null,
                Field = "scope",
                IsFieldExistenceCheck = true,
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
                IsFieldExistenceCheck = true,
                LearnMoreUrl = new Uri("https://docs.pwabuilder.com/#/builder/manifest?id=short_name-string"),
                ImageUrl = null,
                Category = PwaCapabilityCategory.WebAppManifest,
                Status = PwaCapabilityCheckStatus.InProgress
            },
            new PwaCapability
            {
                Id = PwaCapabilityId.StartUrl,
                Description = "The start_url member is a string that represents the start URL of the web application — the preferred URL that should be loaded when the user launches the web application.",
                TodoAction = "Add a start_url to your manifest.",
                Level = PwaCapabilityLevel.Required,
                FeatureName = null,
                FeatureIcon = null,
                Field = "start_url",
                IsFieldExistenceCheck = true,
                LearnMoreUrl = new Uri("https://docs.pwabuilder.com/#/builder/manifest?id=start_url-string"),
                ImageUrl = null,
                Category = PwaCapabilityCategory.WebAppManifest,
                Status = PwaCapabilityCheckStatus.InProgress
            },
            new PwaCapability
            {
                Id = PwaCapabilityId.Display,
                Description = "The display member is a string that determines the developers' preferred display mode for the website. The display mode changes how much of browser UI is shown to the user and can range from browser (when the full browser window is shown) to fullscreen (when the app is fullscreened).",
                TodoAction = "Add a display to your manifest.",
                Level = PwaCapabilityLevel.Recommended,
                FeatureName = null,
                FeatureIcon = null,
                Field = "display",
                IsFieldExistenceCheck = true,
                LearnMoreUrl = new Uri("https://docs.pwabuilder.com/#/builder/manifest?id=display-string"),
                ImageUrl = null,
                Category = PwaCapabilityCategory.WebAppManifest,
                Status = PwaCapabilityCheckStatus.InProgress
            },
            new PwaCapability
            {
                Id = PwaCapabilityId.Orientation,
                Description = "The orientation member is a string that determines the developers' preferred orientation for their PWA. The orientation can be any of the following: any, natural, landscape, landscape-primary, landscape-secondary, portrait, portrait-primary, portrait-secondary.",
                TodoAction = "Specify your app's preferred device orientation by adding orientation to your manifest.",
                Level = PwaCapabilityLevel.Recommended,
                FeatureName = null,
                FeatureIcon = null,
                Field = "orientation",
                IsFieldExistenceCheck = true,
                LearnMoreUrl = new Uri("https://docs.pwabuilder.com/#/builder/manifest?id=orientation-string"),
                ImageUrl = null,
                Category = PwaCapabilityCategory.WebAppManifest,
                Status = PwaCapabilityCheckStatus.InProgress
            },
            new PwaCapability
            {
                Id = PwaCapabilityId.Language,
                Description = "The lang member is a string that represents the default language of your PWA.",
                TodoAction = "Define the primary language for your app by adding lang to your manifest.",
                Level = PwaCapabilityLevel.Optional,
                FeatureName = null,
                FeatureIcon = null,
                Field = "lang",
                IsFieldExistenceCheck = true,
                LearnMoreUrl = new Uri("https://docs.pwabuilder.com/#/builder/manifest?id=lang-string"),
                ImageUrl = null,
                Category = PwaCapabilityCategory.WebAppManifest,
                Status = PwaCapabilityCheckStatus.InProgress
            },
            new PwaCapability
            {
                Id = PwaCapabilityId.Direction,
                Description = "The dir member is a string that represents the default text direction of your PWA's language. For example, ltr for left-to-right languages like English, or rtl for right-to-left languages like Hebrew and Arabic.",
                TodoAction = "Define the language direction of your PWA by adding dir to your manifest.",
                Level = PwaCapabilityLevel.Optional,
                FeatureName = null,
                FeatureIcon = null,
                Field = "dir",
                IsFieldExistenceCheck = true,
                LearnMoreUrl = new Uri("https://docs.pwabuilder.com/#/builder/manifest?id=dir-string"),
                ImageUrl = null,
                Category = PwaCapabilityCategory.WebAppManifest,
                Status = PwaCapabilityCheckStatus.InProgress
            },
            new PwaCapability
            {
                Id = PwaCapabilityId.ScopeExtensions,
                Description = "Scope extensions allow your PWA to define additional URL domains that are considered in-scope for your app. For example, for a PWA hosted on example.com, you may add auth.example.com and en.example.com to your scope extensions. Without scope extensions, any navigation outside of your PWA's domain may show a browser address bar inside your PWA.",
                TodoAction = "Enable your PWA to navigate to additional domains or subdomains by adding scope_extensions to your manifest.",
                Level = PwaCapabilityLevel.Optional,
                FeatureName = null,
                FeatureIcon = null,
                Field = "scope_extensions",
                IsFieldExistenceCheck = true,
                LearnMoreUrl = new Uri("https://docs.pwabuilder.com/#/builder/manifest?id=scope_extensions-array"),
                ImageUrl = null,
                Category = PwaCapabilityCategory.WebAppManifest,
                Status = PwaCapabilityCheckStatus.InProgress
            },
            new PwaCapability
            {
                Id = PwaCapabilityId.Id,
                Description = "The id member is a string that represents the unique identifier of your PWA to the browser. If you don't supply one, your start_url is used as your ID. This can be problematic if your start_url changes in the future; browsers will see your PWA at the new URL as a different app. Supplying a stable and unchanging ID helps browsers and operating systems uniquely identify your app.",
                TodoAction = "Help browsers and OSes identify your app, even if your URL changes, by adding an id to your manifest.",
                Level = PwaCapabilityLevel.Recommended,
                FeatureName = null,
                FeatureIcon = null,
                Field = "id",
                IsFieldExistenceCheck = true,
                LearnMoreUrl = new Uri("https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest/Reference/id"),
                ImageUrl = null,
                Category = PwaCapabilityCategory.WebAppManifest,
                Status = PwaCapabilityCheckStatus.InProgress
            }
        ];
    }

    /// <summary>
    /// Creates the list of service worker capability checks.
    /// </summary>
    /// <returns>A new list containing the service worker capability checks.</returns>
    public static List<PwaCapability> CreateServiceWorkerCapabilities()
    {
        return
        [
            new PwaCapability
            {
                Id = PwaCapabilityId.HasServiceWorker,
                Description = "Service Workers sit between your web app and the network. They are intended to enable the creation of effective offline experiences, intercept network requests, and take appropriate action based on whether the network is available. They also allow access to push notifications and background sync APIs.",
                TodoAction = "Make your app faster and more reliable by adding a service worker.",
                Level = PwaCapabilityLevel.Recommended,
                FeatureName = "Has Service Worker",
                FeatureIcon = new Uri("/assets/new/has_service_worker_icon.svg", UriKind.Relative),
                Field = null,
                IsFieldExistenceCheck = false,
                LearnMoreUrl = new Uri("https://docs.pwabuilder.com/#/home/sw-intro"),
                ImageUrl = null,
                Category = PwaCapabilityCategory.ServiceWorker,
                Status = PwaCapabilityCheckStatus.InProgress
            },
            new PwaCapability
            {
                Id = PwaCapabilityId.ServiceWorkerIsNotEmpty,
                Description = "Your service worker should not be empty or contain no caching logic. Instead, your service worker should add support for caching resources -- for example, your app's HTML, CSS, and JS -- and serve from the cache when the network is unavailable.",
                TodoAction = "Improve your app's performance by adding caching logic to your service worker.",
                Level = PwaCapabilityLevel.Recommended,
                FeatureName = "Has Logic",
                FeatureIcon = new Uri("/assets/new/service_worker_has_logic.png", UriKind.Relative),
                Field = null,
                IsFieldExistenceCheck = false,
                LearnMoreUrl = new Uri("https://docs.pwabuilder.com/#/home/sw-intro"),
                ImageUrl = null,
                Category = PwaCapabilityCategory.ServiceWorker,
                Status = PwaCapabilityCheckStatus.InProgress
            },
            new PwaCapability
            {
                Id = PwaCapabilityId.PeriodicSync,
                Description = "Periodic Sync can fetch your web app's data in the background at regular intervals. For example, a weather app might fetch the local weather forecast each morning so that when the app is launched, the forecast is instantly shown to the user even if a network connection isn't available.",
                TodoAction = "Show data to your users instantly by adding periodic background sync to your service worker.",
                Level = PwaCapabilityLevel.Feature,
                FeatureName = "Periodic Sync",
                FeatureIcon = new Uri("/assets/new/periodic_sync_icon.svg", UriKind.Relative),
                Field = null,
                IsFieldExistenceCheck = false,
                LearnMoreUrl = new Uri("https://docs.pwabuilder.com/#/home/native-features?id=periodic-background-sync-overview"),
                ImageUrl = null,
                Category = PwaCapabilityCategory.ServiceWorker,
                Status = PwaCapabilityCheckStatus.InProgress
            },
            new PwaCapability
            {
                Id = PwaCapabilityId.BackgroundSync,
                Description = "The Background Sync API enables a web app to defer tasks so that they can be run in a service worker once the user has a stable network connection.",
                TodoAction = "Make your app resilient to poor network connections by adding Background Sync to your service worker.",
                Level = PwaCapabilityLevel.Feature,
                FeatureName = "Background Sync",
                FeatureIcon = new Uri("/assets/new/background_sync_icon.svg", UriKind.Relative),
                Field = null,
                IsFieldExistenceCheck = false,
                LearnMoreUrl = new Uri("https://docs.pwabuilder.com/#/home/native-features?id=background-sync-overview"),
                ImageUrl = null,
                Category = PwaCapabilityCategory.ServiceWorker,
                Status = PwaCapabilityCheckStatus.InProgress
            },
            new PwaCapability
            {
                Id = PwaCapabilityId.PushNotifications,
                Description = "The Web Push Notifications API allows you to send a pop up notification that displays to your users, regardless of whether your app is running.",
                TodoAction = "Re-engage users with timely notifications by adding push notifications to your service worker.",
                Level = PwaCapabilityLevel.Feature,
                FeatureName = "Push Notifications",
                FeatureIcon = new Uri("/assets/new/push_notifications_icon.svg", UriKind.Relative),
                Field = null,
                IsFieldExistenceCheck = false,
                LearnMoreUrl = new Uri("https://docs.pwabuilder.com/#/home/native-features?id=push-notifications"),
                ImageUrl = null,
                Category = PwaCapabilityCategory.ServiceWorker,
                Status = PwaCapabilityCheckStatus.InProgress
            },
            new PwaCapability
            {
                Id = PwaCapabilityId.OfflineSupport,
                Description = "Offline support enables your PWA to function without a network connection via a service worker with caches to serve from while the app is offline.",
                TodoAction = "Enable your PWA to work offline by caching your app's assets in your service worker and serving them from the cache when offline.",
                Level = PwaCapabilityLevel.Feature,
                FeatureName = "Offline Support",
                FeatureIcon = new Uri("/assets/new/offline_support_icon.svg", UriKind.Relative),
                Field = null,
                IsFieldExistenceCheck = false,
                LearnMoreUrl = new Uri("https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Tutorials/js13kGames/Offline_Service_workers"),
                ImageUrl = null,
                Category = PwaCapabilityCategory.ServiceWorker,
                Status = PwaCapabilityCheckStatus.InProgress
            }
        ];
    }

    public static List<PwaCapability> CreateHttpsCapabilities()
    {
        return
        [
            new PwaCapability
            {
                Id = PwaCapabilityId.HasHttps,
                Description = "Your web app must be protected with HTTPS, even if it doesn't handle sensitive data.",
                TodoAction = "Add HTTPS to your web app to enable powerful PWA features like service worker, offline capability, install, and more.",
                Level = PwaCapabilityLevel.Required,
                FeatureName = null,
                FeatureIcon = null,
                Field = null,
                IsFieldExistenceCheck = false,
                LearnMoreUrl = new Uri("https://microsoft.github.io/win-student-devs/#/30DaysOfPWA/core-concepts/04"),
                ImageUrl = null,
                Category = PwaCapabilityCategory.Https,
                Status = PwaCapabilityCheckStatus.InProgress
            }
        ];
    }

    /// <summary>
    /// Creates a list of general web app capabilities.
    /// </summary>
    /// <returns>A list of general web app capabilities.</returns>
    public static List<PwaCapability> CreateGeneralCapabilities()
    {
        return
        [
            new PwaCapability
            {
                Id = PwaCapabilityId.ServesHtml,
                Description = "Your web app must serve content of type text/html. We analyzed your site's URL and found that it serves {0}.",
                TodoAction = "Update your web app to serve text/html content.",
                Level = PwaCapabilityLevel.Required,
                FeatureName = null,
                FeatureIcon = null,
                Field = null,
                IsFieldExistenceCheck = false,
                LearnMoreUrl = new Uri("https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Server-side/Configuring_server_MIME_types"),
                ImageUrl = null,
                Category = PwaCapabilityCategory.General,
                Status = PwaCapabilityCheckStatus.InProgress
            }
        ];
    }
}