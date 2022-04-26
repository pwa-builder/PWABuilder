import { env } from '../../utils/environment';
import {
  ServiceWorkerDetectionResult,
  TestResult,
} from '../../utils/interfaces';

type OfflineCheckResult = {
  data: {
    offline: boolean;
  };
};

export async function testServiceWorker(
  url: string
): Promise<Array<TestResult>> {
  console.info('Testing Service Worker');
  const isHttp = typeof url === 'string' && url.startsWith('http://');

  if (!url || isHttp) {
    return [];
  }

  let swData: ServiceWorkerDetectionResult;
  try {
    swData = await detectServiceWorker(url);
  } catch (swDetectionError) {
    swData = {
      hasSW: false,
      url: url,
      hasPushRegistration: false,
      serviceWorkerDetectionTimedOut: false,
      noServiceWorkerFoundDetails: `${swDetectionError}`,
      hasBackgroundSync: false,
      hasPeriodicBackgroundSync: false,
    };
  }
  const worksOffline = await detectOfflineSupport(url);
  const swTestResult = [
    {
      result: swData.hasSW,
      infoString: 'Has a Service Worker',
      category: 'required',
    },
    {
      result: worksOffline,
      infoString: 'Works Offline',
      category: 'recommended',
    },
    {
      result: swData.hasPeriodicBackgroundSync,
      infoString: 'Uses Periodic Sync for a rich offline experience',
      category: 'optional',
    },
    {
      result: swData.hasBackgroundSync,
      infoString: 'Uses Background Sync for a rich offline experience',
      category: 'optional',
    },
  ];

  return swTestResult;
}

async function detectServiceWorker(
  url: string
): Promise<ServiceWorkerDetectionResult> {
  const fetchResult = await fetch(
    `${env.serviceWorkerUrl
    }/serviceWorker/runAllChecks?url=${encodeURIComponent(url)}`
  );
  if (!fetchResult.ok) {
    console.warn(
      'Unable to detect service worker due to HTTP error',
      fetchResult.status,
      fetchResult.statusText
    );
    throw new Error(`Service worker detection failed due to HTTP error ${fetchResult.status} ${fetchResult.statusText}`);
  }

  const jsonResult: ServiceWorkerDetectionResult = await fetchResult.json();
  console.info('Service worker detection succeeded', jsonResult);
  return jsonResult;
}

/**
 * Checks the URL for offline support.
 */
async function detectOfflineSupport(url: string): Promise<boolean> {

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
    const puppeteerCheck = detectOfflineSupportPuppeteer(url);
    const lighthouseCheck = detectOfflineSupportLighthouse(url);
    new Promise<void>(() => setTimeout(() => resolve(false), 10000));

    puppeteerCheck.then(result => resolveIfOfflineDetected(result), puppeteerError => console.warn('Service worker offline check via Puppeteer failed', puppeteerError));
    lighthouseCheck.then(result => resolveIfOfflineDetected(result), lighthouseError => console.warn('Service worker offline check via Lighthouse failed', lighthouseError));

    // If both checks finished, resolve as no offline detected.
    Promise.allSettled([puppeteerCheck, lighthouseCheck]).then(() =>
      resolve(false)
    );
  });
}

async function detectOfflineSupportPuppeteer(url: string) {
  const fetchResult = await fetch(
    `${env.serviceWorkerUrl
    }/serviceworker/GetOfflineSupport?url=${encodeURIComponent(url)}`
  );
  if (!fetchResult.ok) {
    console.warn(
      'Unable to detect offline support via Puppeteer.',
      fetchResult.status,
      fetchResult.statusText
    );
    throw new Error(fetchResult.statusText);
  }

  const jsonResult: boolean = await fetchResult.json();
  console.info(
    'Offline support detection completed via Puppeteer. Offline support =',
    jsonResult
  );
  return jsonResult;
}

async function detectOfflineSupportLighthouse(url: string) {
  const fetchResult = await fetch(
    `${env.api}/offline/?site=${encodeURIComponent(url)}`
  );
  if (!fetchResult.ok) {
    console.warn(
      'Unable to detect offline support via Lighthouse.',
      fetchResult.status,
      fetchResult.statusText
    );
    throw new Error(fetchResult.statusText);
  }

  const jsonResult: OfflineCheckResult = await fetchResult.json();
  console.info(
    'Offline support detection completed via Lighthouse. Offline support =',
    jsonResult
  );
  return jsonResult.data.offline;
}
