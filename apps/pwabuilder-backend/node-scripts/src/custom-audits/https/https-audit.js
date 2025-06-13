import { Audit, NetworkRecords } from "lighthouse";

export default class HttpsAudit extends Audit {
  static get meta() {
    return {
      id: "https-audit",
      title: "HTTPS Security",
      failureTitle: "Page have HTTPS Security issues",
      description: "Simple HTTPS Security audit",
      requiredArtifacts: ["devtoolsLogs", "URL"],
    };
  }
  static async audit(artifacts, context) {
    const devtoolsLogs = artifacts.devtoolsLogs[Audit.DEFAULT_PASS];
    const networkRecords = await NetworkRecords.request(devtoolsLogs, context);
    const finalRecord = networkRecords.find(
      (record) =>
        record.url == artifacts.URL.finalDisplayedUrl ||
        record.url == artifacts.URL.requestedUrl ||
        record.url == artifacts.URL.mainDocumentUrl
    );

    return {
      score: Number(finalRecord?.isSecure && finalRecord?.isValid),
    };
  }
}
