using PWABuilder.Models;
using PWABuilder.Services;
using Xunit;

namespace PWABuilder.Tests;

/// <summary>Verifies the agent readiness checks (PE WA BE): page summary, structured data, llms.txt and the agent card.</summary>
public sealed class AgentReadinessDetectorTests
{
    private static PwaCapability Capability(PwaCapabilityId id) => PwaCapability.CreateAgentReadinessCapabilities().First(c => c.Id == id);

    /// <summary>A start page with a title, a description and a language passes the summary check.</summary>
    [Theory]
    [InlineData("<html lang=\"en\"><head><title>My app</title><meta name=\"description\" content=\"A small app.\"></head></html>")]
    [InlineData("<!doctype html><HTML LANG='ar' dir='rtl'><head><META content=\"Describes the app\" NAME=\"description\"><TITLE>تطبيق</TITLE></head>")]
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
    public void Missing_page_summary_is_reported(string html, string expectedInMessage)
    {
        var capability = Capability(PwaCapabilityId.PageSummary);
        Assert.Equal(PwaCapabilityCheckStatus.Failed, AgentReadinessDetector.CheckPageSummary(html, capability));
        Assert.Contains(expectedInMessage, capability.ErrorMessage);
    }

    /// <summary>JSON-LD with a type, including inside an @graph or an array, is recognized as structured data.</summary>
    [Theory]
    [InlineData("<script type=\"application/ld+json\">{\"@context\":\"https://schema.org\",\"@type\":\"Person\",\"name\":\"Hamdi\"}</script>")]
    [InlineData("<script type='application/ld+json'>{\"@context\":\"https://schema.org\",\"@graph\":[{\"@type\":\"WebSite\"}]}</script>")]
    [InlineData("<script type=\"application/ld+json\">[{\"@type\":\"Organization\"}]</script>")]
    [InlineData("<script type=\"application/ld+json\">not json</script><script type=\"application/ld+json\">{\"@type\":\"Event\"}</script>")]
    public void Structured_data_is_detected(string html)
    {
        Assert.Equal(PwaCapabilityCheckStatus.Passed, AgentReadinessDetector.CheckStructuredData(html, Capability(PwaCapabilityId.StructuredData)));
    }

    /// <summary>Pages without a parsable JSON-LD type fail the structured data check.</summary>
    [Theory]
    [InlineData("<html><head><title>x</title></head></html>")]
    [InlineData("<script type=\"application/ld+json\">{\"name\":\"no type\"}</script>")]
    [InlineData("<script type=\"application/ld+json\">{broken</script>")]
    public void Missing_structured_data_is_reported(string html)
    {
        var capability = Capability(PwaCapabilityId.StructuredData);
        Assert.Equal(PwaCapabilityCheckStatus.Failed, AgentReadinessDetector.CheckStructuredData(html, capability));
        Assert.NotNull(capability.ErrorMessage);
    }

    /// <summary>A plain text llms.txt that starts with a heading passes.</summary>
    [Theory]
    [InlineData("# My app\n\n> One line about it.\n", "text/plain")]
    [InlineData("﻿# My app\n", "text/plain; charset=utf-8")]
    [InlineData("# My app", null)]
    public void Llms_txt_is_detected(string body, string? mediaType)
    {
        Assert.Equal(PwaCapabilityCheckStatus.Passed, AgentReadinessDetector.CheckLlmsTxt(new FetchedText(body, mediaType), Capability(PwaCapabilityId.LlmsTxt)));
    }

    /// <summary>A missing file, an HTML catch-all page or a file without a heading fails the llms.txt check.</summary>
    [Fact]
    public void Missing_or_wrong_llms_txt_is_reported()
    {
        Assert.Equal(PwaCapabilityCheckStatus.Failed, AgentReadinessDetector.CheckLlmsTxt(null, Capability(PwaCapabilityId.LlmsTxt)));
        Assert.Equal(PwaCapabilityCheckStatus.Failed, AgentReadinessDetector.CheckLlmsTxt(new FetchedText("<!doctype html><html></html>", "text/html"), Capability(PwaCapabilityId.LlmsTxt)));
        Assert.Equal(PwaCapabilityCheckStatus.Failed, AgentReadinessDetector.CheckLlmsTxt(new FetchedText("My app without a heading", "text/plain"), Capability(PwaCapabilityId.LlmsTxt)));
    }

    /// <summary>An agent card with a name, a description, a url and skills passes.</summary>
    [Fact]
    public void Agent_card_is_detected()
    {
        var card = "{\"name\":\"Cards\",\"description\":\"Finds a contact card\",\"url\":\"https://example.org/a2a\",\"version\":\"1.0\",\"skills\":[{\"id\":\"find\",\"name\":\"Find card\"}]}";
        Assert.Equal(PwaCapabilityCheckStatus.Passed, AgentReadinessDetector.CheckAgentCard(new FetchedText(card, "application/json"), Capability(PwaCapabilityId.AgentCard)));
    }

    /// <summary>A missing, broken or incomplete agent card fails and names the missing fields.</summary>
    [Fact]
    public void Missing_or_incomplete_agent_card_is_reported()
    {
        Assert.Equal(PwaCapabilityCheckStatus.Failed, AgentReadinessDetector.CheckAgentCard(null, Capability(PwaCapabilityId.AgentCard)));
        Assert.Equal(PwaCapabilityCheckStatus.Failed, AgentReadinessDetector.CheckAgentCard(new FetchedText("{broken", "application/json"), Capability(PwaCapabilityId.AgentCard)));
        Assert.Equal(PwaCapabilityCheckStatus.Failed, AgentReadinessDetector.CheckAgentCard(new FetchedText("[]", "application/json"), Capability(PwaCapabilityId.AgentCard)));

        var incomplete = Capability(PwaCapabilityId.AgentCard);
        Assert.Equal(PwaCapabilityCheckStatus.Failed, AgentReadinessDetector.CheckAgentCard(new FetchedText("{\"name\":\"Cards\"}", "application/json"), incomplete));
        Assert.Contains("description", incomplete.ErrorMessage);
        Assert.Contains("skills", incomplete.ErrorMessage);
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
}
