using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;

namespace PWABuilder.MicrosoftStore.Models
{
    /// <summary>
    /// Configuration options for generating the Windows app package.
    /// </summary>
    public class WindowsAppPackageOptions
    {
        /// <summary>
        /// The package ID that uniquely identifies the app. Can only contain letters, numbers, hypen, and period. Typically, "MyCompany.MyApp". If unspecified, one will be created based on the URL.
        /// </summary>
        public string PackageId { get; set; } = string.Empty;

        /// <summary>
        /// Gets the display name of the app. If not supplied, the name will be fetched from the web manifest.
        /// </summary>
        public string? Name { get; set; }

        /// <summary>
        /// The URL of the PWA to generate an .msix file from.
        /// </summary>
        public required Uri Url { get; set; }

        /// <summary>
        /// The version of the app.
        /// </summary>
        public string Version { get; set; } = string.Empty;

        /// <summary>
        /// Whether the generated MSIX package will be signable. If false, the app won't be able to be submitted to the Store.
        /// </summary>
        public bool AllowSigning { get; set; }

        /// <summary>
        /// The publisher information.
        /// </summary>
        public Publisher? Publisher { get; set; }

        /// <summary>
        /// The Edge channel. Must be one of: stable, beta, dev, canary, internal. Defaults to stable.
        /// </summary>
        public string? EdgeChannel { get; set; }

        /// <summary>
        /// The Application ID of the application
        /// </summary>
        public string? ApplicationId { get; set; } = "App";

        /// <summary>
        /// The App User Model Id (aumid) that will be declared in the MSIX manifest. Default is Microsoft.MicrosoftEdge.[channel]_8wekyb3d8bbwe!MSEDGE
        /// </summary>
        public string? AppUserModelId { get; set; }

        /// <summary>
        /// Extended configuration. Expected values are "sharetarget", "filetype". Currently not used but reserved for future use.
        /// </summary>
        public string? Extensions { get; set; }

        /// <summary>
        /// Whether to generate the modern app package, a PWA powered by Microsoft Edge using the new Hosted App Model. This app will work on versions of Windows >= May 2020 Update.
        /// </summary>
        public bool GenerateModernPackage { get; set; } = true;

        /// <summary>
        /// Options for generating the classic Windows package, a PWA package powered by Microsoft Edge that runs on older Windows versions prior to May 2020 update.
        /// </summary>
        public ClassicWindowsPackageOptions? ClassicPackage { get; set; }

        /// <summary>
        /// Options for generating an EdgeHTML (legacy Edge, aka Spartan)-based package.
        /// </summary>
        public SpartanWindowsPackageOptions? EdgeHtmlPackage { get; set; }

        /// <summary>
        /// The URL to the web app manifest. If null, it will be fetched via the manifest finder service.
        /// </summary>
        public Uri? ManifestUrl { get; set; }

        /// <summary>
        /// The PWA's web app manifest contents.
        /// </summary>
        public JsonDocument? Manifest { get; set; }

        /// <summary>
        /// The file path of the generated manifest file if raw manifest is provided (populated by the code)
        /// </summary>
        public string? ManifestFilePath { get; set; }
        /// <summary>
        /// The image options. This includings options for generating images, as well as optional URLs to existing images to use.
        /// </summary>
        public WindowsImages? Images { get; set; }

        /// <summary>
        /// The start URL for the PWA. If null, the value from the web app manifest will be used.
        /// </summary>
        /// <remarks>This was added for a partner, Facebook, who wished to create a private manifest behind user login, so they needed to override the start_url.</remarks>
        public string? StartUrl { get; set; }

        /// <summary>
        /// The resource language of the Windows app package. Defaults to EN-US.
        /// </summary>
        public string? ResourceLanguage { get; set; }

        /// <summary>
        /// The Device families supported by the package. The currently accepted values are "Desktop","Holographic" or "Team".
        /// </summary>
        public List<string>? TargetDeviceFamilies { get; set; }

        /// <summary>
        /// Whether to use the old pwa_builder.exe tool that accepts passing a manifest URL into the tool, rather than fetching it dynamically.
        /// This should be enabled only for scenarios where we want to generate a package for a site where the manifest isn't accessible or detectable. 
        /// In such cases, we provide an alternative URL where the manifest can be downloaded by the tool.
        /// </summary>
        public bool? UsePWABuilderWithCustomManifest { get; set; } = false;

