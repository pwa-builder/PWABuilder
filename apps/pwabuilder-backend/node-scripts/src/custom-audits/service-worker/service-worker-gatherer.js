import BaseGatherer from "lighthouse/core/gather/base-gatherer.js";
import {
  getServiceWorkerRegistrations,
  getServiceWorkerVersions,
} from "./service-worker-driver.js";

export default class ServiceWorkerGatherer extends BaseGatherer {
  static symbol = Symbol("ServiceWorkerGatherer");

  constructor() {
    super();
    this.meta = {
      symbol: ServiceWorkerGatherer.symbol,
      supportedModes: ["navigation"],
    };
  }

  async getArtifact(context) {
    const session = context.driver.defaultSession;
    const { versions } = await getServiceWorkerVersions(session);
    const { registrations } = await getServiceWorkerRegistrations(session);

    return {
      versions,
      registrations,
    };
  }
}
