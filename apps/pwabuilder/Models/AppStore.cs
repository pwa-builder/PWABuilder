namespace PWABuilder.Models;

/// <summary>
/// The app store where the PWA was published.
/// </summary>
public enum AppStore
{
    /// <summary>
    /// The Microsoft Store for Windows.
    /// </summary>
    MicrosoftStore,

    /// <summary>
    /// The Apple iOS App Store.
    /// </summary>
    IOSAppStore,

    /// <summary>
    /// The Google Play Store.
    /// </summary>
    GooglePlayStore,

    /// <summary>
    /// The Meta Quest Store.
    /// </summary>
    MetaQuestStore
}