using System.Net;
using System.Text;
using Microsoft.Extensions.Logging.Abstractions;
using PWABuilder.Models;
using PWABuilder.Services;
using Xunit;

namespace PWABuilder.Tests;

/// <summary>Verifies the agent readiness checks (PE WA BE): page summary, structured data, llms.txt and the agent card.</summary>
public sealed class AgentReadinessDetectorTests
{
    private const string GoodPage = "<html lang=\"en\"><head><title>My app</title><meta name=\"description\" content=\"A small app.\"><script type=\"application/ld+json\">{\"@context\":\"https://schema.org\",\"@type\":\"WebApplication\",\"name\":\"My app\"}</script></head></html>";
    private const string GoodLlms = "# My app\n\n> One line about it.\n";
    private const string GoodCard = "{\"name\":\"Cards\",\"description\":\"Finds a contact card\",\"url\":\"https://example.org/a2a\",\"version\":\"1.0\",\"skills\":[{\"id\":\"find\",\"name\":\"Find card\"}]}";

    private static PwaCapability Capability(PwaCapabilityId id) => PwaCapability.CreateAgentReadinessCapabilities().First(c => c.Id == id);

    private static string JsonLd(string json) => $"<html><head><script type=\"application/ld+json\">{json}</script></head></html>";

    // ---- Page summary ----

    /// <summary>A start page with a title, a description and a language passes the summary check.</summary>
    [Theory]
    [InlineData("<html lang=\"en\"><head><title>My app</title><meta name=\"description\" content=\"A small app.\"></head></html>")]
    [InlineData("<!doctype html><HTML LANG='ar' dir='rtl'><head><META content=\"Describes the app\" NAME=\"description\"><TITLE>تطبيق</TITLE></head>")]
    [InlineData("<html lang=en><head><title>App</title><meta name=description content=\"A useful app\"></head></html>")]
    [InlineData("<html lang=pt-BR><head><title>App</title><meta content=App name=description></head></html>")]
    [InlineData("<html lang=\"en\"><head><title>App</title><meta name=\"description\" content=\"'An app' for notes\"></head></html>")]
    [InlineData("<html lang=\"en\"><head><title>App</title><meta name='description' content='The \"best\" app'></head></html>")]
    public void Page_summary_is_detected(string html)
    {
        var capability = Capability(PwaCapabilityId.PageSummary);
        Assert.Equal(PwaCapabilityCheckStatus.Passed, AgentReadinessDetector.CheckPageSummary(html, capability));
        Assert.Null(capability.ErrorMessage);
    }

    /// <summary>A missing title, description or language fails the summary check and names what is missing.</summary>
    [Theory]
    [InlineData("<html><head><title>My app</title><meta name=\"description\" content=\"A small app.\"></head></html>", "lang")]
    [InlineData("<html lang=\"en\"><head><meta name=\"description\" content=\"A small app.\"></head></html>", "<title>")]
    [InlineData("<html lang=\"en\"><head><title>My app</title></head></html>", "description")]
    [InlineData("<html lang=\"en\"><head><title> </title><meta name=\"description\" content=\"\"></head></html>", "<title>")]
    [InlineData("<html lang=\"\"><head><title>My app</title><meta name=\"description\" content=\"A small app.\"></head></html>", "lang")]
    [InlineData("<html lang=\"en\"><head><title>My app</title><meta property=\"og:description\" content=\"A small app.\"></head></html>", "description")]
    [InlineData("<html lang=\"en\"><head><meta name=\"description\" content=\"A small app.\"></head><body><svg><title>Logo</title></svg></body></html>", "<title>")]
    public void Missing_page_summary_is_reported(string html, string expectedInMessage)
    {
        var capability = Capability(PwaCapabilityId.PageSummary);
        Assert.Equal(PwaCapabilityCheckStatus.Failed, AgentReadinessDetector.CheckPageSummary(html, capability));
        Assert.Contains(expectedInMessage, capability.ErrorMessage);
    }

