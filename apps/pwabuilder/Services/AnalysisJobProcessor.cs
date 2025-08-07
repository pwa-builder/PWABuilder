
using Microsoft.Extensions.Options;
using PWABuilder.Models;

namespace PWABuilder.Services;

/// <summary>
/// Background service that periodically checks for new AnalysisJob objects in the Azure queue and processes them.
/// </summary>
public class AnalysisJobProcessor : IHostedService
{
    private const int MaxRetryCount = 3;
    private readonly AnalysisJobQueue queue;
    private readonly AnalysisDb db;
    private readonly CancellationTokenSource abortToken = new();
    private readonly ILighthouseService lighthouse;
    private readonly ILogger<AnalysisJobProcessor> logger;

    public AnalysisJobProcessor(AnalysisJobQueue queue, AnalysisDb db, ILighthouseService lighthouse, ILogger<AnalysisJobProcessor> logger)
    {
        this.queue = queue;
        this.db = db;
        this.lighthouse = lighthouse;
        this.logger = logger;
    }

    public async Task StartAsync(CancellationToken cancellationToken)
    {
        // In a loop, check for new AnalysisJob objects in the Azure queue.
        while (!abortToken.IsCancellationRequested)
        {
            var job = await TryDequeueAsync();
            if (job != null)
            {
                await TryProcessJobAsync(job);
            }
            else
            {
                // No jobs? Wait a few seconds before checking again.
                await Task.Delay(TimeSpan.FromSeconds(5), abortToken.Token);
            }
        }
    }

    public Task StopAsync(CancellationToken stoppingToken)
    {
        return abortToken.CancelAsync();
    }

    private async Task<AnalysisJob?> TryDequeueAsync()
    {
        try
        {
            return await queue.DequeueAsync(abortToken.Token);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error dequeue analysis job from the Azure Queue.");
            return null;
        }
    }

    private async Task TryProcessJobAsync(AnalysisJob job)
    {
        try
        {
            // Grab the actual analysis object from the database.
            var analysis = await db.GetByIdAsync(job.AnalysisId);
            if (analysis == null)
            {
                await RetryJobOrFail(job, new Exception($"Analysis with ID {job.AnalysisId} was not found."));
                return;
            }

            // Mark the analysis as processing.
            analysis.Status = AnalysisStatus.Processing;
            await db.Save(analysis);

            // Run the Lighthouse 
            var lighthouseAudit = await lighthouse.RunAuditAsync(job.Url.ToString(), true);
            analysis.Status = AnalysisStatus.Completed;
            await db.Save(analysis);
        }
        catch (Exception error)
        {
            await RetryJobOrFail(job, error);
        }
    }

    private async Task RetryJobOrFail(AnalysisJob job, Exception error)
    {
        if (job.RetryCount < MaxRetryCount)
        {
            logger.LogWarning(error, "Error processing AnalysisJob {id} during attempt {number} of {max}. Retrying...", job.Id, job.RetryCount + 1, MaxRetryCount);
            job.RetryCount++;
            await queue.EnqueueAsync(job);
            logger.LogInformation("Re-enqueued AnalysisJob with ID {JobId} for retry.", job.Id);
        }
        else
        {
            logger.LogError("AnalysisJob with ID {JobId} has exceeded maximum retry attempts. Job will not be re-enqueued and the analysis will be marked as failed.", job.Id);

            // Try to grab the analysis object. 
            await this.MarkAnalysisAsFailedAsync(job.AnalysisId, error);
        }
    }

    private async Task MarkAnalysisAsFailedAsync(string analysisId, Exception error)
    {
        try
        {
            var analysis = await db.GetByIdAsync(analysisId);
            if (analysis != null)
            {
                analysis.Status = AnalysisStatus.Failed;
                analysis.Error = error.ToString();
                await db.Save(analysis);
            }
            else
            {
                logger.LogWarning("Attempted to mark analysis as failed, but couldn't find the analysis with ID {id}.", analysisId);
            }
        }
        catch (Exception markAsFailedError)
        {
            logger.LogError(markAsFailedError, "Error marking analysis {id} as failed.", analysisId);
        }
    }
}