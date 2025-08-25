using Microsoft.Extensions.Logging;
using PWABuilder.Common;
using PWABuilder.Models;
using PWABuilder.Validations.Models;
using System.ComponentModel;
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
            serviceWorker = await TryFetchServiceWorkerWithPuppeteer(appUrl, logger, cancelToken);
        }

        return serviceWorker;
    }

    private async Task<ServiceWorkerDetection?> TryFetchServiceWorkerWithPuppeteer(Uri appUrl, ILogger logger, CancellationToken cancelToken)
    {
        using var page = await puppeteer.Navigate(appUrl);
        var jsGetServiceWorker =
            @"('serviceWorker' in navigator ? navigator.serviceWorker.getRegistration().then((registration) => registration ? registration.active?.scriptURL || registration.installing?.scriptURL || registration.waiting?.scriptURL : null ) : Promise.resolve(null))";
        var serviceWorkerUrl = await page.EvaluateExpressionAsync<string>(jsGetServiceWorker);
        if (serviceWorkerUrl == null)
        {
            logger.LogWarning("Service worker not found in Puppeteer for {appUrl}", appUrl);
            return null;
        }

        var serviceWorkerUri = new Uri(appUrl, serviceWorkerUrl);
        var serviceWorker = await TryFetchServiceWorker(serviceWorkerUri, logger, cancelToken);
        return serviceWorker;
    }

    private async Task<ServiceWorkerDetection?> TryFetchServiceWorker(Uri? serviceWorkerUrl, ILogger logger, CancellationToken cancelToken)
    {
        if (serviceWorkerUrl == null)
        {
            return null;
        }

        try
        {
            var serviceWorkerJs = await webStringCache.Get(serviceWorkerUrl, Constants.JavascriptMimeTypes, cancelToken, maxSizeInBytes: 1024 * 1024 * 1);
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
                logger.LogInformation("No service worker URL found in HTML of {appUrl}", appUrl);
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
            var html = await webStringCache.Get(appUrl, ["text/html"], cancelToken);
            return html;
        }
        catch (Exception htmlFetchError)
        {
            logger.LogWarning(htmlFetchError, "Unable to fetch HTML of {url} while fetching service worker.", appUrl);
            return null;
        }
    }
}