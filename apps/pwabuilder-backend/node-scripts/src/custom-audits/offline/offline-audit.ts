import { Audit } from 'lighthouse';
import * as LH from 'lighthouse/types/lh.js';

export default class OfflineAudit extends Audit {
	static get meta(): LH.Audit.Meta {
		return {
			id: 'offline-audit',
			title: 'Offline Support Audit',
			failureTitle: 'Default page is not available offline',
			description: 'Simple offline support audit',
			// The name of the custom gatherer class that provides input to this audit.
			requiredArtifacts: [
				'OfflineGatherer',
				'ServiceWorkerGatherer',
				'WebAppManifest',
			] as any[],
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
