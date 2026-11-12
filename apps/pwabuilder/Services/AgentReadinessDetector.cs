using System.Net;
using System.Text.Json;
using System.Text.RegularExpressions;
using HtmlAgilityPack;
using PWABuilder.Common;
using PWABuilder.Models;

namespace PWABuilder.Services;

/// <summary>
/// Detects agent readiness capabilities (PE WA BE): whether AI agents and assistants can read what the web app is and act on it
/// without scraping. The checks look at the start page (title, description, language, structured data) and at two
/// discovery files: /llms.txt and /.well-known/agent-card.json.
/// These checks look for machine readable discovery signals. They do not certify that a site implements the Agent2Agent protocol,
/// that its endpoints work, or that acting on them is safe.
/// </summary>
public partial class AgentReadinessDetector
{
    private const int MaxPageBytes = 2 * 1024 * 1024;
    private const int MaxTextFileBytes = 256 * 1024;
    private const string LlmsTxtPath = "/llms.txt";
    private const string AgentCardPath = "/.well-known/agent-card.json";

    /// <summary>
    /// The time one fetch may take, headers and body together. HttpClient.Timeout stops covering the body once the headers
    /// have arrived, so a server that stalls halfway would otherwise hold a check until the whole analysis is cancelled.
    /// </summary>
    private static readonly TimeSpan DefaultFetchTimeout = TimeSpan.FromSeconds(20);

    private readonly HttpClient http;
    private readonly TimeSpan fetchTimeout;

    public AgentReadinessDetector(IHttpClientFactory httpFactory)
        : this(httpFactory, DefaultFetchTimeout)
    {
    }

    /// <summary>
    /// Creates a detector with its own per fetch timeout. Used by tests to exercise the timeout path quickly.
    /// </summary>
    public AgentReadinessDetector(IHttpClientFactory httpFactory, TimeSpan fetchTimeout)
    {
        http = httpFactory.CreateClient(Constants.PwaBuilderAgentHttpClient);
        this.fetchTimeout = fetchTimeout;
    }

    /// <summary>
    /// Runs every agent readiness check. The three fetches are independent: a timeout or a network problem on one of them
    /// skips only the checks that needed it and leaves the results of the others intact.
    /// A check fails only when the server confirmed the answer; a check that could not be made is skipped.
    /// </summary>
    /// <param name="url">The URL of the web app.</param>
    /// <param name="logger">The logger.</param>
    /// <param name="cancelToken">The cancellation token.</param>
    /// <returns>The agent readiness capabilities with their statuses.</returns>
    public async Task<List<PwaCapability>> TryDetectAsync(Uri url, ILogger logger, CancellationToken cancelToken)
    {
        var capabilities = PwaCapability.CreateAgentReadinessCapabilities();
        try
        {
            // FetchAsync turns every failure of its own request into an outcome, so WhenAll only throws when the shared token is cancelled.
            var pageTask = FetchAsync(url, MaxPageBytes, logger, cancelToken);
            var llmsTask = FetchAsync(new Uri(url, LlmsTxtPath), MaxTextFileBytes, logger, cancelToken);
            var cardTask = FetchAsync(new Uri(url, AgentCardPath), MaxTextFileBytes, logger, cancelToken);
            await Task.WhenAll(pageTask, llmsTask, cardTask);

            var page = await pageTask;
            var llms = await llmsTask;
            var card = await cardTask;
            foreach (var capability in capabilities)
            {
                capability.Status = capability.Id switch
                {
                    // The start page is not a discovery file: any answer other than the page itself means the check could not run.
                    PwaCapabilityId.PageSummary => page.Outcome == FetchOutcome.Found ? CheckPageSummary(page.Body, capability) : PwaCapabilityCheckStatus.Skipped,
                    PwaCapabilityId.StructuredData => page.Outcome == FetchOutcome.Found ? CheckStructuredData(page.Body, capability) : PwaCapabilityCheckStatus.Skipped,
                    PwaCapabilityId.LlmsTxt => CheckLlmsTxt(llms, capability),
                    PwaCapabilityId.AgentCard => CheckAgentCard(card, capability),
                    _ => PwaCapabilityCheckStatus.Skipped
                };
            }

            return capabilities;
        }
        catch (Exception error)
        {
            if (error is OperationCanceledException)
            {
                logger.LogInformation("Agent readiness detection was cancelled. Marking the unfinished checks as skipped.");
            }
            else
            {
                logger.LogError(error, "Unable to detect agent readiness capabilities due to an error. Marking them as skipped.");
            }

            capabilities
                .Where(c => c.Status == PwaCapabilityCheckStatus.InProgress)
                .ToList()
                .ForEach(c => c.Status = PwaCapabilityCheckStatus.Skipped);
            return capabilities;
        }
    }

