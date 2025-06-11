import {Audit, NetworkRecords} from 'lighthouse';
import * as LH from 'lighthouse/types/lh.js';

class HttpsAudit extends Audit {
  static get meta(): LH.Audit.Meta {
    return {
      id: 'https-audit',
      title: 'HTTPS Security',
      failureTitle: 'Page have HTTPS Security issues',
      description: 'Simple HTTPS Security audit',

      // The name of the custom gatherer class that provides input to this audit.
			// @ts-ignore
      requiredArtifacts: ['devtoolsLogs', 'URL'],
    };
  }

  static async audit(artifacts: LH.Artifacts, context: LH.Audit.Context) {
		const devtoolsLogs = artifacts.devtoolsLogs[Audit.DEFAULT_PASS];
    const networkRecords = await NetworkRecords.request(devtoolsLogs, context);
		const finalRecord = networkRecords.find(record => (record.url == artifacts.URL.finalDisplayedUrl || record.url == artifacts.URL.requestedUrl || record.url == artifacts.URL.mainDocumentUrl));
		// finalRecord?.isSecure;
		// finalRecord?.protocol;
    

    return {
      // Cast true/false to 1/0
      score: Number(finalRecord?.isSecure && finalRecord?.isValid),
    };
  }
}

export default HttpsAudit;