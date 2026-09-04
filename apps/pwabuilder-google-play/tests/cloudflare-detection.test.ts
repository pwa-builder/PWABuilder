import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Readable } from 'node:stream';
import { Response } from 'node-fetch';
import { detectCloudflare, type PublicUrlFetcher } from '../utils/cloudflare-detection.js';
import { PublicUrlBlockedError } from '../utils/public-url-fetch.js';

const currentDir = dirname(fileURLToPath(import.meta.url));

/**
 * Builds a Readable stream carrying a small payload so tests can assert the
 * Cloudflare detector always destroys the response body.
 */
function makeBodyStream(): Readable {
    const stream = new Readable({ read() {} });
    stream.push('body');
    return stream;
}

/**
 * Builds a response with a live, destroyable body and the given headers.
 */
function makeResponse(headers: Record<string, string>): { response: Response; body: Readable } {
    const body = makeBodyStream();
    const response = new Response(body, { status: 200, headers });
    return { response, body };
}

/**
 * Wraps a PublicUrlFetcher, recording each URL it is asked to fetch.
 */
function makeRecordingFetcher(fetcher: PublicUrlFetcher): { fetcher: PublicUrlFetcher; urls: string[] } {
    const urls: string[] = [];
    const wrapped: PublicUrlFetcher = url => {
        urls.push(url.href);
        return fetcher(url);
    };
    return { fetcher: wrapped, urls };
}

test('detectCloudflare returns true when the Server header is exactly cloudflare', async () => {
    const { response, body } = makeResponse({ server: 'cloudflare' });
    const { fetcher, urls } = makeRecordingFetcher(async () => response);
    assert.equal(await detectCloudflare('https://example.com/icon.png', fetcher), true);
    assert.deepEqual(urls, ['https://example.com/icon.png']);
    assert.equal(body.destroyed, true, 'body should be destroyed');
});

test('detectCloudflare matches the Server header case-insensitively and as a substring', async () => {
    for (const header of ['CloudFlare', 'CLOUDFLARE', 'cloudflare-nginx', 'Cloudflare']) {
        const { response, body } = makeResponse({ server: header });
        assert.equal(await detectCloudflare('https://example.com/icon.png', async () => response), true, `header ${header}`);
        assert.equal(body.destroyed, true, `body should be destroyed for ${header}`);
    }
});

test('detectCloudflare returns false for a non-Cloudflare Server header and destroys the body', async () => {
    const { response, body } = makeResponse({ server: 'nginx' });
    assert.equal(await detectCloudflare('https://example.com/icon.png', async () => response), false);
    assert.equal(body.destroyed, true, 'body should be destroyed');
});

test('detectCloudflare returns false when the Server header is missing and destroys the body', async () => {
    const { response, body } = makeResponse({});
    assert.equal(await detectCloudflare('https://example.com/icon.png', async () => response), false);
    assert.equal(body.destroyed, true, 'body should be destroyed');
});

test('detectCloudflare returns false for a malformed URL without invoking the fetcher', async () => {
    let called = false;
    const fetcher: PublicUrlFetcher = async () => {
        called = true;
        return new Response('ok', { status: 200 });
    };
    assert.equal(await detectCloudflare('not a url', fetcher), false);
    assert.equal(called, false, 'fetcher must not be called for a malformed URL');
});

test('detectCloudflare returns false when the fetch is blocked by the public-URL policy', async () => {
    const fetcher: PublicUrlFetcher = async () => {
        throw new PublicUrlBlockedError();
    };
    assert.equal(await detectCloudflare('https://internal.example/icon.png', fetcher), false);
});

test('detectCloudflare returns false for DNS, timeout, and generic fetch errors', async () => {
    const errors = [
        new Error('ENOTFOUND example.com'),
        new Error('The operation was aborted due to timeout'),
        new Error('socket hang up'),
    ];
    for (const error of errors) {
        const fetcher: PublicUrlFetcher = async () => {
            throw error;
        };
        assert.equal(await detectCloudflare('https://example.com/icon.png', fetcher), false, `error ${error.message}`);
    }
});

test('detectCloudflare does not surface the underlying error message', async () => {
    const secret = 'https://10.0.0.1/secret-path';
    const fetcher: PublicUrlFetcher = async () => {
        throw new Error(`connect ECONNREFUSED ${secret}`);
    };
    // A false return (not a throw) proves no sensitive error is propagated to the caller.
    assert.equal(await detectCloudflare(secret, fetcher), false);
});

// --- Structural regression guard for packageCreator ------------------------

test('packageCreator no longer contains the CodeQL request-forgery sink or its helpers', async () => {
    const source = await readFile(join(currentDir, '..', 'services', 'packageCreator.ts'), 'utf8');
    assert.equal(/fetch\(\s*(?:options\.)?iconUrl/.test(source), false, 'direct fetch(iconUrl) sink must be gone');
    assert.equal(source.includes('TryCheckCloudflare'), false, 'TryCheckCloudflare must be removed');
    assert.equal(source.includes('isSafeUrlForFetch'), false, 'isSafeUrlForFetch must be removed');
    assert.equal(source.includes('detectCloudflare'), true, 'detectCloudflare must be used');
});
