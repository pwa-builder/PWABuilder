using System;

namespace PWABuilder.MicrosoftStore.Jobs;

/// <summary>Public polling response; excludes inputs, internal errors, and storage/lease details.</summary>
/// <param name="Id">Job capability ID.</param>
/// <param name="Status">Queued, InProgress, Completed, Failed, or Expired.</param>
/// <param name="CreatedAt">Submission time.</param>
/// <param name="ExpiresAt">Processing/download deadline.</param>
/// <param name="FinishedAt">Terminal transition time.</param>
/// <param name="Attempts">Number of attempts started.</param>
/// <param name="Error">Safe client-facing error summary.</param>
/// <param name="DownloadUrl">Download endpoint, only when completed and unexpired.</param>
public sealed record WindowsPackageJobStatus(
    string Id,
    string Status,
    DateTimeOffset CreatedAt,
    DateTimeOffset ExpiresAt,
    DateTimeOffset? FinishedAt,
    int Attempts,
    string? Error,
    string? DownloadUrl);