    /// <summary>Markup inside an HTML comment is not page metadata.</summary>
    [Fact]
    public void Commented_out_page_summary_does_not_count()
    {
        var html = "<!-- <html lang=\"en\"><title>App</title><meta name=\"description\" content=\"App\"> -->\n<html><head></head></html>";
        var capability = Capability(PwaCapabilityId.PageSummary);
        Assert.Equal(PwaCapabilityCheckStatus.Failed, AgentReadinessDetector.CheckPageSummary(html, capability));
        Assert.Contains("<title>", capability.ErrorMessage);
        Assert.Contains("description", capability.ErrorMessage);
        Assert.Contains("lang", capability.ErrorMessage);
    }

    /// <summary>Broken HTML never throws; it fails the check.</summary>
    [Theory]
    [InlineData("")]
    [InlineData("<<<>>> not html at all")]
    [InlineData("<html lang=\"en\"><head><title>Unclosed")]
    public void Malformed_html_is_handled(string html)
    {
        var summary = AgentReadinessDetector.CheckPageSummary(html, Capability(PwaCapabilityId.PageSummary));
        var structured = AgentReadinessDetector.CheckStructuredData(html, Capability(PwaCapabilityId.StructuredData));
        Assert.Equal(PwaCapabilityCheckStatus.Failed, summary);
        Assert.Equal(PwaCapabilityCheckStatus.Failed, structured);
    }

    // ---- Structured data ----

    /// <summary>JSON-LD that names a schema.org type, directly, inside an @graph or in an array, is recognized.</summary>
    [Theory]
    [InlineData("{\"@context\":\"https://schema.org\",\"@type\":\"Person\",\"name\":\"Hamdi\"}")]
    [InlineData("{\"@context\":\"http://schema.org/\",\"@type\":\"Person\"}")]
    [InlineData("{\"@context\":\"https://schema.org\",\"@graph\":[{\"@type\":\"WebSite\"}]}")]
    [InlineData("[{\"@context\":\"https://schema.org\",\"@type\":\"Organization\"}]")]
    [InlineData("{\"@context\":\"https://schema.org\",\"@type\":[\"Organization\",\"LocalBusiness\"]}")]
    [InlineData("{\"@context\":[\"https://schema.org\",{\"ex\":\"https://example.org/ns#\"}],\"@type\":\"Event\"}")]
    [InlineData("{\"@context\":{\"@vocab\":\"https://schema.org/\"},\"@type\":\"Product\"}")]
    [InlineData("{\"@context\":{\"schema\":\"https://schema.org/\"},\"@type\":\"schema:Person\"}")]
    [InlineData("{\"@type\":\"https://schema.org/Person\"}")]
    [InlineData("{\"@context\":\"https://unrelated.example/vocab\",\"@type\":[\"Thing\",\"http://schema.org/Person\"]}")]
    [InlineData("{\"@context\":\"https://schema.org\",\"@type\":null,\"@graph\":[{\"@type\":\"WebSite\"}]}")]
    public void Structured_data_is_detected(string json)
    {
        var capability = Capability(PwaCapabilityId.StructuredData);
        Assert.Equal(PwaCapabilityCheckStatus.Passed, AgentReadinessDetector.CheckStructuredData(JsonLd(json), capability));
        Assert.Null(capability.ErrorMessage);
    }

    /// <summary>The script element is found whatever the quoting or casing of its type attribute, and a broken block does not hide a good one.</summary>
    [Theory]
    [InlineData("<script type=application/ld+json>{\"@context\":\"https://schema.org\",\"@type\":\"Person\"}</script>")]
    [InlineData("<script type='application/ld+json'>{\"@context\":\"https://schema.org\",\"@type\":\"Person\"}</script>")]
    [InlineData("<SCRIPT TYPE=\"Application/LD+JSON\" id=ld>{\"@context\":\"https://schema.org\",\"@type\":\"Person\"}</SCRIPT>")]
    [InlineData("<script type=\"application/ld+json; charset=utf-8\">{\"@context\":\"https://schema.org\",\"@type\":\"Person\"}</script>")]
    [InlineData("<script type=\"application/ld+json\">not json</script><script type=\"application/ld+json\">{\"@context\":\"https://schema.org\",\"@type\":\"Event\"}</script>")]
    [InlineData("<script type=\"application/ld+json\">{\"@context\":\"https://schema.org\",\"@type\":\"Article\",\"headline\":\"a < b && c > d\"}</script>")]
    public void Structured_data_script_is_found(string html)
    {
        Assert.Equal(PwaCapabilityCheckStatus.Passed, AgentReadinessDetector.CheckStructuredData(html, Capability(PwaCapabilityId.StructuredData)));
    }

