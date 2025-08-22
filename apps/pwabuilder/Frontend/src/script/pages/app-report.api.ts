import { Validation } from '@pwabuilder/manifest-validation';
import { env } from '../utils/environment';
import { getHeaders } from '../utils/platformTrackingHeaders';
import { TestResult } from '../utils/interfaces';
import { showToast } from '../services/toasts';

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
		webAppManifestDetails: {
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
};

export type Analysis = {
	id: string,
	url: string,
	createdAt: string,
	lastModifiedAt: string;
	duration: string | null,
	status: "Queued" | "Processing" | "Completed" | "Failed",
	error: string | null,
	webManifest: ManifestDetection | null,
	serviceWorker: ServiceWorkerDetection | null,
	lighthouseReport: LighthouseReport | null,
	logs: string[],
	canPackage: boolean;
	capabilities: PwaCapability[];
}

export type PwaCapability = {
	level: PwaCapabilityLevel;
	category: PwaCapabilityCategory;
	id: PwaCapabilityId,
	featureName: string | null;
	featureIcon: string | null;
	description: string;
	todoAction: string;
	field: string | null;
	learnMoreUrl: string | null;
	imageUrl: string | null;
	status: PwaCapbilityStatus;
	errorMessage: string | null;
}

export type PwaCapabilityLevel = "Required" | "Recommended" | "Optional" | "Feature";

export type PwaCapabilityCategory = "ServiceWorker" | "WebAppManifest" | "Https";

export type PwaCapabilityId = "HasManifest" | "Name" | "Description" | "BackgroundColor" | "Shortcuts" | "Categories" | "Icons" | "Screenshots" | "IconsAreFetchable" | "ScreenshotsAreFetchable";

export type PwaCapbilityStatus = "InProgress" | "Skipped" | "Passed" | "Failed";

export type ManifestDetection = {
	url: string,
	manifest: object,
	manifestRaw: string | null
}

export type ServiceWorkerDetection = {
	url: string,
	raw: string | null,
	validations: TestResult[]
}

export type LighthouseReport = {
	lighthouseVersion: string | null,
	requestedUrl: string | null,
	mainDocumentUrl: string | null,
	finalDisplayedUrl: string | null,
	fetchTime: string,
	gatherMode: string | null,
	runWarnings: string[] | null,
	userAgent: string | null
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

/**
 * Queues an analysis job for the specified site.
 * @param site The site URL to analyze.
 * @returns The ID of the queued analysis job.
 */
export async function enqueueAnalysis(site: string): Promise<string> {
	const absoluteUrl = `${env.api}/analyses/enqueue?url=${encodeURIComponent(site)}`;
	
	try {
		const enqueueResult = await fetch(absoluteUrl, {
			method: "POST"
		});
		if (!enqueueResult.ok) {
			throw new Error(`Unable to enqueue analysis job for site. Status ${enqueueResult.status} ${enqueueResult.statusText}`);
		}
		
		const analysisId = await enqueueResult.text();
		return analysisId;
	} catch (error) {
		showToast("Unable to analyze your web app", `${error}`.substring(0, 100), "danger", "exclamation-octagon");
		throw error;
	}
}

/**
 * Gets the analysis with the specified ID.
 * @param id The ID of the analysis to retrieve.
 * @returns The analysis with the specified ID, or null if not found.
 */
export async function getAnalysis(id: string): Promise<Analysis | null> {
	const absoluteUrl = `${env.api}/analyses?id=${encodeURIComponent(id)}`;
	try {
		const fetchResult = await fetch(absoluteUrl);
		if (!fetchResult.ok) {
			throw new Error(`Unable to fetch analysis with ID ${id}. Status ${fetchResult.status} ${fetchResult.statusText}`);
		}

		// If the status is 204, it means we couldn't find the Analysis.
		if (fetchResult.status === 204) {
			return null;
		}

		const jsonResult = await fetchResult.json();
		return jsonResult;
	} catch (error) {
		showToast("Unable to check the status of your web app's PWA features", `${error}`.substring(0, 100), "danger", "exclamation-octagon");
		throw error;
	}
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