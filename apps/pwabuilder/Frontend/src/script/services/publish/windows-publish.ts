import { Manifest } from '@pwabuilder/manifest-validation';
import { env } from '../../utils/environment';
import { findBestAppIcon } from '../../utils/icons';
import {
    generateWindowsPackageId,
    validateWindowsOptions,
    WindowsPackageOptions,
} from '../../utils/win-validation';
import { getURL, getManifestUrl } from '../app-info';
import { fetchOrCreateManifest } from '../manifest';
import { getHeaders } from '../../utils/platformTrackingHeaders';

export let hasGeneratedWindowsPackage = false;

export async function generateWindowsPackage(
    windowsOptions: WindowsPackageOptions
) {
    if (!windowsOptions) {
        // this.showErrorMessage("Invalid Windows options. No options specified.");
        throw new Error('Invalid Windows options. No options specified.');
    }

    // sets en-us as the default fallback
    if (!windowsOptions.resourceLanguage || windowsOptions.resourceLanguage.length === 0) {
        windowsOptions.resourceLanguage = 'en-us';
    }
    // the api expects a comma separated string instead of a list, so we do it this way
    else {
        if (typeof (windowsOptions.resourceLanguage) != "string") {
            windowsOptions.resourceLanguage = (windowsOptions.resourceLanguage as string[])!.join(",");
        }
    }

    const validationErrors = validateWindowsOptions(windowsOptions);
    if (validationErrors.length > 0 || !windowsOptions) {
        throw new Error(
            'Invalid Windows options. ' +
            validationErrors.map(a => a.error).join('\n')
        );
    }

    let headers = { ...getHeaders(), 'content-type': 'application/json' };

    const referrer = sessionStorage.getItem('ref');
    const response = await fetch(`${env.windowsPackageGeneratorUrl}${referrer ? '?ref=' + encodeURIComponent(referrer) : ''}`, {
        method: 'POST',
        body: JSON.stringify(windowsOptions),
        headers: new Headers(headers),
    });

    if (response.status === 200) {
        const data = await response.blob();

        //set generated flag
        hasGeneratedWindowsPackage = true;
        return data;
    } else {
        const responseText = await response.text();
        let err = new Error(
            `Failed. Status code ${response.status}, Error: ${response.statusText}, Details: ${responseText}`
        );
        Object.defineProperty(response, "stack_trace", { value: responseText });
        //@ts-ignore
        err.response = response;
        throw err;

    }
}

export function emptyWindowsPackageOptions(): WindowsPackageOptions {
    return {
        name: '',
        packageId: '',
        url: '',
        version: '1.0.0.1',
        manifestUrl: '',
        classicPackage: {
            generate: true,
            version: '1.0.0.0',
            url: '',
        },
        publisher: {
            displayName: '',
            commonName: '',
        },
    };
}

export function createWindowsPackageOptionsFromManifest(
    manifest: Manifest
): WindowsPackageOptions {
    const maniURL = getManifestUrl();
    const pwaURL = getURL();

    if (!pwaURL) {
        throw new Error("Can't find the current URL");
    }

    if (!maniURL) {
        throw new Error('Cant find the manifest URL');
    }

    const name = manifest.short_name || manifest.name || 'My PWA';
    const packageID = generateWindowsPackageId(new URL(pwaURL).hostname);
    const manifestIcons = manifest.icons || [];

    let languages: string[] = [];
    if (manifest.lang) {
        for (let i = 0; i < windowsLanguages.length; i++) {
            let lang = windowsLanguages[i];
            if (lang.codes.includes(manifest.lang.toLowerCase())) {
                languages.push(manifest.lang.toLowerCase())
                break;
            }
        }
    }

    const icon = findBestAppIcon(manifestIcons);
    const options: WindowsPackageOptions = {
        name: name as string,
        packageId: packageID,
        url: pwaURL,
        version: '1.0.1',
        allowSigning: true,
        publisher: {
            displayName: 'Contoso, Inc.',
            commonName: 'CN=3a54a224-05dd-42aa-85bd-3f3c1478fdca',
        },
        generateModernPackage: true,
        classicPackage: {
            generate: true,
            version: '1.0.0',
            url: pwaURL,
        },
        edgeHtmlPackage: {
            generate: false,
        },
        manifestUrl: maniURL,
        manifest: manifest,
        images: {
            baseImage: icon?.src || '',
            backgroundColor: 'transparent',
            padding: 0.0,
        },
        resourceLanguage: languages,
        enableWebAppWidgets: Object.keys(manifest).includes("widgets"),
    };

    return options;
}

