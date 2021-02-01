import { testManifest } from './manifest';
import { testSecurity } from './security';
import { testServiceWorker } from './service-worker';

export async function runAllTests(url: string) {
  // disabling an eslint check here because we need async
  // here for this function to work properly
  // this is also valid JavaScript
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async resolve => {
    const TestResults = testManifest(url);
    const serviceWorkerTestResults = testServiceWorker(url);
    const securityTestResults = testSecurity(url);

    resolve({
      manifest: await TestResults,
      service_worker: await serviceWorkerTestResults,
      security: await securityTestResults,
    });
  });
}