    /// <summary>
    /// Checks that the start page carries a title, a meta description and a language on the html element.
    /// The page is parsed as HTML, so unquoted attributes count and markup inside comments does not.
    /// </summary>
    public static PwaCapabilityCheckStatus CheckPageSummary(string html, PwaCapability capability)
    {
        var document = LoadHtml(html);
        var missing = new List<string>();

        // An inline SVG can carry its own <title>; that one names a drawing, not the page.
        var hasTitle = document.DocumentNode
            .SelectNodesOrEmpty("//title")
            .Any(node => !node.Ancestors("svg").Any() && !string.IsNullOrWhiteSpace(HtmlEntity.DeEntitize(node.InnerText)));
        if (!hasTitle)
        {
            missing.Add("a <title>");
        }

        var hasDescription = document.DocumentNode
            .SelectNodesOrEmpty("//meta")
            .Any(node => string.Equals(node.GetAttributeValue("name", string.Empty).Trim(), "description", StringComparison.OrdinalIgnoreCase)
                && !string.IsNullOrWhiteSpace(HtmlEntity.DeEntitize(node.GetAttributeValue("content", string.Empty))));
        if (!hasDescription)
        {
            missing.Add("a <meta name=\"description\">");
        }

        var lang = document.DocumentNode.SelectSingleNode("//html")?.GetAttributeValue("lang", string.Empty) ?? string.Empty;
        if (!LanguageTagRegex().IsMatch(lang.Trim()))
        {
            missing.Add("a lang attribute on <html>");
        }

        if (missing.Count > 0)
        {
            capability.ErrorMessage = $"The start page is missing {string.Join(", ", missing)}.";
            return PwaCapabilityCheckStatus.Failed;
        }

        return PwaCapabilityCheckStatus.Passed;
    }

    /// <summary>
    /// Checks that the start page carries at least one JSON-LD block that parses and names a schema.org type.
    /// A type counts when it is a schema.org address (https://schema.org/Person), or a plain or prefixed name
    /// (Person, schema:Person) under a @context that points at schema.org.
    /// </summary>
    public static PwaCapabilityCheckStatus CheckStructuredData(string html, PwaCapability capability)
    {
        var blocks = LoadHtml(html).DocumentNode
            .SelectNodesOrEmpty("//script")
            .Where(node => IsJsonLdMediaType(node.GetAttributeValue("type", string.Empty)))
            .ToList();
        if (blocks.Count == 0)
        {
            capability.ErrorMessage = "No <script type=\"application/ld+json\"> block was found on the start page.";
            return PwaCapabilityCheckStatus.Failed;
        }

        var parsedAny = false;
        foreach (var block in blocks)
        {
            try
            {
                using var doc = JsonDocument.Parse(block.InnerHtml);
                parsedAny = true;
                if (HasSchemaOrgType(doc.RootElement, JsonLdContext.None))
                {
                    return PwaCapabilityCheckStatus.Passed;
                }
            }
            catch (JsonException)
            {
                // A broken block is the same as no block. Keep looking at the others.
            }
        }

        capability.ErrorMessage = parsedAny
            ? "The JSON-LD on the start page does not name a schema.org type. Give a node an @type such as Organization or WebApplication, with \"@context\": \"https://schema.org\"."
            : "The JSON-LD on the start page is not valid JSON.";
        return PwaCapabilityCheckStatus.Failed;
    }

