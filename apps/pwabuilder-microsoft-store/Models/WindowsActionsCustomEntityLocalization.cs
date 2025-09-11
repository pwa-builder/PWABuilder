using System.Text.Json;

namespace PWABuilder.MicrosoftStore.Models;

/// <summary>
/// Localization file for a customEntities.json, used in Windows Actions.
/// </summary>
public class WindowsActionsCustomEntityLocalization
{
    /// <summary>
    /// The file name of the localization file. File name is needed as it includes language tag information consistent with resource management system. See https://learn.microsoft.com/en-us/windows/uwp/app-resources/how-rms-matches-lang-tags
    /// </summary>
    public required string FileName { get; set; }

    /// <summary>
    /// The contents of the localization file. Example contents: 
    /// 
    /// { 
    ///    "Atomic Habits": { 
    ///       "author": "James Clear",
    ///       "genre": "self-help"
    ///    }
    /// }
    /// </summary>
    public required JsonDocument Contents { get; set; }
}
