import { ServiceWorkerDetectionResult } from "~/store/modules/generator/generator.state";
import { getCache, setCache } from "./caching";

/**
 * Runs service worker detection for a site.
 */
export class ServiceWorkerChecker {
    private readonly offlineCheckUrl = process.env.testAPIUrl;
    private readonly serviceWorkerCheckUrl = process.env.serviceWorkerDetectorUrl;

    constructor(private url: string) {
    }

    /**
     * Fetches the service worker for the site.
     */
    async detectServiceWorker(): Promise<ServiceWorkerDetectionResult> {
        // First, is it in the session cache? Just use that.
        const serviceWorkerCacheKey = "sw";
        const cachedData: ServiceWorkerDetectionResult = getCache(serviceWorkerCacheKey, this.url);
        if (cachedData) {
            return cachedData;
        }

        const fetchResult = await fetch(`${this.serviceWorkerCheckUrl}/serviceWorker/runAllChecks?url=${encodeURIComponent(this.url)}`);
        if (!fetchResult.ok) {
            console.warn("Unable to detect service worker", fetchResult.status, fetchResult.statusText);
            throw new Error(fetchResult.statusText);
        }

        const jsonResult: ServiceWorkerDetectionResult = await fetchResult.json();
        console.info("Service worker detection succeeded", jsonResult);
        setCache(serviceWorkerCacheKey, this.url, jsonResult);
        return jsonResult;
    }

    /**
     * Checks the URL for offline support.
     */
    async detectOfflineSupport(): Promise<boolean> {
        type OfflineCheckResult = {
            data: {
                offline: boolean;
            }
        };

        // We've witnessed this call take a very long time. We're going to time-box it to 10s.
        const tenSecondTimeout = new Promise<void>(resolve => setTimeout(() => resolve(), 10000));
        const offlineFetch = fetch(`${this.offlineCheckUrl}/offline/?site=${encodeURIComponent(this.url)}`);

        const fetchResultOrTimeout = await Promise.race([tenSecondTimeout, offlineFetch]);
        if (!fetchResultOrTimeout) {
            console.warn("Offline check timed out after 10 seconds.");
            throw new Error("Offline check timed out after 10 seconds.");
        }
        if (!fetchResultOrTimeout.ok) {
            console.warn("Unable to detect offline support.", fetchResultOrTimeout.status, fetchResultOrTimeout.statusText);
            throw new Error(fetchResultOrTimeout.statusText);
        }

        const jsonResult: OfflineCheckResult = await fetchResultOrTimeout.json();
        console.info("Offline support detection succeeded. Offline support =", jsonResult);
        return jsonResult.data.offline;
    }
}