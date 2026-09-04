import assert from 'node:assert/strict';
import { test } from 'node:test';
import { Readable } from 'node:stream';
import { Response } from 'node-fetch';
import {
    fetchPublicUrl,
    isPublicIpAddress,
    PublicUrlBlockedError,
    type PublicUrlDependencies,
    type ResolvedAddress,
} from '../utils/public-url-fetch.js';

/**
 * Builds a Readable stream carrying a small payload. Used to prove that response
 * bodies are destroyed (never consumed) by the public-URL pipeline.
 */
function makeBodyStream(): Readable {
    const stream = new Readable({ read() {} });
    stream.push('body');
    return stream;
}

/**
 * Builds a redirect response with a live, destroyable body so tests can assert the
 * body is torn down before the pipeline follows the redirect.
 */
function makeRedirectResponse(status: number, location: string | null): { response: Response; body: Readable } {
    const body = makeBodyStream();
    const headers: Record<string, string> = {};
    if (location !== null) {
        headers.location = location;
    }
    const response = new Response(body, { status, headers });
    return { response, body };
}

/**
 * A dependency double that records every hostname resolved and every address the
 * pipeline pins a request to. It never opens a socket.
 */
function makeRecordingDeps(overrides: Partial<PublicUrlDependencies>): {
    deps: PublicUrlDependencies;
    resolvedHostnames: string[];
    pinnedAddresses: ResolvedAddress[];
    requestedUrls: string[];
} {
    const resolvedHostnames: string[] = [];
    const pinnedAddresses: ResolvedAddress[] = [];
    const requestedUrls: string[] = [];
    const deps: PublicUrlDependencies = {
        async resolve(hostname) {
            resolvedHostnames.push(hostname);
            if (overrides.resolve) {
                return overrides.resolve(hostname);
            }
            throw new Error(`unexpected resolve(${hostname})`);
        },
        async request(url, address) {
            requestedUrls.push(url.href);
            pinnedAddresses.push(address);
            if (overrides.request) {
                return overrides.request(url, address);
            }
            throw new Error(`unexpected request(${url.href})`);
        },
    };
    return { deps, resolvedHostnames, pinnedAddresses, requestedUrls };
}

// --- isPublicIpAddress: public addresses -----------------------------------

test('isPublicIpAddress allows representative public IPv4 addresses', () => {
    for (const address of ['8.8.8.8', '1.1.1.1', '203.0.114.0', '172.15.255.255', '172.32.0.0', '100.63.255.255', '100.128.0.0']) {
        assert.equal(isPublicIpAddress(address), true, `expected ${address} to be public`);
    }
});

test('isPublicIpAddress allows representative public IPv6 addresses', () => {
    for (const address of ['2606:4700:4700::1111', '2620:fe::fe', '[2606:4700:4700::1111]']) {
        assert.equal(isPublicIpAddress(address), true, `expected ${address} to be public`);
    }
});

// --- isPublicIpAddress: every denied range (first + last) ------------------

const DENIED_IPV4: ReadonlyArray<readonly [string, string]> = [
    ['0.0.0.0', '0.255.255.255'],
    ['10.0.0.0', '10.255.255.255'],
    ['100.64.0.0', '100.127.255.255'],
    ['127.0.0.0', '127.255.255.255'],
    ['169.254.0.0', '169.254.255.255'],
    ['172.16.0.0', '172.31.255.255'],
    ['192.0.0.0', '192.0.0.255'],
    ['192.0.2.0', '192.0.2.255'],
    ['192.88.99.0', '192.88.99.255'],
    ['192.168.0.0', '192.168.255.255'],
    ['198.18.0.0', '198.19.255.255'],
    ['198.51.100.0', '198.51.100.255'],
    ['203.0.113.0', '203.0.113.255'],
    ['224.0.0.0', '239.255.255.255'],
    ['240.0.0.0', '255.255.255.255'],
];

test('isPublicIpAddress denies first and last address of every reserved IPv4 range', () => {
    for (const [first, last] of DENIED_IPV4) {
        assert.equal(isPublicIpAddress(first), false, `expected ${first} to be denied`);
        assert.equal(isPublicIpAddress(last), false, `expected ${last} to be denied`);
    }
});

