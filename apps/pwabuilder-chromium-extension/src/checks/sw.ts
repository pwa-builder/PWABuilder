import { TestResult } from "../interfaces/manifest";
import { ManifestDetectionResult, ServiceWorkerDetectionResult, SiteData } from "../interfaces/validation";
import { getTabId } from "../utils/chromium";

let getServiceWorkerInfoPromise: Promise<ServiceWorkerDetectionResult>;
const messageType = 'serviceWorkerMessage';

export function getSwInfo() : Promise<ServiceWorkerDetectionResult> {
    if (getServiceWorkerInfoPromise) {
        return getServiceWorkerInfoPromise;
    }

    getServiceWorkerInfoPromise = new Promise(async (resolve, reject) => {
        const listener = (message: any, sender: any, sendResponse: any) => {
            if (message.type && message.type === messageType) {
                // we finally have all the info we need for the service worker
                resolve(message.serviceWorkerRegistration);
                chrome.runtime.onMessage.removeListener(listener);
                sendResponse(true);
            }
        }

        chrome.runtime.onMessage.addListener(listener)

        const tabId = await getTabId();
        if (tabId) {
            await chrome.scripting.executeScript({
                target: {tabId},
                func: runContentScriptIsolated,
                args: [messageType]
            });

            await chrome.scripting.executeScript({
                target: {tabId},
                func: runContentScriptOnPage,
                world: "MAIN",
                args: [messageType]
            });
        } else {
            reject("No active tab found");
        }
    });

    return getServiceWorkerInfoPromise;
}


// running code on page allowing us to get the service worker registration
async function runContentScriptOnPage(messageType: string) {

    const timeoutPromise = new Promise((resolve, reject) => {
        setTimeout(resolve, 10000);
    })


    const result = await Promise.any([timeoutPromise, navigator.serviceWorker.ready]);
    
    const swInfo : ServiceWorkerDetectionResult = {
        hasSW: false
    }

    if (result) {
        const registration = result as ServiceWorkerRegistration;
        swInfo.hasSW = true;
        swInfo.url = registration.active?.scriptURL;
        swInfo.scope = registration.scope;
        swInfo.isHtmlInCache = false;

        async function fetchSwCode(uri: string) {
            const response = await fetch(uri, { credentials: "include" });
            const text = await response.text();
            return text;
        }

        async function isHtmlInCache() {
            const cacheNames = await caches.keys();
            for (let cacheName of cacheNames) {
                const cache = await caches.open(cacheName);
                const cacheKeys = await cache.keys();
                for (let key of cacheKeys) {
                    const cachedObject = await cache.match(key);
                    if (cachedObject && cachedObject.headers) {
                        const contentType = cachedObject.headers.get('Content-Type');
                        if (contentType && contentType.startsWith('text/html')) {
                            return true;
                        }
                    }
                }
            }
            return false;
        }

        function hasSwEventSubscription(eventName: string, eventMethodName: string, testString: string) {
            const addEventListenerRegEx = `(\\n\\s*|.)addEventListener\\(['|\\"]${eventName}['|\\"]`;
            const methodnameRegEx = `(\\n\\s*|.)${eventName}\\s*=`;
        
            return (new RegExp(`(${addEventListenerRegEx}|${methodnameRegEx})`)).test(testString);
        }
        
        const results = await Promise.all([fetchSwCode(registration.active?.scriptURL!), isHtmlInCache()]);
        swInfo.rawSW = results[0];
        swInfo.isHtmlInCache = results[1];

        const pushSubscription = await registration.pushManager.getSubscription();
        swInfo.hasPushRegistration = pushSubscription !== null || hasSwEventSubscription("push", "onpush", swInfo.rawSW);

        try {
            const periodicSyncTags : [] = await (registration as any).periodicSync.getTags();
            swInfo.hasPeriodicBackgroundSync = periodicSyncTags.length > 0 || hasSwEventSubscription("periodicsync", "onperiodicsync", swInfo.rawSW);
        } catch {
            swInfo.hasPeriodicBackgroundSync = hasSwEventSubscription("periodicsync", "onperiodicsync", swInfo.rawSW);
        }

        try {
            const syncTags : [] = await (registration as any).sync.getTags();
            swInfo.hasBackgroundSync = syncTags.length > 0 || hasSwEventSubscription("sync", "onsync", swInfo.rawSW);
        } catch {
            swInfo.hasBackgroundSync = hasSwEventSubscription("sync", "onsync", swInfo.rawSW);
        }

    }
    
    window.postMessage({type: messageType, serviceWorkerRegistration: swInfo}, "*");
}

// running code isolated so we can use messaging back to extension
// should be run first to setup window message listener for messages from other content script
function runContentScriptIsolated(messageType: string) {
    const callback = (event: MessageEvent) => {
        console.log('got message there', event.data);
        if (event.source !== window) {
            return;
        }

        if (event.data.type && event.data.type === messageType) {
            window.removeEventListener("message", callback);
            console.log('here', event.data.serviceWorkerRegistration)
            chrome.runtime.sendMessage<ServiceWorkerDetectionResult>(event.data);
        }
    }; 

    window.addEventListener("message", callback)
    return true;
}

export function getManifestTestResults(swInfo: ServiceWorkerDetectionResult) : TestResult[] {
    return [
        {
            result: swInfo.hasSW || false,
            infoString: "Has a registered service worker",
            category: "required",
        },
        {
            result: swInfo.hasPushRegistration || false,
            infoString: "Has push notification registration",
            category: "recommended",
        },
        {
            result: swInfo.hasBackgroundSync || false,
            infoString: "Has background sync",
            category: "recommended",
        },
        {
            result: swInfo.hasPeriodicBackgroundSync || false,
            infoString: "Has periodic background sync",
            category: "recommended",
        },
        {
            result: swInfo.isHtmlInCache || false,
            infoString: "Has cached HTML",
            category: "recommended",
        },
    ];
}