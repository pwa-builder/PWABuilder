import { ManifestDetectionResult, Manifest } from "~/store/modules/generator/generator.state";

/**
 * Fetches web manifests from a URL. Wraps up logic that uses multiple fallbacks to find and parse a web manifest.
 */
export class ManifestFetcher {
    private readonly apiUrl = `${process.env.apiUrl}/manifests`;

    constructor (private url: string, private axios: any) {
        
    }

    async fetch(): Promise<ManifestDetectionResult> {
        // Best case: use our API directly
        try {
            return await this.getManifestViaApi();
        } catch (apiError) {
            console.error("Failed to fetch manifest via API. Falling back to manifest file POST.", apiError);
        }

        // Fallback: use our Puppeteer microservice to fetch the manifest and send it into the API as a file POST.
        try {
            return await this.getManifestViaFilePost();
        } catch (filePostError) {
            console.error("Failed to fetch manifest via file POST. Falling back to HTML parsing service.", filePostError);
        }

        // Fallback: use our HTML parsing service that loads and parses the HTML in order to find and fetch the manifest.
        try {
            return await this.getManifestViaHtmlParse();
        } catch (htmlParseError) {
            console.error("Failed to fetch manifest via html parse service. Manifest detection failed.", htmlParseError);

            // Well, we sure tried.
            throw htmlParseError;
        }
    }

    // Uses PWABuilder API to fetch the manifest
    private getManifestViaApi(): Promise<ManifestDetectionResult> {
        const options = {
          siteUrl: this.url,
        };
        
        return this.axios.$post(this.apiUrl, options);
    }

    // Uses Azure manifest Puppeteer service to fetch the manifest, then POSTS it to the API.
    private async getManifestViaFilePost(): Promise<ManifestDetectionResult> {
        const manifestTestUrl = `${process.env.testAPIUrl}/WebManifest?site=${encodeURIComponent(this.url)}`;
        const response = await fetch(manifestTestUrl);
        if (!response.ok) {
            throw new Error(`Unable to fetch response using ${manifestTestUrl}. Response status  ${response.status}`);  
        }
        const responseData = await response.json();
        if (!responseData) {
          throw new Error(`Unable to get JSON from ${manifestTestUrl}`);
        }
    
        const manifestFile = new File([JSON.stringify(responseData.content)], 'test.json');
    
        const formData = new FormData();
        formData.append("file", manifestFile);
    
        return await this.axios.$post(this.apiUrl, formData);
    }

    // Uses Azure HTML parsing microservice to fetch the manifest, then hands it to the API.
    private async getManifestViaHtmlParse(): Promise<ManifestDetectionResult> {
        type ManifestFinderResult = {
            manifestUrl: string | null,
            manifestContents: Manifest | null,
            error: string | null
        };

        const manifestTestUrl = `${process.env.manifestFinderUrl}?url=${encodeURIComponent(this.url)}`;
        const response = await fetch(manifestTestUrl);
        if (!response.ok) {
            throw new Error(`Error fetching from ${manifestTestUrl}`);
        }
        const responseData: ManifestFinderResult = await response.json();
        if (responseData.error || !responseData.manifestContents) {
            throw new Error(responseData.error || "Manifest couldn't be fetched");
        }

        return {
            content: responseData.manifestContents,
            format: "w3c",
            generatedUrl: responseData.manifestUrl || this.url,
            default: {
                short_name: responseData.manifestContents.short_name || ""
            },
            id: "",
            errors: [],
            suggestions: [],
            warnings: []
        }
    }
}