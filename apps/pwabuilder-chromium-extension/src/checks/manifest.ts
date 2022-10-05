import { ManifestDetectionResult, ServiceWorkerDetectionResult, SiteData } from "../interfaces/validation";
import { getTabId } from "../utils/chromium";

let manifestInfoPromise: Promise<ManifestDetectionResult>;
const messageType = 'manifestMessage';

export function getManifestInfo() : Promise<ManifestDetectionResult> {
    if (manifestInfoPromise) {
        return manifestInfoPromise;
    }

    manifestInfoPromise = new Promise(async (resolve, reject) => {
        const listener = (message: any, sender: any, sendResponse: any) => {
            if (message.type && message.type === messageType) {
                // we finally have all the info we need for the service worker
                resolve(message.manifestInfo);
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
        } else {
            reject("No active tab found");
        }
    });

    return manifestInfoPromise;
}

// running code isolated so we can use messaging back to extension
// should be run first to setup window message listener for messages from other content script
async function runContentScriptIsolated(messageType: string) {

    const manifestInfo : ManifestDetectionResult = {
        hasManifest: false
    }

    const link = document.querySelector('link[rel="manifest"]') as HTMLLinkElement;
    if (link) {
        const manifestUri = link.href;

        const manifestResponse = await fetch(manifestUri, { credentials: "include" })
        const manifest = await manifestResponse.json();

        manifestInfo.hasManifest = true;
        manifestInfo.manifestUri = manifestUri;
        manifestInfo.manifest = manifest;
    }

    chrome.runtime.sendMessage({type: messageType, manifestInfo});
    return true;
}