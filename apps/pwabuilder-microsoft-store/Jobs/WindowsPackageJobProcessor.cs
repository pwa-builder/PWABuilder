using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace PWABuilder.MicrosoftStore.Jobs;

/// <summary>
/// Crash-recoverable, at-least-once Windows packaging job lifecycle.
/// </summary>
public sealed class WindowsPackageJobProcessor(
    IWindowsPackageJobStore store,
    IWindowsPackageJobQueue queue,
    IWindowsPackageJobBuilder builder,
    IOptions<WindowsPackageJobOptions> options,
    TimeProvider clock,
    ILogger<WindowsPackageJobProcessor> logger)
{
    private readonly WindowsPackageJobOptions settings = options.Value;

    /// <summary>
    /// Dispatches persisted outbox records. A crash between send and clear can duplicate
    /// delivery, but cannot lose an accepted job.
    /// </summary>
    public async Task DispatchAsync(CancellationToken token)
    {
        foreach (var job in await store.GetPendingDispatchAsync(token))
        {
            await queue.SendAsync(job.Id, token);
            await store.TryReplaceAsync(job with { NeedsDispatch = false }, token);
        }
    }

    /// <summary>
    /// Processes one delivery, acknowledging only durable terminal outcomes.
    /// </summary>
    public async Task ProcessAsync(PackageJobMessage message, CancellationToken stoppingToken)
    {
        if (!Guid.TryParseExact(message.JobId, "N", out _))
        {
            await PoisonAndDeleteAsync(message, "Invalid job reference.", stoppingToken);
            return;
        }

        var job = await store.GetAsync(message.JobId, stoppingToken);
        if (job is null)
        {
            if (message.DequeueCount >= settings.MaxAttempts)
            {
                await PoisonAndDeleteAsync(message, "Job record missing or expired.", stoppingToken);
            }
            return;
        }
        if (job.Status is WindowsPackageJob.Completed or WindowsPackageJob.Expired)
        {
            await queue.DeleteAsync(message, stoppingToken);
            return;
        }
        if (job.Status is WindowsPackageJob.Failed)
        {
            await PoisonAndDeleteAsync(message, job.Error ?? "Job failed.", stoppingToken);
            return;
        }

        var now = clock.GetUtcNow();
        if (job.LeaseExpiresAt > now || job.RetryAfter > now)
        {
            // Do not delete an overlapping delivery: it may have replaced the original
            // receipt after a visibility timeout. Leave it available for recovery.
            return;
        }

        var expired = job.ExpiresAt <= now;
        var exhausted = job.Attempts >= settings.MaxAttempts;
        var claimed = await store.TryReplaceAsync(job with
        {
            Status = WindowsPackageJob.InProgress,
            Attempts = job.Attempts + (expired || exhausted ? 0 : 1),
            NeedsDispatch = false,
            RetryAfter = null,
            LeaseExpiresAt = now.AddSeconds(settings.VisibilitySeconds)
        }, stoppingToken);
        if (claimed is null)
        {
            return;
        }

        using var lease = new PackageJobLease(store, queue, claimed, message, settings, clock);
        using var attempt = CancellationTokenSource.CreateLinkedTokenSource(stoppingToken);
        using var stopRenewal = CancellationTokenSource.CreateLinkedTokenSource(stoppingToken);
        var remaining = claimed.ExpiresAt - now;
        var deadline = TimeSpan.FromMinutes(settings.AttemptTimeoutMinutes);
        attempt.CancelAfter(remaining <= TimeSpan.Zero ? TimeSpan.Zero : remaining < deadline ? remaining : deadline);
        var renewalTask = lease.RenewUntilStoppedAsync(attempt, stopRenewal.Token);

        try
        {
            if (expired || exhausted)
            {
                var terminal = await lease.FinishAsync(j => j with
                {
                    Status = expired ? WindowsPackageJob.Expired : WindowsPackageJob.Failed,
                    Error = expired ? "Job expired." : "Maximum build attempts exceeded.",
                    FinishedAt = clock.GetUtcNow()
                }, stoppingToken);
                await AcknowledgeTerminalAsync(terminal, lease.Message, stoppingToken);
                return;
            }

            logger.LogInformation("Starting Windows job {JobId}, attempt {Attempt}, platform {PlatformId}",
                claimed.Id, claimed.Attempts, claimed.PlatformId);
            string artifact;
            try
            {
                var input = await store.ReadInputAsync(claimed.Id, attempt.Token);
                var path = await builder.BuildAsync(input, attempt.Token);
                artifact = await store.UploadArtifactAsync(claimed.Id, Guid.NewGuid().ToString("N"), path, attempt.Token);
                attempt.Token.ThrowIfCancellationRequested();
            }
            catch (Exception error) when (!stoppingToken.IsCancellationRequested && !lease.Lost)
            {
                logger.LogError(error, "Windows job {JobId} attempt {Attempt} failed", claimed.Id, claimed.Attempts);
                await RecordFailureAsync(lease, stoppingToken);
                return;
            }

            var completed = await lease.FinishAsync(j => j with
            {
                Status = WindowsPackageJob.Completed,
                ArtifactName = artifact,
                Error = null,
                FinishedAt = clock.GetUtcNow()
            }, attempt.Token);
            await AcknowledgeTerminalAsync(completed, lease.Message, stoppingToken);
            logger.LogInformation("Completed Windows job {JobId}, platform {PlatformId}", claimed.Id, claimed.PlatformId);
        }
        catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested || lease.Lost)
        {
            logger.LogInformation("Leaving Windows job {JobId} unacknowledged for recovery", claimed.Id);
        }
        finally
        {
            await stopRenewal.CancelAsync();
            // Renewal exceptions are observed, not swallowed; the host logs and retries.
            await renewalTask;
        }
    }

    /// <summary>
    /// Records retries before allowing the unacknowledged message to reappear.
    /// </summary>
    private async Task RecordFailureAsync(PackageJobLease lease, CancellationToken token)
    {
        var updated = await lease.FinishAsync(j =>
        {
            var expired = j.ExpiresAt <= clock.GetUtcNow();
            var final = expired || j.Attempts >= settings.MaxAttempts;
            var delay = TimeSpan.FromSeconds(Math.Min(600, settings.RetryDelaySeconds * Math.Pow(2, j.Attempts - 1)));
            return j with
            {
                Status = expired ? WindowsPackageJob.Expired : final ? WindowsPackageJob.Failed : WindowsPackageJob.Queued,
                Error = expired ? "Job expired." : final ? "Packaging failed after the maximum number of attempts." : "Build attempt failed; retry pending.",
                FinishedAt = final ? clock.GetUtcNow() : null,
                RetryAfter = final ? null : clock.GetUtcNow().Add(delay)
            };
        }, token);
        if (updated.Status is WindowsPackageJob.Queued)
        {
            var delay = updated.RetryAfter!.Value - clock.GetUtcNow();
            await queue.RenewAsync(lease.Message, delay > TimeSpan.Zero ? delay : TimeSpan.FromSeconds(1), token);
        }
        else
        {
            await AcknowledgeTerminalAsync(updated, lease.Message, token);
        }
    }

    /// <summary>
    /// Acknowledges only after terminal status (and any poison entry) is durable.
    /// </summary>
    private Task AcknowledgeTerminalAsync(WindowsPackageJob job, PackageJobMessage message, CancellationToken token) =>
        job.Status is WindowsPackageJob.Failed
            ? PoisonAndDeleteAsync(message, job.Error ?? "Job failed.", token)
            : queue.DeleteAsync(message, token);

    /// <summary>
    /// Poison delivery can itself duplicate after a crash; it is diagnostic, not executable work.
    /// </summary>
    private async Task PoisonAndDeleteAsync(PackageJobMessage message, string reason, CancellationToken token)
    {
        await queue.PoisonAsync(message, reason, token);
        await queue.DeleteAsync(message, token);
    }
}
