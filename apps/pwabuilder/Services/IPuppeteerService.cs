using PuppeteerSharp;

namespace PWABuilder.Services
{
    public interface IPuppeteerService : IAsyncDisposable
    {
        Task<IBrowser> CreateAsync(LaunchOptions? customLaunchOptions = null);
        Task<IPage> GoToSite(string site);
    }
}