const DENIED_IPV6: ReadonlyArray<readonly [string, string]> = [
    ['::', '::'],
    ['::1', '::1'],
    ['::ffff:0.0.0.0', '::ffff:255.255.255.255'],
    ['64:ff9b::', '64:ff9b::ffff:ffff'],
    ['64:ff9b:1::', '64:ff9b:1:ffff:ffff:ffff:ffff:ffff'],
    ['100::', '100::ffff:ffff:ffff:ffff'],
    ['2001::', '2001:1ff:ffff:ffff:ffff:ffff:ffff:ffff'],
    ['2001:db8::', '2001:db8:ffff:ffff:ffff:ffff:ffff:ffff'],
    ['2002::', '2002:ffff:ffff:ffff:ffff:ffff:ffff:ffff'],
    ['3fff::', '3fff:fff:ffff:ffff:ffff:ffff:ffff:ffff'],
    ['5f00::', '5f00:ffff:ffff:ffff:ffff:ffff:ffff:ffff'],
    ['fc00::', 'fdff:ffff:ffff:ffff:ffff:ffff:ffff:ffff'],
    ['fe80::', 'febf:ffff:ffff:ffff:ffff:ffff:ffff:ffff'],
    ['ff00::', 'ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff'],
];

test('isPublicIpAddress denies first and last address of every reserved IPv6 range', () => {
    for (const [first, last] of DENIED_IPV6) {
        assert.equal(isPublicIpAddress(first), false, `expected ${first} to be denied`);
        assert.equal(isPublicIpAddress(last), false, `expected ${last} to be denied`);
    }
});

test('isPublicIpAddress denies IPv4-mapped IPv6 addresses', () => {
    for (const address of ['::ffff:8.8.8.8', '::ffff:127.0.0.1', '::ffff:1.1.1.1']) {
        assert.equal(isPublicIpAddress(address), false, `expected mapped ${address} to be denied`);
    }
});

test('isPublicIpAddress treats invalid addresses as non-public', () => {
    for (const address of ['not-an-ip', '', '999.999.999.999', 'example.com', '12345']) {
        assert.equal(isPublicIpAddress(address), false, `expected ${address} to be non-public`);
    }
});

// --- fetchPublicUrl: scheme and credential rejection -----------------------

test('fetchPublicUrl rejects non-http(s) schemes without resolving or requesting', async () => {
    const { deps, resolvedHostnames, requestedUrls } = makeRecordingDeps({});
    for (const raw of ['ftp://example.com/x', 'file:///etc/passwd', 'gopher://example.com', 'data:text/plain,hi']) {
        await assert.rejects(fetchPublicUrl(new URL(raw), deps), PublicUrlBlockedError);
    }
    assert.deepEqual(resolvedHostnames, []);
    assert.deepEqual(requestedUrls, []);
});

test('fetchPublicUrl rejects URLs carrying credentials', async () => {
    const { deps, resolvedHostnames, requestedUrls } = makeRecordingDeps({});
    for (const raw of ['http://user@example.com/x', 'http://user:pass@example.com/x', 'https://:pass@example.com/x']) {
        await assert.rejects(fetchPublicUrl(new URL(raw), deps), PublicUrlBlockedError);
    }
    assert.deepEqual(resolvedHostnames, []);
    assert.deepEqual(requestedUrls, []);
});

// --- fetchPublicUrl: IP literals -------------------------------------------

test('fetchPublicUrl allows a public IPv4 literal and pins the request without DNS', async () => {
    const { deps, resolvedHostnames, pinnedAddresses } = makeRecordingDeps({
        async request() {
            return new Response('ok', { status: 200 });
        },
    });
    const response = await fetchPublicUrl(new URL('http://8.8.8.8/icon.png'), deps);
    assert.equal(response.status, 200);
    assert.deepEqual(resolvedHostnames, []);
    assert.deepEqual(pinnedAddresses, [{ address: '8.8.8.8', family: 4 }]);
});

test('fetchPublicUrl allows a public IPv6 literal and pins the bracket-stripped address', async () => {
    const { deps, resolvedHostnames, pinnedAddresses } = makeRecordingDeps({
        async request() {
            return new Response('ok', { status: 200 });
        },
    });
    const response = await fetchPublicUrl(new URL('http://[2606:4700:4700::1111]/icon.png'), deps);
    assert.equal(response.status, 200);
    assert.deepEqual(resolvedHostnames, []);
    assert.deepEqual(pinnedAddresses, [{ address: '2606:4700:4700::1111', family: 6 }]);
});

