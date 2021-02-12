import { TestResult } from '../utils/interfaces';

let site_url: string | undefined;
let results: Array<TestResult> | undefined;

export function setURL(url: string) {
  site_url = url;
  sessionStorage.setItem('current_url', site_url);
}

export function getURL() {
  if (site_url) {
    return site_url;
  } else {
    const url = sessionStorage.getItem('current_url');

    return url || undefined;
  }
}

export function setResults(testResults) {
  results = testResults;
  sessionStorage.setItem('current_results', JSON.stringify(testResults));
}

export function getResults() {
  if (results) {
    return results;
  } else {
    const testResults = sessionStorage.getItem('current_results');

    if (testResults) {
      const parsedResults = JSON.parse(testResults);
      return parsedResults;
    } else {
      return undefined;
    }
  }
}
