using PWABuilder.IOS.Common;
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
    [InlineData(257)]
    [InlineData(512)]
    public void Splash_icon_size_outside_the_range_is_rejected(int size)
    {
        var options = CreateOptions(manifestDisplay: "standalone");
        options.SplashIconSize = size;
        Assert.Throws<ArgumentOutOfRangeException>(() => options.Validate());
    }

    /// <summary>The smallest generated image that covers the wanted pixels is picked; when none does, the largest one.</summary>
    [Theory]
    [InlineData(32, 64)]
    [InlineData(64, 64)]
    [InlineData(65, 128)]
    [InlineData(192, 192)]
    [InlineData(200, 256)]
    [InlineData(384, 512)]
    [InlineData(513, 1024)]
    [InlineData(768, 1024)]
    [InlineData(2000, 1024)]
    public void Launch_image_covers_the_wanted_pixels(int wanted, int expected)
    {
        Assert.Equal(expected, XcodePwaShellProject.PickLaunchImage([64, 128, 192, 256, 512, 1024], wanted));
    }

    /// <summary>Every allowed size is covered at 3x by a generated image, so no allowed size is upscaled.</summary>
    [Fact]
    public void Every_allowed_size_is_covered_on_3x_screens()
    {
        var generated = ImageTargetSizeExtensions.GetAll().Where(size => size.IsLaunchIconSize()).Select(size => size.GetDimensions().Item1).ToList();
        Assert.Contains(1024, generated);
        for (var size = IOSAppPackageOptions.MinSplashIconSize; size <= IOSAppPackageOptions.MaxSplashIconSize; size++)
        {
            foreach (var scale in new[] { 1, 2, 3 })
            {
                Assert.True(XcodePwaShellProject.PickLaunchImage(generated, size * scale) >= size * scale, $"{size} points at {scale}x is not covered");
            }
        }
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

        // The loading view shown after launch keeps the frames the template always had.
        Assert.Contains("<rect key=\"frame\" x=\"95\" y=\"322\" width=\"200\" height=\"200\"/>", files.MainStoryboard);
        Assert.Contains("<rect key=\"frame\" x=\"68\" y=\"68\" width=\"64\" height=\"64\"/>", files.MainStoryboard);
        Assert.Contains("<rect key=\"frame\" x=\"50\" y=\"146\" width=\"100\" height=\"15\"/>", files.MainStoryboard);
        Assert.Contains("<image name=\"LaunchIcon\" width=\"64\" height=\"64\"/>", files.MainStoryboard);

        AssertLaunchImages(files, expected1x: 64, expected2x: 128, expected3x: 192);

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

        // The loading view shown after launch uses the same icon size, centered, with the progress bar under it.
        Assert.Contains("<rect key=\"frame\" x=\"95\" y=\"274\" width=\"200\" height=\"296\"/>", files.MainStoryboard);
        Assert.Contains("<rect key=\"frame\" x=\"20\" y=\"68\" width=\"160\" height=\"160\"/>", files.MainStoryboard);
        Assert.Contains("<rect key=\"frame\" x=\"50\" y=\"242\" width=\"100\" height=\"15\"/>", files.MainStoryboard);
        Assert.Contains("<image name=\"LaunchIcon\" width=\"160\" height=\"160\"/>", files.MainStoryboard);

        AssertLaunchImages(files, expected1x: 192, expected2x: 512, expected3x: 512);

        AssertNoPlaceholders(files);
    }

    /// <summary>The largest allowed size gets the 1024 pixel image on 3x screens, and the loading view grows to hold the icon.</summary>
    [Fact]
    public async Task Largest_splash_icon_uses_the_1024_pixel_image()
    {
        var options = CreateOptions(manifestDisplay: "standalone");
        options.SplashIconSize = 256;

        var files = await GenerateProject(options);

        AssertLaunchImages(files, expected1x: 256, expected2x: 512, expected3x: 1024);
        Assert.Contains("<rect key=\"frame\" x=\"67\" y=\"226\" width=\"256\" height=\"392\"/>", files.MainStoryboard);
        Assert.Contains("<rect key=\"frame\" x=\"0\" y=\"68\" width=\"256\" height=\"256\"/>", files.MainStoryboard);
        AssertNoPlaceholders(files);
    }

    /// <summary>The launch screen lets the size constraints win over the image's own size, and the shell keeps the status bar hidden in fullscreen.</summary>
    [Fact]
    public void Template_layout_and_status_bar_rules_hold()
    {
        var template = FindTemplateDirectory();
        var launchScreen = File.ReadAllText(Path.Combine(template, "pwa-shell", "Base.lproj", "LaunchScreen.storyboard"));
        var imageView = launchScreen.Split('\n').Single(line => line.Contains("<imageView") && line.Contains("LaunchIcon"));
        Assert.DoesNotContain("Priority=\"1000\"", imageView);

        var viewController = File.ReadAllText(Path.Combine(template, "pwa-shell", "ViewController.swift"));
        Assert.Matches(@"override var prefersStatusBarHidden: Bool \{\s+return displayMode == ""fullscreen""", viewController);

        // The image set names three real slots and nothing else: no placeholders, valid JSON.
        var imageSet = System.Text.Json.JsonDocument.Parse(File.ReadAllText(Path.Combine(template, "pwa-shell", "Assets.xcassets", "LaunchIcon.imageset", "Contents.json")));
        var entries = imageSet.RootElement.GetProperty("images").EnumerateArray().Select(image => (image.GetProperty("filename").GetString(), image.GetProperty("scale").GetString())).ToList();
        Assert.Equal([("launch-1x.png", "1x"), ("launch-2x.png", "2x"), ("launch-3x.png", "3x")], entries);
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

        var mainStoryboard = File.ReadAllText(Path.Combine(template, "pwa-shell", "Base.lproj", "Main.storyboard"));
        foreach (var name in new[] { "splashIconSize", "loadingViewX", "loadingViewY", "loadingViewWidth", "loadingViewHeight", "loadingIconX", "loadingProgressX", "loadingProgressY", "loadingOfflineIconX", "loadingOfflineIconY" })
        {
            Assert.Contains("{{PWABuilder.iOS." + name + "}}", mainStoryboard);
        }
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
            // The image writer puts the generated launch images, 1024 included, into the image set before the project is updated.
            // The template ships 64 to 512; stand in for the 1024 one with a file the tests can recognize.
            var imageSetDir = Path.Combine(outputDir, "pwa-shell", "Assets.xcassets", "LaunchIcon.imageset");
            File.WriteAllBytes(Path.Combine(imageSetDir, "launch-1024.png"), Fake1024Image);
            var sourceImages = Directory.GetFiles(imageSetDir, "launch-*.png")
                .ToDictionary(path => int.Parse(Path.GetFileNameWithoutExtension(path)["launch-".Length..]), File.ReadAllBytes);

            var project = new XcodePwaShellProject(validated, outputDir);
            project.Load();
            await project.ApplyChanges();

            // ApplyChanges renames the pwa-shell folder after the app, so search for the files instead of assuming a path.
            return new GeneratedFiles(
                ReadSingle(outputDir, "Info.plist"),
                ReadSingle(outputDir, "Settings.swift"),
                ReadSingle(outputDir, "LaunchScreen.storyboard"),
                File.ReadAllText(Directory.GetFiles(outputDir, "Contents.json", SearchOption.AllDirectories)
                    .Single(p => p.Contains("LaunchIcon.imageset"))),
                ReadSingle(outputDir, "Main.storyboard"),
                Directory.GetFiles(outputDir, "*.png", SearchOption.AllDirectories)
                    .Where(p => p.Contains("LaunchIcon.imageset"))
                    .ToDictionary(p => Path.GetFileName(p), File.ReadAllBytes),
                sourceImages
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
        Assert.DoesNotContain("{{PWABuilder.iOS.", files.MainStoryboard);
        System.Xml.Linq.XDocument.Parse(files.MainStoryboard);
        System.Xml.Linq.XDocument.Parse(files.LaunchScreen);
    }

    /// <summary>
    /// The image set holds exactly the three files its Contents.json names, and each is a copy of the expected generated size.
    /// </summary>
    private static void AssertLaunchImages(GeneratedFiles files, int expected1x, int expected2x, int expected3x)
    {
        Assert.Equal(["launch-1x.png", "launch-2x.png", "launch-3x.png"], files.LaunchImages.Keys.Order());
        Assert.Equal(files.SourceImages[expected1x], files.LaunchImages["launch-1x.png"]);
        Assert.Equal(files.SourceImages[expected2x], files.LaunchImages["launch-2x.png"]);
        Assert.Equal(files.SourceImages[expected3x], files.LaunchImages["launch-3x.png"]);
        foreach (var name in files.LaunchImages.Keys)
        {
            Assert.Contains($"\"filename\" : \"{name}\"", files.LaunchIconSet);
        }
    }

    private static readonly byte[] Fake1024Image = "stand-in for the generated 1024 pixel launch image"u8.ToArray();

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

    private sealed record GeneratedFiles(string InfoPlist, string Settings, string LaunchScreen, string LaunchIconSet, string MainStoryboard, Dictionary<string, byte[]> LaunchImages, Dictionary<int, byte[]> SourceImages);
}
