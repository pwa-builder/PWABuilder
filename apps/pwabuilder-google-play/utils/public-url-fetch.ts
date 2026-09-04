import fetch, { type Response } from 'node-fetch';
import { Agent as HttpAgent } from 'node:http';
import { Agent as HttpsAgent } from 'node:https';
import { BlockList, isIP, type LookupFunction } from 'node:net';
import { lookup as dnsLookup } from 'node:dns/promises';
import { Readable } from 'node:stream';

/**
 * A resolved network address paired with its IP family. The address is always an
 * IP literal (never a hostname) so that the connection can be pinned to it.
 */
export interface ResolvedAddress {
    readonly address: string;
    readonly family: 4 | 6;
}

/**
 * The injectable DNS/request boundary used by {@link fetchPublicUrl}. Tests supply
 * doubles here so that no DNS query or socket is ever opened during unit tests.
 */
export interface PublicUrlDependencies {
    /** Resolves a hostname to one or more candidate addresses. */
    resolve(hostname: string): Promise<readonly ResolvedAddress[]>;
    /** Performs a GET request pinned to the given, already-validated address. */
    request(url: URL, address: ResolvedAddress): Promise<Response>;
}

/**
 * Thrown when a URL (or any of its redirect hops) is not permitted: a disallowed
 * scheme, embedded credentials, a non-public/invalid address, or too many redirects.
 * The message is constant and never reflects the offending URL or address, so it is
 * safe to log without leaking request targets.
 */
export class PublicUrlBlockedError extends Error {
    /** A constant, non-reflective message. */
    public static readonly blockedMessage = 'The requested URL is not permitted for diagnostic fetching.';

    /** Creates a new {@link PublicUrlBlockedError}. */
    public constructor() {
        super(PublicUrlBlockedError.blockedMessage);
        this.name = 'PublicUrlBlockedError';
    }
}

/** Request timeout, in milliseconds, applied to every hop. */
const REQUEST_TIMEOUT_MS = 5_000;

/** Maximum number of redirects to follow (the initial request plus up to 3 hops). */
const MAX_REDIRECTS = 3;

/** HTTP status codes that represent a redirect we are willing to follow. */
const REDIRECT_STATUSES: ReadonlySet<number> = new Set([301, 302, 303, 307, 308]);

/**
 * Reserved / non-public IPv4 subnets, expressed as [network, prefixLength]. These
 * mirror the approved SSRF denylist and are the only IPv4 ranges we refuse.
 */
const BLOCKED_IPV4_SUBNETS: ReadonlyArray<readonly [string, number]> = [
    ['0.0.0.0', 8],
    ['10.0.0.0', 8],
    ['100.64.0.0', 10],
    ['127.0.0.0', 8],
    ['169.254.0.0', 16],
    ['172.16.0.0', 12],
    ['192.0.0.0', 24],
    ['192.0.2.0', 24],
    ['192.88.99.0', 24],
    ['192.168.0.0', 16],
    ['198.18.0.0', 15],
    ['198.51.100.0', 24],
    ['203.0.113.0', 24],
    ['224.0.0.0', 4],
    ['240.0.0.0', 4],
];

/**
 * Reserved / non-public IPv6 subnets, expressed as [network, prefixLength]. The
 * ::ffff:0:0/96 entry blocks all IPv4-mapped IPv6 literals.
 */
const BLOCKED_IPV6_SUBNETS: ReadonlyArray<readonly [string, number]> = [
    ['::', 128],
    ['::1', 128],
    ['::ffff:0:0', 96],
    ['64:ff9b::', 96],
    ['64:ff9b:1::', 48],
    ['100::', 64],
    ['2001::', 23],
    ['2001:db8::', 32],
    ['2002::', 16],
    ['3fff::', 20],
    ['5f00::', 16],
    ['fc00::', 7],
    ['fe80::', 10],
    ['ff00::', 8],
];

/**
 * Builds a {@link BlockList} for a single family. IPv4 and IPv6 denylists are kept
 * separate on purpose: Node's BlockList automatically checks the IPv4-mapped form of
 * an IPv4 address against IPv6 subnets, so mixing families in one list would cause the
 * ::ffff:0:0/96 entry to reject every IPv4 address. Separate lists avoid that.
 */
function buildBlockList(subnets: ReadonlyArray<readonly [string, number]>, family: 'ipv4' | 'ipv6'): BlockList {
    const list = new BlockList();
    for (const [network, prefix] of subnets) {
        list.addSubnet(network, prefix, family);
    }
    return list;
}

const ipv4BlockList = buildBlockList(BLOCKED_IPV4_SUBNETS, 'ipv4');
const ipv6BlockList = buildBlockList(BLOCKED_IPV6_SUBNETS, 'ipv6');

/**
 * Removes surrounding brackets from an IPv6 literal host (e.g. "[::1]" -> "::1").
 */
function stripBrackets(host: string): string {
    if (host.length >= 2 && host.startsWith('[') && host.endsWith(']')) {
        return host.slice(1, -1);
    }
    return host;
}

/**
 * Returns true only when the given address is a syntactically valid IP literal that
 * does not fall inside any reserved/private range. Invalid addresses are non-public.
 */
export function isPublicIpAddress(address: string): boolean {
    const normalized = stripBrackets(address);
    const version = isIP(normalized);
    if (version === 4) {
        return !ipv4BlockList.check(normalized, 'ipv4');
    }
    if (version === 6) {
        return !ipv6BlockList.check(normalized, 'ipv6');
    }
    return false;
}

