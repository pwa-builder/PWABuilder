import { Audit } from 'lighthouse';
import * as LH from 'lighthouse/types/lh.js';

type WebAppManifestRawArtifact = {
	errorMessage: string | null;
	manifestUrl: string | null;
	manifestRaw: string | null;
};

export default class WebAppManifestRawAudit extends Audit {
	static get meta(): LH.Audit.Meta {
		return {
			id: 'web-app-manifest-raw-audit',
			title: 'Manifest is present and fetched',
			failureTitle: 'Manifest missing or not fetched',
			description: 'Checks if the manifest URL is present and fetchable.',
			supportedModes: ['navigation'],
			requiredArtifacts: ['WebAppManifestRawGatherer'] as any,
		};
	}

	static audit(artifacts): LH.Audit.Product {
		const manifestArtifact = artifacts.WebAppManifestRawGatherer as WebAppManifestRawArtifact;

		if (!manifestArtifact?.manifestRaw) {
			return {
				score: 0,
				explanation: manifestArtifact?.errorMessage || 'No manifest fetched',
			};
		}

		return {
			score: 1,
			details: {
				type: 'debugdata',
				manifestUrl: manifestArtifact.manifestUrl,
				manifestRaw: manifestArtifact.manifestRaw,
			},
		};
	}
}
