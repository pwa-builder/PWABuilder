using System;
using System.Threading;
using System.Threading.Tasks;

namespace PWABuilder.MicrosoftStore.Jobs;

/// <summary>
/// A received queue message. Renewal returns a new pop receipt.
/// </summary>
/// <param name="MessageId">Queue-generated ID.</param>
/// <param name="PopReceipt">Current acknowledgement/renewal token.</param>
/// <param name="JobId">Durable job reference, not its inputs.</param>
/// <param name="DequeueCount">Number of deliveries.</param>
public sealed record PackageJobMessage(string MessageId, string PopReceipt, string JobId, long DequeueCount);

/// <summary>
/// At-least-once delivery with explicit renewal and acknowledgement.
/// </summary>
public interface IWindowsPackageJobQueue
{
    /// <summary>
    /// Enqueues a small job reference.
    /// </summary>
    Task SendAsync(string jobId, CancellationToken token);

    /// <summary>
    /// Receives without deleting; null means the queue is empty.
    /// </summary>
    Task<PackageJobMessage?> ReceiveAsync(CancellationToken token);

    /// <summary>
    /// Updates invisibility and returns the new pop receipt.
    /// </summary>
    Task<PackageJobMessage> RenewAsync(PackageJobMessage message, TimeSpan visibility, CancellationToken token);

    /// <summary>
    /// Acknowledges processing with the latest pop receipt.
    /// </summary>
    Task DeleteAsync(PackageJobMessage message, CancellationToken token);

    /// <summary>
    /// Writes a diagnostic reference to the poison queue before acknowledgement.
    /// </summary>
    Task PoisonAsync(PackageJobMessage message, string reason, CancellationToken token);
}
