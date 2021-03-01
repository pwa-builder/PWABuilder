import { env } from '../../utils/environment';
import { ServiceWorkerDetectionResult, TestResult } from '../../utils/interfaces';

export async function testServiceWorker(url: string): Promise<Array<TestResult>> {
  console.info('Testing Service Worker');
  const isHttp = typeof url === 'string' && url.startsWith('http://');

  if (!url || isHttp) {
    return [];
  }

  const swData = await detectServiceWorker(url);
  const worksOffline = await detectOfflineSupport(url);

  const swTestResult = [
      {
        result: swData.hasSW,
        infoString: "Has a Service Worker",
        category: "required"

      },
      {
        result: worksOffline,
        infoString: "Works Offline",
        category: "recommended"
      },
      {
        result: swData.hasPeriodicBackgroundSync,
        infoString: "Uses Periodic Sync for a rich offline experience",
        category: "optional"
      },
      {
        result: swData.hasBackgroundSync,
        infoString: "Uses Background Sync for a rich offline experience",
        category: "optional"
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
      'Unable to detect service worker',
      fetchResult.status,
      fetchResult.statusText
    );
    throw new Error(fetchResult.statusText);
  }

  const jsonResult: ServiceWorkerDetectionResult = await fetchResult.json();
  console.info('Service worker detection succeeded', jsonResult);
  return jsonResult;
}

/**
 * Checks the URL for offline support.
 */
async function detectOfflineSupport(url: string): Promise<boolean> {
  type OfflineCheckResult = {
    data: {
      offline: boolean;
    };
  };

  // We've witnessed this call take a very long time. We're going to time-box it to 10s.
  const tenSecondTimeout = new Promise<void>(resolve =>
    setTimeout(() => resolve(), 10000)
  );
  const offlineFetch = fetch(
    `${env.testAPIUrl}/offline/?site=${encodeURIComponent(url)}`
  );

  const fetchResultOrTimeout: void | Response = await Promise.race([
    tenSecondTimeout,
    offlineFetch,
  ]);

  if (!fetchResultOrTimeout) {
    console.warn('Offline check timed out after 10 seconds.');
    return false;
  }
  if (fetchResultOrTimeout && !fetchResultOrTimeout.ok) {
    console.warn(
      'Unable to detect offline support.',
      fetchResultOrTimeout.status,
      fetchResultOrTimeout.statusText
    );
  }

  const jsonResult: OfflineCheckResult = await (fetchResultOrTimeout as Response).json();
  console.info('Offline support detection succeeded', jsonResult);
  return jsonResult.data.offline;
}

