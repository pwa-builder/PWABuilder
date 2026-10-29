using System.Text.Json;
using System.Text.RegularExpressions;
using PWABuilder.Common;
using PWABuilder.Models;

namespace PWABuilder.Services;

/// <summary>
/// Detects agent readiness capabilities (PE WA BE): whether AI agents and assistants can read what the web app is and act on it
/// without scraping. The checks look at the start page (title, description, language, structured data) and at two
/// discovery files: /llms.txt and /.well-known/agent-card.json.
/// </summary>
public partial class AgentReadinessDetector
{
    private const int MaxPageBytes = 2 * 1024 * 1024;
    private const int MaxTextFileBytes = 256 * 1024;

    private readonly HttpClient http;

    public AgentReadinessDetector(IHttpClientFactory httpFactory)
    {
        http = httpFactory.CreateClient(Constants.PwaBuilderAgentHttpClient);
    }

    /// <summary>
    /// Runs every agent readiness check. A check that cannot run because of a network problem is marked as skipped, never as failed.
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
            var pageTask = TryGetTextAsync(url, MaxPageBytes, logger, cancelToken);
            var llmsTask = TryGetTextAsync(new Uri(url, "/llms.txt"), MaxTextFileBytes, logger, cancelToken);
            var cardTask = TryGetTextAsync(new Uri(url, "/.well-known/agent-card.json"), MaxTextFileBytes, logger, cancelToken);
            await Task.WhenAll(pageTask, llmsTask, cardTask);

            var page = pageTask.Result;
            foreach (var capability in capabilities)
            {
                capability.Status = capability.Id switch
                {
                    PwaCapabilityId.PageSummary => page is null ? PwaCapabilityCheckStatus.Skipped : CheckPageSummary(page.Value.Body, capability),
                    PwaCapabilityId.StructuredData => page is null ? PwaCapabilityCheckStatus.Skipped : CheckStructuredData(page.Value.Body, capability),
                    PwaCapabilityId.LlmsTxt => CheckLlmsTxt(llmsTask.Result, capability),
                    PwaCapabilityId.AgentCard => CheckAgentCard(cardTask.Result, capability),
                    _ => PwaCapabilityCheckStatus.Skipped
                };
            }