    /// <summary>JSON-LD without a usable schema.org type fails: no type, an empty or non-text type, or a type from another vocabulary.</summary>
    [Theory]
    [InlineData("{\"name\":\"no type\"}")]
    [InlineData("{\"@type\":null}")]
    [InlineData("{\"@type\":{}}")]
    [InlineData("{\"@type\":123}")]
    [InlineData("{\"@type\":[]}")]
    [InlineData("{\"@type\":\"\"}")]
    [InlineData("{\"@context\":\"https://schema.org\",\"@type\":\"  \"}")]
    [InlineData("{\"@context\":\"https://schema.org\",\"@type\":[\"Person\",42]}")]
    [InlineData("{\"@context\":\"https://unrelated.example/vocab\",\"@type\":\"NotSchemaOrg\"}")]
    [InlineData("{\"@type\":\"Person\"}")]
    [InlineData("{\"@type\":\"https://unrelated.example/Person\"}")]
    [InlineData("{\"@context\":\"https://schema.org\",\"@type\":\"other:Person\"}")]
    [InlineData("{\"@context\":\"https://schema.org\",\"@graph\":[{\"@context\":\"https://unrelated.example/vocab\",\"@type\":\"Thing\"}]}")]
    [InlineData("\"just a string\"")]
    public void Unusable_structured_data_is_reported(string json)
    {
        var capability = Capability(PwaCapabilityId.StructuredData);
        Assert.Equal(PwaCapabilityCheckStatus.Failed, AgentReadinessDetector.CheckStructuredData(JsonLd(json), capability));
        Assert.Contains("schema.org", capability.ErrorMessage);
    }

    /// <summary>Pages without a JSON-LD block, with a broken one, or with one only inside a comment fail the structured data check.</summary>
    [Theory]
    [InlineData("<html><head><title>x</title></head></html>", "No <script")]
    [InlineData("<script type=\"application/ld+json\">{broken</script>", "not valid JSON")]
    [InlineData("<!-- <script type=\"application/ld+json\">{\"@context\":\"https://schema.org\",\"@type\":\"Person\"}</script> --><html></html>", "No <script")]
    [InlineData("<script type=\"application/json\">{\"@context\":\"https://schema.org\",\"@type\":\"Person\"}</script>", "No <script")]
    public void Missing_structured_data_is_reported(string html, string expectedInMessage)
    {
        var capability = Capability(PwaCapabilityId.StructuredData);
        Assert.Equal(PwaCapabilityCheckStatus.Failed, AgentReadinessDetector.CheckStructuredData(html, capability));
        Assert.Contains(expectedInMessage, capability.ErrorMessage);
    }

    // ---- llms.txt ----

    /// <summary>A plain text llms.txt that starts with a heading passes.</summary>
    [Theory]
    [InlineData("# My app\n\n> One line about it.\n", "text/plain")]
    [InlineData("﻿# My app\n", "text/plain; charset=utf-8")]
    [InlineData("# My app", null)]
    public void Llms_txt_is_detected(string body, string? mediaType)
    {
        Assert.Equal(PwaCapabilityCheckStatus.Passed, AgentReadinessDetector.CheckLlmsTxt(FetchResult.Found(body, mediaType), Capability(PwaCapabilityId.LlmsTxt)));
    }

