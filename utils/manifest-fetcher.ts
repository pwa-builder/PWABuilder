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
            console.error("Failed to fetch manifest via API. Trying manifest fetch fallbacks.", apiError);
        }

        // Fallback: try our fallbacks simulatenously and see any of them can fetch the manifest.
        try {
            // Promise.any(...) may not exist. Use our polyfill if needed.
            const promiseAnyOrPolyfill: (promises: Promise<ManifestDetectionResult>[]) => Promise<ManifestDetectionResult> = 
                (promises) => Promise["any"] ? Promise["any"](promises) : this.promiseAny(promises);
            return await promiseAnyOrPolyfill([this.getManifestViaFilePost(), this.getManifestViaHtmlParse()])
        } catch (fallbackError) {
            console.error("Manifest detection fallbacks also failed. Manifest not detected.", fallbackError);

            // Well, we sure tried.
            throw fallbackError;
        }    
    }

    // This is a polyfill for Promise.any(...), which isn't well supported yet at the time of this writing.        
    private promiseAny(promises: Promise<ManifestDetectionResult>[]): Promise<ManifestDetectionResult> {
        if (promises.length === 0) {
            return Promise.reject("No promises supplied");
        }
        let errors: unknown[] = [];
        
        return new Promise<ManifestDetectionResult>((resolve, reject) => {
            let completedCount = 0;
            let hasSucceeded = false;

            for (let promise of promises) {
                promise.then(result => {
                    if (!hasSucceeded) {
                        hasSucceeded = true;
                        resolve(result);
                    }
                });
                promise.catch(error => errors.push(error));
                promise.finally(() => {
                    completedCount++;
                    if (completedCount === promises.length && !hasSucceeded) {
                        reject("All promises failed: " + errors.join("\n"))
                    }
                })
            }  
        });
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
        const response = await fetch(manifestTestUrl, {
            method: "POST"
        });
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