import * as LH from 'lighthouse/types/lh.js';

interface CustomArtifacts extends LH.Artifacts {
	ServiceWorkerGatherer: any,
	OfflineGatherer: any
}

export default CustomArtifacts;