    /// <summary>A confirmed missing file, an HTML catch-all page or a file without a heading fails the llms.txt check.</summary>
    [Fact]
    public void Missing_or_wrong_llms_txt_is_reported()
    {
        var missing = Capability(PwaCapabilityId.LlmsTxt);
        Assert.Equal(PwaCapabilityCheckStatus.Failed, AgentReadinessDetector.CheckLlmsTxt(FetchResult.NotFound(), missing));
        Assert.Contains("No /llms.txt file was found", missing.ErrorMessage);
        Assert.Equal(PwaCapabilityCheckStatus.Failed, AgentReadinessDetector.CheckLlmsTxt(FetchResult.Found("<!doctype html><html></html>", "text/html"), Capability(PwaCapabilityId.LlmsTxt)));
        Assert.Equal(PwaCapabilityCheckStatus.Failed, AgentReadinessDetector.CheckLlmsTxt(FetchResult.Found("My app without a heading", "text/plain"), Capability(PwaCapabilityId.LlmsTxt)));
        Assert.Equal(PwaCapabilityCheckStatus.Failed, AgentReadinessDetector.CheckLlmsTxt(FetchResult.Found("#  \nno name in the heading", "text/plain"), Capability(PwaCapabilityId.LlmsTxt)));
    }

    /// <summary>A discovery file that could not be fetched is skipped, with no error message, so it creates no action item.</summary>
    [Fact]
    public void Unavailable_discovery_files_are_skipped_not_failed()
    {
        var llms = Capability(PwaCapabilityId.LlmsTxt);
        var card = Capability(PwaCapabilityId.AgentCard);
        Assert.Equal(PwaCapabilityCheckStatus.Skipped, AgentReadinessDetector.CheckLlmsTxt(FetchResult.Unavailable("HTTP 503"), llms));
        Assert.Equal(PwaCapabilityCheckStatus.Skipped, AgentReadinessDetector.CheckAgentCard(FetchResult.Unavailable("timed out"), card));
        Assert.Equal(PwaCapabilityCheckStatus.Skipped, AgentReadinessDetector.CheckLlmsTxt(default, Capability(PwaCapabilityId.LlmsTxt)));
        Assert.Null(llms.ErrorMessage);
        Assert.Null(card.ErrorMessage);
    }

    // ---- Agent card ----

    /// <summary>An agent card with a name, a description, an endpoint and skills passes, in the 0.3 shape (url) and the 1.0 shape (supportedInterfaces).</summary>
    [Theory]
    [InlineData(GoodCard)]
    [InlineData("{\"name\":\"Cards\",\"description\":\"Finds a contact card\",\"url\":\"http://example.org\",\"skills\":[]}")]
    [InlineData("{\"name\":\"Cards\",\"description\":\"Finds a contact card\",\"supportedInterfaces\":[{\"url\":\"https://example.org/a2a\",\"protocolBinding\":\"JSONRPC\"}],\"skills\":[{\"id\":\"find\"}]}")]
    public void Agent_card_is_detected(string card)
    {
        var capability = Capability(PwaCapabilityId.AgentCard);
        Assert.Equal(PwaCapabilityCheckStatus.Passed, AgentReadinessDetector.CheckAgentCard(FetchResult.Found(card, "application/json"), capability));
        Assert.Null(capability.ErrorMessage);
    }

