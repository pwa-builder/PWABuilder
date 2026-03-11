
namespace PWABuilder.Services;

/// <summary>
/// Base class for a background service that executes code on a timer.
/// </summary>
public abstract class TimedBackgroundServiceBase : IHostedService, IDisposable
{
    private readonly TimeSpan dueTime;
    private readonly TimeSpan intervalTime;
    protected readonly ILogger logger;

    private Timer? timer = null;
    private CancellationToken cancelToken;

    /// <summary>
    /// Creates a new timed background service.
    /// </summary>
    /// <param name="dueTime">When the first run should execute.</param>
    /// <param name="intervalTime">How often runs should be repeated.</param>
    /// <param name="logger">Logger</param>
    public TimedBackgroundServiceBase(
        TimeSpan dueTime,
        TimeSpan intervalTime,
        ILogger logger)
    {
        this.dueTime = dueTime;
        this.intervalTime = intervalTime;
        this.logger = logger;
    }

    public Task StartAsync(CancellationToken cancellationToken)
    {
        timer = new Timer(async _ => await TryDoWorkAsync(), null, dueTime, intervalTime);
        this.cancelToken = cancellationToken;
        return Task.CompletedTask;
    }

    public async Task StopAsync(CancellationToken stoppingToken)
    {
        this.cancelToken = stoppingToken;
        if (this.timer != null)
        {
            await timer.DisposeAsync();
        }
    }

    public void Dispose()
    {
        timer?.Dispose();
    }

    /// <summary>
    /// Runs the service. This is called from a timer.
    /// </summary>
    /// <param name="cancelToken">Cancellation Token</param>
    public abstract Task DoWorkAsync(CancellationToken cancelToken);

    private async Task TryDoWorkAsync()
    {
        try
        {
            await DoWorkAsync(this.cancelToken);
        }
        catch (Exception error)
        {
            logger.LogError(error, "Error executing timed background service");
        }
    }
}
