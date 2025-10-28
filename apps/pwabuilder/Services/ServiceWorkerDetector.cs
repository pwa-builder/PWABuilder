using PuppeteerSharp;
using PWABuilder.Common;
using PWABuilder.Models;
using System.Text.RegularExpressions;

namespace PWABuilder.Services;

/// <summary>
/// Detects service worker registrations given a web app URL.
/// </summary>
public class ServiceWorkerDetector
{
    private readonly WebStringCache webStringCache;
    private readonly IPuppeteerService puppeteer;

    public ServiceWorkerDetector(WebStringCache webStringCache, IPuppeteerService puppeteer)
    {
        this.webStringCache = webStringCache;
        this.puppeteer = puppeteer;
    }

    /// <summary>
    /// Attempts to detect the service worker for the given app URL. It first tries to fetch the HTML of the page and parse it for the service worker registration. If that fails, it uses Puppeteer to try to find the service worker registration.
    /// If any errors occur during the process, they are logged, and the method returns null.
    /// </summary>
    /// <param name="appUrl">The URL of the web app to analyze.</param>
    /// <param name="logger">A logger to log information, warnings, and errors during this analysis.</param>
    /// <param name="cancelToken"></param>
    /// <returns>The service worker info, if any.</returns>
    public async Task<ServiceWorkerDetection?> TryDetectAsync(Uri appUrl, ILogger logger, CancellationToken cancelToken)
    {
        // Grab the HTML of the page.
        var appHtml = await TryGetHtmlPage(appUrl, logger, cancelToken);

        // See if we can find the service worker registration.
        var serviceWorkerUrl = TryGetServiceWorkerUrlFromHtml(appHtml, appUrl, logger);

        // Grab the service worker.
        var serviceWorker = await TryFetchServiceWorker(serviceWorkerUrl, logger, cancelToken);

        // Couldn't find the service worker? See if we can via Puppeteer.
        if (serviceWorker == null)
        {
            serviceWorker = await TryFetchServiceWorkerWithPuppeteer(appUrl, retryOnFailure: true, logger, cancelToken);
        }

        return serviceWorker;
    }

    private async Task<ServiceWorkerDetection?> TryFetchServiceWorkerWithPuppeteer(Uri appUrl, bool retryOnFailure, ILogger logger, CancellationToken cancelToken)
    {
        try
        {
            logger.LogInformation("Attempting to fetch service worker for {appUrl} via Puppeteer.", appUrl);

            using var page = await puppeteer.NavigateAsync(appUrl);
            var serviceWorkerUrl = await TryGetServiceWorkerUrlFromPuppeteer(page, logger);
            if (string.IsNullOrWhiteSpace(serviceWorkerUrl))
            {
                logger.LogWarning("Service worker not found in Puppeteer for {appUrl}", appUrl);
                return null;
            }

            // Cool. Can we grab the script contents? That'd be fabulous and we can skip fetching it from C#.
            logger.LogInformation("Found service worker URL {serviceWorkerUrl} for {appUrl} via Puppeteer. Attempting to fetch service worker contents...", serviceWorkerUrl, appUrl);
            var serviceWorkerUri = new Uri(appUrl, serviceWorkerUrl);
            var serviceWorkerContent = await TryGetServiceWorkerContentsFromPuppeteer(page, logger);
            if (!string.IsNullOrWhiteSpace(serviceWorkerContent))
            {
                return new ServiceWorkerDetection
                {
                    Raw = serviceWorkerContent,
                    Url = serviceWorkerUri,
                };
            }

            // We couldn't grab the service worker contents from Puppeteer. 
            // See if we can grab it from the network ourselves.
            logger.LogWarning("Service worker contents at {serviceWorkerUrl} could not be fetched via Puppeteer. Falling back to C# fetch.", serviceWorkerUrl);
            var serviceWorker = await TryFetchServiceWorker(serviceWorkerUri, logger, cancelToken);
            return serviceWorker;
        }
        catch (Exception error)
        {
            if (retryOnFailure)
            {
                return await TryFetchServiceWorkerWithPuppeteer(appUrl, retryOnFailure: false, logger, cancelToken);
            }
            else
            {
                logger.LogWarning(error, "Failed to detect service worker via Puppeteer for {appUrl}.", appUrl);
                return null;
            }
        }
    }