    /// <summary>A missing, broken or incomplete agent card fails and names the missing fields.</summary>
    [Fact]
    public void Missing_or_incomplete_agent_card_is_reported()
    {
        Assert.Equal(PwaCapabilityCheckStatus.Failed, AgentReadinessDetector.CheckAgentCard(FetchResult.NotFound(), Capability(PwaCapabilityId.AgentCard)));
        Assert.Equal(PwaCapabilityCheckStatus.Failed, AgentReadinessDetector.CheckAgentCard(FetchResult.Found("{broken", "application/json"), Capability(PwaCapabilityId.AgentCard)));
        Assert.Equal(PwaCapabilityCheckStatus.Failed, AgentReadinessDetector.CheckAgentCard(FetchResult.Found("[]", "application/json"), Capability(PwaCapabilityId.AgentCard)));

        var catchAll = Capability(PwaCapabilityId.AgentCard);
        Assert.Equal(PwaCapabilityCheckStatus.Failed, AgentReadinessDetector.CheckAgentCard(FetchResult.Found("<!doctype html><html></html>", "text/html"), catchAll));
        Assert.Contains("HTML instead of JSON", catchAll.ErrorMessage);

        var incomplete = Capability(PwaCapabilityId.AgentCard);
        Assert.Equal(PwaCapabilityCheckStatus.Failed, AgentReadinessDetector.CheckAgentCard(FetchResult.Found("{\"name\":\"Cards\"}", "application/json"), incomplete));
        Assert.DoesNotContain("name (", incomplete.ErrorMessage);
        Assert.Contains("description", incomplete.ErrorMessage);
        Assert.Contains("url", incomplete.ErrorMessage);
        Assert.Contains("skills", incomplete.ErrorMessage);
    }

    /// <summary>Fields that are present but cannot be used as described fail the check and are named.</summary>
    [Theory]
    [InlineData("{\"name\":false,\"description\":42,\"url\":{},\"skills\":\"not an array\"}", "name (|description (|url (|skills (")]
    [InlineData("{\"name\":\"  \",\"description\":\"d\",\"url\":\"https://example.org\",\"skills\":[]}", "name (")]
    [InlineData("{\"name\":\"n\",\"description\":\"\",\"url\":\"https://example.org\",\"skills\":[]}", "description (")]
    [InlineData("{\"name\":\"n\",\"description\":\"d\",\"url\":\"/relative/path\",\"skills\":[]}", "url (")]
    [InlineData("{\"name\":\"n\",\"description\":\"d\",\"url\":\"ftp://example.org/agent\",\"skills\":[]}", "url (")]
    [InlineData("{\"name\":\"n\",\"description\":\"d\",\"url\":\"javascript:alert(1)\",\"skills\":[]}", "url (")]
    [InlineData("{\"name\":\"n\",\"description\":\"d\",\"url\":\"not a url\",\"skills\":[]}", "url (")]
    [InlineData("{\"name\":\"n\",\"description\":\"d\",\"supportedInterfaces\":[{\"url\":42}],\"skills\":[]}", "url (")]
    [InlineData("{\"name\":\"n\",\"description\":\"d\",\"url\":\"https://example.org\",\"skills\":{}}", "skills (")]
    [InlineData("{\"name\":\"n\",\"description\":\"d\",\"url\":\"https://example.org\",\"skills\":[\"find\",1]}", "skills (")]
    public void Agent_card_with_unusable_values_is_reported(string card, string expectedInMessage)
    {
        var capability = Capability(PwaCapabilityId.AgentCard);
        Assert.Equal(PwaCapabilityCheckStatus.Failed, AgentReadinessDetector.CheckAgentCard(FetchResult.Found(card, "application/json"), capability));
        foreach (var expected in expectedInMessage.Split('|'))
        {
            Assert.Contains(expected, capability.ErrorMessage);
        }
    }

    // ---- Fetching: what each kind of answer does to the four checks ----

    /// <summary>A site that publishes everything passes all four checks end to end.</summary>
    [Fact]
    public async Task A_ready_site_passes_all_four_checks()
    {
        var result = await Detect(new FakeHandler());
        Assert.All(result.Values, status => Assert.Equal(PwaCapabilityCheckStatus.Passed, status));
        Assert.Equal(4, result.Count);
    }

    /// <summary>404 and 410 confirm a discovery file is absent, so the check fails. The page checks keep their results.</summary>
    [Theory]
    [InlineData(HttpStatusCode.NotFound)]
    [InlineData(HttpStatusCode.Gone)]
    public async Task Confirmed_missing_files_fail(HttpStatusCode status)
    {
        var handler = new FakeHandler { Llms = _ => Respond(status), Card = _ => Respond(status) };
        var result = await Detect(handler);
        Assert.Equal(PwaCapabilityCheckStatus.Passed, result[PwaCapabilityId.PageSummary]);
        Assert.Equal(PwaCapabilityCheckStatus.Passed, result[PwaCapabilityId.StructuredData]);
        Assert.Equal(PwaCapabilityCheckStatus.Failed, result[PwaCapabilityId.LlmsTxt]);
        Assert.Equal(PwaCapabilityCheckStatus.Failed, result[PwaCapabilityId.AgentCard]);
    }

