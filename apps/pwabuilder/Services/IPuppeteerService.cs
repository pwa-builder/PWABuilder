using PuppeteerSharp;

namespace PWABuilder.Services
{
    public interface IPuppeteerService : IAsyncDisposable
    {
        Task CreateAsync();
        Task<IPage> GoToSite(string site);
    }
}
