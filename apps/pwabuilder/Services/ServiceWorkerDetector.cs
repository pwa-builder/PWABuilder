using Microsoft.Extensions.Logging;
using PWABuilder.Common;
using PWABuilder.Models;
using PWABuilder.Validations.Models;
using System.ComponentModel;
using System.Text.RegularExpressions;

namespace PWABuilder.Services;

/// <summary>
/// Detects service worker registrations given a URL.
/// </summary>
public class ServiceWorkerDetector
{
    private readonly HttpClient http;
    private readonly WebStringCache webStringCache;
    private readonly IPuppeteerService puppeteer;
    private readonly IServiceWorkerAnalyzer serviceWorkerAnalyzer;

    public ServiceWorkerDetector(
        WebStringCache htmlFetchCache,
        IHttpClientFactory httpClientFactory,
        IPuppeteerService puppeteer,
        IServiceWorkerAnalyzer serviceWorkerAnalyzer
    )
    {
        http = httpClientFactory.CreateClient(Constants.PwaBuilderAgentHttpClient);
        this.webStringCache = htmlFetchCache;
        this.puppeteer = puppeteer;
        this.serviceWorkerAnalyzer = serviceWorkerAnalyzer;
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

    /// <summary>
    /// Analyzes an existing service worker and determines what features are used in it, such as push notifications, background sync, etc.
    /// If there was an error during the analysis, the error is logged and null is returned.
    /// </summary>
    /// <param name="serviceWorkerUrl">The URL of the service worker.</param>
    /// <param name="appUrl">The URL of the app hosting the service worker.</param>
    /// <param name="logger">The logger.</param>
    /// <param name="cancelToken">The cancellation token.</param>
    /// <returns>The features detected within the service worker, or null if the service worker couldn't be analyzed.</returns>
    public async Task<List<TestResult>> TryAnalyze(Uri serviceWorkerUrl, Uri appUrl, ILogger logger, CancellationToken cancelToken)
    {
        try
        {
            var features = await serviceWorkerAnalyzer.AnalyzeServiceWorkerAsync(serviceWorkerUrl, appUrl, logger, cancelToken);
            return FeaturesToValidationTests(features);
        }
        catch (Exception featureDetectionError)
        {
            logger.LogError(featureDetectionError, "Unable to detect service worker features of {url} due to an error", serviceWorkerUrl);
            return [];
        }
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
            var serviceWorkerJs = await http.GetStringAsync(serviceWorkerUrl, ["application/javascript", "text/javascript"], maxSizeInBytes: 1024 * 1024 * 1, cancelToken);
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
            var html = await webStringCache.Get(appUrl, ["text/html"], cancelToken);
            return html;
        }
        catch (Exception htmlFetchError)
        {
            logger.LogWarning(htmlFetchError, "Unable to fetch HTML of {url} while fetching service worker.", appUrl);
            return null;
        }
    }

    private List<TestResult> FeaturesToValidationTests(ServiceWorkerFeatures? features)
    {
        return new List<TestResult>
        {
            new()
            {
                Result = true,
                InfoString = features != null
                    ? "Has a Service Worker"
                    : "Does not have a Service Worker",
                Category = "highly recommended",
                Member = "has_service_worker",
            },
            new()
            {
                Result = features?.PeriodicBackgroundSync == true,
                InfoString = features?.PeriodicBackgroundSync == true
                        ? "Uses Periodic Sync for a rich offline experience"
                        : "Does not use Periodic Sync for a rich offline experience",
                Category = "optional",
                Member = "periodic_sync",
            },
            new()
            {
                Result = features?.BackgroundSync == true,
                InfoString =
                    features?.BackgroundSync == true
                        ? "Uses Background Sync for a rich offline experience"
                        : "Does not use Background Sync for a rich offline experience",
                Category = "optional",
                Member = "background_sync",
            },
            new()
            {
                Result = features?.PushRegistration == true,
                InfoString =
                    features?.PushRegistration == true
                        ? "Uses Push Notifications"
                        : "Does not use Push Notifications",
                Category = "optional",
                Member = "push_notifications",
            }
        };
    }
}