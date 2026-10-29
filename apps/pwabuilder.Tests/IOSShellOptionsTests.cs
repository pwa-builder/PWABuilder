using PWABuilder.IOS.Models;
using Xunit;

namespace PWABuilder.Tests;

/// <summary>
/// Verifies the iOS shell options (display name, display mode, status bar style, appearance, splash icon size)
/// validate with sensible defaults and land in the generated Xcode project.
/// </summary>
public sealed class IOSShellOptionsTests
{
    [Fact]
    public void Defaults_follow_the_name_and_manifest()
    {
        var validated = CreateOptions(manifestDisplay: "standalone").Validate();

        Assert.Equal("My Progressive App", validated.DisplayName);
        Assert.Equal("standalone", validated.DisplayMode);
        Assert.Equal("auto", validated.StatusBarStyle);
        Assert.Equal("auto", validated.Appearance);
        Assert.Equal(64, validated.SplashIconSize);
    }

    [Fact]
    public void Display_mode_defaults_to_fullscreen_when_the_manifest_asks_for_it()
    {
        var validated = CreateOptions(manifestDisplay: "fullscreen").Validate();
        Assert.Equal("fullscreen", validated.DisplayMode);
    }

    [Fact]
    public void Display_mode_falls_back_to_standalone_for_other_manifest_values()
    {
        var validated = CreateOptions(manifestDisplay: "minimal-ui").Validate();
        Assert.Equal("standalone", validated.DisplayMode);
    }

    [Fact]
    public void Explicit_values_win_and_are_normalized()
    {
        var options = CreateOptions(manifestDisplay: "standalone");
        options.DisplayName = "  My App ";
        options.DisplayMode = " Fullscreen ";
        options.StatusBarStyle = "LIGHT";
        options.Appearance = "Dark";
        options.SplashIconSize = 128;

        var validated = options.Validate();

        Assert.Equal("My App", validated.DisplayName);
        Assert.Equal("fullscreen", validated.DisplayMode);
        Assert.Equal("light", validated.StatusBarStyle);
        Assert.Equal("dark", validated.Appearance);
        Assert.Equal(128, validated.SplashIconSize);
    }

    [Fact]
    public void Unknown_choices_fall_back_to_defaults()
    {
        var options = CreateOptions(manifestDisplay: "standalone");
        options.DisplayMode = "window";
        options.StatusBarStyle = "blue";
        options.Appearance = "sepia";

        var validated = options.Validate();

        Assert.Equal("standalone", validated.DisplayMode);
        Assert.Equal("auto", validated.StatusBarStyle);
        Assert.Equal("auto", validated.Appearance);
    }

    [Theory]
    [InlineData(31)]
    [InlineData(513)]
    public void Splash_icon_size_outside_the_range_is_rejected(int size)
    {
        var options = CreateOptions(manifestDisplay: "standalone");
        options.SplashIconSize = size;
        Assert.Throws<ArgumentOutOfRangeException>(() => options.Validate());
    }

    [Theory]
    [InlineData(32, "launch-64.png")]
    [InlineData(64, "launch-64.png")]
    [InlineData(128, "launch-128.png")]
    [InlineData(192, "launch-192.png")]
    [InlineData(200, "launch-256.png")]
    [InlineData(384, "launch-512.png")]
    [InlineData(1536, "launch-512.png")]
    public void Launch_icon_file_covers_the_requested_pixels(int pixels, string expected)
    {
        Assert.Equal(expected, XcodePwaShellProject.GetLaunchIconFileName(pixels));
    }

