using System.Net;
using System.Text.RegularExpressions;

namespace PWABuilder.Services;

/// <summary>Defense-in-depth redaction for private diagnostic text; never fetches referenced resources.</summary>
public static class SupportDiagnosticSanitizer
{
    /// <summary>Maximum characters displayed per diagnostic entry.</summary>
    public const int MaximumTextLength = 4000;
    /// <summary>Maximum log entries included in a detail view.</summary>
    public const int MaximumLogs = 100;
    /// <summary>Maximum error entries included in a detail view.</summary>
    public const int MaximumErrors = 20;

    private const string SensitiveField = @"(?:[a-z0-9_-]*(?:password|passwd|passphrase|secret|token|credential)[a-z0-9_-]*|pwd|(?:key|store|ks)[_-]?pass|(?:private|signing|api|access|client)[_-]?key|key[_-]?alias|alias|authorization|cookie|keystore|key[_-]?file|file|dname|distinguishedName)";
    private const string Value = """(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|[^\s,;}\]]+)""";
    private static readonly Regex unicodeEscapes = Pattern(@"\\u([a-f0-9]{4})");
    private static readonly Regex privateKeys = Pattern(@"-----BEGIN [^-]+-----[\s\S]*?(?:-----END [^-]+-----|$)");
    private static readonly Regex sensitiveObjects = Pattern("""["']?(?:signing|credentials)["']?\s*[:=]\s*\{[\s\S]*""");
    private static readonly Regex sensitiveFields = Pattern($"""(?<label>["']?{SensitiveField}["']?\s*[:=]\s*){Value}""");
    private static readonly Regex commandLineSecrets = Pattern($"""(?<label>--?{SensitiveField}(?:=|\s+))(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|[^\s]+)""");
    private static readonly Regex authorization = Pattern("""\b(?:Bearer|Basic)\s+["']?[^\s"',;<>]+["']?""");
    private static readonly Regex dataUris = Pattern("""\bdata:[^\s"'<>]+""");
    private static readonly Regex urls = Pattern("""(?:[a-z][a-z0-9+.-]*:)?//[^\s"'<>]+""");
    private static readonly Regex encodedUrls = Pattern("""\b(?:https?|ftp|file|wss?)%(?:25)?3a%(?:25)?2f%(?:25)?2f[^\s"'<>]+""");
    private static readonly Regex jwt = Pattern(@"\beyJ[a-z0-9_-]+\.[a-z0-9_-]+\.[a-z0-9_-]+\b");
    private static readonly Regex longOpaqueValues = Pattern(@"[a-z0-9+/=_-]{128,}");

    /// <summary>Preserves useful failure text while removing credential-shaped values and URL-private components.</summary>
    public static string Sanitize(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return "";
        }
        // Never truncate before redaction: doing so could split a sensitive field or quoted value.
        if (value.Length > 16 * 1024)
        {
            return "[Diagnostic omitted: exceeds safe processing limit.]";
        }
        try
        {
            var text = value;
            for (var pass = 0; pass < 2; pass++)
            {
                text = WebUtility.HtmlDecode(text);
                text = unicodeEscapes.Replace(text, match => ((char)Convert.ToInt32(match.Groups[1].Value, 16)).ToString());
                text = text.Replace("\\/", "/").Replace("\\\"", "\"").Replace("\\'", "'");
                // Remove URLs before decoding escaped spaces, which could otherwise split a private path.
                text = encodedUrls.Replace(text, match => SupportDiagnosticsService.SanitizeOrigin(
                    Uri.UnescapeDataString(Uri.UnescapeDataString(match.Value))));
                text = urls.Replace(text, match => SupportDiagnosticsService.SanitizeOrigin(match.Value));
                text = Uri.UnescapeDataString(text);
            }
            text = new string(text.Where(character => !char.IsControl(character) || character is '\r' or '\n' or '\t').ToArray());
            text = privateKeys.Replace(text, "[redacted private key]");
            text = sensitiveObjects.Replace(text, "[redacted credential object]");
            text = authorization.Replace(text, "[redacted authorization]");
            text = dataUris.Replace(text, "[redacted data]");
            text = urls.Replace(text, match => SupportDiagnosticsService.SanitizeOrigin(match.Value));
            text = jwt.Replace(text, "[redacted token]");
            text = longOpaqueValues.Replace(text, "[redacted opaque value]");
            text = commandLineSecrets.Replace(text, "${label}[redacted]");
            text = sensitiveFields.Replace(text, "${label}[redacted]");
            return text.Length <= MaximumTextLength ? text : text[..(MaximumTextLength - 12)] + " [truncated]";
        }
        catch (Exception exception) when (exception is RegexMatchTimeoutException or UriFormatException or ArgumentException)
        {
            return "[Diagnostic omitted: could not safely redact.]";
        }
    }

    /// <summary>Bounds entries before sanitizing and omits empty diagnostics.</summary>
    public static IReadOnlyList<string> SanitizeEntries(IEnumerable<string>? entries, int limit) =>
        (entries ?? []).Take(Math.Clamp(limit, 0, MaximumLogs)).Select(Sanitize)
            .Where(entry => entry.Length > 0).ToArray();

    /// <summary>Bounds each regular expression's execution time on untrusted diagnostic text.</summary>
    private static Regex Pattern(string pattern) =>
        new(pattern, RegexOptions.IgnoreCase | RegexOptions.CultureInvariant, TimeSpan.FromMilliseconds(100));
}
