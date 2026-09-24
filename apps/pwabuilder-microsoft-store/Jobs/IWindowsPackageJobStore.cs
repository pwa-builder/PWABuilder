using System.Collections.Generic;
using System.IO;
using System.Threading;
using System.Threading.Tasks;

namespace PWABuilder.MicrosoftStore.Jobs;

/// <summary>
/// Durable job metadata and private input/output storage.
/// </summary>
public interface IWindowsPackageJobStore
{
    /// <summary>
    /// Persists inputs before creating the dispatchable job document.
    /// </summary>
    Task CreateAsync(WindowsPackageJob job, WindowsPackageJobInput input, CancellationToken token);

    /// <summary>
    /// Point-reads a job with its current ETag.
    /// </summary>
    Task<WindowsPackageJob?> GetAsync(string id, CancellationToken token);

    /// <summary>
    /// Reads a bounded batch of pending outbox records.
    /// </summary>
    Task<IReadOnlyList<WindowsPackageJob>> GetPendingDispatchAsync(CancellationToken token);

    /// <summary>
    /// Replaces a job only if its ETag still matches; null means ownership changed.
    /// </summary>
    Task<WindowsPackageJob?> TryReplaceAsync(WindowsPackageJob job, CancellationToken token);

    /// <summary>
    /// Reads private build inputs.
    /// </summary>
    Task<WindowsPackageJobInput> ReadInputAsync(string id, CancellationToken token);

    /// <summary>
    /// Uploads a build output to an attempt-specific location.
    /// </summary>
    Task<string> UploadArtifactAsync(string id, string attemptId, string path, CancellationToken token);

    /// <summary>
    /// Opens a completed artifact for streaming.
    /// </summary>
    Task<Stream> OpenArtifactAsync(string name, CancellationToken token);
}
