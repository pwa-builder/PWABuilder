using PuppeteerSharp;
using PWABuilder.Models;

namespace PWABuilder.Services;

/// <summary>
/// Puppeteer service for controlling headless chrome.
/// </summary>
public interface IPuppeteerService : IAsyncDisposable
{
    /// <summary>
    /// Creates a new page in the reusable browser instance and navigates it to the given site and waits for DOMContentLoaded.
    /// </summary>
    /// <param name="url">The URL to navigate to.</param>
    /// <returns>The new page navigated to the specified URL.</returns>
    Task<IPage> NavigateAsync(Uri url);

    /// <summary>
    /// Attempts to navigate a new page in the reusable browser instance and navigates to it.
    /// </summary>
    /// <param name="url">The URL to navigate to.</param>
    /// <returns></returns>
    Task<IPage?> TryNavigate(Uri url, ILogger logger);
}
