using System;
using System.Threading;
using System.Threading.Tasks;

namespace PWABuilder.MicrosoftStore.Jobs;

/// <summary>
/// Serializes queue receipt renewal and conditional job updates. A failed renewal
/// cancels the build; an ETag mismatch prevents a stale worker from publishing its result.
/// </summary>
internal sealed class PackageJobLease(
    IWindowsPackageJobStore store,
    IWindowsPackageJobQueue queue,
    WindowsPackageJob job,
    PackageJobMessage message,
    WindowsPackageJobOptions options,
    TimeProvider clock) : IDisposable
{
    private readonly SemaphoreSlim gate = new(1, 1);
    private WindowsPackageJob current = job;
    private bool released;

    /// <summary>Latest queue receipt, including renewals.</summary>
    public PackageJobMessage Message { get; private set; } = message;

    /// <summary>Whether exclusive ownership was lost.</summary>
    public bool Lost { get; private set; }

    /// <summary>Renews the queue message and durable ownership until completion.</summary>
    public async Task RenewUntilStoppedAsync(CancellationTokenSource build, CancellationToken stop)
    {
        try
        {
            while (!stop.IsCancellationRequested)
            {
                await Task.Delay(TimeSpan.FromSeconds(options.RenewalSeconds), clock, stop);
                await gate.WaitAsync(stop);
                try
                {
                    if (released)
                    {
                        return;
                    }
                    EnsureOwnership();
                    // Bound storage calls too: a hung renewal must not leave an unfenced builder running.
                    using var renewal = CancellationTokenSource.CreateLinkedTokenSource(stop);
                    renewal.CancelAfter(TimeSpan.FromSeconds(options.RenewalSeconds));
                    Message = await queue.RenewAsync(Message, TimeSpan.FromSeconds(options.VisibilitySeconds), renewal.Token);
                    current = await store.TryReplaceAsync(current with
                    {
                        LeaseExpiresAt = clock.GetUtcNow().AddSeconds(options.VisibilitySeconds)
                    }, renewal.Token) ?? throw new InvalidOperationException("Job ownership changed during renewal.");
                }
                catch
                {
                    // Fence a completion already waiting on the semaphore before releasing it.
                    Lost = true;
                    throw;
                }
                finally
                {
                    gate.Release();
                }
            }
        }
        catch (OperationCanceledException) when (stop.IsCancellationRequested)
        {
            // Normal shutdown of this job's renewal loop.
        }
        catch
        {
            Lost = true;
            await build.CancelAsync();
            throw;
        }
    }

    /// <summary>Persists a state transition against the latest revision and releases ownership.</summary>
    public async Task<WindowsPackageJob> FinishAsync(Func<WindowsPackageJob, WindowsPackageJob> transition, CancellationToken token)
    {
        await gate.WaitAsync(token);
        try
        {
            EnsureOwnership();
            current = await store.TryReplaceAsync(transition(current) with { LeaseExpiresAt = null }, token)
                ?? throw new InvalidOperationException("Job ownership changed before completion.");
            released = true;
            return current;
        }
        catch
        {
            Lost = true;
            throw;
        }
        finally
        {
            gate.Release();
        }
    }

    /// <summary>Refuses writes after the durable lease has expired.</summary>
    private void EnsureOwnership()
    {
        if (Lost || current.LeaseExpiresAt <= clock.GetUtcNow())
        {
            throw new InvalidOperationException("Job ownership expired.");
        }
    }

    /// <inheritdoc/>
    public void Dispose() => gate.Dispose();
}