    private static async Task<string?> TryGetServiceWorkerUrlFromPuppeteer(IPage puppeteerPage, ILogger logger)
    {
        try
        {
            var jsGetServiceWorker = @"('serviceWorker' in navigator ? navigator.serviceWorker.getRegistration().then((registration) => registration ? registration.active?.scriptURL || registration.installing?.scriptURL || registration.waiting?.scriptURL : null ) : Promise.resolve(null))";
            var serviceWorkerUrl = await puppeteerPage.EvaluateExpressionAsync<string?>(jsGetServiceWorker);
            return serviceWorkerUrl;
        }
        catch (Exception evalError)
        {
            logger.LogError(evalError, "Error evaluating script to find service worker URL in Puppeteer.");
            return null;
        }
    }

    private static async Task<string?> TryGetServiceWorkerContentsFromPuppeteer(IPage puppeteerPage, ILogger logger)
    {
        try
        {
            var jsGetServiceWorkerContent = @"
                navigator.serviceWorker.getRegistration().then(registration => {
                    if (!registration || !registration.active) return null;
                    return fetch(registration.active.scriptURL)
                        .then(response => response.text())
                        .catch(() => null);
                })";
            var serviceWorkerContent = await puppeteerPage.EvaluateExpressionAsync<string?>(jsGetServiceWorkerContent);
            return serviceWorkerContent;
        }
        catch (Exception evalError)
        {
            logger.LogWarning(evalError, "Error evaluating script to get service worker content in Puppeteer.");
            return null;
        }
    }

    private async Task<ServiceWorkerDetection?> TryFetchServiceWorker(Uri? serviceWorkerUrl, ILogger logger, CancellationToken cancelToken)
    {
        if (serviceWorkerUrl == null)
        {
            return null;
        }

        try
        {
            var serviceWorkerJs = await webStringCache.GetOrFetchAsync(serviceWorkerUrl, Constants.JavascriptMimeTypes, logger, cancelToken, maxSizeInBytes: 1024 * 1024 * 1);
            if (serviceWorkerJs == null)
            {
                logger.LogWarning("Service worker at {serviceWorkerUrl} returned null content.", serviceWorkerUrl);
                return null;
            }

            return new ServiceWorkerDetection
            {
                Raw = serviceWorkerJs,
                Url = serviceWorkerUrl
            };
        }
        catch (Exception error)
        {
            logger.LogError(error, "Error fetching service worker from {serviceWorkerUrl}.", serviceWorkerUrl);
            return null;
        }
    }

    private static Uri? TryGetServiceWorkerUrlFromHtml(string? appHtml, Uri appUrl, ILogger logger)
    {
        if (appHtml == null)
        {
            return null;
        }

        try
        {
            // Look for navigator.serviceWorker.register('...'). Quotes can be single or double.
            var pattern = @"navigator\.serviceWorker\.register\(\s*(['""])(.*?)\1";
            var match = Regex.Match(appHtml, pattern);

            var relativeServiceWorkerUrl = match.Success && match.Groups.Count > 1 ?
                match.Groups[2].Value : null;
            if (string.IsNullOrEmpty(relativeServiceWorkerUrl))
            {
                logger.LogInformation("No service worker URL found via HTML parsing of {appUrl}", appUrl);
                return null;
            }

            return new Uri(appUrl, relativeServiceWorkerUrl);
        }
        catch (Exception error)
        {
            logger.LogError(error, "Error parsing HTML to find service worker URL in {appUrl}.", appUrl);
            return null;
        }
    }

    private async Task<string?> TryGetHtmlPage(Uri appUrl, ILogger logger, CancellationToken cancelToken)
    {
        try
        {
            var html = await webStringCache.GetOrFetchAsync(appUrl, ["text/html"], logger, cancelToken);
            return html;
        }
        catch (Exception htmlFetchError)
        {
            logger.LogWarning(htmlFetchError, "Unable to fetch HTML of {url} while fetching service worker.", appUrl);
            return null;
        }
    }
}