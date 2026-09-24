using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace PWABuilder.MicrosoftStore.Jobs;

/// <summary>
/// Bounded consumers and a recoverable outbox dispatcher, owned by the host.
/// </summary>
public sealed class WindowsPackageJobWorker(
    IServiceScopeFactory scopes,
    IWindowsPackageJobQueue queue,
    IOptions<WindowsPackageJobOptions> options,
    ILogger<WindowsPackageJobWorker> logger) : BackgroundService
{
    private readonly WindowsPackageJobOptions settings = options.Value;

    /// <inheritdoc/>
    protected override Task ExecuteAsync(CancellationToken stoppingToken)
    {
        // API-only instances still dispatch accepted jobs; dedicated workers can recover
        // pending outbox records left by an API crash.
        var count = settings.RunWorkers ? settings.WorkerCount : 0;
        return Task.WhenAll(Enumerable.Range(0, count)
            .Select(_ => RunLoopAsync(false, stoppingToken))
            .Append(RunLoopAsync(true, stoppingToken)));
    }

    /// <summary>
    /// Creates a fresh scope for each delivery so temporary build files are isolated.
    /// </summary>
    private async Task RunLoopAsync(bool dispatch, CancellationToken token)
    {
        while (!token.IsCancellationRequested)
        {
            var idle = dispatch;
            try
            {
                await using var scope = scopes.CreateAsyncScope();
                var processor = scope.ServiceProvider.GetRequiredService<WindowsPackageJobProcessor>();
                if (dispatch)
                {
                    await processor.DispatchAsync(token);
                }
                else
                {
                    var message = await queue.ReceiveAsync(token);
                    idle = message is null;
                    if (message is not null)
                    {
                        await processor.ProcessAsync(message, token);
                    }
                }
            }
            catch (OperationCanceledException) when (token.IsCancellationRequested)
            {
                break;
            }
            catch (Exception error)
            {
                logger.LogError(error, "Windows package {Loop} iteration failed; unacknowledged jobs remain recoverable",
                    dispatch ? "dispatcher" : "worker");
                idle = true;
            }

            if (idle)
            {
                try
                {
                    await Task.Delay(TimeSpan.FromSeconds(settings.PollSeconds), token);
                }
                catch (OperationCanceledException) when (token.IsCancellationRequested)
                {
                    break;
                }
            }
        }
    }
}
