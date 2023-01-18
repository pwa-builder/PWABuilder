import { Manifest } from '@pwabuilder/manifest-validation';
import { env } from '../utils/environment';
import { ManifestContext, ServiceWorkerDetectionResult, TestResult } from '../utils/interfaces';
import { createManifestContextFromEmpty } from '../services/manifest';

export type ReportAudit = {
	audits: {
		isOnHttps: { score: boolean },
		installableManifest: {
		  score: boolean,
		  details: { url?: string }
		},
		serviceWorker: {
		  score: boolean,
		  details: {
			url?: string,
			scope?: string,
			features?: { detectedBackgroundSync: boolean,
				detectedPeriodicBackgroundSync: boolean,
				detectedPushRegistration: boolean,
				detectedSignsOfLogic: boolean,
				raw?: string[] }
			}
		  },
		appleTouchIcon: { score: boolean },
		maskableIcon: { score: boolean },
		splashScreen: { score: boolean },
		themedOmnibox: { score: boolean },
		viewport: { score: boolean }
	},
	artifacts: {
		webAppManifest: {
			raw: string,
			url: string,
			value: unknown
		},
		serviceWorker: {
			registrations: unknown[],
			versions: unknown[],
			raw?: string
		},
		url: string,
		linkElements: unknown[],
		metaElements: unknown[]
	}
}

export async function Report(
	url: string
  ): Promise<ReportAudit> {
	const fetchReport = await fetch(
	  `${
		env.apiV2
	  }/Report?site=${encodeURIComponent(url)}`
	);
	if (!fetchReport.ok) {
	  console.warn(
		'Unable to audit due to HTTP error',
		fetchReport.status,
		fetchReport.statusText
	  );
	  throw new Error(
		`Report audit failed due to HTTP error ${fetchReport.status} ${fetchReport.statusText}`
	  );
	}

	const jsonResult: { data: ReportAudit } = await fetchReport.json();
	console.info('Report audit succeeded', jsonResult?.data);
	return jsonResult?.data;
}

export async function processManifest(appUrl: string, manifestArtifact?: ReportAudit['artifacts']['webAppManifest']): Promise<ManifestContext> {
	let manifestContext: ManifestContext;
	let manifest: Manifest;

	if ( manifestArtifact?.raw ) {
		manifest = JSON.parse(manifestArtifact.raw);

		manifestContext = {
			manifest,
			manifestUrl: manifestArtifact?.url || '',
			isEdited: false,
			isGenerated: false,
			siteUrl: appUrl
		}
	}
	else {
		manifestContext = await createManifestContextFromEmpty(appUrl);
	}

	return manifestContext;
}

export function processServiceWorker(audits: ReportAudit['audits']): Array<TestResult> {
	console.info('Testing Service Worker');

	const worksOffline: boolean = audits.installableManifest.score;
	const swFeatures = audits.serviceWorker.details?.features || null;

	const swTestResult = [
	  {
		result: audits.serviceWorker.score,
		infoString: audits.serviceWorker.score ? 'Has a Service Worker' : 'Does not have a Service Worker',
		category: 'required',
	  },
	  {
		result: worksOffline,
		infoString: worksOffline ? 'Works Offline' : 'Does not work offline',
		category: 'recommended',
	  },
	  {
		result: swFeatures?.detectedPeriodicBackgroundSync || false,
		infoString: swFeatures?.detectedPeriodicBackgroundSync ? 'Uses Periodic Sync for a rich offline experience' : 'Does not use Periodic Sync for a rich offline experience',
		category: 'optional',
	  },
	  {
		result: swFeatures?.detectedBackgroundSync || false,
		infoString: swFeatures?.detectedBackgroundSync ? 'Uses Background Sync for a rich offline experience' : 'Does not use Background Sync for a rich offline experience',
		category: 'optional',
	  },
	];

	return swTestResult;
  }

  export function processSecurity(audits: ReportAudit['audits']): Array<TestResult> {


	//TODO: Adjust this to use the new security audits

	const organizedResults = [
	  {
		result: audits.isOnHttps.score,
		infoString: audits.isOnHttps.score ? 'Uses HTTPS' : 'Does not use HTTPS',
		category: 'required',
	  },
	  {
		result: audits.isOnHttps.score,
		infoString: audits.isOnHttps.score ? 'Has a valid SSL certificate' : 'Does not have a valid SSL certificate',
		category: 'required',
	  },
	  {
		result: audits.isOnHttps.score,
		infoString: audits.isOnHttps.score ? 'No mixed content on page' : 'Uses mixed content on page',
		category: 'required',
	  },
	];

	return organizedResults;
  }