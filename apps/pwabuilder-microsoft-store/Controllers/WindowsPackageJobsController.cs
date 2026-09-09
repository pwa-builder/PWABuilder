using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using PWABuilder.MicrosoftStore.Jobs;
using PWABuilder.MicrosoftStore.Models;

namespace PWABuilder.MicrosoftStore.Controllers;

/// <summary>
/// Optional asynchronous packaging API; legacy MSIX endpoints remain unchanged.
/// </summary>
[ApiController]
[Route("msix")]
public sealed class WindowsPackageJobsController(
    IOptions<WindowsPackageJobOptions> options,
    IOptions<AppSettings> appSettings,
    TimeProvider clock,
    IWindowsPackageJobStore? store = null) : ControllerBase
{
    /// <summary>
    /// Durably accepts a Windows package job without holding the HTTP connection open.
    /// </summary>
    [HttpPost("enqueuePackageJob")]
    [RequestSizeLimit(2 * 1024 * 1024)]
    public async Task<IActionResult> EnqueuePackageJob(WindowsAppPackageOptions packageOptions, CancellationToken token)
    {
        if (!options.Value.Enabled || store is null)
        {
            return Unavailable();
        }

        var errors = packageOptions.GetValidationErrors(appSettings.Value);
        if (errors.Count > 0)
        {
            return BadRequest(new { errors });
        }

        // These paths are generated on the worker, never accepted from remote callers.
        packageOptions.ManifestFilePath = null;
        var now = clock.GetUtcNow();
        var job = new WindowsPackageJob
        {
            Id = Guid.NewGuid().ToString("N"),
            CreatedAt = now,
            ExpiresAt = now.AddHours(options.Value.JobLifetimeHours),
            Ttl = checked((options.Value.JobLifetimeHours + 24) * 3600),
            PlatformId = Request.Headers["platform-identifier"].ToString()
        };
        var input = new WindowsPackageJobInput
        {
            Options = packageOptions,
            Analytics = new PackageJobAnalytics
            {
                PlatformId = job.PlatformId,
                PlatformVersion = Request.Headers["platform-identifier-version"].ToString(),
                CorrelationId = Request.Headers["correlation-id"].ToString() is { Length: > 0 } correlation
                    ? correlation : job.Id,
                Referrer = Request.Query["ref"].ToString()
            }
        };

        // The persisted NeedsDispatch flag is an outbox. A queue outage or API crash
        // after this write cannot silently drop the accepted job.
        await store.CreateAsync(job, input, token);
        Response.Headers.RetryAfter = options.Value.PollSeconds.ToString(System.Globalization.CultureInfo.InvariantCulture);
        Response.Headers.CacheControl = "no-store";
        return Accepted($"{Request.PathBase}/msix/getPackageJob?id={job.Id}", ToStatus(job));
    }

    /// <summary>
    /// Returns safe job status. Random job IDs are bearer capabilities.
    /// </summary>
    [HttpGet("getPackageJob")]
    public async Task<IActionResult> GetPackageJob(string id, CancellationToken token)
    {
        Response.Headers.CacheControl = "no-store";
        if (!options.Value.Enabled || store is null)
        {
            return Unavailable();
        }
        if (!Guid.TryParseExact(id, "N", out _))
        {
            return BadRequest(new { error = "Invalid job ID." });
        }
        var job = await store.GetAsync(id, token);
        if (job is null)
        {
            return NotFound();
        }
        Response.Headers.RetryAfter = options.Value.PollSeconds.ToString(System.Globalization.CultureInfo.InvariantCulture);
        return Ok(ToStatus(job));
    }

    /// <summary>
    /// Streams an unexpired completed ZIP without buffering it in application memory.
    /// </summary>
    [HttpGet("downloadPackageZip")]
    public async Task<IActionResult> DownloadPackageZip(string id, CancellationToken token)
    {
        Response.Headers.CacheControl = "no-store";
        if (!options.Value.Enabled || store is null)
        {
            return Unavailable();
        }
        if (!Guid.TryParseExact(id, "N", out _))
        {
            return BadRequest(new { error = "Invalid job ID." });
        }
        var job = await store.GetAsync(id, token);
        if (job is null)
        {
            return NotFound();
        }
        if (job.ExpiresAt <= clock.GetUtcNow() || job.Status is WindowsPackageJob.Expired)
        {
            return StatusCode(StatusCodes.Status410Gone, new { error = "Job expired." });
        }
        if (job.Status is not WindowsPackageJob.Completed || job.ArtifactName is null)
        {
            return Conflict(ToStatus(job));
        }

        var stream = await store.OpenArtifactAsync(job.ArtifactName, token);
        return File(stream, "application/zip", "windows-package.zip");
    }

    /// <summary>
    /// Maps durable metadata to the public polling contract.
    /// </summary>
    private WindowsPackageJobStatus ToStatus(WindowsPackageJob job)
    {
        var expired = job.ExpiresAt <= clock.GetUtcNow();
        return new WindowsPackageJobStatus(
            job.Id,
            expired ? WindowsPackageJob.Expired : job.Status,
            job.CreatedAt,
            job.ExpiresAt,
            job.FinishedAt,
            job.Attempts,
            expired ? "Job expired." : job.Error,
            !expired && job.Status is WindowsPackageJob.Completed
                ? $"{Request.PathBase}/msix/downloadPackageZip?id={job.Id}" : null);
    }

    /// <summary>
    /// Reports the disabled feature without constructing storage dependencies.
    /// </summary>
    private ObjectResult Unavailable() =>
        StatusCode(StatusCodes.Status503ServiceUnavailable, new { error = "Queued Windows packaging is not enabled." });
}
