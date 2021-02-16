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
    }

    setResults(resultsObject);

    const progress = getProgress();
    updateProgress(progress)

    resolve(resultsObject);
  });
}

function updateProgress(progress) {
  progress.progress[0].items[1].done = Status.DONE;

  const newProgress = progress;
  setProgress(newProgress);
}

