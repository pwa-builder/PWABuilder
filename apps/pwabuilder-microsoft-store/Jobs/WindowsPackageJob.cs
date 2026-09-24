using System;
using Newtonsoft.Json;

namespace PWABuilder.MicrosoftStore.Jobs;

/// <summary>
/// Durable job state. Conditional Cosmos writes fence stale workers.
/// </summary>
public sealed record WindowsPackageJob
{
    /// <summary>
    /// Waiting for processing.
    /// </summary>
    public const string Queued = "Queued";

    /// <summary>
    /// Owned by a worker.
    /// </summary>
    public const string InProgress = "InProgress";

    /// <summary>
    /// Artifact and final state have been persisted.
    /// </summary>
    public const string Completed = "Completed";

    /// <summary>
    /// No more attempts will be made.
    /// </summary>
    public const string Failed = "Failed";

    /// <summary>
    /// The job's processing/download lifetime has elapsed.
    /// </summary>
    public const string Expired = "Expired";

    /// <summary>
    /// Random, unguessable job ID, also used as the partition key.
    /// </summary>
    [JsonProperty("id")]
    public required string Id { get; init; }

    /// <summary>
    /// Current state.
    /// </summary>
    public string Status { get; init; } = Queued;

    /// <summary>
    /// When the request was durably accepted.
    /// </summary>
    public DateTimeOffset CreatedAt { get; init; }

    /// <summary>
    /// Processing and downloads are disallowed after this time.
    /// </summary>
    public DateTimeOffset ExpiresAt { get; init; }

    /// <summary>
    /// When the last terminal transition occurred.
    /// </summary>
    public DateTimeOffset? FinishedAt { get; init; }

    /// <summary>
    /// Attempts already started, including interrupted attempts.
    /// </summary>
    public int Attempts { get; init; }

    /// <summary>
    /// Outbox flag, cleared only after successful queue submission.
    /// </summary>
    public bool NeedsDispatch { get; init; } = true;

    /// <summary>
    /// Earliest time a queued retry can start.
    /// </summary>
    public DateTimeOffset? RetryAfter { get; init; }

    /// <summary>
    /// Exclusive ownership expires unless renewed by the worker.
    /// </summary>
    public DateTimeOffset? LeaseExpiresAt { get; init; }

    /// <summary>
    /// Attempt-specific artifact path, set only on completion.
    /// </summary>
    public string? ArtifactName { get; init; }

    /// <summary>
    /// Safe client-facing failure description; diagnostics belong in logs.
    /// </summary>
    public string? Error { get; init; }

    /// <summary>
    /// Self-reported caller name for operational reporting, not authorization.
    /// </summary>
    public string? PlatformId { get; init; }

    /// <summary>
    /// Cosmos time to live. Provision the container with TTL enabled.
    /// </summary>
    [JsonProperty("ttl")]
    public int Ttl { get; init; }

    /// <summary>
    /// Cosmos revision, not included in persisted request bodies.
    /// </summary>
    [JsonIgnore]
    [System.Text.Json.Serialization.JsonIgnore]
    public string ETag { get; init; } = string.Empty;
}