export async function createWindowsPackageOptionsFromForm(
    form: HTMLFormElement
): Promise<WindowsPackageOptions> {
    let manifest: Manifest;
    try {
        const manifestContext = await fetchOrCreateManifest();
        manifest = manifestContext!.manifest;
    } catch {
        return createEmptyPackageOptions();
    }

    const name = form.appName.value || manifest.short_name || manifest.name;
    const packageID = form.packageId.value;
    const manifestIcons = manifest.icons || [];
    const icon = findBestAppIcon(manifestIcons);
    const baseImageAbsoluteUrl = new URL(form.iconUrl.value || icon?.src, getManifestUrl());
    return {
        name: name,
        packageId: packageID,
        url: form.url.value || getURL(),
        version: form.appVersion.value || '1.0.1',
        allowSigning: true,
        publisher: {
            displayName: form.publisherDisplayName.value,
            commonName: form.publisherId.value,
        },
        generateModernPackage: true,
        classicPackage: {
            generate: true,
            version: form.classicVersion.value || '1.0.0',
            url: form.url.value || getURL(),
        },
        edgeHtmlPackage: {
            generate: false,
        },
        manifestUrl: form.manifestUrl.value || getManifestUrl(),
        manifest: manifest,
        images: {
            baseImage: baseImageAbsoluteUrl.toString(),
            backgroundColor: 'transparent', // TODO: should we let the user specify image background color in the form?
            padding: 0.0,
        },
        resourceLanguage: form.windowsLanguageInput.value || 'EN-US',
    };
}

function createEmptyPackageOptions(): WindowsPackageOptions {
    return {
        name: '',
        packageId: '',
        url: '',
        version: '',
        publisher: {
            displayName: '',
            commonName: '',
        },
    };
}

