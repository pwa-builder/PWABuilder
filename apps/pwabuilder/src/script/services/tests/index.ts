import {
  ProgressList,
  RawTestResult,
  Status,
  TestResult,
} from '../../utils/interfaces';
import { getProgress, getResults, setProgress, setResults } from '../app-info';
import { giveOutBadges } from '../badges';
import { testManifest } from './manifest';
import { testSecurity } from './security';
import { testServiceWorker } from './service-worker';

export async function runAllTests(url: string): Promise<RawTestResult> {
  // disabling an eslint check here because we need async
  // here for this function to work properly
  // this is also valid JavaScript
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    try {
      const maniTestResult = testManifest(url);
      const serviceWorkerTestResult = testServiceWorker(url);
      const securityTestResult = testSecurity(url);

      const resultsObject: RawTestResult = {
        manifest: await maniTestResult,
        service_worker: await serviceWorkerTestResult,
        security: await securityTestResult,
      };

      setResults(resultsObject);

      const progress = getProgress();
      updateProgress(progress, resultsObject);

      giveOutBadges();

      resolve(resultsObject);
    } catch (err) {
      reject(err);
    }
  });
}

export function getOverallScore() {
  const results = getResults();

  let manifestScore = 0;
  let swScore = 0;
  let securityScore = 0;

  // gather manifest scores
  // each result is worth 10
  (results?.manifest as TestResult[]).map(result => {
    if (result.result === true) {
      manifestScore = manifestScore + 10;
    }
  });

  (results?.service_worker as TestResult[]).map(result => {
    if (result.result === true) {
      swScore = swScore + 10;
    }
  });

  (results?.security as TestResult[]).map(result => {
    if (result.result === true) {
      securityScore = securityScore + 10;
    }
  });
  
  return manifestScore + swScore + securityScore;
}

function updateProgress(progress: ProgressList, results: RawTestResult) {
  progress.progress[0]!.items[1]!.done = Status.DONE;

  progress.progress[1]!.items.map(item => {
    if (item.name === 'Manifest') {
      if (results && Array.isArray(results.manifest)) {
        if (results.manifest[0]?.result === true) {
          item.done = Status.DONE;
        }
      }
    } else if (item.name === 'Service Worker') {
      if (results && results.service_worker) {
        if (results.service_worker[0]?.result === true) {
          item.done = Status.DONE;
        }
      }
    } else if (item.name === 'Security') {
      if (results && results.security) {
        if (results.security[0]?.result === true) {
          item.done = Status.DONE;
        }
      }
    }
  });

  giveOutBadges();

  const newProgress = progress;
  setProgress(newProgress);
}
