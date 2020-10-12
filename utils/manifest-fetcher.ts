import { ManifestDetectionResult, Manifest } from "~/store/modules/generator/generator.state";

/**
 * Fetches web manifests from a URL. Wraps up logic that uses multiple services to find the manifest.
 */
export class ManifestFetcher {
    private readonly apiUrl = `${process.env.apiUrl}/manifests`;

    constructor (private url: string, private axios: any) {
        
    }

    async fetch(): Promise<ManifestDetectionResult> {

        // Manifest detection is surprisingly tricky due to redirects, dynamic code generation, SSL problems, and other issues.
        // We have 3 techniques to detect the manifest:
        // 1. The legacy PWABuilder API
        // 2. An Azure function that uses Chrome Puppeteer to fetch the manifest
        // 3. An Azure function that parses the HTML to find the manifest.
        // This fetch() function runs all 3 manifest detection schemes concurrently and returns the first one that succeeds.

        const manifestDetectors = [
            this.getManifestViaApi(), 
            this.getManifestViaFilePost(), 
            this.getManifestViaHtmlParse()
        ];

        // We want to use Promise.any(...), but browser support is too low at the time of this writing: https://caniuse.com/mdn-javascript_builtins_promise_any
        // Use our polyfill if needed.
        const promiseAnyOrPolyfill: (promises: Promise<ManifestDetectionResult>[]) => Promise<ManifestDetectionResult> = 
            (promises) => Promise["any"] ? Promise["any"](promises) : this.promiseAny(promises);

        try {
            return await promiseAnyOrPolyfill(manifestDetectors);
        } catch (manifestDetectionError) {
            console.error("All manifest detectors failed.", manifestDetectionError);

            // Well, we sure tried.
            throw manifestDetectionError;
        }    
    }

    // This is a polyfill for Promise.any(...), which isn't well supported yet at the time of this writing: https://caniuse.com/mdn-javascript_builtins_promise_any   
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
        
        const postResult = this.axios.$post(this.apiUrl, options);
        postResult.then((r: ManifestDetectionResult) => console.info("Fetching manifest via API succeeded", r));
        return postResult;
    }

    // Uses Azure manifest Puppeteer service to fetch the manifest, then POSTS it to the API.
    private async getManifestViaFilePost(): Promise<ManifestDetectionResult> {
        const manifestTestUrl = `${process.env.testAPIUrl}/WebManifest?site=${encodeURIComponent(this.url)}`;
        const response = await fetch(manifestTestUrl, {
            method: "POST"
        });
        if (!response.ok) {
            console.warn("Fetching manifest via API v2 file POST failed", response.statusText);
            throw new Error(`Unable to fetch response using ${manifestTestUrl}. Response status  ${response}`);  
        }
        const responseData = await response.json();
        if (!responseData) {
            console.warn("Fetching manifest via API v2 file POST failed due to no response data", response);
            throw new Error(`Unable to get JSON from ${manifestTestUrl}`);
        }
    
        const manifestFile = new File([JSON.stringify(responseData.content)], 'test.json');
    
        const formData = new FormData();
        formData.append("file", manifestFile);
    
        const filePostResult: Promise<ManifestDetectionResult> = await this.axios.$post(this.apiUrl, formData);
        filePostResult.then(r => console.info("Manifest detection succeeded via API v2 file POST", r));
        return this.syncRedis(await filePostResult);
    }

    // Uses Azurez HTML parsing microservice to fetch the manifest, then hands it to the API.
    private async getManifestViaHtmlParse(): Promise<ManifestDetectionResult> {
        type ManifestFinderResult = {
            manifestUrl: string | null,
            manifestContents: Manifest | null,
            error: string | null
        };

        const manifestTestUrl = `${process.env.manifestFinderUrl}?url=${encodeURIComponent(this.url)}`;
        const response = await fetch(manifestTestUrl);
        if (!response.ok) {
            console.warn("Fetching manifest via HTML parsing service failed", response);
            throw new Error(`Error fetching from ${manifestTestUrl}`);
        }
        const responseData: ManifestFinderResult = await response.json();
        if (responseData.error || !responseData.manifestContents) {
            console.warn("Fetching manifest via HTML parsing service failed due to no response data", response);
            throw new Error(responseData.error || "Manifest couldn't be fetched");
        }
        console.info(
          "Manifest detection succeeded via HTML parse service",
          responseData
        );
        return this.syncRedis({
          content: responseData.manifestContents,
          format: "w3c",
          generatedUrl: responseData.manifestUrl || this.url,
          default: {
            short_name: responseData.manifestContents.short_name || "",
          },
          id: "",
          errors: [],
          suggestions: [],
          warnings: [],
        });
    }

    private async syncRedis(manifestData: ManifestDetectionResult): Promise<ManifestDetectionResult> {
        return this.axios.$post(this.apiUrl, manifestData)
            .then(res => (res.json() as unknown) as ManifestDetectionResult)
            .then(res => {
                console.log("sync redis called: ", res);
                return res;
            })
    }
}