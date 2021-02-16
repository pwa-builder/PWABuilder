import { Status, TestResult } from '../../utils/interfaces';
import { getProgress, setProgress, setResults } from '../app-info';
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

    const resultsObject = {
      manifest: await maniTestResult,
      service_worker: await serviceWorkerTestResult,
      security: await securityTestResult,
    };

    setResults(resultsObject);

    const progress = getProgress();
    updateProgress(progress, resultsObject);

    resolve(resultsObject);
  });
}

function updateProgress(progress, results) {
  progress.progress[0].items[1].done = Status.DONE;

  progress.progress[1].items.map(item => {
    if (item.title === 'Manifest') {
      if (results && results.manifest) {
        if (results.manifest[0].result === true) {
          item.status = Status.DONE;
        }
      }
    } else if (item.title === 'Service Worker') {
      if (results && results.service_worker) {
        if (results.service_worker[0].result === true) {
          item.status = Status.DONE;
        }
      }
    } else if (item.title === 'Security') {
      if (results && results.security) {
        if (results.security[0].result === true) {
          item.status = Status.DONE;
        }
      }
    }
  });

  const newProgress = progress;
  setProgress(newProgress);
}
