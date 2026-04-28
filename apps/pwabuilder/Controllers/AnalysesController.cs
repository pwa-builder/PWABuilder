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
    private readonly IRedisCache db;
    private readonly IAnalysisJobQueue analysisJobQueue;

    public AnalysesController(IRedisCache analysisDb, IAnalysisJobQueue analysisJobQueue, ILogger<AnalysesController> logger)
    {
        this.db = analysisDb;
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
        await this.db.SaveAsync(analysis.Id, analysis);
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
        var analysis = await this.db.GetByIdAsync<Analysis>(id);
        if (analysis == null)
        {
            logger.LogWarning("Analysis with ID {id} not found.", id);
            return null;
        }
        return analysis;
    }

    public async Task<ActionResult> Health([FromServices] AnalysisJobProcessorHealthMonitor healthMonitor)
    {
        var errorMessage = string.Empty;
        if (healthMonitor.JobProcessorStopped)
        {
            errorMessage = "The analysis job processor has stopped processing jobs. This may indicate a problem with the AnalysisJobProcessor background service. Check the logs for more details.";
        }
        else if (healthMonitor.AnalysisQueueLength > 500)
        {
            errorMessage = "There are more than 500 analysis jobs in the queue. This may indicate a severe problem with the AnalysisJobProcessor background service. Check the queue length and monitor it to ensure it's not growing too large.";
        }
        else if (healthMonitor.AnalysisQueueLength > 100)
        {
            errorMessage = "There are more than 100 analysis jobs in the queue. This may indicate that the AnalysisJobProcessor background service is not processing jobs quickly enough. Check the queue length and monitor it to ensure it's not growing too large.";
        }
        else if (healthMonitor.JobsCompletedInLastHourCount < 5 && healthMonitor.AnalysisQueueLength > 10 && healthMonitor.RunningTime > TimeSpan.FromHours(1))
        {
            errorMessage = "Fewer than 5 analysis jobs have been completed in the last hour, and there are jobs in the queue. This may indicate that the AnalysisJobProcessor background service is not processing jobs. Check the job processor to ensure it's running and processing jobs.";
        }
        else if (healthMonitor.JobsStartedInLastHourCount < 5 && healthMonitor.AnalysisQueueLength > 10 && healthMonitor.RunningTime > TimeSpan.FromHours(1))
        {
            errorMessage = "Fewer than 5 analysis jobs have been started in the last hour, and there are jobs in the queue. This may indicate that the AnalysisJobProcessor background service is not starting jobs. Check the job processor to ensure it's running and starting jobs.";
        }
        
        var healthMonitorJson = new
        {
            healthMonitor.JobProcessorStopped,
            healthMonitor.AnalysisQueueLength,
            healthMonitor.JobsCompletedCount,
            healthMonitor.JobsCompletedInLastHourCount,
            healthMonitor.JobsStartedInLastHourCount,
            ErrorMessage = errorMessage,
        };


        if (!string.IsNullOrEmpty(errorMessage))
        {
            logger.LogError("Health check failed: {healthMonitorJson}", JsonConvert.SerializeObject(healthMonitorJson));
            return StatusCode((int)HttpStatusCode.InternalServerError, errorMessage);
        }
        else
        {
            logger.LogInformation("Health check passed: {healthMonitorJson}", JsonConvert.SerializeObject(healthMonitorJson));
            return Ok(healthMonitorJson);
        }
    }
}