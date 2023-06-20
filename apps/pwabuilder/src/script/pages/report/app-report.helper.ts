import { Manifest, Validation, validateManifest } from '@pwabuilder/manifest-validation';
import { Icon, ManifestContext, TestResult } from '../../utils/interfaces';
import { createManifestContextFromEmpty, fetchOrCreateManifest } from '../../services/manifest';
import { ReportAudit } from './app-report.api';
import { resolveUrl } from '../../utils/url';

// Polling function that updates the time that the site was last tested
export function pollLastTested(){
  let last = new Date(JSON.parse(sessionStorage.getItem('last_tested')!));
  let now = new Date();
  let diff = now.getTime() - last.getTime();

  let lastTested = "";

  if(diff < 60000){
    lastTested = "Last tested seconds ago";
  } else if (diff < 3600000) {
    let mins = Math.floor(diff / 60000);
    lastTested = "Last tested " + mins + " minutes ago";
  } else if (diff < 86400000) {
    let hours = Math.floor(diff / 3600000);
    lastTested = "Last tested " + hours + " hours ago";
  } else {
    let days = Math.floor(diff / 86400000);
    lastTested = "Last tested " + days + " days ago";
  }
  return lastTested;
}

export async function populateAppCard(manifestContext: ManifestContext, url: string) {
  let cleanURL = url.replace(/(^\w+:|^)\/\//, '')

  let appCard = {
    siteName: "Missing Name",
    siteUrl: cleanURL,
    description: "Your manifest description is missing.",
    iconURL: "/assets/new/icon_placeholder.png",
    iconAlt: "A placeholder for you sites icon"
  };

  if (manifestContext && !manifestContext.isGenerated) {
    const parsedManifestContext = manifestContext;

    let icons = parsedManifestContext.manifest.icons;

    let chosenIcon: any;

    if(icons){
      let maxSize = 0;
      for(let i = 0; i < icons.length; i++){
        let icon = icons[i];
        let size = icon.sizes?.split("x")[0];
        if(size === '512'){
          chosenIcon = icon;
          break;
        } else{
          if(parseInt(size!) > maxSize){
            maxSize = parseInt(size!);
            chosenIcon = icon;
          }
        }
      }
    }

    let iconUrl: string;
    if(chosenIcon){
      iconUrl = iconSrcListParse(chosenIcon, manifestContext);
    } else {
      iconUrl = "/assets/icons/icon_512.png"
    }

    await testImage(iconUrl).then(
      function fulfilled(_img: any) {
        //console.log('That image is found and loaded', img);
      },

      function rejected() {
        //console.log('That image was not found');
        iconUrl = `https://pwabuilder-safe-url.azurewebsites.net/api/getSafeUrl?url=${iconUrl}`;
      }
    );

    appCard = {
      siteName: parsedManifestContext.manifest.short_name
        ? parsedManifestContext.manifest.short_name
        : (parsedManifestContext.manifest.name ? parsedManifestContext.manifest.name : 'Untitled App'),
      siteUrl: cleanURL,
      iconURL: iconUrl,
      iconAlt: "Your sites logo",
      description: parsedManifestContext.manifest.description
        ? parsedManifestContext.manifest.description
        : 'Add an app description to your manifest',
    }
  }
  return appCard;
}

// Gets full icon URL from manifest given a manifest icon object
function iconSrcListParse(icon: any, manifestContext: ManifestContext) {
  let manifest = manifestContext.manifest;
  let manifestURL = manifestContext.manifestUrl;
  let iconURL: string = handleImageUrl(icon, manifest, manifestURL) || '';

  return iconURL;
}

// Makes sure the icon URL is valid
function handleImageUrl(icon: Icon, manifest: Manifest, manifestURL: string) {
  if (icon.src.indexOf('data:') === 0 && icon.src.indexOf('base64') !== -1) {
    return icon.src;
  }

  let url = resolveUrl(manifestURL, manifest?.startUrl);
  url = resolveUrl(url?.href, icon.src);

  if (url) {
    return url.href;
  }

  return undefined;
}

// Tests if an image will load
// If it fails, we use our proxy service to fetch it
// If it succeeds, we load it
function testImage(url: string) {

  // Define the promise
  const imgPromise = new Promise(function imgPromise(resolve, reject) {

      // Create the image
      const imgElement = new Image();

      // When image is loaded, resolve the promise
      imgElement.addEventListener('load', function imgOnLoad() {
          resolve(this);
      });

      // When there's an error during load, reject the promise
      imgElement.addEventListener('error', function imgOnError() {
          reject();
      })

      // Assign URL
      imgElement.src = url;

  });

  return imgPromise;
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

export async function runManifestTests(manifest: Manifest){
	const validationResults = await validateManifest(manifest, true);

	let todos: unknown[] = [];

	//  This just makes it so that the valid things are first
	// and the invalid things show after.
	validationResults.sort((a: Validation, b: Validation) => {
		if(a.valid && !b.valid){
			return 1;
		} else if(b.valid && !a.valid){
			return -1;
		} else {
			return a.member.localeCompare(b.member);
		}
	});

	let manifestTotalScore = validationResults.length;
	let manifestValidCounter = 0;
	let manifestRequiredCounter = 0;
	let manifestRecCounter = 0;
	let manifestEnhCounter = 0;
	let passedEnhancement = 0;

	validationResults.forEach((test: Validation) => {
		if(test.valid){
			manifestValidCounter++;
			if(test.category === "enhancement"){
				passedEnhancement++;
			}
		} else {
			let status ="";
			if(test.category === "required" || test.testRequired){
				status = "required";
				manifestRequiredCounter++;
			} else if(test.category === "recommended"){
				status = "recommended";
				manifestRecCounter++;
			} else if(test.category === "enhancement"){
				status = "enhancement";
				manifestEnhCounter++;
			} else {
				status = "optional";
			}
			todos.push({"card": "mani-details", "field": test.member, "displayString": test.displayString ?? "", "fix": test.errorString, "status": status});
		}
	});
	return {
		manifestBreakdown: {
			total: manifestTotalScore,
			valid: manifestValidCounter,
			failedRequired: manifestRequiredCounter,
			failedRecommended: manifestRecCounter,
			failedEnhancement: manifestEnhCounter,
			passedEnhancement: passedEnhancement
		},
		todos: todos,
		results: validationResults
	}
}