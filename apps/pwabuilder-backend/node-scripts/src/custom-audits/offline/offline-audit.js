import { Audit } from "lighthouse";

export default class OfflineAudit extends Audit {
  static get meta() {
    return {
      id: "offline-audit",
      title: "Offline Support Audit",
      failureTitle: "Default page is not available offline",
      description: "Simple offline support audit",
      requiredArtifacts: [
        "OfflineGatherer",
        "ServiceWorkerGatherer",
        "WebAppManifest",
      ],
    };
  }

  static audit(artifacts) {

    const response = artifacts.OfflineGatherer;
    const success = response.status == 200 && response.fromServiceWorker;

    return {
      score: Number(success),
    };
  }
}
