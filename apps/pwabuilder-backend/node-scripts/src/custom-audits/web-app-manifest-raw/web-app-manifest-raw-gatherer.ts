import BaseGatherer from 'lighthouse/core/gather/base-gatherer.js';
import * as LH from 'lighthouse/types/lh.js';

type FetchAppManifestResult = {
	error?: string;
	url?: string;
	data?: string;
	errors?: { message: string }[];
};

class WebAppManifestRawGatherer extends BaseGatherer {
	static symbol = Symbol('WebAppManifestRawGatherer');

	meta: LH.Gatherer.GathererMeta = {
		symbol: WebAppManifestRawGatherer.symbol,
		supportedModes: ['navigation'],
	};

	static async fetchAppManifest(session: LH.Gatherer.ProtocolSession): Promise<FetchAppManifestResult> {
		session.setNextProtocolTimeout(10000);
		let response;
		try {
			response = await session.sendCommand('Page.getAppManifest');
		} catch (err: any) {
			if (err.code === 'PROTOCOL_TIMEOUT') {
				return { error: 'Protocol timeout while fetching manifest' };
			}

			return { error: `Error fetching manifest: ${err.message || err}` };
		}

		let data: string | undefined = response?.data;

		if (!data) {
			return { error: 'No manifest data returned' };
		}

		const BOM_LENGTH = 3;
		const BOM_FIRSTCHAR = 65279;
		const isBomEncoded = data.charCodeAt(0) === BOM_FIRSTCHAR;

		if (isBomEncoded) {
			data = Buffer.from(data).slice(BOM_LENGTH).toString();
		}

		return { ...response, data };
	}

	async getArtifact(context: LH.Gatherer.Context): Promise<any> {
		const driver = context.driver;
		try {
			const response = await WebAppManifestRawGatherer.fetchAppManifest(driver.defaultSession);

			if (response.error) {
				return {
					errorMessage: response.error,
					manifestUrl: response.url ?? null,
					manifestRaw: null,
				};
			}

			return {
				errorMessage: response.errors?.[0]?.message ?? null,
				manifestUrl: response.url ?? null,
				manifestRaw: response.data ?? null,
			};
		} catch (error: any) {
			return {
				errorMessage: `Exception in WebAppManifestRawGatherer.getArtifact: ${error?.message || error}`,
				manifestUrl: null,
				manifestRaw: null,
			};
		}
	}
}

export default WebAppManifestRawGatherer;
