import { env } from '../../utils/environment';
import {
  ServiceWorkerDetectionResult,
  TestResult,
} from '../../utils/interfaces';

export async function testServiceWorker(
  url: string
): Promise<Array<TestResult>> {
  console.info('Testing Service Worker');
  const isHttp = typeof url === 'string' && url.startsWith('http://');

  if (!url || isHttp) {
    return [];
  }

  let swData: ServiceWorkerDetectionResult;
  let worksOffline: boolean = false;
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

  if (swData.hasSW) {
    worksOffline = await detectOfflineSupport(url);
  }

  const swTestResult = [
    {
      result: swData.hasSW,
      infoString: swData.hasSW ? 'Has a Service Worker' : 'Does not have a Service Worker',
      category: 'required',
    },
    {
      result: worksOffline,
      infoString: worksOffline ? 'Works Offline' : 'Does not work offline',
      category: 'recommended',
    },
    {
      result: swData.hasPeriodicBackgroundSync,
      infoString: swData.hasPeriodicBackgroundSync ? 'Uses Periodic Sync for a rich offline experience' : 'Does not use Periodic Sync for a rich offline experience',
      category: 'optional',
    },
    {
      result: swData.hasBackgroundSync,
      infoString: swData.hasBackgroundSync ? 'Uses Background Sync for a rich offline experience' : 'Does not use Background Sync for a rich offline experience',
      category: 'optional',
    },
  ];

  return swTestResult;
}

async function detectServiceWorker(
  url: string
): Promise<ServiceWorkerDetectionResult> {
  const fetchResult = await fetch(
    `${
      env.serviceWorkerUrl
    }/serviceWorker/runAllChecks?url=${encodeURIComponent(url)}`
  );
  if (!fetchResult.ok) {
    console.warn(
      'Unable to detect service worker due to HTTP error',
      fetchResult.status,
      fetchResult.statusText
    );
    throw new Error(
      `Service worker detection failed due to HTTP error ${fetchResult.status} ${fetchResult.statusText}`
    );
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

  return new Promise<boolean>((resolve) => {
    const resolveIfOfflineDetected = (offlineDetected: boolean) => {
      if (offlineDetected) {
        resolve(true);
      }
    };

    // Race to success: if any test returns offline = true, use that.
    // Otherwise, punt if we timeout, or if the test returns false.
    const puppeteerCheck = detectOfflineSupportPuppeteer(url);
    const timeout = new Promise((resolve) => {
      setTimeout(() => resolve(false), 10000);
    });
    puppeteerCheck.then(
      (result) => resolveIfOfflineDetected(result),
      (puppeteerError) =>
        console.warn(
          'Service worker offline check via Puppeteer failed',
          puppeteerError
        )
    );
    return Promise.race([puppeteerCheck, timeout]).then(() => resolve(false));
  });
}

async function detectOfflineSupportPuppeteer(url: string) {
  const fetchResult = await fetch(
    `${
      env.serviceWorkerUrl
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
