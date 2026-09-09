using System.Text;
using PWABuilder.Common;
using PWABuilder.IOS.Models;

namespace PWABuilder.MacOS.Models
{
    /// <summary>
    /// Models the macOS pwa-shell Xcode project template.
    /// Applies user-provided options (name, URL, bundle ID, colors, etc.) to the template files.
    /// </summary>
    public sealed class XcodeMacOSProject : XcodeProject
    {
        private readonly MacOSAppPackageOptions.Validated options;
        private readonly string macSafeProjectName;
        private readonly string swiftModuleName;

        /// <summary>
        /// Initializes the project with the validated options and the root directory of the copied template.
        /// </summary>
        public XcodeMacOSProject(MacOSAppPackageOptions.Validated options, string rootDirectory)
            : base(rootDirectory)
        {
            this.options = options;
            macSafeProjectName = GetMacSafeFileName(options.Name);
            swiftModuleName = GetSwiftSafeModuleName(options.Name);
        }

        /// <summary>
        /// Applies all template substitutions and renames to the copied source directory, then saves to disk.
        /// </summary>
        public async Task ApplyChanges()
        {
            UpdateAppNameAndUrls();
            UpdateAppBundleId();
            UpdateAppColors();
            RenameProjectFolders();
            UpdateProjectFolderReferences();

            await Save();
        }

        /// <summary>
        /// Substitutes app name, PWA URL, and permitted origins into the Swift settings and Info.plist files.
        /// </summary>
        private void UpdateAppNameAndUrls()
        {
            var infoPlist = GetFile("Info.plist");
            var settingsFile = GetFile("Settings.swift");

            // Info.plist: display name
            infoPlist.Replace(
                "<string>{{PWABuilder.macOS.appName}}</string>",
                $"<string>{GetXmlSafeNodeValue(options.Name)}</string>"
            );

            // Info.plist: WKAppBoundDomains — include the PWA host plus any permitted hosts
            var domainsBuilder = new StringBuilder();
            domainsBuilder.Append($"<string>{GetXmlSafeNodeValue(options.Url.ToIOSHostString())}</string>");

            options.PermittedUrls
                .Select(u => u.ToIOSHostString())
                .Select(GetXmlSafeNodeValue)
                .ToList()
                .ForEach(h => domainsBuilder.Append($"\n<string>{h}</string>"));

            infoPlist.Replace(
                "<string>{{PWABuilder.macOS.permittedUrls}}</string>",
                domainsBuilder.ToString()
            );

            // Settings.swift: start URL
            settingsFile.Replace("{{PWABuilder.macOS.url}}", options.Url.ToString().TrimEnd('/'));

            // Settings.swift: allowed origin (host only)
            settingsFile.Replace("{{PWABuilder.macOS.urlHost}}", options.Url.Host);

            // Settings.swift: auth/permitted hosts
            var authOriginsValue = string.Join(
                ',',
                options.PermittedUrls
                    .Select(u => u.ToIOSHostString())
                    .Select(h => $"\"{h}\"")
            );
            settingsFile.Replace("\"{{PWABuilder.macOS.permittedHosts}}\"", authOriginsValue);

            // Settings.swift: app name
            settingsFile.Replace("{{PWABuilder.macOS.appName}}", GetSwiftStringSafeValue(options.Name));
        }

        /// <summary>
        /// Substitutes the bundle identifier into the Xcode project file.
        /// </summary>
        private void UpdateAppBundleId()
        {
            GetFile("project.pbxproj").Replace("{{PWABuilder.macOS.bundleId}}", options.BundleId);
        }

        /// <summary>
        /// Substitutes theme and background colors into the Swift settings file.
        /// </summary>
        private void UpdateAppColors()
        {
            var settingsFile = GetFile("Settings.swift");
            settingsFile.Replace("{{PWABuilder.macOS.themeColor}}", ColorToHexString(options.ThemeColor));
            settingsFile.Replace("{{PWABuilder.macOS.backgroundColor}}", ColorToHexString(options.BackgroundColor));
        }

        /// <summary>
        /// Renames the template directories from "pwa-shell" to the user-supplied app name.
        /// </summary>
        private void RenameProjectFolders()
        {
            GetFolder("pwa-shell").Rename(macSafeProjectName);
            GetFolder("pwa-shell.xcodeproj").Rename($"{macSafeProjectName}.xcodeproj");
        }

        /// <summary>
        /// Updates file references inside the Xcode project file and workspace to use the renamed directory.
        /// </summary>
        private void UpdateProjectFolderReferences()
        {
            const string oldName = "pwa-shell";

            GetFile("project.pbxproj").Replace(oldName, macSafeProjectName);
            GetFileByPath(Path.Combine("project.xcworkspace", "contents.xcworkspacedata"))
                .Replace(oldName, macSafeProjectName);
            GetFile("pwa-shell.xcscheme").Replace(oldName, macSafeProjectName);
        }

        /// <summary>
        /// Converts an RGB color to a CSS-style hex string like "#FF5733".
        /// </summary>
        private static string ColorToHexString(PWABuilder.IOS.Models.Color color)
            => $"#{color.R:X2}{color.G:X2}{color.B:X2}";

        private static string GetMacSafeFileName(string name)
        {
            var safe = name
                .Replace(':', '_')
                .Replace('/', '_')
                .TrimStart('.')
                .Trim();
            return safe.Length switch
            {
                <= 255 => safe,
                _ => safe[..255],
            };
        }

        private static string GetSwiftSafeModuleName(string name)
        {
            var sb = new StringBuilder(name.Length);
            foreach (var c in name)
            {
                if (char.IsWhiteSpace(c)) continue;
                sb.Append(char.IsLetterOrDigit(c) ? c : '_');
            }

            if (sb.Length > 0 && char.IsNumber(sb[0]))
            {
                sb.Insert(0, '_');
            }

            return sb.ToString();
        }

        private static string GetXmlSafeNodeValue(string input)
        {
            if (string.IsNullOrWhiteSpace(input))
            {
                return input ?? string.Empty;
            }

            return new System.Xml.Linq.XElement("D", input)
                .ToString()
                .Replace("<D>", string.Empty)
                .Replace("</D>", string.Empty);
        }

        /// <summary>
        /// Escapes a string for safe embedding inside a Swift string literal.
        /// </summary>
        private static string GetSwiftStringSafeValue(string input)
        {
            return input
                .Replace("\\", "\\\\")
                .Replace("\"", "\\\"");
        }
    }
}