test('fetchPublicUrl blocks a private IP literal before requesting', async () => {
    const { deps, requestedUrls } = makeRecordingDeps({});
    await assert.rejects(fetchPublicUrl(new URL('http://127.0.0.1/icon.png'), deps), PublicUrlBlockedError);
    assert.deepEqual(requestedUrls, []);
});

// --- fetchPublicUrl: DNS resolution outcomes --------------------------------

test('fetchPublicUrl blocks when DNS returns no addresses', async () => {
    const { deps, requestedUrls } = makeRecordingDeps({
        async resolve() {
            return [];
        },
    });
    await assert.rejects(fetchPublicUrl(new URL('https://example.com/icon.png'), deps), PublicUrlBlockedError);
    assert.deepEqual(requestedUrls, []);
});

test('fetchPublicUrl blocks when any resolved address is non-public, before requesting', async () => {
    const { deps, requestedUrls } = makeRecordingDeps({
        async resolve() {
            return [
                { address: '93.184.216.34', family: 4 },
                { address: '10.0.0.5', family: 4 },
            ];
        },
    });
    await assert.rejects(fetchPublicUrl(new URL('https://example.com/icon.png'), deps), PublicUrlBlockedError);
    assert.deepEqual(requestedUrls, []);
});

test('fetchPublicUrl blocks when a resolved address is invalid, before requesting', async () => {
    const { deps, requestedUrls } = makeRecordingDeps({
        async resolve() {
            return [{ address: 'not-an-ip', family: 4 }];
        },
    });
    await assert.rejects(fetchPublicUrl(new URL('https://example.com/icon.png'), deps), PublicUrlBlockedError);
    assert.deepEqual(requestedUrls, []);
});

test('fetchPublicUrl resolves the hostname and pins the first validated address', async () => {
    const { deps, resolvedHostnames, pinnedAddresses } = makeRecordingDeps({
        async resolve() {
            return [
                { address: '93.184.216.34', family: 4 },
                { address: '2606:4700:4700::1111', family: 6 },
            ];
        },
        async request() {
            return new Response('ok', { status: 200 });
        },
    });
    const response = await fetchPublicUrl(new URL('https://example.com/icon.png'), deps);
    assert.equal(response.status, 200);
    assert.deepEqual(resolvedHostnames, ['example.com']);
    assert.deepEqual(pinnedAddresses, [{ address: '93.184.216.34', family: 4 }]);
});

// --- fetchPublicUrl: redirects ---------------------------------------------

test('fetchPublicUrl follows a relative redirect, revalidating and destroying the body', async () => {
    let hop = 0;
    const redirectBodies: Readable[] = [];
    const { deps, requestedUrls } = makeRecordingDeps({
        async resolve() {
            return [{ address: '93.184.216.34', family: 4 }];
        },
        async request() {
            hop += 1;
            if (hop === 1) {
                const { response, body } = makeRedirectResponse(302, '/redirected/icon.png');
                redirectBodies.push(body);
                return response;
            }
            return new Response('ok', { status: 200 });
        },
    });
    const response = await fetchPublicUrl(new URL('https://example.com/icon.png'), deps);
    assert.equal(response.status, 200);
    assert.deepEqual(requestedUrls, [
        'https://example.com/icon.png',
        'https://example.com/redirected/icon.png',
    ]);
    assert.equal(redirectBodies[0].destroyed, true, 'redirect body should be destroyed');
});

test('fetchPublicUrl follows an absolute redirect to another public host', async () => {
    let hop = 0;
    const { deps, resolvedHostnames } = makeRecordingDeps({
        async resolve() {
            return [{ address: '93.184.216.34', family: 4 }];
        },
        async request() {
            hop += 1;
            if (hop === 1) {
                return makeRedirectResponse(301, 'https://cdn.example.net/icon.png').response;
            }
            return new Response('ok', { status: 200 });
        },
    });
    const response = await fetchPublicUrl(new URL('https://example.com/icon.png'), deps);
    assert.equal(response.status, 200);
    assert.deepEqual(resolvedHostnames, ['example.com', 'cdn.example.net']);
});

