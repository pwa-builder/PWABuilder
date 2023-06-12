import { Manifest } from '@pwabuilder/manifest-validation';
import { ManifestContext, TestResult } from '../utils/interfaces';
import { createManifestContextFromEmpty } from '../services/manifest';
import { ReportAudit } from './app-report.api';

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

export function processServiceWorker(serviceWorker?: ReportAudit['audits']['serviceWorker']/*,installable?: boolean*/): Array<TestResult> {
	console.info('Testing Service Worker');

	const swFeatures = serviceWorker?.details?.features || null;

	const swTestResult = [
	  {
		result: serviceWorker?.score || false,
		infoString: serviceWorker?.score ? 'Has a Service Worker' : 'Does not have a Service Worker',
		category: 'highly recommended',
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
	// TODO: move installability from here
	// if (typeof installable == 'boolean') {
	// 	swTestResult.push(
	// 		{
	// 		  result: installable,
	// 		  infoString: installable ? 'Installable' : 'App is not installable',
	// 		  category: 'required',
	// 		});
	// }

	return swTestResult;
  }

  export function processSecurity(audits?: ReportAudit['audits']): Array<TestResult> {


	// TODO: Adjust this to use the new security audits
	// Installable can't be not on https, probably mixed content due redirects.
	const isOnHttps = audits?.isOnHttps?.score || audits?.installableManifest?.score || false;
	const noMixedContent = audits?.isOnHttps?.score || false;

	const organizedResults = [
	  {
		result: isOnHttps,
		infoString: isOnHttps ? 'Uses HTTPS' : 'Does not use HTTPS',
		category: 'required',
	  },
	  {
		result: isOnHttps,
		infoString: isOnHttps ? 'Has a valid SSL certificate' : 'Does not have a valid SSL certificate',
		category: 'required',
	  },
	  {
		result: noMixedContent,
		infoString: noMixedContent ? 'No mixed content on page' : 'Uses mixed content on page or http redirect on loads',
		category: 'required',
	  },
	];

	return organizedResults;
  }