            return capabilities;
        }
        catch (Exception error)
        {
            logger.LogError(error, "Unable to detect agent readiness capabilities due to an error. Marking them as skipped.");
            capabilities
                .Where(c => c.Status == PwaCapabilityCheckStatus.InProgress)
                .ToList()
                .ForEach(c => c.Status = PwaCapabilityCheckStatus.Skipped);
            return capabilities;
        }
    }

    /// <summary>
    /// Checks that the start page carries a title, a meta description and a language on the html element.
    /// </summary>
    public static PwaCapabilityCheckStatus CheckPageSummary(string html, PwaCapability capability)
    {
        var missing = new List<string>();
        var title = TitleRegex().Match(html);
        if (!title.Success || string.IsNullOrWhiteSpace(StripTags(title.Groups[1].Value)))
        {
            missing.Add("a <title>");
        }

        var description = MetaDescriptionRegex().Match(html);
        var descriptionText = description.Success ? (description.Groups[1].Success ? description.Groups[1].Value : description.Groups[2].Value) : string.Empty;
        if (string.IsNullOrWhiteSpace(descriptionText))
        {
            missing.Add("a <meta name=\"description\">");
        }

        if (!HtmlLangRegex().IsMatch(html))
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
    /// </summary>
    public static PwaCapabilityCheckStatus CheckStructuredData(string html, PwaCapability capability)
    {
        var blocks = JsonLdRegex().Matches(html);
        if (blocks.Count == 0)
        {
            capability.ErrorMessage = "No <script type=\"application/ld+json\"> block was found on the start page.";
            return PwaCapabilityCheckStatus.Failed;
        }

        foreach (Match block in blocks)
        {
            try
            {
                using var doc = JsonDocument.Parse(block.Groups[1].Value);
                if (HasType(doc.RootElement))
                {
                    return PwaCapabilityCheckStatus.Passed;
                }
            }
            catch (JsonException)
            {
                // A broken block is the same as no block. Keep looking at the others.
            }
        }

        capability.ErrorMessage = "The JSON-LD on the start page does not parse or has no @type.";
        return PwaCapabilityCheckStatus.Failed;
    }

    /// <summary>
    /// Checks that /llms.txt exists, is plain text and starts with a Markdown heading, as the llms.txt proposal asks.
    /// </summary>
    public static PwaCapabilityCheckStatus CheckLlmsTxt(FetchedText? file, PwaCapability capability)
    {
        if (file is null)
        {
            capability.ErrorMessage = "No /llms.txt file was found.";
            return PwaCapabilityCheckStatus.Failed;
        }

        if (file.Value.MediaType is { } type && type.Contains("html", StringComparison.OrdinalIgnoreCase))
        {
            capability.ErrorMessage = "/llms.txt returned HTML instead of plain text. It is probably a catch-all page.";
            return PwaCapabilityCheckStatus.Failed;
        }

        var body = file.Value.Body.TrimStart('﻿', ' ', '\r', '\n', '\t');
        if (!body.StartsWith("# ", StringComparison.Ordinal))
        {
            capability.ErrorMessage = "/llms.txt should start with a level one Markdown heading that names the app.";
            return PwaCapabilityCheckStatus.Failed;
        }

        return PwaCapabilityCheckStatus.Passed;
    }

    /// <summary>
    /// Checks that /.well-known/agent-card.json exists and carries the fields every agent card needs: name, description, url and skills.
    /// </summary>
    public static PwaCapabilityCheckStatus CheckAgentCard(FetchedText? file, PwaCapability capability)
    {
        if (file is null)
        {
            capability.ErrorMessage = "No /.well-known/agent-card.json file was found.";
            return PwaCapabilityCheckStatus.Failed;
        }

        try
        {
            using var doc = JsonDocument.Parse(file.Value.Body);
            var root = doc.RootElement;
            if (root.ValueKind != JsonValueKind.Object)
            {
                capability.ErrorMessage = "/.well-known/agent-card.json is not a JSON object.";
                return PwaCapabilityCheckStatus.Failed;
            }

            var missing = new[] { "name", "description", "url", "skills" }
                .Where(field => !root.TryGetProperty(field, out var value) || value.ValueKind is JsonValueKind.Null or JsonValueKind.Undefined)
                .ToList();
            if (missing.Count > 0)
            {
                capability.ErrorMessage = $"/.well-known/agent-card.json is missing {string.Join(", ", missing)}.";
                return PwaCapabilityCheckStatus.Failed;
            }

            return PwaCapabilityCheckStatus.Passed;
        }
        catch (JsonException)
        {
            capability.ErrorMessage = "/.well-known/agent-card.json is not valid JSON.";
            return PwaCapabilityCheckStatus.Failed;
        }
    }

    /// <summary>
    /// Whether a JSON-LD value names a schema.org type, directly, inside an @graph, or in an array of nodes.
    /// </summary>
    private static bool HasType(JsonElement element)
    {
        switch (element.ValueKind)
        {
            case JsonValueKind.Object:
                if (element.TryGetProperty("@type", out _))
                {
                    return true;
                }

                if (element.TryGetProperty("@graph", out var graph) && HasType(graph))
                {
                    return true;
                }

                return false;
            case JsonValueKind.Array:
                return element.EnumerateArray().Any(HasType);
            default:
                return false;
        }
    }

    private async Task<FetchedText?> TryGetTextAsync(Uri url, int maxBytes, ILogger logger, CancellationToken cancelToken)
    {
        try
        {
            using var response = await http.GetAsync(url, HttpCompletionOption.ResponseHeadersRead, cancelToken);
            if (!response.IsSuccessStatusCode)
            {
                logger.LogInformation("Agent readiness: {url} answered {status}.", url, response.StatusCode);
                return null;
            }

            using var stream = await response.Content.ReadAsStreamAsync(cancelToken);
            using var limited = new MemoryStream();
            var buffer = new byte[16 * 1024];
            int read;
            while ((read = await stream.ReadAsync(buffer, cancelToken)) > 0 && limited.Length < maxBytes)
            {
                await limited.WriteAsync(buffer.AsMemory(0, Math.Min(read, (int)(maxBytes - limited.Length))), cancelToken);
            }

            var body = System.Text.Encoding.UTF8.GetString(limited.ToArray());
            return new FetchedText(body, response.Content.Headers.ContentType?.MediaType);
        }
        catch (Exception error) when (error is not OperationCanceledException)
        {
            logger.LogWarning(error, "Agent readiness: unable to fetch {url}.", url);
            return null;
        }
    }

    private static string StripTags(string html) => Regex.Replace(html, "<[^>]+>", string.Empty);

    [GeneratedRegex(@"<title[^>]*>(.*?)</title>", RegexOptions.IgnoreCase | RegexOptions.Singleline)]
    private static partial Regex TitleRegex();

    [GeneratedRegex(@"<meta\s+(?:[^>]*?\s)?name\s*=\s*[""']description[""'][^>]*?content\s*=\s*[""']([^""']*)[""']|<meta\s+(?:[^>]*?\s)?content\s*=\s*[""']([^""']*)[""'][^>]*?name\s*=\s*[""']description[""']", RegexOptions.IgnoreCase | RegexOptions.Singleline)]
    private static partial Regex MetaDescriptionRegex();

    [GeneratedRegex(@"<html[^>]*\slang\s*=\s*[""']?[A-Za-z]{2,}", RegexOptions.IgnoreCase)]
    private static partial Regex HtmlLangRegex();

    [GeneratedRegex(@"<script[^>]*type\s*=\s*[""']application/ld\+json[""'][^>]*>(.*?)</script>", RegexOptions.IgnoreCase | RegexOptions.Singleline)]
    private static partial Regex JsonLdRegex();
}

/// <summary>
/// A text resource fetched during agent readiness detection.
/// </summary>
/// <param name="Body">The body, cut at the size limit.</param>
/// <param name="MediaType">The media type the server declared, if any.</param>
public readonly record struct FetchedText(string Body, string? MediaType);
