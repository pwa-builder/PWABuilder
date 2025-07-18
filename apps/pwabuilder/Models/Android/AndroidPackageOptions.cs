namespace PWABuilder.Android.Models
{
    /// <summary>
    /// Options for creating an Android PWA package.
    /// </summary>
    public class AndroidPackageOptions
    {
        public string? AppVersion { get; set; }
        public int AppVersionCode { get; set; }
        public string? BackgroundColor { get; set; }
        public string? Display { get; set; }
        public bool EnableNotifications { get; set; }
        public bool? EnableSiteSettingsShortcut { get; set; }
        public string? FallbackType { get; set; }
        public AndroidFeatures? Features { get; set; }
        public string? Host { get; set; }
        public string? IconUrl { get; set; }
        public bool IncludeSourceCode { get; set; }
        public bool? IsChromeOSOnly { get; set; }
        public bool? IsMetaQuest { get; set; }
        public string? LauncherName { get; set; }
        public string? MaskableIconUrl { get; set; }
        public string? MonochromeIconUrl { get; set; }
        public string? Name { get; set; }
        public string? NavigationColor { get; set; }
        public string? NavigationColorDark { get; set; }
        public string? NavigationDividerColor { get; set; }
        public string? NavigationDividerColorDark { get; set; }
        public string? Orientation { get; set; }
        public string? PackageId { get; set; }
        public List<WebManifestShortcut>? Shortcuts { get; set; }
        public SigningOptions? Signing { get; set; }
        public string? SigningMode { get; set; } // "new", "none", "mine"
        public int SplashScreenFadeOutDuration { get; set; }
        public string? StartUrl { get; set; }
        public string? ThemeColor { get; set; }
        public string? ThemeColorDark { get; set; }
        public string? WebManifestUrl { get; set; }
        public string? PwaUrl { get; set; }
        public string? FullScopeUrl { get; set; }
        public int? MinSdkVersion { get; set; }

        public Validated Validate()
        {
            var errors = new List<string>();

            // Required fields (always mandatory)
            if (string.IsNullOrWhiteSpace(Name))
                errors.Add("Name is required.");
            if (string.IsNullOrWhiteSpace(PackageId))
                errors.Add("PackageId is required.");
            if (string.IsNullOrWhiteSpace(Host))
                errors.Add("Host is required.");
            if (string.IsNullOrWhiteSpace(PwaUrl))
                errors.Add("PwaUrl is required.");
            if (string.IsNullOrWhiteSpace(IconUrl))
                errors.Add("IconUrl is required.");
            if (string.IsNullOrWhiteSpace(LauncherName))
                errors.Add("LauncherName is required.");
            if (string.IsNullOrWhiteSpace(StartUrl))
                errors.Add("StartUrl is required.");
            if (string.IsNullOrWhiteSpace(BackgroundColor))
                errors.Add("BackgroundColor is required.");
            if (string.IsNullOrWhiteSpace(ThemeColor))
                errors.Add("ThemeColor is required.");
            if (string.IsNullOrWhiteSpace(Display))
                errors.Add("Display is required.");
            if (string.IsNullOrWhiteSpace(FallbackType))
                errors.Add("FallbackType is required.");
            if (string.IsNullOrWhiteSpace(WebManifestUrl))
                errors.Add("WebManifestUrl is required.");
            if (string.IsNullOrWhiteSpace(SigningMode))
                errors.Add("SigningMode is required.");

            if (IsMetaQuest == true && string.IsNullOrWhiteSpace(FullScopeUrl))
            {
                errors.Add("FullScopeUrl is required when IsMetaQuest is true.");
            }

            // Signing validation
            if (SigningMode != "none")
            {
                if (Signing == null)
                {
                    errors.Add("Signing is required when SigningMode is not 'none'.");
                }
                else
                {
                    if (SigningMode == "mine")
                    {
                        if (string.IsNullOrWhiteSpace(Signing.File))
                            errors.Add("Signing file is required in 'mine' mode.");
                        else if (!Signing.File.StartsWith("data:"))
                            errors.Add(
                                "Signing file must be base64 encoded (starting with 'data:')."
                            );
                    }

                    if (SigningMode == "new")
                    {
                        if (string.IsNullOrWhiteSpace(Signing.CountryCode))
                            errors.Add("CountryCode is required in 'new' mode.");
                        if (string.IsNullOrWhiteSpace(Signing.FullName))
                            errors.Add("FullName is required in 'new' mode.");
                        if (string.IsNullOrWhiteSpace(Signing.Organization))
                            errors.Add("Organization is required in 'new' mode.");
                        if (string.IsNullOrWhiteSpace(Signing.OrganizationalUnit))
                            errors.Add("OrganizationalUnit is required in 'new' mode.");
                    }

                    // Default passwords if missing
                    var defaultPass = Guid.NewGuid().ToString("N").Substring(0, 12);
                    Signing.KeyPassword ??= defaultPass;
                    Signing.StorePassword ??= defaultPass;

                    if (string.IsNullOrWhiteSpace(Signing.Alias))
                        errors.Add("Signing alias is required.");
                    if (string.IsNullOrWhiteSpace(Signing.KeyPassword))
                        errors.Add("Signing key password is required.");
                    if (string.IsNullOrWhiteSpace(Signing.StorePassword))
                        errors.Add("Signing store password is required.");
                }
            }

            if (errors.Any())
            {
                throw new ArgumentException(
                    "Invalid Android package options: " + string.Join(" | ", errors)
                );
            }

            // URI parsing
            var parsedHost = new Uri("https://" + Host!.Trim(), UriKind.Absolute);
            var parsedPwaUrl = new Uri(PwaUrl!.Trim(), UriKind.Absolute);
            var parsedIconUrl = new Uri(IconUrl!.Trim(), UriKind.Absolute);
            var parsedManifestUrl = new Uri(WebManifestUrl!.Trim(), UriKind.Absolute);
            Uri? parsedFullScope = !string.IsNullOrWhiteSpace(FullScopeUrl)
                ? new Uri(FullScopeUrl!.Trim(), UriKind.Absolute)
                : null;

            return new Validated(
                Name!.Trim(),
                PackageId!.Trim(),
                parsedHost,
                parsedPwaUrl,
                parsedIconUrl,
                LauncherName!,
                StartUrl!,
                BackgroundColor!,
                ThemeColor!,
                Display!,
                FallbackType!,
                SigningMode!,
                Signing!,
                parsedManifestUrl,
                parsedFullScope,
                AppVersion!,
                AppVersionCode,
                SplashScreenFadeOutDuration,
                IncludeSourceCode,
                MinSdkVersion ?? 19,
                IsChromeOSOnly ?? false,
                IsMetaQuest ?? false,
                NavigationColor,
                NavigationColorDark,
                NavigationDividerColor,
                NavigationDividerColorDark,
                Orientation,
                MaskableIconUrl,
                MonochromeIconUrl,
                EnableNotifications,
                EnableSiteSettingsShortcut ?? false,
                Features,
                Shortcuts
            );
        }
    }

    public class AndroidFeatures
    {
        public LocationDelegationConfig? LocationDelegation { get; set; }
        public PlayBillingConfig? PlayBilling { get; set; }
    }

    public class LocationDelegationConfig
    {
        public bool Enabled { get; set; }
    }

    public class PlayBillingConfig
    {
        public bool Enabled { get; set; }
    }

    public class WebManifestShortcut
    {
        public string? Name { get; set; }
        public string? Short_Name { get; set; }
        public string? Description { get; set; }
        public string? Url { get; set; }
        public List<ShortcutIcon>? Icons { get; set; }
    }

    public class ShortcutIcon
    {
        public string? Src { get; set; }
        public string? Sizes { get; set; }
    }

    public class SigningOptions
    {
        public string? File { get; set; }
        public string? Alias { get; set; }
        public string? FullName { get; set; }
        public string? Organization { get; set; }
        public string? OrganizationalUnit { get; set; }
        public string? CountryCode { get; set; }
        public string? KeyPassword { get; set; }
        public string? StorePassword { get; set; }
    }

    public record Validated(
        string Name,
        string PackageId,
        Uri Host,
        Uri PwaUrl,
        Uri IconUrl,
        string LauncherName,
        string StartUrl,
        string BackgroundColor,
        string ThemeColor,
        string Display,
        string FallbackType,
        string SigningMode,
        SigningOptions Signing,
        Uri ManifestUrl,
        Uri? FullScopeUrl,
        string AppVersion,
        int AppVersionCode,
        int SplashScreenFadeOutDuration,
        bool IncludeSourceCode,
        int MinSdkVersion,
        bool IsChromeOSOnly,
        bool IsMetaQuest,
        string? NavigationColor,
        string? NavigationColorDark,
        string? NavigationDividerColor,
        string? NavigationDividerColorDark,
        string? Orientation,
        string? MaskableIconUrl,
        string? MonochromeIconUrl,
        bool EnableNotifications,
        bool EnableSiteSettingsShortcut,
        AndroidFeatures? Features,
        List<WebManifestShortcut>? Shortcuts
    );
}
