using System.Text.Json;
using System.Text.RegularExpressions;
using HtmlAgilityPack;
using PWABuilder.Common;
using PWABuilder.Models;

namespace PWABuilder.Services;

/// <summary>
/// Detects service worker registrations given a URL.
/// </summary>
public class ServiceWorkerDetector
{
    private readonly HttpClient http;
    private readonly HtmlFetchCache htmlFetchCache;
    private readonly IPuppeteerService puppeteer;

    public ServiceWorkerDetector(
        HtmlFetchCache htmlFetchCache,
        IHttpClientFactory httpClientFactory,
        IPuppeteerService puppeteer
    )
    {
        http = httpClientFactory.CreateClient(Constants.PwaBuilderAgentHttpClient);
        this.htmlFetchCache = htmlFetchCache;
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
    public async Task<ServiceWorkerContentResult?> TryDetectAsync(Uri appUrl, ILogger logger, CancellationToken cancelToken)
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

    private async Task<ServiceWorkerContentResult?> TryFetchServiceWorkerWithPuppeteer(Uri appUrl, ILogger logger, CancellationToken cancelToken)
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

    private async Task<ServiceWorkerContentResult?> TryFetchServiceWorker(Uri? serviceWorkerUrl, ILogger logger, CancellationToken cancelToken)
    {
        if (serviceWorkerUrl == null)
        {
            return null;
        }

        try
        {
            var serviceWorkerJs = await http.GetStringAsync(serviceWorkerUrl, accept: "text/javascript", maxSizeInBytes: 1024 * 1024 * 1, cancelToken);
            if (serviceWorkerJs == null)
            {
                logger.LogWarning("Service worker at {serviceWorkerUrl} returned null content.", serviceWorkerUrl);
                return null;
            }

            return new ServiceWorkerContentResult
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

    private Uri? TryGetServiceWorkerUrlFromHtml(string? appHtml, Uri appUrl, ILogger logger)
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
            var html = await htmlFetchCache.GetHtml(appUrl, cancelToken);
            return html;
        }
        catch (Exception htmlFetchError)
        {
            logger.LogWarning(htmlFetchError, "Unable to fetch HTML of {url} while fetching service worker.", appUrl);
            return null;
        }
    }
}