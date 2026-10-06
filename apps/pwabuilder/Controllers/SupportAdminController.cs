using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Mvc;
using PWABuilder.Models;
using PWABuilder.Services;

namespace PWABuilder.Controllers;

/// <summary>Read-only diagnostics API available solely to assigned tenant support readers.</summary>
[Authorize(Policy = SupportAdminAuthentication.Policy)]
[Route("api/admin")]
[ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
public sealed class SupportAdminController : Controller
{
    private readonly IAnalysisStore analyses;
    private readonly SupportDiagnosticsService diagnostics;
    private readonly ILogger<SupportAdminController> logger;
    private readonly SupportCursorProtector cursors;

    /// <summary>Creates the support controller with read-only diagnostics dependencies.</summary>
    public SupportAdminController(IAnalysisStore analyses, SupportDiagnosticsService diagnostics,
        ILogger<SupportAdminController> logger, IDataProtectionProvider protection)
    {
        this.analyses = analyses;
        this.diagnostics = diagnostics;
        this.logger = logger;
        cursors = new SupportCursorProtector(protection);
    }

    /// <summary>Lists at most fifty failures per service from the preceding fourteen days.</summary>
    [HttpGet("")]
    public async Task<IActionResult> Index(CancellationToken cancellationToken)
    {
        Audit("recent-failures", "");
        SupportPageRequest analysisRequest;
        SupportPageRequest packageRequest;
        try
        {
            var now = DateTimeOffset.UtcNow;
            analysisRequest = cursors.Read("analysis", Cursor("analysisCursor"), now);
            packageRequest = cursors.Read("package", Cursor("packageCursor"), now);
        }
        catch (ArgumentException)
        {
            return BadRequest(new { message = "Invalid or expired support cursor. Reload the dashboard." });
        }
        var failedAnalyses = await analyses.GetFailuresPageAsync(analysisRequest, cancellationToken);
        var failedPackages = await diagnostics.GetPackagesPageAsync(packageRequest);
        return Ok(new SupportDashboard(failedAnalyses.Items, failedPackages.Items,
            cursors.Write("analysis", analysisRequest, failedAnalyses.ContinuationToken),
            cursors.Write("package", packageRequest, failedPackages.ContinuationToken),
            cursors.WritePage("analysis", analysisRequest), cursors.WritePage("package", packageRequest)));
    }

    /// <summary>Rejects duplicate query values and distinguishes absent cursors from invalid empty cursors.</summary>
    private string? Cursor(string name)
    {
        if (!Request.Query.TryGetValue(name, out var values))
        {
            return null;
        }
        return values.Count is 1 ? values[0] ?? "" : throw new ArgumentException("Invalid support cursor.");
    }

    /// <summary>Shows an explicit analysis projection without raw errors or private package data.</summary>
    [HttpGet("analyses/{id}")]
    public async Task<IActionResult> Analysis(string id, CancellationToken cancellationToken)
    {
        if (id.Length > 256 || !id.StartsWith("analysis:", StringComparison.Ordinal)
            || id.Any(character => char.IsControl(character) || character is '/' or '\\' or '?' or '#'))
        {
            return NotFound();
        }
        Audit("analysis", id);
        var analysis = await analyses.GetSupportByIdAsync(id, cancellationToken);
        return analysis is null ? NotFound() : Ok(analysis);
    }

    /// <summary>Shows a package's separate diagnostics by UUID, without owner tokens or artifact access.</summary>
    [HttpGet("package-jobs/{supportReference}")]
    public async Task<IActionResult> Package(string supportReference)
    {
        if (!Guid.TryParseExact(supportReference, "D", out var reference) || reference == Guid.Empty)
        {
            return NotFound();
        }
        Audit("package", reference.ToString("D"));
        var package = await diagnostics.GetPackageAsync(reference);
        return package is null ? NotFound() : Ok(package);
    }

    /// <summary>Records each valid support read attempt without email addresses, tokens, or diagnostics.</summary>
    private void Audit(string resource, string reference)
    {
        var objectId = Guid.TryParse(User.FindFirst("oid")?.Value, out var oid) ? oid.ToString("D") : "unavailable";
        var tenantId = Guid.TryParse(User.FindFirst("tid")?.Value, out var tid) ? tid.ToString("D") : "unavailable";
        logger.LogInformation("Support read: {Resource} {Reference}; actor {ObjectId}; tenant {TenantId}",
            resource, reference, objectId, tenantId);
    }
}
