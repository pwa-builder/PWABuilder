namespace PWABuilder.Models;

public enum PwaCapabilityId
{
    HasManifest,

    // Manifest fields
    Name,
    Id,
    ShortName,
    Description,
    BackgroundColor,
    Shortcuts,
    Categories,
    Icons,
    ThemeColor,
    Scope,
    ScopeExtensions,
    Display,
    Orientation,
    Language,
    Direction,
    Screenshots,
    FileHandlers,
    LaunchHandler,
    PreferRelatedApplication,
    RelatedApplications,
    ProtocolHandlers,
    ShareTarget,
    IarcRatingId,
    DisplayOverride,
    WindowControlsOverlay,
    TabbedDisplay,
    NoteTaking,
    StartUrl,
    Widgets,
    EdgeSidePanel,

    // other manifest checks
    IconsAreFetchable,
    HasSquare192x192PngAnyPurposeIcon,
    HasSquare512x512PngAnyPurposeIcon,
    ScreenshotsAreFetchable,
    HasWideScreenshot,
    HasNarrowScreenshot,

    // service worker capabilities
    HasServiceWorker,
    ServiceWorkerIsNotEmpty,
    PeriodicSync,
    BackgroundSync,
    PushNotifications,
    OfflineSupport,

    // Https capabilities
    HasHttps,
    NoMixedContent
}