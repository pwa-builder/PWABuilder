import { testManifest } from './manifest';
import { testServiceWorker } from './service-worker';

export async function runAllTests(url: string) {
  return new Promise(async (resolve, reject) => {
    try {
      const manifestTestResults = testManifest(url);
      const serviceWorkerResults = testServiceWorker(url);

      resolve({
        manifest: await manifestTestResults,
        service_worker: await serviceWorkerResults,
      });
    } catch (err) {
      console.error(err);
      reject(`Couldnt run all tests: ${err}`);
    }
  });
}
