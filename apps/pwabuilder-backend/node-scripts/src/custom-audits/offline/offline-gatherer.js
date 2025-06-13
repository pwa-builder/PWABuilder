import { Gatherer } from "lighthouse";
import ServiceWorkerGatherer from "../service-worker/service-worker-gatherer.js";

export default class OfflineGatherer extends Gatherer {
  constructor() {
    super();
    this.meta = {
      supportedModes: ["navigation"],
      dependencies: { ServiceWorkerGatherer: ServiceWorkerGatherer.symbol },
    };
  }

  async getArtifact(context) {
    const { page, dependencies } = context;

    let response = null;
    if (dependencies["ServiceWorkerGatherer"]?.registrations?.length) {
      try {
        const offlinePage = await page.browser().newPage();
        await offlinePage.setOfflineMode(true);
        response = await offlinePage
          .goto(page.url(), { timeout: 2000, waitUntil: "domcontentloaded" })
          .then((resp) => resp)
          .catch((error) => error);
      } catch (error) {}
    }

    if (response?.status && response?.statusText) {
      return {
        status: response.status(),
        fromServiceWorker: response.fromServiceWorker(),
        explanation: response.statusText(),
      };
    }

    return {
      status: -1,
      fromServiceWorker: false,
      explanation: "Timed out waiting for start_url to respond.",
    };
  }
}
