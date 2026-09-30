using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PWABuilder.Models;
using PWABuilder.Services;

namespace PWABuilder.Controllers;

/// <summary>Read-only, server-rendered diagnostics available solely to assigned tenant support readers.</summary>
[Authorize(Policy = SupportAdminAuthentication.Policy)]
[Route("admin")]
[ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
public sealed class SupportAdminController : Controller
{
    private readonly IAnalysisStore analyses;
    private readonly SupportDiagnosticsService diagnostics;
    private readonly ILogger<SupportAdminController> logger;

    /// <summary>Creates the support controller with read-only diagnostics dependencies.</summary>
    public SupportAdminController(IAnalysisStore analyses, SupportDiagnosticsService diagnostics,
        ILogger<SupportAdminController> logger)
    {
        this.analyses = analyses;
        this.diagnostics = diagnostics;
        this.logger = logger;
    }

    /// <summary>Lists at most fifty failures per service from the preceding fourteen days.</summary>
    [HttpGet("")]
    public async Task<IActionResult> Index(CancellationToken cancellationToken)
    {
        Audit("recent-failures", "");
        var failedAnalyses = await analyses.GetRecentFailuresAsync(cancellationToken);
        var failedPackages = await diagnostics.GetRecentPackagesAsync();
        return View(new SupportDashboard(failedAnalyses, failedPackages));
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
        return analysis is null ? NotFound() : View(analysis);
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
        return package is null ? NotFound() : View(package);
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
