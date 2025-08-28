﻿namespace PWABuilder.Common;

public static class Constants
{
    public const string DesktopUserAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36 Edg/139.0.0.0 PWABuilderHttpAgent";
    public const string PwaBuilderAgentHttpClient = "PWABuilderHttpAgent";
    public static readonly IReadOnlyCollection<string> ManifestMimeTypes = 
    [
        "application/manifest+json",
        "application/json",
        "text/json"
    ];
    public static readonly IReadOnlyCollection<string> JavascriptMimeTypes = [
        "application/javascript",
        "text/javascript",
        "application/x-javascript"
    ];
}
