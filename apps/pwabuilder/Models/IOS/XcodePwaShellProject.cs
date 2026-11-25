using System.Text;
using PWABuilder.Common;

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
            UpdateShellOptions();
            UpdateSplashIconSize();
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

            // Update the display name, the name under the icon on the home screen. It defaults to the app name.
            var appNameExisting = "<string>{{PWABuilder.iOS.appName}}</string>";
            var appNameDesired = $"<string>{GetXmlSafeNodeValue(options.DisplayName)}</string>";
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

        /// <summary>
        /// Writes the display mode, status bar style and appearance into Settings.swift and Info.plist.
        /// The shell already reads these constants; they were fixed values until now.
        /// </summary>
        private void UpdateShellOptions()
        {
            var settingsFile = GetFile("Settings.swift");
            var infoPlistXmlFile = GetFile("Info.plist");

            settingsFile.Replace("{{PWABuilder.iOS.displayMode}}", options.DisplayMode);

            // Status bar text and icons. "auto" keeps the shell's adaptive behavior; "light" or "dark" fix the style.
            // The shell's statusBarTheme names the app background: "dark" background means light status bar text.
            var overrideStatusBar = options.StatusBarStyle != "auto";
            var statusBarTheme = options.StatusBarStyle == "light" ? "dark" : "light";
            settingsFile.Replace("{{PWABuilder.iOS.overrideStatusBar}}", overrideStatusBar ? "true" : "false");
            settingsFile.Replace("{{PWABuilder.iOS.statusBarTheme}}", statusBarTheme);
            var statusBarStyleValue = options.StatusBarStyle switch
            {
                "light" => "UIStatusBarStyleLightContent",
                "dark" => "UIStatusBarStyleDarkContent",
                _ => "UIStatusBarStyleDefault"
            };
            infoPlistXmlFile.Replace("<string>{{PWABuilder.iOS.statusBarStyle}}</string>", $"<string>{statusBarStyleValue}</string>");

            // Appearance. "auto" lets iOS 15+ follow the web view background (adaptiveUIStyle) and the system theme.
            // "light" or "dark" lock the app with UIUserInterfaceStyle and switch the adaptive behavior off.
            settingsFile.Replace("{{PWABuilder.iOS.adaptiveUIStyle}}", options.Appearance == "auto" ? "true" : "false");
            var appearanceEntry = options.Appearance switch
            {
                "light" => "\t<key>UIUserInterfaceStyle</key>\n\t<string>Light</string>\n",
                "dark" => "\t<key>UIUserInterfaceStyle</key>\n\t<string>Dark</string>\n",
                _ => string.Empty
            };
            infoPlistXmlFile.Replace("\t{{PWABuilder.iOS.appearance}}\n", appearanceEntry);

            // Fullscreen hides the status bar at launch; the shell's displayMode keeps it hidden afterwards.
            infoPlistXmlFile.Replace("<{{PWABuilder.iOS.statusBarHidden}}/>", options.DisplayMode == "fullscreen" ? "<true/>" : "<false/>");
        }

        /// <summary>
        /// Sizes the splash icon in both places it is shown: the system launch screen (LaunchScreen.storyboard) and the
        /// loading view the app shows while the first page loads (Main.storyboard). The two must match or the icon jumps in size after launch.
        /// </summary>
        private void UpdateSplashIconSize()
        {
            var iconSize = options.SplashIconSize;
            GetFile("LaunchScreen.storyboard").Replace("{{PWABuilder.iOS.splashIconSize}}", Number(iconSize));

            // The loading view holds the icon, the progress bar under it and the offline icon. It uses fixed frames with
            // flexible margins, so the frames are worked out here. The icon sits at the center of the loading view, which
            // is centered on screen, the same place the launch screen puts it. At 64 points these are the original frames.
            const int sceneWidth = 390, sceneHeight = 844, iconTop = 68, progressWidth = 100, offlineIconWidth = 30;
            var viewWidth = Math.Max(200, iconSize);
            var viewHeight = iconSize + (2 * iconTop);
            var mainStoryboard = GetFile("Main.storyboard");
            mainStoryboard.Replace("{{PWABuilder.iOS.splashIconSize}}", Number(iconSize));
            mainStoryboard.Replace("{{PWABuilder.iOS.loadingViewX}}", Number((sceneWidth - viewWidth) / 2.0));
            mainStoryboard.Replace("{{PWABuilder.iOS.loadingViewY}}", Number((sceneHeight - viewHeight) / 2.0));
            mainStoryboard.Replace("{{PWABuilder.iOS.loadingViewWidth}}", Number(viewWidth));
            mainStoryboard.Replace("{{PWABuilder.iOS.loadingViewHeight}}", Number(viewHeight));
            mainStoryboard.Replace("{{PWABuilder.iOS.loadingIconX}}", Number((viewWidth - iconSize) / 2.0));
            mainStoryboard.Replace("{{PWABuilder.iOS.loadingProgressX}}", Number((viewWidth - progressWidth) / 2.0));
            mainStoryboard.Replace("{{PWABuilder.iOS.loadingProgressY}}", Number(iconTop + iconSize + 14));
            mainStoryboard.Replace("{{PWABuilder.iOS.loadingOfflineIconX}}", Number((viewWidth - offlineIconWidth) / 2.0));
            mainStoryboard.Replace("{{PWABuilder.iOS.loadingOfflineIconY}}", Number(iconTop + iconSize + 27));

            WriteLaunchIconSet(iconSize);
        }

        /// <summary>
        /// Fills the LaunchIcon image set with one file per screen scale, each the smallest generated launch image that
        /// covers the icon at that scale, and removes the generated sizes the set does not use so Xcode sees no unassigned files.
        /// </summary>
        private void WriteLaunchIconSet(int iconSize)
        {
            var imageSetDirectory = Path.GetDirectoryName(GetFileByPath(Path.Combine("LaunchIcon.imageset", "Contents.json")).ItemPath)!;
            var generated = Directory.GetFiles(imageSetDirectory, "launch-*.png")
                .Select(path => (Path: path, Pixels: GetLaunchImagePixels(path)))
                .Where(image => image.Pixels > 0)
                .OrderBy(image => image.Pixels)
                .ToList();
            if (generated.Count == 0)
            {
                return;
            }

            var slots = new List<(string Destination, byte[] Bytes)>(3);
            foreach (var scale in new[] { 1, 2, 3 })
            {
                var source = PickLaunchImage(generated.Select(image => image.Pixels), iconSize * scale);
                var bytes = File.ReadAllBytes(generated.First(image => image.Pixels == source).Path);
                slots.Add((Path.Combine(imageSetDirectory, $"launch-{scale}x.png"), bytes));
            }

            generated.ForEach(image => File.Delete(image.Path));
            slots.ForEach(slot => File.WriteAllBytes(slot.Destination, slot.Bytes));
        }

        /// <summary>
        /// Picks the smallest available launch image that covers the wanted pixel size, or the largest one when none does.
        /// </summary>
        public static int PickLaunchImage(IEnumerable<int> availablePixels, int wantedPixels)
        {
            var ordered = availablePixels.OrderBy(pixels => pixels).ToList();
            var covering = ordered.Where(pixels => pixels >= wantedPixels).ToList();
            return covering.Count > 0 ? covering[0] : ordered[^1];
        }

        /// <summary>
        /// Reads the pixel size out of a generated launch image name such as launch-512.png. Returns 0 for any other name.
        /// </summary>
        private static int GetLaunchImagePixels(string path)
        {
            var name = Path.GetFileNameWithoutExtension(path);
            return int.TryParse(name.AsSpan("launch-".Length), System.Globalization.NumberStyles.None, System.Globalization.CultureInfo.InvariantCulture, out var pixels) ? pixels : 0;
        }

        private static string Number(double value) => value.ToString("0.##", System.Globalization.CultureInfo.InvariantCulture);

        private void UpdateShortcuts(XcodeFile infoPlistXmlFile)
        {
            var shortcutsTemplate = "<key>{{PWABuilder.iOS.shortcuts}}</key>";
            var shortcuts = (options.Manifest.Shortcuts ?? new List<WebManifestShortcutItem>(0))
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