        /// <summary>
        /// A boolean to indicate if widgets are enabled in the PWA
        /// </summary>
        public bool? EnableWebAppWidgets { get; set; } = false;

        /// <summary>
        /// Options related to Windows Actions, which surface app actions to the OS level. For example, an app can declare that it can remove background from images. Users can, for example, right-click an image in Windows Explore and remove the background of an image using your app.
        /// </summary>
        /// <remarks>
        /// For more information about App Actions, see https://learn.microsoft.com/en-us/windows/ai/app-actions/actions-get-started
        /// For more information about App Actions for PWAs, see https://blogs.windows.com/msedgedev/2025/05/30/bring-your-pwa-closer-to-users-with-app-actions-on-windows/
        /// To test out a PWA with App Actions, see the App Actions Testing Playground https://apps.microsoft.com/detail/9plswv2gr8b4
        /// </remarks>
        public WindowsActionsOptions? WindowsActions { get; set; }

        public List<string> GetValidationErrors(AppSettings appSettings)
        {
            // Package ID can contain only letters, numbers, hyphen, period.
            var errors = new List<string>(1);
            if (string.IsNullOrWhiteSpace(this.PackageId))
            {
                errors.Add("Package ID must not be empty");
            }
            else
            {
                if (this.PackageId.Any(c => c != '.' && c != '-' && !char.IsLetterOrDigit(c)))
                {
                    errors.Add("Package ID can only contain letters, digits, period, and hyphen.");
                }
                if (this.PackageId.Length < 3)
                {
                    errors.Add("Package ID must be at least 3 characters");
                }
            }

            var uri = this.Url;
            // Ensure the URL is an absolute HTTPS, non-loopback URL.
            if (uri == null || !uri.IsAbsoluteUri || uri.Scheme != Uri.UriSchemeHttps || uri.IsLoopback)
            {
                errors.Add("URL must be an absolute HTTPS URL and cannot be a loopback address.");
            }

            // The version requirements for the Microsoft Store: https://docs.microsoft.com/en-us/windows/uwp/publish/package-version-numbering
            //
            // The major version must be 1 or greater (e.g. it can't be 0.5.0.0)
            // Tevision number must be zero or omitted (1.0.0.0 or 1.0.0) The revision number is reserved for Store use.
            // The version must be 1.0.1 or greater if the user is creating a classic app package, because classic app package must have a lower version than the modern app package.
            if (!System.Version.TryParse(Version, out var version))
            {
                errors.Add("The version must be a valid Version string in the form of 'x.x.x'");
            }
            else
            {
                // Major version must be > 0
                if (version.Major == 0)
                {
                    errors.Add("The app version must have a major version of 1 or greater. Versions starting with zero are not accepted by the Store.");
                }

                // Ensure revision number is omitted or zero.
                if (version.Revision > 0) // it will be -1 if omitted
                {
                    errors.Add("The app version must have the revision section omitted or zero: 'x.x.x' or 'x.x.x.0'. The revision is reserved for Store use.");
                }

                // If we're generating a classic package, make sure our version is >= 1.0.1
                // Needed because the Store requires a different version for the app packages targetting different version of Windows. If the modern package will have v1.0.1, the classic package will have v1.0.0
                if (ClassicPackage?.Generate == true && version < new System.Version(1, 0, 1))
                {
                    errors.Add("The app version must be >= 1.0.1 when including a classic app package.");
                }
            }

            // The classic package version may be omitted. But if it's specified, validate it.
            if (ClassicPackage?.Generate == true && !string.IsNullOrWhiteSpace(ClassicPackage?.Version))
            {
                if (!System.Version.TryParse(ClassicPackage.Version, out var classicVersion))
                {
                    errors.Add("Invalid classic package version. Must be a version in the 'x.x.x' format.");
                }
                else
                {
                    if (version != null && classicVersion >= version)
                    {
                        errors.Add("The classic app package version must be less than the modern app package version.");
                    }
                    if (classicVersion.Major == 0)
                    {
                        errors.Add("The classic app package version must be 1.0 or greater.");
                    }
                    if (classicVersion.Revision > 0)
                    {
                        errors.Add("The revision number of the classic app package version must be zero or omitted, e.g. 'x.x.x' or 'x.x.x.0'.");
                    }
                }
            }

            // The package ID max length is 50. See https://github.com/pwa-builder/PWABuilder/issues/1778
            if (PackageId.Length > 50)
            {
                errors.Add("Package ID must be 50 characters or fewer.");
            }

            if (!string.IsNullOrEmpty(this.EdgeChannel))
            {
                var validChannels = new[] { "stable", "beta", "dev", "canary", "internal" };
                if (!validChannels.Any(c => c == this.EdgeChannel))
                {
                    errors.Add("edgeChannel must be one of " + string.Join(", ", validChannels));
                }
            }

            if (!string.IsNullOrEmpty(this.ResourceLanguage))
            {
                // For Store supported languages, see https://docs.microsoft.com/en-us/windows/uwp/publish/supported-languages
                var storeSupportedLanguages = System.IO.File.ReadAllLines(appSettings.StoreSupportedLanguagesPath)
                    .Select(lang => lang.Trim());

                // We now support multiple languages via a comma separated string.
                var languages = this.ResourceLanguage
                    .Split(',', StringSplitOptions.RemoveEmptyEntries)
                    .Select(lang => lang.Trim());
                foreach (var language in languages)
                {
                    if (!storeSupportedLanguages.Contains(language, StringComparer.OrdinalIgnoreCase))
                    {
                        errors.Add($"'{language}' is an invalid language string. Your manifest's `lang` must be set to a valid Store-supported language. For a list of Store-supported languages, see https://docs.microsoft.com/en-us/windows/uwp/publish/supported-languages");
                    }
                }
            }

            // Trim any whitespace from the 3 required fields. See https://github.com/pwa-builder/PWABuilder/issues/1937#issuecomment-880862998
            if (this.Publisher?.CommonName != null)
            {
                this.Publisher.CommonName = this.Publisher.CommonName.Trim();
            }
            if (this.Publisher?.DisplayName != null)
            {
                this.Publisher.DisplayName = this.Publisher.DisplayName.Trim();
            }
            if (this.PackageId != null)
            {
                this.PackageId = this.PackageId.Trim();
            }

            //Checking if the Device families are valid
            if (this.TargetDeviceFamilies != null)
            {
                var deviceFamilies = new[] { "holographic", "desktop", "team" };
                this.TargetDeviceFamilies = this.TargetDeviceFamilies.Where(deviceFamily => deviceFamily != null && deviceFamily != "").Select(deviceFamily => deviceFamily.Trim()).Distinct().ToList<string>();
                foreach (string family in this.TargetDeviceFamilies)
                {
                    if (!deviceFamilies.Any(c => c == family.ToLower()))
                    {
                        errors.Add("TargetDeviceFamilies must contain only the following " + string.Join(", ", deviceFamilies));
                    }

                }
            }

            return errors;
        }

