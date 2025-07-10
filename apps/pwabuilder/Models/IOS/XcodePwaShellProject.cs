using System.Text;
using PWABuilder.IOS.Common;

namespace PWABuilder.IOS.Models
{
    /// <summary>
    /// Models the pwa-shell Xcode project that serves as the template for generated PWA packages.
    /// </summary>
    public class XcodePwaShellProject : XcodeProject
    {
        private readonly IOSAppPackageOptions.Validated options;
        private readonly string macSafeProjectName;
        private readonly string swiftModuleName;

        public XcodePwaShellProject(IOSAppPackageOptions.Validated options, string rootDirectory)
            : base(rootDirectory)
        {
            this.options = options;
            macSafeProjectName = GetMacSafeFileName(options.Name);
            swiftModuleName = GetSwiftSafeModuleName(options.Name);
        }

        public async Task ApplyChanges()
        {
            UpdateAppColors();
            UpdateAppNameAndUrls();
            UpdateAppBundleId();
            RenameProjectFolders();
            UpdateProjectFolderReferences();
            UpdateModuleReferences();

            await Save();
        }

        private void UpdateAppColors()
        {
            var launchScreenStoryboard = GetFile("LaunchScreen.storyboard");
            var mainStoryboard = GetFile("Main.storyboard");

            // Set the splash color.
            // var existingSplashColorLine = "{{PWABuilder.iOS.splashBgColor}}";
            // var desiredSplashColorLine = $"<color key=\"backgroundColor\" {options.SplashColor.ToStoryboardColorString()} alpha=\"1\" colorSpace=\"custom\" customColorSpace=\"sRGB\"/>";
            // launchScreenStoryboard.Replace(existingSplashColorLine, desiredSplashColorLine);
            // mainStoryboard.Replace(existingSplashColorLine, desiredSplashColorLine);

            // Set the status bar color
            // var existingStatusBarColorLine = "{{PWABuilder.iOS.statusBarColor}}";
            // var desiredStatusBarColorLine = $"<color key=\"backgroundColor\" {options.StatusBarColor.ToStoryboardColorString()} alpha=\"1\" colorSpace=\"custom\" customColorSpace=\"sRGB\"/>";
            // mainStoryboard.Replace(existingStatusBarColorLine, desiredStatusBarColorLine);

            // Set the progress var color
            var existingProgressBarColorLine = "{{PWABuilder.iOS.progressBarColor}}";
            var desiredProgressBarColorLine =
                $"<color key=\"tintColor\" {options.ProgressBarColor.ToStoryboardColorString()} alpha=\"1\" colorSpace=\"custom\" customColorSpace=\"sRGB\"/>";
            mainStoryboard.Replace(existingProgressBarColorLine, desiredProgressBarColorLine);
        }

