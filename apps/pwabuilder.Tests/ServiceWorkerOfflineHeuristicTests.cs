using PuppeteerSharp;
using PWABuilder.Services;
using Xunit;

namespace PWABuilder.Tests;

/// <summary>Verifies the static offline-caching heuristic used when a service worker is still installing during offline detection.</summary>
public sealed class ServiceWorkerOfflineHeuristicTests
{
    /// <summary>Workbox precaching/routing and cache-backed fetch handlers are recognized as offline caching logic.</summary>
    [Theory]
    [InlineData("define([\"./workbox-e613d4d5\"],(function(e){e.precacheAndRoute([{url:\"index.html\",revision:\"1\"}],{}),e.registerRoute(new e.NavigationRoute(e.createHandlerBoundToURL(\"index.html\")))}));")]
    [InlineData("workbox.routing.registerRoute(({request}) => request.mode === 'navigate', new workbox.strategies.NetworkFirst());")]
    [InlineData("self.addEventListener('fetch', e => e.respondWith(caches.match(e.request).then(r => r || fetch(e.request))));")]
    [InlineData("self.onfetch = function (event) { event.respondWith(caches.open('v1').then(c => c.match(event.request))); };")]
    public void Offline_caching_logic_is_detected(string serviceWorkerJs)
    {
        Assert.True(ServiceWorkerAnalyzer.HasOfflineCachingLogic(serviceWorkerJs));
    }

    /// <summary>Service workers without a cache-backed fetch handler are not treated as offline capable.</summary>
    [Theory]
    [InlineData("")]
    [InlineData("self.addEventListener('push', e => self.registration.showNotification('hi'));")]
    [InlineData("self.addEventListener('fetch', e => e.respondWith(fetch(e.request)));")]
    [InlineData("self.addEventListener('install', e => e.waitUntil(caches.open('v1').then(c => c.addAll(['/']))));")]
    public void Missing_offline_caching_logic_is_not_detected(string serviceWorkerJs)
    {
        Assert.False(ServiceWorkerAnalyzer.HasOfflineCachingLogic(serviceWorkerJs));
    }

    /// <summary>A crashed or closed browser tab is recognized so the offline check can retry or fall back to static analysis.</summary>
    [Fact]
    public void Browser_crashes_are_recognized()
    {
        Assert.True(ServiceWorkerAnalyzer.IsBrowserCrash(new TargetClosedException("Protocol error (Performance.enable): Session closed.", "Page failed to process Inspector.targetCrashed.")));
        Assert.True(ServiceWorkerAnalyzer.IsBrowserCrash(new InvalidOperationException("wrapped", new TargetClosedException("Session closed", "Inspector.targetCrashed"))));
        Assert.True(ServiceWorkerAnalyzer.IsBrowserCrash(new Exception("Page failed to process Inspector.targetCrashed.")));
    }

    /// <summary>Ordinary failures of the app under test are not mistaken for a browser crash.</summary>
    [Theory]
    [InlineData("net::ERR_INTERNET_DISCONNECTED")]
    [InlineData("Navigation timeout of 20000 ms exceeded")]
    [InlineData("")]
    public void Other_failures_are_not_browser_crashes(string message)
    {
        Assert.False(ServiceWorkerAnalyzer.IsBrowserCrash(new Exception(message)));
        Assert.False(ServiceWorkerAnalyzer.IsBrowserCrash(new TimeoutException(message)));
    }
}