    /// <summary>
    /// Checks that /llms.txt exists, is plain text and starts with a Markdown heading, as the llms.txt proposal asks.
    /// </summary>
    public static PwaCapabilityCheckStatus CheckLlmsTxt(FetchResult file, PwaCapability capability)
    {
        if (TryGetFetchStatus(file, LlmsTxtPath, capability) is { } status)
        {
            return status;
        }

        if (file.MediaType is { } type && type.Contains("html", StringComparison.OrdinalIgnoreCase))
        {
            capability.ErrorMessage = $"{LlmsTxtPath} returned HTML instead of plain text. It is probably a catch-all page.";
            return PwaCapabilityCheckStatus.Failed;
        }

        var body = file.Body.TrimStart('﻿', ' ', '\r', '\n', '\t');
        if (!body.StartsWith("# ", StringComparison.Ordinal) || string.IsNullOrWhiteSpace(body.Split('\n')[0][2..]))
        {
            capability.ErrorMessage = $"{LlmsTxtPath} should start with a level one Markdown heading that names the app.";
            return PwaCapabilityCheckStatus.Failed;
        }

        return PwaCapabilityCheckStatus.Passed;
    }

    /// <summary>
    /// Checks that /.well-known/agent-card.json exists and that the fields an agent needs first have usable values:
    /// name and description are text, skills is a list of objects, and the card gives an http or https endpoint,
    /// either as url (Agent2Agent 0.2 and 0.3) or inside supportedInterfaces (Agent2Agent 1.0).
    /// This is not a full validation against the Agent2Agent schema.
    /// </summary>
    public static PwaCapabilityCheckStatus CheckAgentCard(FetchResult file, PwaCapability capability)
    {
        if (TryGetFetchStatus(file, AgentCardPath, capability) is { } status)
        {
            return status;
        }

        if (file.MediaType is { } type && type.Contains("html", StringComparison.OrdinalIgnoreCase))
        {
            capability.ErrorMessage = $"{AgentCardPath} returned HTML instead of JSON. It is probably a catch-all page.";
            return PwaCapabilityCheckStatus.Failed;
        }

        try
        {
            using var doc = JsonDocument.Parse(file.Body);
            var root = doc.RootElement;
            if (root.ValueKind != JsonValueKind.Object)
            {
                capability.ErrorMessage = $"{AgentCardPath} is not a JSON object.";
                return PwaCapabilityCheckStatus.Failed;
            }

            var problems = new List<string>();
            foreach (var field in new[] { "name", "description" })
            {
                if (!root.TryGetProperty(field, out var value) || !IsNonEmptyString(value))
                {
                    problems.Add($"{field} (a non-empty string)");
                }
            }

            if (!HasEndpoint(root))
            {
                problems.Add("url (an absolute http or https address, or a supportedInterfaces list that carries one)");
            }

            if (!root.TryGetProperty("skills", out var skills)
                || skills.ValueKind != JsonValueKind.Array
                || skills.EnumerateArray().Any(skill => skill.ValueKind != JsonValueKind.Object))
            {
                problems.Add("skills (a list of skill objects)");
            }

            if (problems.Count > 0)
            {
                capability.ErrorMessage = $"{AgentCardPath} is missing or has an unusable value for: {string.Join("; ", problems)}.";
                return PwaCapabilityCheckStatus.Failed;
            }

            return PwaCapabilityCheckStatus.Passed;
        }
        catch (JsonException)
        {
            capability.ErrorMessage = $"{AgentCardPath} is not valid JSON.";
            return PwaCapabilityCheckStatus.Failed;
        }
    }

