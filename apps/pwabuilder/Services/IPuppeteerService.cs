using PuppeteerSharp;

namespace PWABuilder.Services
{
    public interface IPuppeteerService : IAsyncDisposable
    {
        Task CreateAsync(LaunchOptions? customLaunchOptions = null);
        Task<IPage> GoToSite(string site);
    }
}
