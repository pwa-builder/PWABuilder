using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Text.Json.Nodes;

namespace PWABuilder.MicrosoftStore.Common;

/// <summary>
/// Sanitizes a PWA web app manifest so it can be safely converted into a valid Windows AppxManifest by pwa_builder.exe.
/// </summary>
public static class WebManifestSanitizer
{
    private const string WildcardLabelPrefix = "*.";

    /// <summary>
    /// Produces a JSON string for the manifest with any values that would generate an invalid AppxManifest fixed up or removed.
    /// </summary>
    /// <remarks>
    /// Currently this strips wildcard labels from <c>scope_extensions</c> origins. The Windows <c>windows.appUriHandler</c>
    /// <c>Host Name</c> element requires a fully-qualified domain name and rejects wildcards such as "*.example.com".
    /// When PWABuilder passes the "appurihandler" extension, pwa_builder.exe turns each scope_extensions origin into a
    /// <c>uap3:Host</c> entry, so a wildcard origin produces an invalid manifest and pwa_builder.exe fails with error 0x80080204.
    /// See https://github.com/pwa-builder/PWABuilder/issues/6104.
    /// </remarks>
    /// <param name="manifest">The raw web app manifest.</param>
    /// <returns>A JSON string of the sanitized manifest.</returns>
    public static string Sanitize(JsonDocument manifest)
    {
        ArgumentNullException.ThrowIfNull(manifest);

        var rawJson = manifest.RootElement.GetRawText();
        if (JsonNode.Parse(rawJson) is not JsonObject manifestObject)
        {
            // The manifest isn't a JSON object (unexpected). Leave it untouched.
            return rawJson;
        }

        SanitizeScopeExtensions(manifestObject);
        return manifestObject.ToJsonString();
    }

    /// <summary>
    /// Rewrites the <c>scope_extensions</c> array so every origin has a host that's valid for a Windows appUriHandler.
    /// Wildcard origins are collapsed to their parent domain, unrepresentable origins are dropped, and duplicates are removed.
    /// </summary>
    private static void SanitizeScopeExtensions(JsonObject manifestObject)
    {
        if (!manifestObject.TryGetPropertyValue("scope_extensions", out var scopeExtensionsNode) || scopeExtensionsNode is not JsonArray scopeExtensions)
        {
            return;
        }

        var sanitized = new JsonArray();
        var seenOrigins = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        foreach (var entry in scopeExtensions)
        {
            // Keep anything that isn't a recognizable { "origin": "..." } object untouched.
            if (entry is not JsonObject entryObject
                || !entryObject.TryGetPropertyValue("origin", out var originNode)
                || originNode is not JsonValue originValue
                || originValue.GetValueKind() != JsonValueKind.String)
            {
                sanitized.Add(entry?.DeepClone());
                continue;
            }

            var sanitizedOrigin = SanitizeOrigin(originValue.GetValue<string>());
            if (sanitizedOrigin is null || !seenOrigins.Add(sanitizedOrigin))
            {
                // Drop origins that can't be represented as a valid host, as well as duplicates.
                continue;
            }

            var clone = (JsonObject)entryObject.DeepClone();
            clone["origin"] = sanitizedOrigin;
            sanitized.Add(clone);
        }

        manifestObject["scope_extensions"] = sanitized;
    }

    /// <summary>
    /// Sanitizes a single scope_extensions origin so its host is a valid appUriHandler Host Name.
    /// </summary>
    /// <param name="origin">The origin string, e.g. "https://*.example.com".</param>
    /// <returns>The sanitized origin (e.g. "https://example.com"), or <c>null</c> if it can't be represented as a valid host.</returns>
    private static string? SanitizeOrigin(string origin)
    {
        if (string.IsNullOrWhiteSpace(origin))
        {
            return null;
        }

        var trimmed = origin.Trim();

        // No wildcard means the origin is already usable as-is.
        if (!trimmed.Contains('*'))
        {
            return trimmed;
        }

        // Split "scheme://host[:port][/...]" into scheme and authority so we only touch the host.
        var schemeSeparatorIndex = trimmed.IndexOf("://", StringComparison.Ordinal);
        var scheme = schemeSeparatorIndex >= 0 ? trimmed[..(schemeSeparatorIndex + 3)] : string.Empty;
        var authority = schemeSeparatorIndex >= 0 ? trimmed[(schemeSeparatorIndex + 3)..] : trimmed;

        // Separate the host from any port or trailing path/query/fragment.
        var hostEndIndex = authority.IndexOfAny(new[] { ':', '/', '?', '#' });
        var host = hostEndIndex >= 0 ? authority[..hostEndIndex] : authority;
        var hostSuffix = hostEndIndex >= 0 ? authority[hostEndIndex..] : string.Empty;

        // Collapse a wildcard subdomain to its parent domain, e.g. "*.example.com" => "example.com".
        while (host.StartsWith(WildcardLabelPrefix, StringComparison.Ordinal))
        {
            host = host[WildcardLabelPrefix.Length..];
        }

        // A leftover wildcard (e.g. "sub.*.example.com" or a bare "*") can't be a valid Host Name, so drop the origin.
        if (host.Length == 0 || host.Contains('*'))
        {
            return null;
        }

        return scheme + host + hostSuffix;
    }
}
