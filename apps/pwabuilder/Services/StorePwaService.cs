namespace PWABuilder.Services;

public class StorePwaService : TimedBackgroundServiceBase
{
    public StorePwaService(ILogger<StorePwaService> logger)
        : base(
            dueTime: TimeSpan.FromMinutes(5),
            intervalTime: TimeSpan.FromHours(24),
            logger: logger)
    {

    }

    public override Task DoWorkAsync(CancellationToken cancelToken)
    {
        return Task.CompletedTask;
    }
}