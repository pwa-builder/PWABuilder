import { Icon, Manifest } from "@pwabuilder/manifest-validation";
import { resolveUrl } from "../../utils/url";
import { env } from "../../utils/environment";
import { getHeaders } from "../../utils/platformTrackingHeaders";

// Makes sure the icon URL is valid
export function handleImageUrl(icon: Icon, manifest: Manifest, manifestURL: string) {
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

// Gets full icon URL from manifest given a manifest icon object
export function iconSrcListParse(icon: any, manifest: Manifest, manifestURL: string) {
	let iconURL: string = handleImageUrl(icon, manifest, manifestURL) || '';

	return iconURL;
}

// Tests if an image will load
// If it fails, we use our proxy service to fetch it
// If it succeeds, we load it
export function testImage(url: string) {

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

export async function populateAppCard(siteURL: string, manifest: Manifest, manifestUrl: string) {
	let cleanURL = siteURL.replace(/(^\w+:|^)\/\//, '')

	if(manifest) {

		let icons = manifest.icons;

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
			iconUrl = iconSrcListParse(chosenIcon, manifest, manifestUrl);
		} else {
			iconUrl = "/assets/icons/icon_512.png"
		}

		// this.proxyLoadingImage = true;
		await testImage(iconUrl).then(
			function fulfilled(_img) {
				//console.log('That image is found and loaded', img);
			},

			function rejected() {
				//console.log('That image was not found');
				iconUrl = `https://pwabuilder-safe-url.azurewebsites.net/api/getSafeUrl?url=${iconUrl}`;
			}
		);
		// this.proxyLoadingImage = false;

		return {
			siteName: manifest.short_name
				? manifest.short_name
				: (manifest.name ? manifest.name : 'Untitled App'),
			siteUrl: cleanURL,
			iconURL: iconUrl,
			iconAlt: "Your sites logo",
			description: manifest.description
				? manifest.description
				: 'Add an app description to your manifest',
		};
	} else {
			return {
				siteName: "Missing Name",
				siteUrl: cleanURL,
				description: "Your manifest description is missing.",
				iconURL: "/assets/new/icon_placeholder.png",
				iconAlt: "A placeholder for you sites icon"
			};
	}
}

export async function GetTokenCampaignStatus(): Promise<boolean> {
	
	let headers = getHeaders();

	const fetchStatus = await fetch(
		`${env.validateGiveawayUrl}/GetTokenCampaignStatus`,
		{
			headers: new Headers(headers)
		}
	);

	if (fetchStatus.ok) {
		const json = await fetchStatus.json();
		return json.isAvailable || false;
	}

	return false;
}

export async function CheckUserTokenAvailability(site: string, accessToken: string): Promise<{
		isTokenAvailable: boolean,
		errorMessage: string | null,
		rawError: string | null
	}> {

	let headers = getHeaders();

	const fetchStatus = await fetch(
		`${env.validateGiveawayUrl}/CheckUserTokenAvailability?${new URLSearchParams({ site })}`,
		{
			headers: {
				...new Headers(headers),
				'Authorization': `Bearer ${accessToken}`
			}
		}

	);

	if (fetchStatus.ok) {
		const json = await fetchStatus.json();
		return json;
	}

	return {
		isTokenAvailable: false,
		errorMessage: null,
		rawError: null
	};
}