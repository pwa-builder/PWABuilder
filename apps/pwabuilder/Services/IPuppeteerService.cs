using PuppeteerSharp;

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
    Task<IPage> Navigate(Uri url);
}
