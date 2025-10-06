using System.Data.Common;
using Microsoft.AspNetCore.Mvc;
using PWABuilder.Models;
using PWABuilder.Services;

namespace PWABuilder.IOS.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GooglePlayPackagesController
{
    private readonly ITelemetryService analyticsService;
    private readonly ILogger<GooglePlayPackagesController> logger;
    private readonly IPWABuilderDatabase db;

    private const string googlePlayPackageQueueKey = "googleplaypackagejobs";

    public GooglePlayPackagesController(
        ITelemetryService analyticsService,
        ILogger<GooglePlayPackagesController> logger,
        IPWABuilderDatabase db
    )
    {
        this.analyticsService = analyticsService;
        this.logger = logger;
        this.db = db;
    }

    /// <summary>
    /// Enqueues a GooglePlayPackageJob to be processed by the Google Play packaging service.
    /// </summary>
    /// <returns>The ID of the enqueued job.</returns>
    [HttpPost("enqueue")]
    public async Task<string> Enqueue(GooglePlayPackageJob job)
    {
        try
        {
            // Save the job to the database.
            var analysis = await db.GetByIdAsync<Analysis>(job.AnalysisId);
            if (analysis == null)
            {
                throw new ArgumentException($"No analysis found with ID {job.AnalysisId}");
            }

            job.Id = GooglePlayPackageJob.GetId(analysis.Url);
            await db.SaveAsync(job.Id, job);

            // Enqueue it in the jobs list for processing by the Google Play packaging service.
            var jobJson = System.Text.Json.JsonSerializer.Serialize(job);
            await db.EnqueueAsync(googlePlayPackageQueueKey, jobJson);

            return job.Id;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error enqueuing Google Play package job.");
            throw;
        }
    }
}