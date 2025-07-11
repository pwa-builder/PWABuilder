import { Validation } from '@pwabuilder/manifest-validation';
import { env } from '../utils/environment';
import { getHeaders } from '../utils/platformTrackingHeaders';
import { TestResult } from '../utils/interfaces';

export type ReportAudit = {
  manifestValidations: Validation[],
  serviceWorkerValidations: TestResult[],
  securityValidations: TestResult[],
	audits: {
		serviceWorker: {
			url?: string,
			scope?: string,
		},
		appleTouchIcon: { score: boolean },
		maskableIcon: { score: boolean },
		splashScreen: { score: boolean },
		themedOmnibox: { score: boolean },
		viewport: { score: boolean }
		images: {
			score: boolean, details: { iconsValidation?: Validation, screenshotsValidation?: Validation }
		}
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
		json: unknown,
		validations: Validation[]
	}
}
export type FindServiceWorkerResult = {
	content: {
		url: string,
		raw: string
	}
}
export type AuditServiceWorkerResult = {
	validations: TestResult[],
}

export async function Report(
	url: string
  ): Promise<ReportAudit> {
	const referrer = sessionStorage.getItem('ref');
	const fetchReport = await fetch(
		`${
			env.api
		}/Report?site=${encodeURIComponent(url)}&desktop=true${referrer ? '&ref=' + encodeURIComponent(referrer) : ''}`,
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
	console.info('AuditServiceWorker succeeded', jsonResult?.validations);
	return jsonResult;
}