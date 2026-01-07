namespace PWABuilder.Services;

/// <summary>
/// Background services that periodically scans the Microsoft Store for PWAs.
/// It then matches these up with PWABuilder's packages stored in our backend CosmosDB.
/// </summary>
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
        // Step 1: Find all PWAs in the Store. SFEdge gives us this info.
        // Step 2. For each PWA in the Store, check if we have a PWABuilderPackage for it (joined on packageId). 
        // Step 3. If we have a corresponding PWABuilderPackage, set storeApp.Manifest and storeApp.ManifestUrl.
        // Step 4. Prune any MicrosoftStorePWA objects from our database if they've been removed from the Store.
        return Task.CompletedTask;
    }
}