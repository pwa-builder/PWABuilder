using PWABuilder.Models;

namespace PWABuilder.Services;

/// <summary>
/// Background service that periodically checks for new AnalysisJob objects in the Azure queue and processes them.
/// </summary>
public class AnalysisJobProcessor : IHostedService
{
    private const int MaxRetryCount = 3;
    private readonly IAnalysisJobQueue queue;
    private readonly IPWABuilderDatabase db;
    private CancellationTokenSource? abortToken;
    private Task? jobProcessorTask;
    private readonly ManifestDetector manifestDetector;
    private readonly ManifestAnalyzer manifestAnalyzer;
    private readonly ServiceWorkerDetector serviceWorkerDetector;
    private readonly IServiceWorkerAnalyzer serviceWorkerAnalyzer;
    private readonly ILighthouseService lighthouse;
    private readonly GeneralWebAppCapabilityDetector generalWebAppCapabilityDetector;
    private readonly ILogger<AnalysisJobProcessor> logger;

    public AnalysisJobProcessor(
        IAnalysisJobQueue queue,
        IPWABuilderDatabase db,
        ManifestDetector manifestDetector,
        ManifestAnalyzer manifestAnalyzer,
        ServiceWorkerDetector serviceWorkerDetector,
        IServiceWorkerAnalyzer serviceWorkerAnalyzer,
        GeneralWebAppCapabilityDetector generalWebAppCapabilityDetector,
        ILighthouseService lighthouse,
        ILogger<AnalysisJobProcessor> logger)
    {
        this.queue = queue;
        this.db = db;
        this.lighthouse = lighthouse;
        this.manifestDetector = manifestDetector;
        this.manifestAnalyzer = manifestAnalyzer;
        this.serviceWorkerDetector = serviceWorkerDetector;
        this.serviceWorkerAnalyzer = serviceWorkerAnalyzer;
        this.generalWebAppCapabilityDetector = generalWebAppCapabilityDetector;
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
            await ProcessJobAsync(job, cancelToken);
        }
        catch (Exception error)
        {
            await RetryJobOrFail(job, error);
        }
    }

    private async Task ProcessJobAsync(AnalysisJob job, CancellationToken cancelToken)
    {
        // Grab the actual analysis object from the database.
        var analysis = await db.GetByIdAsync<Analysis>(job.AnalysisId);
        if (analysis == null)
        {
            await RetryJobOrFail(job, new Exception($"Analysis with ID {job.AnalysisId} was not found."));
            return;
        }

        // Create a new AnalysisLogger that will log message both to the Analysis.Logs object and to this service's logger.
        var analysisLogger = new AnalysisLogger(analysis, this.logger);

        // Mark the analysis as processing.
        analysis.Status = AnalysisStatus.Processing;
        await db.SaveAsync(analysis.Id, analysis);

        // Create our own cancellation token source so that we can manually cancel this.
        // Link it to the parent cancellation token to monitor that as well.
        var cancelTokenSrc = CancellationTokenSource.CreateLinkedTokenSource(cancelToken);

        // Kick off the independent jobs simultaneously so that our analysis completes faster.
        var generalCapDetectionTask = generalWebAppCapabilityDetector.TryDetectAsync(job.Url, analysisLogger, cancelTokenSrc.Token);
        var serviceWorkerDetectionTask = serviceWorkerDetector.TryDetectAsync(job.Url, analysisLogger, cancelTokenSrc.Token);
        var serviceWorkerAnalysisTask = serviceWorkerDetectionTask.ContinueWith(t => serviceWorkerAnalyzer.TryAnalyzeServiceWorkerAsync(t.Result, job.Url, analysisLogger, cancelTokenSrc.Token), TaskContinuationOptions.OnlyOnRanToCompletion).Unwrap(); // This will update analysis.Capabilities.
        var manifestDetectionTask = manifestDetector.TryDetectAsync(job.Url, analysisLogger, cancelTokenSrc.Token);
        var manifestAnalysisTask = manifestDetectionTask.ContinueWith(t => manifestAnalyzer.TryAnalyzeManifestAsync(t.Result, logger, cancelTokenSrc.Token), TaskContinuationOptions.OnlyOnRanToCompletion).Unwrap();

        // Step 1: run the general capabilities, such as whether the URL serves HTML. If not, we fail fast.
        var generalCapabilities = await generalCapDetectionTask;
        analysis.ProcessCapabilities(generalCapabilities);
        var servesHtmlStatus = FailIfNotServedHtml(analysis, cancelTokenSrc);
        await db.SaveAsync(analysis.Id, analysis);
        if (servesHtmlStatus == PwaCapabilityCheckStatus.Failed)
        {
            logger.LogWarning("Completed analysis {id} for {url} in {duration} seconds. The URL does not appear to serve HTML content, so no further analysis was performed.", analysis.Id, job.Url, analysis.Duration?.TotalSeconds);
            return;
        }

        // Step 2: find the manifest.
        analysis.WebManifest = await manifestDetectionTask;
        await db.SaveAsync(analysis.Id, analysis);

        // Step 3: analyze the manifest for validity and capabilities.
        var manifestCapabilities = await manifestAnalysisTask;
        analysis.ProcessCapabilities(manifestCapabilities);
        await db.SaveAsync(analysis.Id, analysis);

        // Step 4: find the service worker.
        analysis.ServiceWorker = await serviceWorkerDetectionTask;
        await db.SaveAsync(analysis.Id, analysis);

        // Step 5: analyze the service worker to determine capabilities like push notifications, background sync, etc.
        var swCapabilities = await serviceWorkerAnalysisTask;
        analysis.ProcessCapabilities(swCapabilities);
        await db.SaveAsync(analysis.Id, analysis);

        // Step 6, check for HTTPS.
        var httpsCapabilities = TryCheckHttpsCapabilities(job.Url, analysis.WebManifest, analysis.ServiceWorker);
        analysis.ProcessCapabilities(httpsCapabilities);
        await db.SaveAsync(analysis.Id, analysis);

        // All done! Mark the analysis as completed.
        analysis.Status = AnalysisStatus.Completed;
        analysis.Duration = DateTimeOffset.UtcNow.Subtract(analysis.CreatedAt);
        analysisLogger.FlushLogs();
        logger.LogInformation("Completed analysis {id} for {url} in {duration} seconds. Manifest result {manifest}, Service worker result {sw}, score {score}", analysis.Id, job.Url, analysis.Duration?.TotalSeconds, analysis.WebManifest?.Url, analysis.ServiceWorker?.Url, analysis.Capabilities.Count(c => c.Status == PwaCapabilityCheckStatus.Passed));
        await db.SaveAsync(analysis.Id, analysis);
    }

    /// <summary>
    /// Checks if the "URL serves HTML" check failed. If so, the analysis is marked as failed, the cancellation token is triggered, and any remaining tests are skipped.
    /// </summary>
    /// <param name="analysis">The analysis.</param>
    /// <param name="cancelTokenSrc">The cancellation token source.</param>
    /// <returns>The status of the "URL serves HTML" check.</returns>
    private static PwaCapabilityCheckStatus FailIfNotServedHtml(Analysis analysis, CancellationTokenSource cancelTokenSrc)
    {
        var servedHtmlCapability = analysis.Capabilities.First(c => c.Id == PwaCapabilityId.ServesHtml);
        if (servedHtmlCapability.Status == PwaCapabilityCheckStatus.Failed)
        {
            cancelTokenSrc.Cancel();
            analysis.Status = AnalysisStatus.Completed;
            analysis.Error = "The provided URL does not appear to serve HTML content.";
            analysis.Capabilities
                .Where(capability => capability.Status == PwaCapabilityCheckStatus.InProgress)
                .ToList()
                .ForEach(capability => capability.Status = PwaCapabilityCheckStatus.Skipped);
        }

        return servedHtmlCapability.Status;
    }

    // private async Task<LighthouseReport?> TryRunLighthouseAudit(AnalysisJob job, AnalysisLogger logger, CancellationToken cancelToken)
    // {
    //     try
    //     {
    //         return await lighthouse.RunAuditAsync(job.Url, BrowserFormFactor.Desktop, logger, cancelToken);
    //     }
    //     catch (Exception error)
    //     {
    //         logger.LogError(error, "Error running Lighthouse audit for {url}", job.Url);
    //         return null;
    //     }
    // }

    private List<PwaCapability> TryCheckHttpsCapabilities(Uri url, ManifestDetection? manifestDetection, ServiceWorkerDetection? swDetection)
    {
        var httpsCapabilities = PwaCapability.CreateHttpsCapabilities(); // There's only one HTTPS capability right now: has HTTPS
        try
        {
            var hasHttps = httpsCapabilities.First(c => c.Id == PwaCapabilityId.HasHttps);
            if (url.Scheme != Uri.UriSchemeHttps)
            {
                // Mark as failed.
                hasHttps.Status = PwaCapabilityCheckStatus.Failed;
            }

            // If we have a manifest, check if it has any HTTP URLs.
            if (manifestDetection?.Url != null && manifestDetection.Url.Scheme != Uri.UriSchemeHttps)
            {
                hasHttps.Status = PwaCapabilityCheckStatus.Failed;
            }

            // If we have a service worker, check if it was served over HTTPS.
            if (swDetection?.Url != null && swDetection.Url.Scheme != Uri.UriSchemeHttps)
            {
                hasHttps.Status = PwaCapabilityCheckStatus.Failed;
            }

            hasHttps.Status = PwaCapabilityCheckStatus.Passed;
            return httpsCapabilities;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error detecting HTTPS capabilities for {url}", url);
            httpsCapabilities.ForEach(c => c.Status = PwaCapabilityCheckStatus.Skipped);
            return httpsCapabilities;
        }
    }

    private async Task RetryJobOrFail(AnalysisJob job, Exception error)
    {
        if (job.RetryCount < MaxRetryCount)
        {
            logger.LogWarning(error, "Error processing AnalysisJob {id} for {url} during attempt {number} of {max}. Retrying...", job.Id, job.AnalysisId, job.RetryCount + 1, MaxRetryCount);
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
            var analysis = await db.GetByIdAsync<Analysis>(analysisId);
            if (analysis != null)
            {
                analysis.Status = AnalysisStatus.Failed;
                analysis.Error = error.ToString();
                analysis.Capabilities
                    .Where(capability => capability.Status == PwaCapabilityCheckStatus.InProgress)
                    .ToList()
                    .ForEach(capability => capability.Status = PwaCapabilityCheckStatus.Skipped);
                await db.SaveAsync(analysis.Id, analysis);
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