test('fetchPublicUrl blocks a redirect that targets a private address and destroys the body', async () => {
    let hop = 0;
    const redirectBodies: Readable[] = [];
    const { deps, requestedUrls } = makeRecordingDeps({
        async resolve(hostname) {
            if (hostname === 'example.com') {
                return [{ address: '93.184.216.34', family: 4 }];
            }
            return [{ address: '169.254.169.254', family: 4 }];
        },
        async request() {
            hop += 1;
            const { response, body } = makeRedirectResponse(307, 'https://metadata.internal/icon.png');
            redirectBodies.push(body);
            return response;
        },
    });
    await assert.rejects(fetchPublicUrl(new URL('https://example.com/icon.png'), deps), PublicUrlBlockedError);
    assert.equal(redirectBodies[0].destroyed, true, 'redirect body should be destroyed before blocking');
    assert.deepEqual(requestedUrls, ['https://example.com/icon.png']);
});

test('fetchPublicUrl blocks a redirect response missing a Location header and destroys the body', async () => {
    const redirectBodies: Readable[] = [];
    const { deps } = makeRecordingDeps({
        async resolve() {
            return [{ address: '93.184.216.34', family: 4 }];
        },
        async request() {
            const { response, body } = makeRedirectResponse(302, null);
            redirectBodies.push(body);
            return response;
        },
    });
    await assert.rejects(fetchPublicUrl(new URL('https://example.com/icon.png'), deps), PublicUrlBlockedError);
    assert.equal(redirectBodies[0].destroyed, true, 'redirect body should be destroyed');
});

test('fetchPublicUrl allows three redirects but blocks and destroys the fourth', async () => {
    const redirectBodies: Readable[] = [];
    const { deps, requestedUrls } = makeRecordingDeps({
        async resolve() {
            return [{ address: '93.184.216.34', family: 4 }];
        },
        async request(url) {
            const next = new URL(`/hop${redirectBodies.length + 1}`, url);
            const { response, body } = makeRedirectResponse(308, next.href);
            redirectBodies.push(body);
            return response;
        },
    });
    await assert.rejects(fetchPublicUrl(new URL('https://example.com/icon.png'), deps), PublicUrlBlockedError);
    // initial request + 3 followed redirects = 4 requests; the 4th response is blocked.
    assert.equal(requestedUrls.length, 4);
    assert.equal(redirectBodies.length, 4);
    for (const body of redirectBodies) {
        assert.equal(body.destroyed, true, 'every redirect body should be destroyed');
    }
});

// --- fetchPublicUrl: error propagation --------------------------------------

test('fetchPublicUrl propagates DNS lookup errors to the caller', async () => {
    const dnsError = new Error('ENOTFOUND example.com');
    const { deps } = makeRecordingDeps({
        async resolve() {
            throw dnsError;
        },
    });
    await assert.rejects(fetchPublicUrl(new URL('https://example.com/icon.png'), deps), error => {
        assert.strictEqual(error, dnsError);
        return true;
    });
});

test('fetchPublicUrl propagates request/timeout errors to the caller', async () => {
    const requestError = new Error('The operation was aborted due to timeout');
    const { deps } = makeRecordingDeps({
        async resolve() {
            return [{ address: '93.184.216.34', family: 4 }];
        },
        async request() {
            throw requestError;
        },
    });
    await assert.rejects(fetchPublicUrl(new URL('https://example.com/icon.png'), deps), error => {
        assert.strictEqual(error, requestError);
        return true;
    });
});

test('PublicUrlBlockedError uses a constant message that never reflects the URL or address', async () => {
    const { deps } = makeRecordingDeps({});
    let captured: PublicUrlBlockedError | undefined;
    await assert.rejects(fetchPublicUrl(new URL('http://user:pass@10.0.0.1:9999/secret-path'), deps), error => {
        assert.ok(error instanceof PublicUrlBlockedError);
        captured = error;
        return true;
    });
    const message = captured?.message ?? '';
    for (const secret of ['user', 'pass', '10.0.0.1', '9999', 'secret-path']) {
        assert.equal(message.includes(secret), false, `message leaked ${secret}`);
    }
});