    [Fact]
    public async Task Generated_project_carries_the_defaults()
    {
        var files = await GenerateProject(CreateOptions(manifestDisplay: "standalone"));

        Assert.Contains("<key>CFBundleDisplayName</key>\n\t<string>My Progressive App</string>", files.InfoPlist);
        Assert.Contains("<key>UIStatusBarHidden</key>\n\t<false/>", files.InfoPlist);
        Assert.Contains("<key>UIStatusBarStyle</key>\n\t<string>UIStatusBarStyleDefault</string>", files.InfoPlist);
        Assert.DoesNotContain("UIUserInterfaceStyle", files.InfoPlist);

        Assert.Contains("let displayMode = \"standalone\"", files.Settings);
        Assert.Contains("let adaptiveUIStyle = true", files.Settings);
        Assert.Contains("let overrideStatusBar = false", files.Settings);

        Assert.Contains("firstAttribute=\"width\" constant=\"64\"", files.LaunchScreen);
        Assert.Contains("firstAttribute=\"height\" constant=\"64\"", files.LaunchScreen);
        Assert.Contains("<image name=\"LaunchIcon\" width=\"64\" height=\"64\"/>", files.LaunchScreen);

        Assert.Contains("\"filename\" : \"launch-64.png\"", files.LaunchIconSet);
        Assert.Contains("\"filename\" : \"launch-128.png\"", files.LaunchIconSet);
        Assert.Contains("\"filename\" : \"launch-192.png\"", files.LaunchIconSet);

        AssertNoPlaceholders(files);
    }

    [Fact]
    public async Task Generated_project_carries_explicit_options()
    {
        var options = CreateOptions(manifestDisplay: "standalone");
        options.DisplayName = "My App";
        options.DisplayMode = "fullscreen";
        options.StatusBarStyle = "light";
        options.Appearance = "dark";
        options.SplashIconSize = 160;

        var files = await GenerateProject(options);

        Assert.Contains("<key>CFBundleDisplayName</key>\n\t<string>My App</string>", files.InfoPlist);
        Assert.Contains("<key>UIStatusBarHidden</key>\n\t<true/>", files.InfoPlist);
        Assert.Contains("<key>UIStatusBarStyle</key>\n\t<string>UIStatusBarStyleLightContent</string>", files.InfoPlist);
        Assert.Contains("<key>UIUserInterfaceStyle</key>\n\t<string>Dark</string>", files.InfoPlist);

        Assert.Contains("let displayMode = \"fullscreen\"", files.Settings);
        Assert.Contains("let adaptiveUIStyle = false", files.Settings);
        Assert.Contains("let overrideStatusBar = true", files.Settings);
        Assert.Contains("let statusBarTheme = \"dark\"", files.Settings);

        Assert.Contains("firstAttribute=\"width\" constant=\"160\"", files.LaunchScreen);
        Assert.Contains("firstAttribute=\"height\" constant=\"160\"", files.LaunchScreen);

        Assert.Contains("\"filename\" : \"launch-192.png\"", files.LaunchIconSet);
        Assert.Contains("\"filename\" : \"launch-512.png\"", files.LaunchIconSet);

        AssertNoPlaceholders(files);
    }

    [Fact]
    public async Task Dark_status_bar_text_uses_dark_content()
    {
        var options = CreateOptions(manifestDisplay: "standalone");
        options.StatusBarStyle = "dark";
        options.Appearance = "light";

        var files = await GenerateProject(options);

        Assert.Contains("<key>UIStatusBarStyle</key>\n\t<string>UIStatusBarStyleDarkContent</string>", files.InfoPlist);
        Assert.Contains("<key>UIUserInterfaceStyle</key>\n\t<string>Light</string>", files.InfoPlist);
        Assert.Contains("let overrideStatusBar = true", files.Settings);
        Assert.Contains("let statusBarTheme = \"light\"", files.Settings);
    }

    [Fact]
    public void Template_still_has_every_placeholder()
    {
        var template = FindTemplateDirectory();
        var settings = File.ReadAllText(Path.Combine(template, "pwa-shell", "Settings.swift"));
        var infoPlist = File.ReadAllText(Path.Combine(template, "pwa-shell", "Info.plist"));
        var launchScreen = File.ReadAllText(Path.Combine(template, "pwa-shell", "Base.lproj", "LaunchScreen.storyboard"));

        Assert.Contains("{{PWABuilder.iOS.displayMode}}", settings);
        Assert.Contains("{{PWABuilder.iOS.adaptiveUIStyle}}", settings);
        Assert.Contains("{{PWABuilder.iOS.overrideStatusBar}}", settings);
        Assert.Contains("{{PWABuilder.iOS.statusBarTheme}}", settings);
        Assert.Contains("{{PWABuilder.iOS.appName}}", infoPlist);
        Assert.Contains("{{PWABuilder.iOS.statusBarStyle}}", infoPlist);
        Assert.Contains("{{PWABuilder.iOS.statusBarHidden}}", infoPlist);
        Assert.Contains("{{PWABuilder.iOS.appearance}}", infoPlist);
        Assert.Contains("{{PWABuilder.iOS.splashIconSize}}", launchScreen);
    }

