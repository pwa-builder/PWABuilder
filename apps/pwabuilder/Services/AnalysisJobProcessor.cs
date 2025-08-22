
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;
using PWABuilder.Models;
using PWABuilder.Validations.Models;
using PWABuilder.Validations.Services;

namespace PWABuilder.Services;

/// <summary>
/// Background service that periodically checks for new AnalysisJob objects in the Azure queue and processes them.
/// </summary>
public class AnalysisJobProcessor : IHostedService
{
    private const int MaxRetryCount = 3;
    private readonly IAnalysisJobQueue queue;
    private readonly AnalysisDb db;
    private CancellationTokenSource? abortToken;
    private Task? jobProcessorTask;
    private readonly ManifestDetector manifestDetector;
    private readonly ManifestAnalyzer manifestAnalyzer;
    private readonly ServiceWorkerDetector serviceWorkerDetector;
    private readonly IServiceWorkerAnalyzer serviceWorkerAnalyzer;
    private readonly ILighthouseService lighthouse;
    private readonly IImageValidationService imageValidator;
    private readonly ILogger<AnalysisJobProcessor> logger;

    public AnalysisJobProcessor(
        IAnalysisJobQueue queue, 
        AnalysisDb db, 
        ManifestDetector manifestDetector,
        ManifestAnalyzer manifestAnalyzer,
        ServiceWorkerDetector serviceWorkerDetector,
        IServiceWorkerAnalyzer serviceWorkerAnalyzer,
        ILighthouseService lighthouse, 
        IImageValidationService imageValidator,
        ILogger<AnalysisJobProcessor> logger)
    {
        this.queue = queue;
        this.db = db;
        this.lighthouse = lighthouse;
        this.manifestDetector = manifestDetector;
        this.manifestAnalyzer = manifestAnalyzer;
        this.serviceWorkerDetector = serviceWorkerDetector;
        this.serviceWorkerAnalyzer = serviceWorkerAnalyzer;
        this.imageValidator = imageValidator;
        this.logger = logger;
    }

    public Task StartAsync(CancellationToken cancellationToken)
    {
        this.abortToken = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
        this.jobProcessorTask = Task.Factory.StartNew(() => ListenForJobs(abortToken.Token), abortToken.Token, TaskCreationOptions.LongRunning, TaskScheduler.Default);
        return Task.CompletedTask;
    }

    public async Task StopAsync(CancellationToken stoppingToken)
    {
        if (abortToken != null)
        {
            await abortToken.CancelAsync();
        }
        if (jobProcessorTask != null)
        {
            await jobProcessorTask;
        }
    }

    private async Task ListenForJobs(CancellationToken cancelToken)
    {
        // In a loop, check for new AnalysisJob objects in the Azure queue.
        while (!cancelToken.IsCancellationRequested)
        {
            var job = await TryDequeueAsync(cancelToken);
            if (job != null)
            {
                await TryProcessJobAsync(job, cancelToken);
            }
            else
            {
                // No jobs? Wait a few seconds before checking again.
                await Task.Delay(TimeSpan.FromSeconds(3), cancelToken);
            }
        }
    }

    private async Task<AnalysisJob?> TryDequeueAsync(CancellationToken cancelToken)
    {
        try
        {
            return await queue.DequeueAsync(cancelToken);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error dequeue analysis job from the Azure Queue.");
            return null;
        }
    }

    private async Task TryProcessJobAsync(AnalysisJob job, CancellationToken cancelToken)
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

            // Create a new AnalysisLogger that will log message both to the Analysis.Logs object and to this service's logger.
            var analysisLogger = new AnalysisLogger(analysis, this.logger);

            // Mark the analysis as processing.
            analysis.Status = AnalysisStatus.Processing;
            await db.SaveAsync(analysis);

            // Kick off all jobs simultaneously so the end result is faster.
            var lighthouseAnalysisTask = TryRunLighthouseAudit(job, analysis, analysisLogger, cancelToken);
            var serviceWorkerDetectionTask = serviceWorkerDetector.TryDetectAsync(job.Url, analysisLogger, cancelToken);
            var serviceWorkerAnalysisTask = serviceWorkerDetectionTask.ContinueWith(d => TryAnalyzeServiceWorker(d.Result, job, cancelToken)).Unwrap();
            var manifestDetectionTask = manifestDetector.TryDetectAsync(job.Url, analysisLogger, cancelToken);
            var manifestAnalysisTask = manifestDetectionTask.ContinueWith(m => manifestAnalyzer.TryRunManifestChecksAsync(analysis, analysisLogger, cancelToken)).Unwrap();

            // Step 1: find the manifest.
            analysis.WebManifest = await manifestDetectionTask;
            await db.SaveAsync(analysis);

            // Step 2: analyze the manifest for validity and capabilities.
            
            await db.SaveAsync(analysis);

            // Step 2: find the service worker info.
            analysis.ServiceWorker = await serviceWorkerDetectionTask;
            await db.SaveAsync(analysis);

            // Step 3: analyze the service worker to determine features like push notifications, background sync, etc.
            if (analysis.ServiceWorker != null)
            {
                analysis.ServiceWorker.Validations = await serviceWorkerAnalysisTask;
                await db.SaveAsync(analysis);
            }

            // Step 5, if we have a manifest or service worker, run Lighthouse PWA analysis.
            if (analysis.WebManifest != null || analysis.ServiceWorker != null)
            {
                analysis.LighthouseReport = await lighthouseAnalysisTask;
                await db.SaveAsync(analysis);
            }
            else
            {
                // We don't have a manifest or service worker. Skip Lighthouse analysis and log a message.
                analysisLogger.LogInformation("No manifest or service worker detected for {url}. Skipping Lighthouse analysis.", job.Url);
            }

            // Step 6, if we have a Lighthouse report and a ServiceWorker, add an Offline check.
            if (analysis.LighthouseReport != null && analysis.ServiceWorker != null)
            {
                analysis.ServiceWorker.Validations.Add(analysis.LighthouseReport.GetOfflineTestResult());
                await db.SaveAsync(analysis);
            }

            // All done! Mark the analysis as completed.
            analysis.Status = AnalysisStatus.Completed;
            analysis.Duration = DateTimeOffset.UtcNow.Subtract(analysis.CreatedAt);
            analysisLogger.FlushLogs();
            await db.SaveAsync(analysis);
        }
        catch (Exception error)
        {
            await RetryJobOrFail(job, error);
        }
    }

    private async Task<LighthouseReport?> TryRunLighthouseAudit(AnalysisJob job, Analysis analysis, AnalysisLogger logger, CancellationToken cancelToken)
    {
        try
        {
            return await lighthouse.RunAuditAsync(job.Url, BrowserFormFactor.Desktop);
        }
        catch (Exception error)
        {
            logger.LogError(error, "Error running Lighthouse audit for {url}", job.Url);
            return null;
        }
    }

    private async Task<List<TestResult>> TryAnalyzeServiceWorker(ServiceWorkerDetection? detection, AnalysisJob job, CancellationToken cancelToken)
    {
        if (detection == null)
        {
            return [];
        }

        return await serviceWorkerDetector.TryAnalyze(detection.Url, job.Url, logger, cancelToken);
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
                await db.SaveAsync(analysis);
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