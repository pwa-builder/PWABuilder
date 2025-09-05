import fetch, { Response } from "node-fetch";

export function logUrlResult(url: string, success: boolean, error: string | null): Promise<any> {
    // This environment variable is a secret, and set only in deployed environments
    const logApiUrl = process.env.ANALYSISLOGURL;
    if (!logApiUrl) {
        return Promise.resolve();
    }

    return fetch(logApiUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json; charset=UTF-8"
        },
        body: JSON.stringify({ 
            url: url,
            androidPackage: success,
            androidPackageError: error
        })
    }).catch(err => console.error("Unable to POST to log analysis URL"));
}