    private static IOSAppPackageOptions CreateOptions(string manifestDisplay)
    {
        return new IOSAppPackageOptions
        {
            Name = "My Progressive App",
            BundleId = "com.example.myapp",
            Url = "https://example.com",
            ImageUrl = "https://example.com/icon-512.png",
            ManifestUrl = "https://example.com/manifest.json",
            SplashColor = "#ffffff",
            ProgressBarColor = "#000000",
            StatusBarColor = "#ffffff",
            PermittedUrls = new List<string>(),
            Manifest = new WebAppManifest
            {
                Name = "My Progressive App",
                Display = manifestDisplay,
                Background_color = "#ffffff",
                Theme_color = "#000000"
            }
        };
    }

    private static async Task<GeneratedFiles> GenerateProject(IOSAppPackageOptions options)
    {
        var validated = options.Validate();
        var template = FindTemplateDirectory();
        var outputDir = Path.Combine(Path.GetTempPath(), "pwabuilder-ios-test-" + Guid.NewGuid().ToString("N"));
        CopyDirectory(template, outputDir);
        try
        {
            var project = new XcodePwaShellProject(validated, outputDir);
            project.Load();
            await project.ApplyChanges();

            // ApplyChanges renames the pwa-shell folder after the app, so search for the files instead of assuming a path.
            return new GeneratedFiles(
                ReadSingle(outputDir, "Info.plist"),
                ReadSingle(outputDir, "Settings.swift"),
                ReadSingle(outputDir, "LaunchScreen.storyboard"),
                File.ReadAllText(Directory.GetFiles(outputDir, "Contents.json", SearchOption.AllDirectories)
                    .Single(p => p.Contains("LaunchIcon.imageset")))
            );
        }
        finally
        {
            Directory.Delete(outputDir, recursive: true);
        }
    }

    private static void AssertNoPlaceholders(GeneratedFiles files)
    {
        Assert.DoesNotContain("{{PWABuilder.iOS.", files.InfoPlist);
        Assert.DoesNotContain("{{PWABuilder.iOS.", files.Settings);
        Assert.DoesNotContain("{{PWABuilder.iOS.", files.LaunchScreen);
        Assert.DoesNotContain("{{PWABuilder.iOS.", files.LaunchIconSet);
    }

    private static string ReadSingle(string root, string fileName)
    {
        return File.ReadAllText(Directory.GetFiles(root, fileName, SearchOption.AllDirectories).Single());
    }

    private static string FindTemplateDirectory()
    {
        // The web project copies Resources/IOS into its output; the test output sits next to it.
        var candidates = new[]
        {
            Path.Combine(AppContext.BaseDirectory, "Resources", "IOS", "ios-project-src"),
            Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "..", "pwabuilder", "Resources", "IOS", "ios-project-src")),
        };
        var found = candidates.FirstOrDefault(Directory.Exists);
        if (found == null)
        {
            throw new DirectoryNotFoundException("Could not find the iOS template under " + string.Join(" or ", candidates));
        }

        return found;
    }

    private static void CopyDirectory(string source, string destination)
    {
        Directory.CreateDirectory(destination);
        foreach (var file in Directory.GetFiles(source))
        {
            File.Copy(file, Path.Combine(destination, Path.GetFileName(file)));
        }

        foreach (var dir in Directory.GetDirectories(source))
        {
            CopyDirectory(dir, Path.Combine(destination, Path.GetFileName(dir)));
        }
    }

    private sealed record GeneratedFiles(string InfoPlist, string Settings, string LaunchScreen, string LaunchIconSet);
}
