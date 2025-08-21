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
                Level = PwaCapabilityLevel.Recommended,
                LearnMoreUrl = new Uri("https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest/Reference/background_color"),
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
                LearnMoreUrl = new Uri("https://docs.pwabuilder.com/#/builder/manifest?id=categories-array"),
                ImageUrl = null,
                Category = PwaCapabilityCategory.WebAppManifest,
                Status = PwaCapabilityCheckStatus.InProgress
            }
        ];
    }
}