using System.Net;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using PWABuilder.Services;

namespace PWABuilder.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    private readonly ILogger<HealthController> logger;

    public HealthController(ILogger<HealthController> logger)
    {
        this.logger = logger;
    }

    [HttpGet("check")]
    public async Task<IActionResult> Check([FromServices] AnalysisJobProcessorHealthMonitor healthMonitor)
    {
        var googlePlayPackageQueueLength = await healthMonitor.GetGooglePlayPackageQueueLength();
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

        // We don't have error message for google play package length, because we have Azure health monitor on this endpoint
        // monitoring this endpoint and restarting PWBuilder instance on errors. We don't want PWABuilder instance to restart when Google PLay package queue is too long; that's a separate web service.

        var healthMonitorJson = new
        {
            healthMonitor.JobProcessorStopped,
            healthMonitor.AnalysisQueueLength,
            healthMonitor.JobsCompletedCount,
            healthMonitor.JobsCompletedInLastHourCount,
            healthMonitor.JobsStartedInLastHourCount,
            healthMonitor.RunningTime,
            GooglePlayPackageQueueLength = googlePlayPackageQueueLength,
            ErrorMessage = errorMessage,
        };


        if (!string.IsNullOrEmpty(errorMessage))
        {
            logger.LogError("Health check failed: {healthMonitorJson}", JsonSerializer.Serialize(healthMonitorJson));
            return StatusCode((int)HttpStatusCode.InternalServerError, errorMessage);
        }
        else
        {
            logger.LogInformation("Health check passed: {healthMonitorJson}", JsonSerializer.Serialize(healthMonitorJson));
            return Ok(healthMonitorJson);
        }
    }
}