    /// <summary>
    /// Maps a fetch that did not find the file to a check status: failed when the server confirmed the file is absent,
    /// skipped when the fetch could not tell. Returns null when the file was found and its content should be checked.
    /// </summary>
    private static PwaCapabilityCheckStatus? TryGetFetchStatus(FetchResult file, string path, PwaCapability capability)
    {
        switch (file.Outcome)
        {
            case FetchOutcome.Found:
                return null;
            case FetchOutcome.NotFound:
                capability.ErrorMessage = $"No {path} file was found ({file.Detail}).";
                return PwaCapabilityCheckStatus.Failed;
            default:
                // Not an error of the site's agent readiness: there is nothing for the developer to fix, so no error message and no action item.
                return PwaCapabilityCheckStatus.Skipped;
        }
    }

    /// <summary>
    /// Whether an agent card names an endpoint an agent can call: a top level url, or a url inside supportedInterfaces or additionalInterfaces.
    /// </summary>
    private static bool HasEndpoint(JsonElement card)
    {
        if (card.TryGetProperty("url", out var url) && IsHttpUrl(url))
        {
            return true;
        }

        foreach (var listName in new[] { "supportedInterfaces", "additionalInterfaces" })
        {
            if (card.TryGetProperty(listName, out var list)
                && list.ValueKind == JsonValueKind.Array
                && list.EnumerateArray().Any(item => item.ValueKind == JsonValueKind.Object && item.TryGetProperty("url", out var itemUrl) && IsHttpUrl(itemUrl)))
            {
                return true;
            }
        }

        return false;
    }

    private static bool IsNonEmptyString(JsonElement value) => value.ValueKind == JsonValueKind.String && !string.IsNullOrWhiteSpace(value.GetString());

    private static bool IsHttpUrl(JsonElement value) =>
        value.ValueKind == JsonValueKind.String
        && Uri.TryCreate(value.GetString()?.Trim(), UriKind.Absolute, out var uri)
        && (uri.Scheme == Uri.UriSchemeHttp || uri.Scheme == Uri.UriSchemeHttps)
        && !string.IsNullOrEmpty(uri.Host);

    /// <summary>
    /// Whether a JSON-LD value names a schema.org type: on the node itself, inside its @graph, or in an array of nodes.
    /// </summary>
    /// <param name="element">The JSON-LD value.</param>
    /// <param name="inherited">The context of the enclosing node, which applies unless this node sets its own.</param>
    private static bool HasSchemaOrgType(JsonElement element, JsonLdContext inherited)
    {
        switch (element.ValueKind)
        {
            case JsonValueKind.Object:
                var context = element.TryGetProperty("@context", out var contextElement) ? JsonLdContext.Read(contextElement, inherited) : inherited;
                if (element.TryGetProperty("@type", out var type) && IsSchemaOrgTypeValue(type, context))
                {
                    return true;
                }

                return element.TryGetProperty("@graph", out var graph) && HasSchemaOrgType(graph, context);
            case JsonValueKind.Array:
                foreach (var item in element.EnumerateArray())
                {
                    if (HasSchemaOrgType(item, inherited))
                    {
                        return true;
                    }
                }

                return false;
            default:
                return false;
        }
    }

    /// <summary>
    /// Whether an @type value is usable and from schema.org: a non-empty string, or a non-empty array of non-empty strings
    /// in which at least one names a schema.org type. Null, numbers, objects and empty arrays are not types.
    /// </summary>
    private static bool IsSchemaOrgTypeValue(JsonElement type, JsonLdContext context)
    {
        switch (type.ValueKind)
        {
            case JsonValueKind.String:
                return IsSchemaOrgTypeName(type.GetString(), context);
            case JsonValueKind.Array:
                var names = type.EnumerateArray().ToList();
                return names.Count > 0
                    && names.All(IsNonEmptyString)
                    && names.Any(name => IsSchemaOrgTypeName(name.GetString(), context));
            default:
                return false;
        }
    }

