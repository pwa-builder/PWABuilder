import {Gatherer} from 'lighthouse';
import * as LH from 'lighthouse/types/lh.js';
import { HTTPResponse } from 'puppeteer';
import ServiceWorkerGatherer from '../service-worker/service-worker-gatherer.js';

class OfflineGatherer extends Gatherer {
  meta: LH.Gatherer.GathererMeta = {
    supportedModes: ['navigation'],
    // @ts-ignore
    dependencies: {ServiceWorkerGatherer: ServiceWorkerGatherer.symbol},
  };
// @ts-ignore
  async getArtifact(context: LH.Gatherer.Context) {
    const {driver, page, dependencies} = context;

    let response: HTTPResponse | null = null;
    if (dependencies['ServiceWorkerGatherer']?.registrations?.length)
      try {
        const offlinePage = await page.browser().newPage();
        await offlinePage.setOfflineMode(true);
        response = await offlinePage.goto(page.url(), { timeout: 2000, waitUntil: 'domcontentloaded'}).then((response) => {
          return response;
        }).catch((error) => {
          return error;
        });
      } catch (error) {}

    if (response?.status && response?.statusText) {
      return {
        status: response?.status(),
        fromServiceWorker: response?.fromServiceWorker(),
        explanation: response?.statusText(),
      }
    }
  
    return {
      status: -1,
      fromServiceWorker: false,
      explanation: 'Timed out waiting for start_url to respond.',
    }
  }
}

export default OfflineGatherer;