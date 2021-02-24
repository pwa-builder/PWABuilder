import { ProgressList, RawTestResult, Status } from '../../utils/interfaces';
import { getProgress, setProgress, setResults } from '../app-info';
import { testManifest } from './manifest';
import { testSecurity } from './security';
import { testServiceWorker } from './service-worker';

export async function runAllTests(url: string): Promise<RawTestResult> {
  // disabling an eslint check here because we need async
  // here for this function to work properly
  // this is also valid JavaScript
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async resolve => {
    const maniTestResult = testManifest(url);
    const serviceWorkerTestResult = testServiceWorker(url);
    const securityTestResult = testSecurity(url);

    const resultsObject: RawTestResult = {
      manifest: await maniTestResult,
      service_worker: await serviceWorkerTestResult,
      security: await securityTestResult,
    };

    console.log('resultsObject', resultsObject);

    setResults(resultsObject);

    const progress = getProgress();
    updateProgress(progress, resultsObject);

    resolve(resultsObject);
  });
}

function updateProgress(progress: ProgressList, results: RawTestResult) {
  progress.progress[0].items[1].done = Status.DONE;

  progress.progress[1].items.map((item: { name: string; done: Status }) => {
    if (item.name === 'Manifest') {
      if (results && results.manifest) {
        if (results.manifest[0].result === true) {
          item.done = Status.DONE;
        }
      }
    } else if (item.name === 'Service Worker') {
      if (results && results.service_worker) {
        if (results.service_worker[0].result === true) {
          item.done = Status.DONE;
        }
      }
    } else if (item.name === 'Security') {
      if (results && results.security) {
        if (results.security[0].result === true) {
          item.done = Status.DONE;
        }
      }
    }
  });

  const newProgress = progress;
  setProgress(newProgress);
}
