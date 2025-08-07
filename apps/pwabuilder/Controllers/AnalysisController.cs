using Microsoft.AspNetCore.Mvc;
using PWABuilder.Models;

namespace PWABuilder.Controllers;

/// <summary>
/// Controller that analyzes a URL for PWA compliance. This is a new endpoint meant to replace the legacy URLs of FindWebManifest, FindServiceWorker, and Report.
/// </summary>
[ApiController]
[Route("api/analyses")]
public class AnalysisController : ControllerBase
{
    private readonly ILogger<AnalysisController> logger;

    public AnalysisController(ILogger<AnalysisController> logger)
    {
        this.logger = logger;
    }

    /// <summary>
    /// Analyzes the provided URL for PWA compliance.
    /// </summary>
    /// <param name="url">The URL to analyze.</param>
    /// <returns>The ID of the AnalysisJob.</returns>
    [HttpPost]
    public ActionResult<string> Analyze(Uri url)
    {
        // Create a new Analysis object in the database and enqueue an AnalysisJob.
        var analysis = new Analysis
        {
            Url = url,
            Status = AnalysisStatus.Queued
        };
        var job = new AnalysisJob
        {
            AnalysisId = analysis.Id,
            Url = url
        };
        return job.Id;
    }
}