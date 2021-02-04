import { TestResult } from '../../utils/interfaces';
import { testManifest } from './manifest';
import { testSecurity } from './security';
import { testServiceWorker } from './service-worker';

interface AllTestResults {
  manifest: Array<TestResult>;
  service_worker: Array<TestResult>;
  security: Array<TestResult>;
}

export async function runAllTests(url: string): Promise<AllTestResults> {
  // disabling an eslint check here because we need async
  // here for this function to work properly
  // this is also valid JavaScript
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async resolve => {
    const maniTestResult = testManifest(url);
    const serviceWorkerTestResult = testServiceWorker(url);
    const securityTestResult = testSecurity(url);

    resolve({
      manifest: await maniTestResult,
      service_worker: await serviceWorkerTestResult,
      security: await securityTestResult,
    });
  });
}
