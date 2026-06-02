using System.Net;
using ExCSS;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using PWABuilder.Common;
using PWABuilder.Models;
using PWABuilder.Services;

namespace PWABuilder.Controllers;

/// <summary>
/// Controller that analyzes a URL for PWA compliance.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class AnalysesController : ControllerBase
{
    private readonly ILogger<AnalysesController> logger;
    private readonly IAnalysisStore analysisStore;
    private readonly IAnalysisJobQueue analysisJobQueue;

    public AnalysesController(IAnalysisStore analysisStore, IAnalysisJobQueue analysisJobQueue, ILogger<AnalysesController> logger)
    {
        this.analysisStore = analysisStore;
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
        if (!url.IsAbsoluteUri)
        {
            url = new Uri($"https://{url}", UriKind.Absolute);
        }
        if (!url.IsAbsoluteInternetHttps())
        {
            return BadRequest("URL must be an absolute HTTPS URI pointing to a non-local address.");
        }

        // Create a new Analysis object in the database and enqueue an AnalysisJob.
        var analysis = new Analysis
        {
            Id = Analysis.GetId(url),
            Url = url,
            Status = AnalysisStatus.Queued
        };
        var job = new AnalysisJob
        {
            AnalysisId = analysis.Id,
            Url = url
        };
        await this.analysisStore.SaveAsync(analysis);
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
        var analysis = await this.analysisStore.GetByIdAsync(id);
        if (analysis == null)
        {
            logger.LogWarning("Analysis with ID {id} not found.", id);
            return null;
        }
        return analysis;
    }

    /// <summary>
    /// Records that app store packaging has started for an analysis.
    /// </summary>
    /// <param name="appStorePackage">The package metadata to append to the analysis.</param>
    /// <returns>No content if the package record was saved; not found if the analysis does not exist.</returns>
    [HttpPost("packagingStarted")]
    public async Task<ActionResult> PackagingStarted([FromBody] AppStorePackage appStorePackage)
    {
        return await this.RecordPackagingStatus(appStorePackage, "start");
    }

    /// <summary>
    /// Records that app store packaging has completed for an analysis.
    /// </summary>
    /// <param name="appStorePackage">The package metadata to append to the analysis.</param>
    /// <returns>No content if the package record was saved; not found if the analysis does not exist.</returns>
    [HttpPost("packagingCompleted")]
    public async Task<ActionResult> PackagingCompleted([FromBody] AppStorePackage appStorePackage)
    {
        return await this.RecordPackagingStatus(appStorePackage, "completion");
    }

    /// <summary>
    /// Records that app store packaging has failed for an analysis.
    /// </summary>
    /// <param name="appStorePackage">The package metadata to append to the analysis.</param>
    /// <returns>No content if the package record was saved; not found if the analysis does not exist.</returns>
    [HttpPost("packagingFailed")]
    public async Task<ActionResult> PackagingFailed([FromBody] AppStorePackage appStorePackage)
    {
        return await this.RecordPackagingStatus(appStorePackage, "failure");
    }

    /// <summary>
    /// Appends app store packaging metadata to the specified analysis.
    /// </summary>
    /// <param name="appStorePackage">The package metadata to append to the analysis.</param>
    /// <param name="eventName">A user-friendly event name for logging.</param>
    /// <returns>No content if the package record was saved; not found if the analysis does not exist.</returns>
    private async Task<ActionResult> RecordPackagingStatus(AppStorePackage appStorePackage, string eventName)
    {
        var analysis = await this.analysisStore.GetByIdAsync(appStorePackage.AnalysisId);
        if (analysis is null)
        {
            this.logger.LogWarning("Analysis with ID {id} not found when recording packaging {eventName}.", appStorePackage.AnalysisId, eventName);
            return NotFound();
        }

        analysis.AppStorePackages.Add(appStorePackage);
        await this.analysisStore.SaveAsync(analysis, expiration: TimeSpan.FromDays(365));
        return NoContent();
    }
}