export const windowsLanguages = [
    { "codes": ["ar", "ar-sa", "ar-ae", "ar-bh", "ar-dz", "ar-eg", "ar-iq", "ar-jo", "ar-kw", "ar-lb", "ar-ly", "ar-ma", "ar-om", "ar-qa", "ar-sy", "ar-tn", "ar-ye"], "name": "Arabic" },
    { "codes": ["af", "af-za"], "name": "Afrikaans" },
    { "codes": ["sq", "sq-al"], "name": "Albanian" },
    { "codes": ["am", "am-et"], "name": "Amharic" },
    { "codes": ["hy", "hy-am"], "name": "Armenian" },
    { "codes": ["as", "as-in"], "name": "Assamese" },
    { "codes": ["az-arab", "az-arab-az", "az-cyrl", "az-cyrl-az", "az-latn", "az-latn-az"], "name": "Azerbaijani" },
    { "codes": ["eu", "eu-us"], "name": "Basque (Basque)" },
    { "codes": ["be", "be-by"], "name": "Belarusian" },
    { "codes": ["bn", "bn-bd", "bn-in"], "name": "Bangla" },
    { "codes": ["bs", "bs-cyrl", "bs-cyrl-ba", "bs-latn", "bs-latn-ba"], "name": "Bosnian" },
    { "codes": ["bg", "bg-bg"], "name": "Bulgarian" },
    { "codes": ["ca", "ca-es", "ca-es-valencia"], "name": "Catalan" },
    { "codes": ["chr-cher", "chr-cher-us", "chr-latn"], "name": "Cherokee" },
    { "codes": ["zh-Hans", "zh-cn", "zh-hans-cn", "zh-sg", "zh-hans-sg"], "name": "Chinese (Simplified)" },
    { "codes": ["zh-Hant", "zh-hk", "zh-mo", "zh-tw", "zh-hant-hk", "zh-hant-mo", "zh-hant-tw"], "name": "Chinese (Traditional)" },
    { "codes": ["hr", "hr-hr", "hr-ba"], "name": "Croatian" },
    { "codes": ["cs", "cs-cz"], "name": "Czech" },
    { "codes": ["da", "da-dk"], "name": "Danish" },
    { "codes": ["prs", "prs-af", "prs-arab"], "name": "Dari" },
    { "codes": ["nl", "nl-nl", "nl-be"], "name": "Dutch" },
    { "codes": ["en", "en-au", "en-ca", "en-gb", "en-ie", "en-in", "en-nz", "en-sg", "en-us", "en-za", "en-bz", "en-hk", "en-id", "en-jm", "en-kz", "en-mt", "en-my", "en-ph", "en-pk", "en-tt", "en-vn", "en-zw", "en-053", "en-021", "en-029", "en-011", "en-018", "en-014"], "name": "English" },
    { "codes": ["et", "et-ee"], "name": "Estonian" },
    { "codes": ["fil", "fil-latn", "fil-ph"], "name": "Filipino" },
    { "codes": ["fi", "fi-fi"], "name": "Finnish" },
    { "codes": ["fr", "fr-be", "fr-ca", "fr-ch", "fr-fr", "fr-lu", "fr-015", "fr-cd", "fr-ci", "fr-cm", "fr-ht", "fr-ma", "fr-mc", "fr-ml", "fr-re", "frc-latn", "frp-latn", "fr-155", "fr-029", "fr-021", "fr-011"], "name": "French" },
    { "codes": ["gl", "gl-es"], "name": "Galician" },
    { "codes": ["ka", "ka-ge"], "name": "Georgian" },
    { "codes": ["de", "de-at", "de-ch", "de-de", "de-lu", "de-li"], "name": "German" },
    { "codes": ["el", "el-gr"], "name": "Greek" },
    { "codes": ["gu", "gu-in"], "name": "Gujarati" },
    { "codes": ["ha", "ha-latn", "ha-latn-ng"], "name": "Hausa" },
    { "codes": ["he", "he-il"], "name": "Hebrew" },
    { "codes": ["hi", "hi-in"], "name": "Hindi" },
    { "codes": ["hu", "hu-hu"], "name": "Hungarian" },
    { "codes": ["is", "is-is"], "name": "Icelandic" },
    { "codes": ["ig-latn", "ig-ng"], "name": "Igbo" },
    { "codes": ["id", "id-id"], "name": "Indonesian" },
    { "codes": ["iu-cans", "iu-latn", "iu-latn-ca"], "name": "Inuktitut (Latin)" },
    { "codes": ["ga", "ga-ie"], "name": "Irish" },
    { "codes": ["xh", "xh-za"], "name": "isiXhosa" },
    { "codes": ["zu", "zu-za"], "name": "isiZulu" },
    { "codes": ["it", "it-it", "it-ch"], "name": "Italian" },
    { "codes": ["ja", "ja-jp"], "name": "Japanese" },
    { "codes": ["kn", "kn-in"], "name": "Kannada" },
    { "codes": ["kk", "kk-kz"], "name": "Kazakh" },
    { "codes": ["km", "km-kh"], "name": "Khmer" },
    { "codes": ["quc-latn", "qut-gt", "qut-latn"], "name": "K'iche'" },
    { "codes": ["rw", "rw-rw"], "name": "Kinyarwanda" },
    { "codes": ["sw", "sw-ke"], "name": "KiSwahili" },
    { "codes": ["kok", "kok-in"], "name": "Konkani" },
    { "codes": ["ko", "ko-kr"], "name": "Korean" },
    { "codes": ["ku-arab", "ku-arab-iq"], "name": "Kurdish" },
    { "codes": ["ky-kg", "ky-cyrl"], "name": "Kyrgyz" },
    { "codes": ["lo", "lo-la"], "name": "Lao" },
    { "codes": ["lv", "lv-lv"], "name": "Latvian" },
    { "codes": ["lt", "lt-lt"], "name": "Lithuanian" },
    { "codes": ["lb", "lb-lu"], "name": "Luxembourgish" },
    { "codes": ["mk", "mk-mk"], "name": "Macedonian" },
    { "codes": ["ms", "ms-bn", "ms-my"], "name": "Malay" },
    { "codes": ["ml", "ml-in"], "name": "Malayalam" },
    { "codes": ["mt", "mt-mt"], "name": "Maltese" },
    { "codes": ["mi", "mi-latn", "mi-nz"], "name": "Maori" },
    { "codes": ["mr", "mr-in"], "name": "Marathi" },
    { "codes": ["mn-cyrl", "mn-mong", "mn-mn", "mn-phag"], "name": "Mongolian (Cyrillic)" },
    { "codes": ["ne", "ne-np"], "name": "Nepali" },
    { "codes": ["nb", "nb-no", "nn", "nn-no", "no", "no-no"], "name": "Norwegian" },
    { "codes": ["or", "or-in"], "name": "Odia" },
    { "codes": ["fa", "fa-ir"], "name": "Persian" },
    { "codes": ["pl", "pl-pl"], "name": "Polish" },
    { "codes": ["pt-br"], "name": "Portuguese (Brazil)" },
    { "codes": ["pt", "pt-pt"], "name": "Portuguese (Portugal)" },
    { "codes": ["pa", "pa-arab", "pa-arab-pk", "pa-deva", "pa-in"], "name": "Panjabi" },
    { "codes": ["quz", "quz-bo", "quz-ec", "quz-pe"], "name": "Quechua" },
    { "codes": ["ro", "ro-ro"], "name": "Romanian" },
    { "codes": ["ru", "ru-ru"], "name": "Russian" },
    { "codes": ["gd-gb", "gd-latn"], "name": "Scottish Gaelic" },
    { "codes": ["sr-Latn", "sr-latn-cs", "sr", "sr-latn-ba", "sr-latn-me", "sr-latn-rs"], "name": "Serbian (Latin)" },
    { "codes": ["sr-cyrl", "sr-cyrl-ba", "sr-cyrl-cs", "sr-cyrl-me", "sr-cyrl-rs"], "name": "Serbian (Cyrillic)" },
    { "codes": ["nso", "nso-za"], "name": "Sesotho sa Leboa" },
    { "codes": ["tn", "tn-bw", "tn-za"], "name": "Setswana" },
    { "codes": ["sd-arab", "sd-arab-pk", "sd-deva"], "name": "Sindhi" },
    { "codes": ["si", "si-lk"], "name": "Sinhala" },
    { "codes": ["sk", "sk-sk"], "name": "Slovak" },
    { "codes": ["sl", "sl-si"], "name": "Slovenian" },
    { "codes": ["es", "es-cl", "es-co", "es-es", "es-mx", "es-ar", "es-bo", "es-cr", "es-do", "es-ec", "es-gt", "es-hn", "es-ni", "es-pa", "es-pe", "es-pr", "es-py", "es-sv", "es-us", "es-uy", "es-ve", "es-019", "es-419"], "name": "Spanish" },
    { "codes": ["sv", "sv-se", "sv-fi"], "name": "Swedish" },
    { "codes": ["tg-arab", "tg-cyrl", "tg-cyrl-tj", "tg-latn"], "name": "Tajik (Cyrillic)" },
    { "codes": ["ta", "ta-in"], "name": "Tamil" },
    { "codes": ["tt-arab", "tt-cyrl", "tt-latn", "tt-ru"], "name": "Tatar" },
    { "codes": ["te", "te-in"], "name": "Telugu" },
    { "codes": ["th", "th-th"], "name": "Thai" },
    { "codes": ["tr", "tr-tr"], "name": "Turkish" },
    { "codes": ["tk-cyrl", "tk-latn", "tk-tm", "tk-latn-tr", "tk-cyrl-tr"], "name": "Turkmen" },
    { "codes": ["uk", "uk-ua"], "name": "Ukrainian" },
    { "codes": ["ur", "ur-pk"], "name": "Urdu" },
    { "codes": ["ug-arab", "ug-cn", "ug-cyrl", "ug-latn"], "name": "Uyghur" },
    { "codes": ["uz", "uz-cyrl", "uz-latn", "uz-latn-uz"], "name": "Uzbek (Latin)" },
    { "codes": ["vi", "vi-vn"], "name": "Vietnamese" },
    { "codes": ["cy", "cy-gb"], "name": "Welsh" },
    { "codes": ["wo", "wo-sn"], "name": "Wolof" },
    { "codes": ["yo-latn", "yo-ng"], "name": "Yoruba" },
]