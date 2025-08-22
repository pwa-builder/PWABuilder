namespace PWABuilder.Models;

public enum PwaCapabilityId
{
    HasManifest,

    // Manifest fields
    Name,
    ShortName,
    Description,
    BackgroundColor,
    Shortcuts,
    Categories,
    Icons,
    ThemeColor,
    Scope,
    Screenshots,
    FileHandlers,
    LaunchHandler,
    PreferRelatedApplication,
    RelatedApplications,
    ProtocolHandlers,
    ShareTarget,
    IarcRatingId,
    WindowControlsOverlay,
    TabbedDisplay,


    // Other manifest checks
    IconsAreFetchable,
    HasSquare192x192PngAnyPurposeIcon,
    HasSquare512x512PngAnyPurposeIcon,
    ScreenshotsAreFetchable,
    HasWideScreenshot,
    HasNarrowScreenshot,
    Widgets,
    EdgeSidePanel
}