        private void UpdateAppNameAndUrls()
        {
            var infoPlistXmlFile = GetFile("Info.plist");
            var settingsFile = GetFile("Settings.swift");
            var entitlementsXmlFile = GetFile("Entitlements.plist");

            // Update app name
            var appNameExisting = "<string>{{PWABuilder.iOS.appName}}</string>";
            var appNameDesired = $"<string>{GetXmlSafeNodeValue(options.Name)}</string>";
            infoPlistXmlFile.Replace(appNameExisting, appNameDesired);

            // Add URL and permitted URLs to app bound domains (used for service worker) in Info.plist
            var urlExisting = "<string>{{PWABuilder.iOS.permittedUrls}}</string>";
            var urlDesiredBuilder = new System.Text.StringBuilder();

            // Append the URL of the PWA
            urlDesiredBuilder.Append(
                $"<string>{GetXmlSafeNodeValue(options.Url.ToIOSHostString())}</string>"
            ); // Append the URL of the PWA

            // Append the permitted URLs
            options
                .PermittedUrls.Select(url => url.ToIOSHostString())
                .Select(url => GetXmlSafeNodeValue(url))
                .ToList()
                .ForEach(url => urlDesiredBuilder.Append($"\n<string>{url}</string>"));
            infoPlistXmlFile.Replace(urlExisting, urlDesiredBuilder.ToString());

            // Append shortcuts
            UpdateShortcuts(infoPlistXmlFile);

            // Update app URL in Settings.swift
            var settingsUrlExisting = "{{PWABuilder.iOS.url}}";
            var settingsUrlDesired = options.Url.ToString().TrimEnd('/');
            settingsFile.Replace(settingsUrlExisting, settingsUrlDesired);

            // Update allowed origin in Settings.swift
            var allowedOriginExisting = "{{PWABuilder.iOS.urlHost}}";
            var allowedOriginDesired = options.Url.Host; // Should be Host here, not ToIOSHostString, as ToIOSHostString() can include query strings and URI paths.
            settingsFile.Replace(allowedOriginExisting, allowedOriginDesired);

            // Update authOrigins in Settings.swift
            var authOriginsExisting = "\"{{PWABuilder.iOS.permittedHosts}}\"";
            var authOriginsPermittedUrls = options
                .PermittedUrls.Select(url => url.ToIOSHostString())
                .Select(url => $"\"{url}\"");
            var authOriginsDesired = string.Join(',', authOriginsPermittedUrls);
            settingsFile.Replace(authOriginsExisting, authOriginsDesired);

            // Update app URL in Entitlements.plist. This lets the PWA app handle links to the domain.
            // Note: value here must be the host only. Apple says, "Make sure to only include the desired subdomain and the top-level domain. Don’t include path and query components or a trailing slash (/)."
            // See https://developer.apple.com/documentation/xcode/supporting-associated-domains
            var entitlementsAppUrlExisting = "{{PWABuilder.iOS.universalLinksHost}}";
            var entitlementsAppUrlDesired = $"applinks:{GetXmlSafeNodeValue(options.Url.Host)}";
            entitlementsXmlFile.Replace(entitlementsAppUrlExisting, entitlementsAppUrlDesired);

            // Update webcredentials URL in Entitlements.plist. This lets the PWA app share credentials with the domain.
            // See https://developer.apple.com/documentation/xcode/supporting-associated-domains
            var entitlementsWebcredentialsUrlExisting = "{{PWABuilder.iOS.sharedCredentialsHost}}";
            var entitlementsWebcredentialsUrlDesired =
                $"webcredentials:{GetXmlSafeNodeValue(options.Url.Host)}";
            entitlementsXmlFile.Replace(
                entitlementsWebcredentialsUrlExisting,
                entitlementsWebcredentialsUrlDesired
            );
        }

        private void UpdateShortcuts(XcodeFile infoPlistXmlFile)
        {
            var shortcutsTemplate = "<key>{{PWABuilder.iOS.shortcuts}}</key>";
            var shortcuts = (
                options.Manifest.Shortcuts ?? new List<WebManifestShortcutItem>(0)
            )
                .Select(s => IOSAppShortcut.FromWebManifestShortcut(s, options.ManifestUri))
                .Where(s => s != null)
                .Select(s => s!) // because of the above null check
                .Take(4) // iOS allows a max of 4 shortcuts
                .ToList();
            if (shortcuts.Count == 0)
            {
                // No web app manifest shortcuts? Remove the shortcuts key from Info.plist.
                infoPlistXmlFile.Replace(shortcutsTemplate, string.Empty);
            }
            else
            {
                var shortcutsBuilder = new StringBuilder();
                shortcutsBuilder.Append("<key>UIApplicationShortcutItems</key>\n");
                shortcutsBuilder.Append("<array>\n");
                shortcutsBuilder.Append(
                    string.Join(
                        '\n',
                        shortcuts.Select(s => s.ToInfoPlistEntry(GetXmlSafeNodeValue))
                    )
                );
                shortcutsBuilder.Append("</array>");

                infoPlistXmlFile.Replace(shortcutsTemplate, shortcutsBuilder.ToString());
            }
        }

        private void UpdateAppBundleId()
        {
            var projFile = GetFile("project.pbxproj");
            var existingBundleText = "{{PWABuilder.iOS.bundleId}}";
            var desiredBundleText = options.BundleId;
            projFile.Replace(existingBundleText, desiredBundleText);
        }

