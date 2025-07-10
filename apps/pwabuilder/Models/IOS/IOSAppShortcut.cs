namespace PWABuilder.IOS.Models
{
    /// <summary>
    /// Represents an iOS app shortcut.
    /// </summary>
    public class IOSAppShortcut
    {
        public IOSAppShortcut(string name, Uri uri)
        {
            Name = name;
            Uri = uri;
        }

        /// <summary>
        /// Attempts to create an iOS app shortcut from a W3C web manifest shortcut.
        /// </summary>
        /// <param name="webManifestShortcut">The web manifest shortcut to try to convert to an iOS app shortcut.</param>
        /// <param name="webManifestUri">The URI of the web manifest, used for resolving relative shortcut URIs to absolute URIs.</param>
        /// <returns>An iOS web app shortcut, or null if one could not be created.</returns>
        public static IOSAppShortcut? FromWebManifestShortcut(
            WebManifestShortcutItem webManifestShortcut,
            Uri webManifestUri
        )
        {
            var name = !string.IsNullOrWhiteSpace(webManifestShortcut.Name)
                ? webManifestShortcut.Name
                : webManifestShortcut.Short_name;
            if (string.IsNullOrWhiteSpace(name))
            {
                return null;
            }

            Uri.TryCreate(webManifestUri, webManifestShortcut.Url, out var uri);
            if (uri == null)
            {
                return null;
            }

            return new IOSAppShortcut(name, uri);
        }

        public string Name { get; init; }
        public Uri Uri { get; init; }

        /// <summary>
        /// Converts the iOS app shortcut into an Info.plist-ready XML element string.
        /// </summary>
        /// <param name="safeXmlValueConverter">Function that converts a plain string into an XML value-safe string.</param>
        /// <returns>An XML fragment containing the app shortcut formatted for Info.plist</returns>
        public string ToInfoPlistEntry(Func<string, string> safeXmlValueConverter)
        {
            return "\t\t<dict>\n"
                + "\t\t\t<key>UIApplicationShortcutItemType</key>\n"
                + $"\t\t\t<string>{safeXmlValueConverter(Uri.ToString())}</string>\n"
                + "\t\t\t<key>UIApplicationShortcutItemTitle</key>\n"
                + $"\t\t\t<string>{safeXmlValueConverter(Name)}</string>\n"
                + "\t\t</dict>";
        }
    }
}
