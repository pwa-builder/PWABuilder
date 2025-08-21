namespace PWABuilder.Models;

public enum PwaCapabilityId
{
    HasManifest,

    // Manifest fields
    Name,
    Description,
    BackgroundColor,
    Shortcuts,
    Categories,
    Icons,
    Screenshots,


    // Other manifest checks
    IconsAreFetchable,
    ScreenshotsAreFetchable
}