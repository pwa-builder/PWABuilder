using PWABuilder.MicrosoftStore.Models;
using Xunit;

namespace PWABuilder.MicrosoftStore.Tests;

/// <summary>
/// Covers how manifest icons marked "color_scheme": "light" are picked for Windows image assets.
/// </summary>
public sealed class WebAppManifestIconSelectionTests
{
    private static readonly Uri ManifestUri = new("https://example.com/manifest.json");

    private static WebManifestIcon Icon(string src, string? colorScheme = null, string? purpose = null) => new()
    {
        Src = src,
        Type = "image/png",
        Sizes = "44x44",
        Purpose = purpose,
        Color_scheme = colorScheme
    };

    private static WebAppManifestContext Manifest(params WebManifestIcon[] icons) => new()
    {
        ManifestUri = ManifestUri,
        Icons = icons.ToList()
    };

    private static string? Pick(WebAppManifestContext manifest, ImageAltForm altForm) =>
        manifest.GetIconUriFromTargetSize(ImageTargetSize.Size44x44, altForm)?.AbsolutePath;

    /// <summary>A light mode icon listed first no longer becomes the regular icon.</summary>
    [Fact]
    public void Regular_icon_skips_a_light_mode_icon_listed_first()
    {
        var manifest = Manifest(Icon("/light.png", "light"), Icon("/default.png"));

        Assert.Equal("/default.png", Pick(manifest, ImageAltForm.None));
        Assert.Equal("/light.png", Pick(manifest, ImageAltForm.Light));
    }

    /// <summary>The usual order, default first and light second, keeps working.</summary>
    [Fact]
    public void Regular_icon_and_light_icon_in_the_usual_order()
    {
        var manifest = Manifest(Icon("/default.png"), Icon("/light.png", "light"));

        Assert.Equal("/default.png", Pick(manifest, ImageAltForm.None));
        Assert.Equal("/light.png", Pick(manifest, ImageAltForm.Light));
    }

    /// <summary>When the only icon of a size is a light mode icon, it is still used rather than leaving the asset empty.</summary>
    [Fact]
    public void Light_mode_icon_is_the_fallback_when_nothing_else_fits()
    {
        var manifest = Manifest(Icon("/light.png", "light"));

        Assert.Equal("/light.png", Pick(manifest, ImageAltForm.None));
    }

    /// <summary>Only "light" is recognized; "dark" is treated as a regular icon.</summary>
    [Fact]
    public void Dark_color_scheme_is_treated_as_a_regular_icon()
    {
        var manifest = Manifest(Icon("/dark.png", "dark"), Icon("/light.png", "light"));

        Assert.Equal("/dark.png", Pick(manifest, ImageAltForm.None));
        Assert.Equal("/light.png", Pick(manifest, ImageAltForm.Light));
    }

    /// <summary>Unplated assets prefer an unplated icon, then a regular icon over a light mode one.</summary>
    [Fact]
    public void Unplated_icon_prefers_regular_over_light_mode()
    {
        var withoutUnplated = Manifest(Icon("/light.png", "light"), Icon("/default.png"));
        var withUnplated = Manifest(Icon("/light.png", "light"), Icon("/default.png"), Icon("/unplated.png", purpose: "unplated"));

        Assert.Equal("/default.png", Pick(withoutUnplated, ImageAltForm.Unplated));
        Assert.Equal("/unplated.png", Pick(withUnplated, ImageAltForm.Unplated));
    }
}
