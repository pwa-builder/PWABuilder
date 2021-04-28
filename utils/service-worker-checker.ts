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
        // We have 2 offline checks:
        // - A Google Lighthouse-based check, run via APIv2
        // - A Puppeteer check check, run via our service worker API.
        // We'll run both and see if we get success on either.
        // Additionally, we time box this to 10 seconds because we've witnessed very long timeouts or hangs for some sites.

        return new Promise<boolean>(resolve => {
            const resolveIfOfflineDetected = (offlineDetected: boolean) => {
                if (offlineDetected) {
                    resolve(true);
                }
            };

            // Race to success: if any test returns offline = true, use that.
            // Otherwise, punt if we timeout, or if both tests return false.
            const puppeteerCheck = this.detectOfflineSupportPuppeteer();
            const lighthouseCheck = this.detectOfflineSupportLighthouse();
            new Promise<void>(() => setTimeout(() => resolve(false), 10000));

            puppeteerCheck
                .then(result => resolveIfOfflineDetected(result));
            lighthouseCheck
                .then(result => resolveIfOfflineDetected(result));

            // If both checks finished, resolve as no offline detected.
            Promise["allSettled"]([puppeteerCheck, lighthouseCheck])
                .then(() => resolve(false));
        });
    }

    private async detectOfflineSupportLighthouse(): Promise<boolean> {
        const fetchResult = await fetch(`${this.offlineCheckUrl}/offline/?site=${encodeURIComponent(this.url)}`);
        if (!fetchResult.ok) {
            console.warn("Unable to detect offline support via Lighthouse.", fetchResult.status, fetchResult.statusText);
            throw new Error(fetchResult.statusText);
        }

        type OfflineCheckResult = {
            data: {
                offline: boolean;
            }
        };
        const jsonResult: OfflineCheckResult = await fetchResult.json();
        console.info("Offline support detection completed via Lighthouse. Offline support =", jsonResult);
        return jsonResult.data.offline;
    }

    private async detectOfflineSupportPuppeteer(): Promise<boolean> {
        const fetchResult = await fetch(`${this.serviceWorkerCheckUrl}/serviceworker/GetOfflineSupport?url=${encodeURIComponent(this.url)}`);
        if (!fetchResult.ok) {
            console.warn("Unable to detect offline support via Puppeteer.", fetchResult.status, fetchResult.statusText);
            throw new Error(fetchResult.statusText);
        }

        const jsonResult: boolean = await fetchResult.json();
        console.info("Offline support detection completed via Puppeteer. Offline support =", jsonResult);
        return jsonResult;
    }
}