    private static bool IsSchemaOrgTypeName(string? name, JsonLdContext context)
    {
        name = name?.Trim();
        if (string.IsNullOrEmpty(name))
        {
            return false;
        }

        // A full address names its own vocabulary, whatever the context says.
        if (name.Contains("://", StringComparison.Ordinal))
        {
            return IsSchemaOrgAddress(name) && Uri.TryCreate(name, UriKind.Absolute, out var typeUri) && typeUri.AbsolutePath.Length > 1;
        }

        var colon = name.IndexOf(':');
        if (colon > 0)
        {
            // A prefixed name such as schema:Person counts when the context maps that prefix to schema.org.
            return colon < name.Length - 1 && context.SchemaOrgPrefixes.Contains(name[..colon]);
        }

        return context.DefaultsToSchemaOrg;
    }

    private static bool IsSchemaOrgAddress(string? value) =>
        Uri.TryCreate(value?.Trim(), UriKind.Absolute, out var uri)
        && (uri.Scheme == Uri.UriSchemeHttp || uri.Scheme == Uri.UriSchemeHttps)
        && (uri.Host.Equals("schema.org", StringComparison.OrdinalIgnoreCase) || uri.Host.Equals("www.schema.org", StringComparison.OrdinalIgnoreCase));

    private static bool IsJsonLdMediaType(string type)
    {
        // The type attribute may carry parameters, as in "application/ld+json; charset=utf-8".
        var mediaType = type.Split(';')[0].Trim();
        return mediaType.Equals("application/ld+json", StringComparison.OrdinalIgnoreCase);
    }

    private static HtmlDocument LoadHtml(string html)
    {
        var document = new HtmlDocument();
        document.LoadHtml(html);
        return document;
    }

    /// <summary>
    /// Fetches a text resource and reports how the fetch ended. It never throws for a problem of its own request:
    /// a network error, a server error or a timeout is an outcome. It throws only when the shared token is cancelled.
    /// </summary>
    private async Task<FetchResult> FetchAsync(Uri url, int maxBytes, ILogger logger, CancellationToken cancelToken)
    {
        using var timeout = CancellationTokenSource.CreateLinkedTokenSource(cancelToken);
        timeout.CancelAfter(fetchTimeout);
        try
        {
            using var response = await http.GetAsync(url, HttpCompletionOption.ResponseHeadersRead, timeout.Token);
            if (!response.IsSuccessStatusCode)
            {
                var status = (int)response.StatusCode;
                logger.LogInformation("Agent readiness: {url} answered {status}.", url, status);
                return IsConfirmedAbsence(response.StatusCode)
                    ? FetchResult.NotFound($"HTTP {status}")
                    : FetchResult.Unavailable($"HTTP {status}");
            }

            await using var stream = await response.Content.ReadAsStreamAsync(timeout.Token);
            using var limited = new MemoryStream();
            var buffer = new byte[16 * 1024];
            // Check the cap before asking for more: once it is reached, no further read is awaited.
            while (limited.Length < maxBytes)
            {
                var wanted = (int)Math.Min(buffer.Length, maxBytes - limited.Length);
                var read = await stream.ReadAsync(buffer.AsMemory(0, wanted), timeout.Token);
                if (read == 0)
                {
                    break;
                }

                limited.Write(buffer, 0, read);
            }

            var body = System.Text.Encoding.UTF8.GetString(limited.GetBuffer(), 0, (int)limited.Length);
            return FetchResult.Found(body, response.Content.Headers.ContentType?.MediaType);
        }
        catch (OperationCanceledException) when (!cancelToken.IsCancellationRequested)
        {
            // This request ran out of time (our own limit or HttpClient.Timeout). The other fetches are not affected.
            logger.LogWarning("Agent readiness: {url} timed out.", url);
            return FetchResult.Unavailable("timed out");
        }
        catch (Exception error) when (error is not OperationCanceledException)
        {
            logger.LogWarning(error, "Agent readiness: unable to fetch {url}.", url);
            return FetchResult.Unavailable(error.GetType().Name);
        }
    }

    /// <summary>
    /// Whether a status code confirms that the resource is not there for an anonymous client.
    /// Request timeout (408), rate limiting (429) and every other status say only that the check could not be made now.
    /// </summary>
    private static bool IsConfirmedAbsence(HttpStatusCode status) =>
        status is HttpStatusCode.NotFound or HttpStatusCode.Gone;

