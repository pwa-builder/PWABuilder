import { ServiceWorkerDetectionResult } from "~/store/modules/generator/generator.state";
import { promiseAnyPolyfill } from "./promise-any-polyfill";

/**
 * Runs multiple service worker detectors concurrently and returns the first with a successful result.
 */
export class ServiceWorkerFetcher {
    private readonly apiV2Url = process.env.testAPIUrl;
    private readonly swDetectorUrl = process.env.serviceWorkerDetectorUrl;

    constructor(private url: string) {
    }

    async fetch(): Promise<ServiceWorkerDetectionResult> {
        // We want to use Promise.any(...), but browser support is too low at the time of this writing: https://caniuse.com/mdn-javascript_builtins_promise_any
        // Use our polyfill if needed.
        const detectors = [
            this.runApiV2Detector(),
            this.runServiceWorkerDetector()
        ];
        const promiseAny: (promises: Promise<ServiceWorkerDetectionResult>[]) => Promise<ServiceWorkerDetectionResult> = 
            (promises) => Promise["any"] ? Promise["any"](promises) : promiseAnyPolyfill(promises);
        try {
            return await promiseAny(detectors);
        } catch (serviceWorkerDetectionError) {
            console.error("All service worker detectors failed.", serviceWorkerDetectionError);
            throw serviceWorkerDetectionError;
        }
    }

    private async runApiV2Detector(): Promise<ServiceWorkerDetectionResult> {
        const fetchResult = await fetch(`${this.apiV2Url}/serviceWorker?site=${encodeURIComponent(this.url)}`);
        if (!fetchResult.ok) {
            console.info("Unable to detect service worker via APIv2", fetchResult.status, fetchResult.statusText);
            throw new Error(fetchResult.statusText);
        }

        const jsonResult: ApiV2Result = await fetchResult.json();
        console.info("Service worker detection via APIv2 succeeded", jsonResult);
        return jsonResult.data;
    }

    private async runServiceWorkerDetector(): Promise<ServiceWorkerDetectionResult> {
        const fetchResult = await fetch(`${this.swDetectorUrl}/serviceWorker/runAllChecks?url=${encodeURIComponent(this.url)}`);
        if (!fetchResult.ok) {
            console.info("Unable to detect service worker via puppeteer.", fetchResult.status, fetchResult.statusText);
            throw new Error(fetchResult.statusText);
        }

        const jsonResult: ServiceWorkerDetectionResult = await fetchResult.json();
        console.info("Service worker detection via puppeteer succeeded", jsonResult);
        return jsonResult;
    }
}

interface ApiV2Result {
    data: ServiceWorkerDetectionResult
};