        /// <summary>
        /// Creates a shallow copy of the options.
        /// </summary>
        /// <returns></returns>
        public WindowsAppPackageOptions Clone()
        {
            return (WindowsAppPackageOptions)this.MemberwiseClone();
        }

        /// <summary>
        /// Gets the PWA's absolute start URL. The absolute start URL will be computed from:
        /// 
        /// 1. The <see cref="StartUrl"/> of this options object. If null or empty, it will fallback to
        /// 2. The start_url of the web manifest. If null or empty, it will fallback to
        /// 3. The URL of the PWA.
        /// 
        /// Whichever is used, it will be resolved to an absolute path using the absolute URL of the web manifest.
        /// </summary>
        /// <param name="webManifest"></param>
        /// <returns></returns>
        public Uri GetStartUrl(WebAppManifestContext webManifest)
        {
            var potentialStartUrls = new[]
            {
                this.StartUrl, // If the user specified one in the options, use that.
                webManifest.Start_url, // Otherwise fall back to web manifest's start_url
                this.Url?.ToString() // Finally, fallback to the URL of the PWA.
            };
            var startUrl = potentialStartUrls
                .First(val => !string.IsNullOrWhiteSpace(val));

            // Make sure the URL is absolute, relative to the web manifest path.
            return webManifest.ResolveUri(startUrl!, this.Url);
        }
    }
}
