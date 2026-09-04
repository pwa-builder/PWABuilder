import type { Response } from 'node-fetch';
import { Readable } from 'node:stream';
import { fetchPublicUrl } from './public-url-fetch.js';

/**
 * A function that fetches a validated, public-only URL. Defaults to
 * {@link fetchPublicUrl}; tests inject a double so no socket is opened.
 */
export type PublicUrlFetcher = (url: URL) => Promise<Response>;

/**
 * Destroys a response body without consuming it, swallowing any resulting stream
 * error so that abandoning the body never produces an unhandled error event.
 */
function destroyResponseBody(response: Response): void {
    const body = response.body;
    if (body instanceof Readable) {
        body.on('error', () => {});
        body.destroy();
    }
}

/**
 * Determines whether the given URL is served through Cloudflare by inspecting the
 * final response's Server header (case-insensitively).
 *
 * All failure modes are treated as "not Cloudflare" and return false without throwing:
 * a malformed URL, a blocked/non-public target, DNS/timeout/fetch errors, or a missing
 * or non-Cloudflare Server header. The response body is always destroyed and no
 * sensitive error detail is surfaced to the caller.
 */
export async function detectCloudflare(
    url: string,
    fetcher: PublicUrlFetcher = fetchPublicUrl
): Promise<boolean> {
    let parsedUrl: URL;
    try {
        parsedUrl = new URL(url);
    } catch {
        return false;
    }

    let response: Response;
    try {
        response = await fetcher(parsedUrl);
    } catch {
        // DNS, timeout, blocked, or any other fetch error: treat as "not Cloudflare".
        return false;
    }

    try {
        const serverHeader = response.headers.get('server') ?? '';
        return serverHeader.toLowerCase().includes('cloudflare');
    } finally {
        destroyResponseBody(response);
    }
}