        private void RenameProjectFolders()
        {
            // Rename the pwa-shell directory.
            var pwaShell = GetFolder("pwa-shell");
            pwaShell.Rename(macSafeProjectName);

            // Rename the pwa-shell.xcworkspace directory.
            var workspace = GetFolder("pwa-shell.xcworkspace"); // looks like a file, but actually is a directory
            workspace.Rename($"{macSafeProjectName}.xcworkspace");

            // Rename the pwa-shell.xcodeproj directory.
            var projDir = GetFolder("pwa-shell.xcodeproj"); // Likewise looks like a file, but is a directory
            projDir.Rename($"{macSafeProjectName}.xcodeproj");

            // Rename pwa-shell.xcscheme.
            var schemeFile = GetFile("pwa-shell.xcscheme"); // This one's a file.
            schemeFile.Rename($"{macSafeProjectName}.xcscheme");
        }

        private void UpdateProjectFolderReferences()
        {
            var oldDirName = "pwa-shell";

            GetFile("Podfile").Replace(oldDirName, macSafeProjectName);
            GetFileByPath(Path.Combine("project.xcworkspace", "contents.xcworkspacedata"))
                .Replace(oldDirName, macSafeProjectName);
            GetFileByPath(Path.Combine("pwa-shell.xcworkspace", "contents.xcworkspacedata"))
                .Replace(oldDirName, macSafeProjectName);
            GetFile("pwa-shell.xcscheme").Replace(oldDirName, macSafeProjectName);

            // project.pbxproj has some references to the old directory name.
            // It also has reference to "Pods_pwa_shell.framework", which is kinda the directory name.
            var pbxProj = GetFile("project.pbxproj");
            pbxProj.Replace(oldDirName, macSafeProjectName);
            pbxProj.Replace("Pods_pwa_shell", $"Pods_{swiftModuleName}"); // We use the swift module name here because running 'pod install' on names with spaces throws errors. So, use the more stringent module name instead.
        }

        private void UpdateModuleReferences()
        {
            // Some of the files have reference to PWAShell swift module.
            // Rename these.
            var oldModuleName = "PWAShell";

            GetFile("PushNotifications.swift").Replace(oldModuleName, swiftModuleName);
            GetFile("ViewController.swift").Replace(oldModuleName, swiftModuleName);
            GetFile("Main.storyboard").Replace(oldModuleName, swiftModuleName);
            GetFile("project.pbxproj").Replace(oldModuleName, swiftModuleName);
            GetFile("pwa-shell.xcscheme").Replace(oldModuleName, swiftModuleName);
            GetFile("SceneDelegate.swift").Replace(oldModuleName, swiftModuleName);
            //GetFile("AppDelegate.swift").Replace(oldModuleName, swiftModuleName);
        }

        // TODO: When we want to enable push notifications, revisit this.
        //private void UpdatePushSubscription()
        //{
        //
        // \pwa-shell\PushNotifications.swift
        // \pwa-shell\AppDelegate.swift
        // \pwa-shell\WebView.swift
        // \pwa-shell\Settings.swift has gcmMessageIDKey
        //}

        private static string GetMacSafeFileName(string desiredFileOrFolderName)
        {
            var validChars = desiredFileOrFolderName
                .Replace(':', '_') // Mac doesn't allow colons
                .Replace('/', '_') // doesn't allow forward slash
                .TrimStart('.') // can't begin with a period
                .Trim(); // shouldn't have space at beginning or end
            return validChars.Length switch
            {
                <= 255 => validChars,
                _ => validChars.Substring(0, 255), // must be 255 or less
            };
        }

        private static string GetSwiftSafeModuleName(string name)
        {
            var nameBuilder = new System.Text.StringBuilder(name.Length);
            foreach (var c in name)
            {
                // Remove whitespace
                if (char.IsWhiteSpace(c))
                {
                    continue;
                }

                // Append letters or digits
                if (char.IsLetterOrDigit(c))
                {
                    nameBuilder.Append(c);
                }
                else
                {
                    // Otherwise, append underscore
                    nameBuilder.Append('_');
                }
            }

            // It must not begin with a number.
            if (char.IsNumber(nameBuilder[0]))
            {
                nameBuilder.Insert(0, '_');
            }

            return nameBuilder.ToString();
        }

        private static string GetXmlSafeNodeValue(string input)
        {
            if (string.IsNullOrWhiteSpace(input))
            {
                return input ?? string.Empty;
            }

            // Probably a better way to do this. Maybe new System.Xml.Linq.XText(input).ToString()?
            return new System.Xml.Linq.XElement("D", input)
                .ToString()
                .Replace("<D>", string.Empty)
                .Replace("</D>", string.Empty);
        }
    }
}
