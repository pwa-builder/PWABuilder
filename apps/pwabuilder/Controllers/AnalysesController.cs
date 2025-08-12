using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using PWABuilder.Models;
using PWABuilder.Services;

namespace PWABuilder.Controllers;

/// <summary>
/// Controller that analyzes a URL for PWA compliance. This is a new endpoint meant to replace the legacy URLs of FindWebManifest, FindServiceWorker, and Report.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class AnalysesController : ControllerBase
{
    private readonly ILogger<AnalysesController> logger;
    private readonly AnalysisDb analysisDb;
    private readonly AnalysisJobQueue analysisJobQueue;

    public AnalysesController(AnalysisDb analysisDb, AnalysisJobQueue analysisJobQueue, ILogger<AnalysesController> logger)
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
    [HttpPost("enqueue")]
    public async Task<ActionResult<string>> Enqueue(Uri url)
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
        return analysis.Id;
    }

    /// <summary>
    /// Gets the the PWABuilder analysis with the specified ID.
    /// </summary>
    /// <param name="id"></param>
    /// <returns></returns>
    [HttpGet]
    [ResponseCache(NoStore = true)] // We don't want to cache this endpoint as the analysis changes in the background.
    public async Task<Analysis?> Get(string id)
    {
        var analysis = await this.analysisDb.GetByIdAsync(id);
        if (analysis == null)
        {
            logger.LogWarning("Analysis with ID {id} not found.", id);
            return null;
        }
        return analysis;
    }
}