    /// <summary>Server errors, rate limiting and other answers that do not confirm absence skip the check.</summary>
    [Theory]
    [InlineData(HttpStatusCode.InternalServerError)]
    [InlineData(HttpStatusCode.BadGateway)]
    [InlineData(HttpStatusCode.ServiceUnavailable)]
    [InlineData(HttpStatusCode.GatewayTimeout)]
    [InlineData(HttpStatusCode.TooManyRequests)]
    [InlineData(HttpStatusCode.RequestTimeout)]
    [InlineData(HttpStatusCode.Forbidden)]
    public async Task Unavailable_answers_skip_every_check(HttpStatusCode status)
    {
        var handler = new FakeHandler { Page = _ => Respond(status), Llms = _ => Respond(status), Card = _ => Respond(status) };
        var result = await Detect(handler);
        Assert.All(result.Values, s => Assert.Equal(PwaCapabilityCheckStatus.Skipped, s));
    }

    /// <summary>A DNS or connection failure skips every check: nothing was learned about the site.</summary>
    [Fact]
    public async Task Connection_failures_skip_every_check()
    {
        Func<HttpRequestMessage, Task<HttpResponseMessage>> fail = _ => throw new HttpRequestException("No such host is known.");
        var result = await Detect(new FakeHandler { Page = fail, Llms = fail, Card = fail });
        Assert.All(result.Values, s => Assert.Equal(PwaCapabilityCheckStatus.Skipped, s));
    }

    /// <summary>One failing fetch skips only its own check. The others keep the results they earned.</summary>
    [Fact]
    public async Task One_failed_fetch_does_not_touch_the_other_checks()
    {
        var handler = new FakeHandler { Card = _ => throw new HttpRequestException("Connection reset.") };
        var result = await Detect(handler);
        Assert.Equal(PwaCapabilityCheckStatus.Passed, result[PwaCapabilityId.PageSummary]);
        Assert.Equal(PwaCapabilityCheckStatus.Passed, result[PwaCapabilityId.StructuredData]);
        Assert.Equal(PwaCapabilityCheckStatus.Passed, result[PwaCapabilityId.LlmsTxt]);
        Assert.Equal(PwaCapabilityCheckStatus.Skipped, result[PwaCapabilityId.AgentCard]);
    }

    /// <summary>A request that times out, as HttpClient.Timeout does by throwing a cancellation, skips only its own check.</summary>
    [Fact]
    public async Task A_timed_out_request_does_not_discard_the_other_results()
    {
        var handler = new FakeHandler { Llms = _ => throw new TaskCanceledException("The request was canceled due to the configured HttpClient.Timeout.", new TimeoutException()) };
        var result = await Detect(handler);
        Assert.Equal(PwaCapabilityCheckStatus.Passed, result[PwaCapabilityId.PageSummary]);
        Assert.Equal(PwaCapabilityCheckStatus.Passed, result[PwaCapabilityId.StructuredData]);
        Assert.Equal(PwaCapabilityCheckStatus.Skipped, result[PwaCapabilityId.LlmsTxt]);
        Assert.Equal(PwaCapabilityCheckStatus.Passed, result[PwaCapabilityId.AgentCard]);
    }