/**
 * Enforces the per-hop URL policy: only http/https and no embedded credentials.
 */
function assertUrlPolicy(url: URL): void {
    const protocol = url.protocol.toLowerCase();
    if (protocol !== 'http:' && protocol !== 'https:') {
        throw new PublicUrlBlockedError();
    }
    if (url.username !== '' || url.password !== '') {
        throw new PublicUrlBlockedError();
    }
}

/**
 * Resolves the addresses for a URL. IP literals are used directly (no DNS); all other
 * hostnames are resolved through the injected dependency.
 */
async function resolveAddresses(url: URL, deps: PublicUrlDependencies): Promise<readonly ResolvedAddress[]> {
    const host = stripBrackets(url.hostname);
    const literalVersion = isIP(host);
    if (literalVersion === 4) {
        return [{ address: host, family: 4 }];
    }
    if (literalVersion === 6) {
        return [{ address: host, family: 6 }];
    }
    return deps.resolve(url.hostname);
}

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
 * Performs a GET request pinned to a single, pre-validated address while preserving
 * the original hostname for the Host header and TLS SNI. The connection's DNS lookup
 * is overridden so the socket can only reach the validated address.
 */
function performPinnedRequest(url: URL, address: ResolvedAddress): Promise<Response> {
    // Pin every connection attempt to the exact validated address. @types/node types
    // LookupFunction with the "all" callback form, which matches Node's happy-eyeballs
    // (autoSelectFamily) path used by the agents below.
    const lookup: LookupFunction = (_hostname, _options, callback) => {
        callback(null, [{ address: address.address, family: address.family }]);
    };
    const agent =
        url.protocol === 'https:'
            ? new HttpsAgent({ lookup, keepAlive: false })
            : new HttpAgent({ lookup, keepAlive: false });

    // This is the single controlled network egress for Cloudflare diagnostics.
    // Before this call every hop is validated:
    // (1) only http/https schemes and no embedded credentials are allowed;
    // (2) the host is resolved and EVERY resolved address must be a public IP literal
    //     (private/reserved/invalid ranges are rejected via node:net BlockList);
    // (3) the socket lookup is pinned to that validated address, so the connection
    //     cannot be re-pointed at an internal host via DNS;
    // (4) redirects are disabled here (redirect: 'manual') and are re-validated by the
    //     caller through this same function before any further hop.
    // This suppression documents a CodeQL modeling gap after real controls; it is not a
    // substitute for them.
    // @sarif-suppress 195 -- js/request-forgery
    return fetch(url, {
        method: 'GET',
        redirect: 'manual',
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        agent,
    });
}

/**
 * The production dependency set: DNS via node:dns/promises and requests pinned to the
 * resolved address.
 */
export const productionDependencies: PublicUrlDependencies = {
    async resolve(hostname: string): Promise<readonly ResolvedAddress[]> {
        const results = await dnsLookup(hostname, { all: true, verbatim: true });
        return results.map((entry): ResolvedAddress => ({
            address: entry.address,
            family: entry.family === 6 ? 6 : 4,
        }));
    },
    request(url: URL, address: ResolvedAddress): Promise<Response> {
        return performPinnedRequest(url, address);
    },
};

/**
 * Fetches a URL while guaranteeing that every hop targets a public IP address.
 *
 * For the initial URL and each redirect hop the same validation is applied: only
 * http/https schemes are allowed, embedded credentials are rejected, the host is
 * resolved (IP literals directly, otherwise DNS), an empty result is rejected, and
 * every resolved address must be a public IP literal. One validated address is chosen
 * and the request is pinned to it. Redirects (301/302/303/307/308) are followed
 * manually up to {@link MAX_REDIRECTS}; their bodies are destroyed and the Location is
 * re-validated. Missing Location headers, non-public redirect targets, and excess
 * redirects raise {@link PublicUrlBlockedError}. Ordinary DNS/fetch/timeout errors are
 * propagated unchanged so the caller can treat them as "not Cloudflare".
 */
export async function fetchPublicUrl(
    initialUrl: URL,
    deps: PublicUrlDependencies = productionDependencies
): Promise<Response> {
    let currentUrl = initialUrl;
    let redirectCount = 0;

    for (;;) {
        assertUrlPolicy(currentUrl);

        const addresses = await resolveAddresses(currentUrl, deps);
        if (addresses.length === 0) {
            throw new PublicUrlBlockedError();
        }
        for (const candidate of addresses) {
            if (!isPublicIpAddress(candidate.address)) {
                throw new PublicUrlBlockedError();
            }
        }

        const pinnedAddress = addresses[0];
        const response = await deps.request(currentUrl, pinnedAddress);

        if (!REDIRECT_STATUSES.has(response.status)) {
            return response;
        }

        // A redirect: we never follow more than MAX_REDIRECTS hops.
        if (redirectCount >= MAX_REDIRECTS) {
            destroyResponseBody(response);
            throw new PublicUrlBlockedError();
        }

        const location = response.headers.get('location');
        if (location === null || location === '') {
            destroyResponseBody(response);
            throw new PublicUrlBlockedError();
        }

        destroyResponseBody(response);

        let nextUrl: URL;
        try {
            nextUrl = new URL(location, currentUrl);
        } catch {
            throw new PublicUrlBlockedError();
        }

        currentUrl = nextUrl;
        redirectCount += 1;
    }
}