    // A language tag as HTML expects it: a primary subtag of two or three letters (or a longer registered one), then optional subtags.
    [GeneratedRegex(@"^[A-Za-z]{2,8}(-[A-Za-z0-9]{1,8})*$")]
    private static partial Regex LanguageTagRegex();

    /// <summary>
    /// The part of a JSON-LD @context this detector needs: whether plain type names resolve to schema.org and which prefixes do.
    /// </summary>
    private sealed record JsonLdContext(bool DefaultsToSchemaOrg, IReadOnlySet<string> SchemaOrgPrefixes)
    {
        public static readonly JsonLdContext None = new(false, new HashSet<string>(StringComparer.Ordinal));

        /// <summary>
        /// Reads a @context value: an address, an object with @vocab and prefixes, or an array of those.
        /// </summary>
        public static JsonLdContext Read(JsonElement context, JsonLdContext inherited)
        {
            var defaults = inherited.DefaultsToSchemaOrg;
            var prefixes = new HashSet<string>(inherited.SchemaOrgPrefixes, StringComparer.Ordinal);
            Apply(context, insideArray: false);
            return new JsonLdContext(defaults, prefixes);

            void Apply(JsonElement value, bool insideArray)
            {
                switch (value.ValueKind)
                {
                    case JsonValueKind.String:
                        // schema.org as a context makes plain names schema.org names. Another context on its own replaces that.
                        // Inside an array the contexts add up, and what a remote one defines is unknown, so it leaves the default alone.
                        if (IsSchemaOrgAddress(value.GetString()))
                        {
                            defaults = true;
                        }
                        else if (!insideArray)
                        {
                            defaults = false;
                        }

                        break;
                    case JsonValueKind.Object:
                        foreach (var property in value.EnumerateObject())
                        {
                            if (property.Value.ValueKind != JsonValueKind.String)
                            {
                                continue;
                            }

                            var isSchemaOrg = IsSchemaOrgAddress(property.Value.GetString());
                            if (property.NameEquals("@vocab"))
                            {
                                defaults = isSchemaOrg;
                            }
                            else if (isSchemaOrg && !property.Name.StartsWith('@'))
                            {
                                prefixes.Add(property.Name);
                            }
                        }

                        break;
                    case JsonValueKind.Array:
                        foreach (var item in value.EnumerateArray())
                        {
                            Apply(item, insideArray: true);
                        }

                        break;
                }
            }
        }
    }
}

/// <summary>
/// How a fetch made during agent readiness detection ended.
/// </summary>
public enum FetchOutcome
{
    /// <summary>The fetch could not tell whether the resource exists: a network, DNS or TLS problem, a timeout, a server error or rate limiting.</summary>
    Unavailable,

    /// <summary>The server answered with the resource.</summary>
    Found,

    /// <summary>The server confirmed the resource is not there (HTTP 404 or 410).</summary>
    NotFound
}

/// <summary>
/// The result of fetching a text resource during agent readiness detection.
/// </summary>
/// <param name="Outcome">How the fetch ended. The default value is Unavailable, so an empty result never reads as a missing file.</param>
/// <param name="Body">The body, cut at the size limit. Empty unless the resource was found.</param>
/// <param name="MediaType">The media type the server declared, if any.</param>
/// <param name="Detail">A short note on a fetch that did not find the resource, such as "HTTP 404" or "timed out".</param>
public readonly record struct FetchResult(FetchOutcome Outcome, string Body, string? MediaType, string? Detail)
{
    public static FetchResult Found(string body, string? mediaType = null) => new(FetchOutcome.Found, body, mediaType, null);

    public static FetchResult NotFound(string detail = "HTTP 404") => new(FetchOutcome.NotFound, string.Empty, null, detail);

    public static FetchResult Unavailable(string detail) => new(FetchOutcome.Unavailable, string.Empty, null, detail);
}