    /// <summary>A server that never answers one file is cut off by the detector's own per fetch limit, and the other checks still report.</summary>
    [Fact]
    public async Task A_server_that_never_answers_is_cut_off_by_the_fetch_timeout()
    {
        var handler = new FakeHandler { Card = async request => { await Task.Delay(Timeout.Infinite, request.Options.TryGetValue(FakeHandler.TokenKey, out var token) ? token : default); return await Respond(HttpStatusCode.OK); } };
        var result = await Detect(handler, fetchTimeout: TimeSpan.FromMilliseconds(300)).WaitAsync(TimeSpan.FromSeconds(10));
        Assert.Equal(PwaCapabilityCheckStatus.Passed, result[PwaCapabilityId.PageSummary]);
        Assert.Equal(PwaCapabilityCheckStatus.Passed, result[PwaCapabilityId.LlmsTxt]);
        Assert.Equal(PwaCapabilityCheckStatus.Skipped, result[PwaCapabilityId.AgentCard]);
    }

    /// <summary>A body that stalls after the headers is cut off too: HttpClient.Timeout does not cover the body once headers arrived.</summary>
    [Fact]
    public async Task A_body_that_stalls_is_cut_off_by_the_fetch_timeout()
    {
        var handler = new FakeHandler { Llms = _ => Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK) { Content = new StreamContent(new StallingStream(Encoding.UTF8.GetBytes("# My"))) }) };
        var result = await Detect(handler, fetchTimeout: TimeSpan.FromMilliseconds(300)).WaitAsync(TimeSpan.FromSeconds(10));
        Assert.Equal(PwaCapabilityCheckStatus.Passed, result[PwaCapabilityId.PageSummary]);
        Assert.Equal(PwaCapabilityCheckStatus.Skipped, result[PwaCapabilityId.LlmsTxt]);
        Assert.Equal(PwaCapabilityCheckStatus.Passed, result[PwaCapabilityId.AgentCard]);
    }

    /// <summary>Once the size cap is reached no further read is awaited, so a server that pauses right at the cap does not hold the check.</summary>
    [Fact]
    public async Task Reaching_the_size_cap_stops_reading_at_once()
    {
        const int llmsCap = 256 * 1024;
        var body = new byte[llmsCap];
        Array.Fill(body, (byte)'a');
        Encoding.UTF8.GetBytes("# My app\n").CopyTo(body, 0);
        var stream = new StallingStream(body);
        var handler = new FakeHandler { Llms = _ => Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK) { Content = new StreamContent(stream) }) };

        // The fetch timeout is far longer than the wait: only stopping at the cap can finish in time.
        var result = await Detect(handler, fetchTimeout: TimeSpan.FromMinutes(5)).WaitAsync(TimeSpan.FromSeconds(10));
        Assert.Equal(PwaCapabilityCheckStatus.Passed, result[PwaCapabilityId.LlmsTxt]);
        Assert.False(stream.ReadAfterEnd, "The detector asked for more bytes after the cap was reached.");
    }

    /// <summary>A response larger than the cap is cut at the cap and still checked.</summary>
    [Fact]
    public async Task An_oversized_response_is_cut_at_the_cap()
    {
        var big = "# My app\n" + new string('a', 600 * 1024);
        var handler = new FakeHandler { Llms = _ => Respond(HttpStatusCode.OK, big, "text/plain") };
        var result = await Detect(handler);
        Assert.Equal(PwaCapabilityCheckStatus.Passed, result[PwaCapabilityId.LlmsTxt]);
    }

    /// <summary>Cancelling the whole analysis never throws out of the detector; unfinished checks are skipped.</summary>
    [Fact]
    public async Task Cancelling_the_analysis_skips_the_checks_without_throwing()
    {
        using var cancel = new CancellationTokenSource();
        cancel.Cancel();
        var result = await Detect(new FakeHandler(), cancelToken: cancel.Token);
        Assert.All(result.Values, s => Assert.Equal(PwaCapabilityCheckStatus.Skipped, s));
    }

    /// <summary>Every analysis starts with the four agent readiness checks in progress, in their own category.</summary>
    [Fact]
    public void Analysis_carries_agent_readiness_capabilities()
    {
        var analysis = new Analysis { Id = "analysis:test:1", Url = new Uri("https://example.org/") };
        var agentChecks = analysis.Capabilities.Where(c => c.Category == PwaCapabilityCategory.AgentReadiness).ToList();
        Assert.Equal(4, agentChecks.Count);
        Assert.All(agentChecks, c => Assert.Equal(PwaCapabilityCheckStatus.InProgress, c.Status));
    }

    private static async Task<Dictionary<PwaCapabilityId, PwaCapabilityCheckStatus>> Detect(FakeHandler handler, TimeSpan? fetchTimeout = null, CancellationToken cancelToken = default)
    {
        var detector = new AgentReadinessDetector(new FakeHttpClientFactory(handler), fetchTimeout ?? TimeSpan.FromSeconds(30));
        var capabilities = await detector.TryDetectAsync(new Uri("https://example.org/app/"), NullLogger.Instance, cancelToken);
        return capabilities.ToDictionary(c => c.Id, c => c.Status);
    }

    private static Task<HttpResponseMessage> Respond(HttpStatusCode status, string body = "", string mediaType = "text/plain") =>
        Task.FromResult(new HttpResponseMessage(status) { Content = new StringContent(body, Encoding.UTF8, mediaType) });

    /// <summary>Answers the start page, /llms.txt and the agent card. Each answer can be replaced to simulate a failure.</summary>
    private sealed class FakeHandler : HttpMessageHandler
    {
        public static readonly HttpRequestOptionsKey<CancellationToken> TokenKey = new("token");

        public Func<HttpRequestMessage, Task<HttpResponseMessage>> Page { get; init; } = _ => Respond(HttpStatusCode.OK, GoodPage, "text/html");

        public Func<HttpRequestMessage, Task<HttpResponseMessage>> Llms { get; init; } = _ => Respond(HttpStatusCode.OK, GoodLlms, "text/plain");

        public Func<HttpRequestMessage, Task<HttpResponseMessage>> Card { get; init; } = _ => Respond(HttpStatusCode.OK, GoodCard, "application/json");

        protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            cancellationToken.ThrowIfCancellationRequested();
            request.Options.Set(TokenKey, cancellationToken);
            return request.RequestUri!.AbsolutePath switch
            {
                "/llms.txt" => await Llms(request),
                "/.well-known/agent-card.json" => await Card(request),
                "/app/" => await Page(request),
                var path => throw new InvalidOperationException($"Unexpected request for {path}")
            };
        }
    }

    private sealed class FakeHttpClientFactory(HttpMessageHandler handler) : IHttpClientFactory
    {
        public HttpClient CreateClient(string name) => new(handler, disposeHandler: false);
    }

    /// <summary>Hands out its bytes, then never returns from the next read until the read is cancelled, like a server that goes quiet.</summary>
    private sealed class StallingStream(byte[] data) : Stream
    {
        private int position;

        public bool ReadAfterEnd { get; private set; }

        public override bool CanRead => true;

        public override bool CanSeek => false;

        public override bool CanWrite => false;

        public override long Length => throw new NotSupportedException();

        public override long Position { get => position; set => throw new NotSupportedException(); }

        public override async ValueTask<int> ReadAsync(Memory<byte> buffer, CancellationToken cancellationToken = default)
        {
            if (position >= data.Length)
            {
                ReadAfterEnd = true;
                await Task.Delay(Timeout.Infinite, cancellationToken);
            }

            var count = Math.Min(buffer.Length, data.Length - position);
            data.AsMemory(position, count).CopyTo(buffer);
            position += count;
            return count;
        }

        public override Task<int> ReadAsync(byte[] buffer, int offset, int count, CancellationToken cancellationToken) =>
            ReadAsync(buffer.AsMemory(offset, count), cancellationToken).AsTask();

        public override int Read(byte[] buffer, int offset, int count) => ReadAsync(buffer, offset, count, CancellationToken.None).GetAwaiter().GetResult();

        public override void Flush()
        {
        }

        public override long Seek(long offset, SeekOrigin origin) => throw new NotSupportedException();

        public override void SetLength(long value) => throw new NotSupportedException();

        public override void Write(byte[] buffer, int offset, int count) => throw new NotSupportedException();
    }
}
