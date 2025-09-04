using PWABuilder.MicrosoftStore.Common;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PWABuilder.MicrosoftStore.Models;

/// <summary>
/// Contains file paths to Windows Actions-related files, such as the Windows Actions manifest, custom entities, and custom entity translations.
/// </summary>
public class WindowsActionsFiles
{
    /// <summary>
    /// The file path to the ActionsManifest.json file that defines the Windows Actions for the PWA.
    /// </summary>
    public required FilePath ManifestFilePath { get; set; }

    /// <summary>
    /// The file path to the customEntities.json file that defines any custom entities used by the Windows Actions for the PWA, or null if no custom entities were provided.
    /// </summary>
    public FilePath? CustomEntitiesFilePath { get; set; }

    /// <summary>
    /// The file path of the folder containing any localization files for the custom entities, or null if no localization files were provided.
    /// </summary>
    public FilePath? CustomEntitiesLocalizationDirectoryPath { get; set; }
}