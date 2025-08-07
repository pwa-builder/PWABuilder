using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using PWABuilder.Models;
using PWABuilder.Services;

namespace PWABuilder.Controllers;

/// <summary>
/// Controller that analyzes a URL for PWA compliance. This is a new endpoint meant to replace the legacy URLs of FindWebManifest, FindServiceWorker, and Report.
/// </summary>
[ApiController]
[Route("api/analyses")]
public class AnalysisController : ControllerBase
{
    private readonly ILogger<AnalysisController> logger;
    private readonly AnalysisDb analysisDb;
    private readonly AnalysisJobQueue analysisJobQueue;

    public AnalysisController(AnalysisDb analysisDb, AnalysisJobQueue analysisJobQueue, ILogger<AnalysisController> logger)
    {
        this.analysisDb = analysisDb;
        this.analysisJobQueue = analysisJobQueue;
        this.logger = logger;
    }

    /// <summary>
    /// Analyzes the provided URL for PWA compliance.
    /// </summary>
    /// <param name="url">The URL to analyze.</param>
    /// <returns>The ID of the AnalysisJob.</returns>
    [HttpPost("analyze")]
    public async Task<ActionResult<string>> Analyze(Uri url)
    {
        // Create a new Analysis object in the database and enqueue an AnalysisJob.
        var analysis = new Analysis
        {
            Id = Analysis.GetId(url),
            Url = url.ToString(),
            Status = AnalysisStatus.Queued
        };
        var job = new AnalysisJob
        {
            AnalysisId = analysis.Id,
            Url = url
        };
        await this.analysisDb.SaveAsync(analysis);
        await this.analysisJobQueue.EnqueueAsync(job);
        return job.Id;
    }
}