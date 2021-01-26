import { testManifest } from './manifest';
import { testSecurity } from './security';
import { testServiceWorker } from './service-worker';

export async function runAllTests(url: string) {
  return new Promise(async resolve => {
    const manifestTestResults = testManifest(url);
    const serviceWorkerTestResults = testServiceWorker(url);
    const securityTestResults = testSecurity(url);

    resolve({
      manifest: await manifestTestResults,
      service_worker: await serviceWorkerTestResults,
      security: await securityTestResults,
    });
  });
}
