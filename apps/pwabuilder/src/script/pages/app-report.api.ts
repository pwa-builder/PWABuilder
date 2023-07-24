import { env } from '../utils/environment';
import { getHeaders } from '../utils/platformTrackingHeaders';

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
			raw?: string,
			url?: string,
			value?: unknown,
			json?: unknown
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
export type FindWebManifestResult = {
	content: {
		url: string,
		raw: string,
		json: unknown
	}
}
export type FindServiceWorkerResult = {
	content: {
		url: string,
		raw: string
	}
}
export type AuditServiceWorkerResult = {
	content: {
		score: boolean,
		details:{
			url: string,
			features: ReportAudit['audits']['serviceWorker']['details']['features']
		}
	}
}

export async function Report(
	url: string
  ): Promise<ReportAudit> {
	const fetchReport = await fetch(
		`${
			env.api
		}/Report?site=${encodeURIComponent(url)}&desktop=true`,
		{
			headers: new Headers(getHeaders())
		}
	);

	if (!fetchReport?.ok) {
	  console.warn(
		'Unable to audit due to HTTP error',
		fetchReport.status,
		fetchReport.statusText
	  );
	  throw new Error(
		`Report audit failed due to HTTP error ${fetchReport.status} ${fetchReport.statusText}`
	  );
	}

	const jsonResult: { data: ReportAudit } = await (fetchReport as Response)?.json?.();
	console.info('Report audit succeeded', jsonResult?.data);
	return jsonResult?.data;
}

export async function FindWebManifest(
	site: string
  ): Promise<FindWebManifestResult> {
	const fetchReport = await fetch(
	  `${
		env.api
	  }/FindWebManifest?site=${encodeURIComponent(site)}`
	);
	if (!fetchReport.ok) {
	  console.warn(
		'Unable to FindWebManifest due to HTTP error',
		fetchReport.status,
		fetchReport.statusText
	  );
	  throw new Error(
		`FindWebManifest failed due to HTTP error ${fetchReport.status} ${fetchReport.statusText}`
	  );
	}

	const jsonResult: FindWebManifestResult = await fetchReport.json();
	console.info('FindWebManifest succeeded', jsonResult?.content);
	return jsonResult;
}

export async function FindServiceWorker(
	site: string
  ): Promise<FindServiceWorkerResult> {
	const fetchReport = await fetch(
	  `${
		env.api
	  }/FindServiceWorker?site=${encodeURIComponent(site)}`
	);
	if (!fetchReport.ok) {
	  console.warn(
		'Unable to FindServiceWorker due to HTTP error',
		fetchReport.status,
		fetchReport.statusText
	  );
	  throw new Error(
		`FindServiceWorker failed due to HTTP error ${fetchReport.status} ${fetchReport.statusText}`
	  );
	}

	const jsonResult: FindServiceWorkerResult = await fetchReport.json();
	console.info('FindServiceWorker succeeded', jsonResult?.content);
	return jsonResult;
}

export async function AuditServiceWorker(
	url: string
  ): Promise<AuditServiceWorkerResult> {
	const fetchReport = await fetch(
	  `${
		env.api
	  }/AuditServiceWorker?url=${encodeURIComponent(url)}`
	);
	if (!fetchReport.ok) {
	  console.warn(
		'Unable to AuditServiceWorker due to HTTP error',
		fetchReport.status,
		fetchReport.statusText
	  );
	  throw new Error(
		`AuditServiceWorker failed due to HTTP error ${fetchReport.status} ${fetchReport.statusText}`
	  );
	}

	const jsonResult: AuditServiceWorkerResult = await fetchReport.json();
	console.info('AuditServiceWorker succeeded', jsonResult?.content);
	return jsonResult;
}