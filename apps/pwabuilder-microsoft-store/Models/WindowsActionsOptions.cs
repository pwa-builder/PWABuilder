using System.Collections.Generic;

namespace PWABuilder.MicrosoftStore.Models;

/// <summary>
/// Options for Windows Actions support. 
/// </summary>
/// <remarks>
/// For more information about App Actions, see https://learn.microsoft.com/en-us/windows/ai/app-actions/actions-get-started
/// For more information about App Actions for PWAs, see https://blogs.windows.com/msedgedev/2025/05/30/bring-your-pwa-closer-to-users-with-app-actions-on-windows/
/// To test out a PWA with App Actions, see the App Actions Testing Playground https://apps.microsoft.com/detail/9plswv2gr8b4
/// </remarks>
public class WindowsActionsOptions
{
    /// <summary>
    /// The text contents of the ActionsManifest.json file that defines the Windows Actions for the PWA.
    /// </summary>
    public required string Manifest { get; set; }

    /// <summary>
    /// Optional. The text contents of the CustomEntities.json file that defines any custom entities used by the Windows Actions for the PWA.
    /// </summary>
    public string? CustomEntities { get; set; }

    /// <summary>
    /// Optional. The list of localizations for the custom entities defined in CustomEntities.json.
    /// </summary>
    public List<WindowsActionsCustomEntityLocalization>? CustomEntitiesLocalizations { get; set; }
}
