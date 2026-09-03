# CloudAPK CodeQL Alert Remediation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminate the two CodeQL data flows by making Cloudflare diagnostics public-network-only and generating queue IDs entirely from server randomness.

**Architecture:** A public-URL helper validates and resolves every request hop, rejects non-public addresses, and passes a validated address to a DNS-pinned request function. A Cloudflare detector consumes only response headers and treats every blocked or failed probe as an inconclusive result. Queue IDs move to a focused `randomUUID()` utility, removing request-object hashing.

**Tech Stack:** TypeScript 7, Node.js 24 DNS/net/http/https/crypto APIs, `node-fetch`, Node built-in test runner.

---

## File Structure

- Create `apps/pwabuilder-google-play/utils/public-url-fetch.ts`: URL parsing, public-address policy, DNS resolution, connection pinning, redirect handling, and timeout.
- Create `apps/pwabuilder-google-play/utils/cloudflare-detection.ts`: best-effort Cloudflare header detection.
- Create `apps/pwabuilder-google-play/tests/public-url-fetch.test.ts`: network-free address, pinning, and redirect tests.
- Create `apps/pwabuilder-google-play/tests/cloudflare-detection.test.ts`: network-free detection and fallback tests.
- Modify `apps/pwabuilder-google-play/services/packageCreator.ts`: use the detector and remove the direct request and hostname denylist.
- Create `apps/pwabuilder-google-play/utils/package-job-id.ts`: full UUID queue ID generation.
- Create `apps/pwabuilder-google-play/tests/package-job-id.test.ts`: deterministic ID tests.
- Modify `apps/pwabuilder-google-play/services/packageJobQueue.ts`: use the UUID helper.
- Delete `apps/pwabuilder-google-play/utils/hashCode.ts`: remove the tainted loop.
- Modify `apps/pwabuilder-google-play/package.json`: include the three new emitted JavaScript tests.

### Task 1: Public-only Cloudflare diagnostic

**Files:**
- Create: `apps/pwabuilder-google-play/utils/public-url-fetch.ts`
- Create: `apps/pwabuilder-google-play/utils/cloudflare-detection.ts`
- Create: `apps/pwabuilder-google-play/tests/public-url-fetch.test.ts`
- Create: `apps/pwabuilder-google-play/tests/cloudflare-detection.test.ts`
- Modify: `apps/pwabuilder-google-play/services/packageCreator.ts:108-144,191-200,248-266`
- Modify: `apps/pwabuilder-google-play/package.json:7-16`

- [ ] **Step 1: Add test files to the existing test script**

Append these emitted files to the `test` command in
`apps/pwabuilder-google-play/package.json`:

```text
./tests/public-url-fetch.test.js ./tests/cloudflare-detection.test.js
```

- [ ] **Step 2: Write failing public-address policy tests**

Create `apps/pwabuilder-google-play/tests/public-url-fetch.test.ts`. Import the
public API that will be implemented in Step 6:

```ts
import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { Response } from 'node-fetch';
import {
    PublicUrlBlockedError,
    fetchPublicUrl,
    isPublicIpAddress,
    type PublicUrlDependencies,
    type ResolvedAddress,
} from '../utils/public-url-fetch.js';
```

Use this fake response helper:

```ts
function response(
    status: number,
    headers: Record<string, string> = {}
): Response {
    return {
        status,
        headers: new Headers(headers),
    } as Response;
}
```

Add table-driven tests asserting `isPublicIpAddress(address)` returns `false`
for representative first and last addresses in every specified range:

```ts
const blockedAddresses = [
    '0.0.0.0', '0.255.255.255',
    '10.0.0.1', '100.64.0.1', '127.0.0.1', '169.254.169.254',
    '172.16.0.1', '172.31.255.255', '192.0.0.1', '192.0.2.1',
    '192.88.99.1', '192.168.1.1', '198.18.0.1', '198.51.100.1',
    '203.0.113.1', '224.0.0.1', '255.255.255.255',
    '::', '::1', '::ffff:127.0.0.1', '64:ff9b::1',
    '64:ff9b:1::1', '100::1', '2001::1', '2001:db8::1',
    '2002::1', '3fff::1', '5f00::1', 'fc00::1', 'fe80::1', 'ff00::1',
] as const;

for (const address of blockedAddresses) {
    test(`blocks non-public address ${address}`, () => {
        assert.equal(isPublicIpAddress(address), false);
    });
}

for (const address of ['8.8.8.8', '1.1.1.1', '2001:4860:4860::8888']) {
    test(`allows public address ${address}`, () => {
        assert.equal(isPublicIpAddress(address), true);
    });
}
```

- [ ] **Step 3: Write failing DNS, pinning, and redirect tests**

Build injected dependencies without opening sockets:

```ts
type RequestRecord = {
    url: URL;
    address: ResolvedAddress;
};

function dependencies(
    resolved: Record<string, readonly ResolvedAddress[]>,
    responses: readonly Response[],
    requests: RequestRecord[]
): PublicUrlDependencies {
    let responseIndex = 0;
    return {
        resolve: async hostname => resolved[hostname] ?? [],
        request: async (url, address) => {
            requests.push({ url, address });
            return responses[responseIndex++];
        },
    };
}
```

Add tests proving:

```ts
test('pins a validated public DNS result', async () => {
    const requests: RequestRecord[] = [];
    const deps = dependencies(
        { 'example.com': [{ address: '203.0.114.10', family: 4 }] },
        [response(200)],
        requests
    );

    await fetchPublicUrl(new URL('https://example.com/icon.png'), deps);

    assert.deepEqual(requests, [{
        url: new URL('https://example.com/icon.png'),
        address: { address: '203.0.114.10', family: 4 },
    }]);
});

test('rejects a mixed public and private DNS answer before requesting', async () => {
    const requests: RequestRecord[] = [];
    const deps = dependencies(
        {
            'example.com': [
                { address: '203.0.114.10', family: 4 },
                { address: '127.0.0.1', family: 4 },
            ],
        },
        [],
        requests
    );

    await assert.rejects(
        fetchPublicUrl(new URL('https://example.com/icon.png'), deps),
        PublicUrlBlockedError
    );
    assert.deepEqual(requests, []);
});

test('revalidates and pins every redirect', async () => {
    const requests: RequestRecord[] = [];
    const deps = dependencies(
        {
            'example.com': [{ address: '203.0.114.10', family: 4 }],
            'cdn.example': [{ address: '203.0.114.20', family: 4 }],
        },
        [
            response(302, { location: 'https://cdn.example/icon.png' }),
            response(200),
        ],
        requests
    );

    await fetchPublicUrl(new URL('https://example.com/icon.png'), deps);

    assert.deepEqual(requests.map(item => item.address.address), [
        '203.0.114.10',
        '203.0.114.20',
    ]);
});

test('blocks a redirect to a private address', async () => {
    const requests: RequestRecord[] = [];
    const deps = dependencies(
        { 'example.com': [{ address: '203.0.114.10', family: 4 }] },
        [response(302, { location: 'http://127.0.0.1/metadata' })],
        requests
    );

    await assert.rejects(
        fetchPublicUrl(new URL('https://example.com/icon.png'), deps),
        PublicUrlBlockedError
    );
    assert.equal(requests.length, 1);
});
```

Also cover non-HTTP(S), embedded credentials, empty DNS results, redirects without
`Location`, and a fourth redirect exceeding the three-hop limit.

- [ ] **Step 4: Write failing Cloudflare detector tests**

Create `apps/pwabuilder-google-play/tests/cloudflare-detection.test.ts`:

```ts
import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { Response } from 'node-fetch';
import {
    detectCloudflare,
    type PublicUrlFetcher,
} from '../utils/cloudflare-detection.js';

function fakeResponse(server: string | null): Response {
    return {
        headers: new Headers(server ? { server } : {}),
        body: {
            destroyCalled: false,
            destroy() {
                this.destroyCalled = true;
            },
        },
    } as unknown as Response;
}

test('detects the Cloudflare server header case-insensitively', async () => {
    const fetcher: PublicUrlFetcher = async () =>
        fakeResponse('CloudFlare');

    assert.equal(await detectCloudflare('https://example.com/icon.png', fetcher), true);
});

test('returns false for blocked or failed probes', async () => {
    const fetcher: PublicUrlFetcher = async () => {
        throw new Error('blocked');
    };

    assert.equal(await detectCloudflare('https://example.com/icon.png', fetcher), false);
});
```

Add cases for a non-Cloudflare header, a missing header, malformed URL, and body
destruction after both positive and negative final responses.

- [ ] **Step 5: Run tests to verify they fail**

Run:

```powershell
Set-Location apps\pwabuilder-google-play
npm run build
```

Expected: FAIL because `public-url-fetch.ts` and `cloudflare-detection.ts` do not
exist.

- [ ] **Step 6: Implement the public URL policy**

Create `apps/pwabuilder-google-play/utils/public-url-fetch.ts` with these public
types and constants:

```ts
import { Agent as HttpAgent } from 'node:http';
import { isIP, BlockList, type LookupFunction } from 'node:net';
import { Agent as HttpsAgent } from 'node:https';
import { lookup } from 'node:dns/promises';
import fetch, { type RequestInit, type Response } from 'node-fetch';

export type ResolvedAddress = {
    address: string;
    family: 4 | 6;
};

export type PublicUrlDependencies = {
    resolve: (hostname: string) => Promise<readonly ResolvedAddress[]>;
    request: (url: URL, address: ResolvedAddress) => Promise<Response>;
};

export class PublicUrlBlockedError extends Error {
    constructor() {
        super('Public URL request was blocked');
        this.name = 'PublicUrlBlockedError';
    }
}

const redirectStatuses = new Set([301, 302, 303, 307, 308]);
const maxRedirects = 3;
const requestTimeoutMs = 5000;
const blockedAddresses = new BlockList();
```

Initialize `blockedAddresses` once with the exact IPv4 and IPv6 subnets from the
design. Add each using `addSubnet(network, prefix, 'ipv4' | 'ipv6')`.

Implement address checking:

```ts
export function isPublicIpAddress(address: string): boolean {
    const normalizedAddress =
        address.startsWith('[') && address.endsWith(']')
            ? address.slice(1, -1)
            : address;
    const family = isIP(normalizedAddress);
    if (family === 0) {
        return false;
    }

    return !blockedAddresses.check(
        normalizedAddress,
        family === 4 ? 'ipv4' : 'ipv6'
    );
}
```

Implement production DNS and a pinned request:

```ts
async function resolveHost(hostname: string): Promise<readonly ResolvedAddress[]> {
    const literal = hostname.replace(/^\[|\]$/gu, '');
    const literalFamily = isIP(literal);
    if (literalFamily !== 0) {
        return [{ address: literal, family: literalFamily }];
    }

    const results = await lookup(hostname, { all: true, verbatim: true });
    return results
        .filter((result): result is ResolvedAddress =>
            result.family === 4 || result.family === 6
        )
        .map(result => ({ address: result.address, family: result.family }));
}

function createPinnedLookup(address: ResolvedAddress): LookupFunction {
    return (_hostname, _options, callback) => {
        callback(null, address.address, address.family);
    };
}

async function requestPinnedUrl(
    url: URL,
    address: ResolvedAddress
): Promise<Response> {
    const lookup = createPinnedLookup(address);
    const agent =
        url.protocol === 'https:'
            ? new HttpsAgent({ lookup })
            : new HttpAgent({ lookup });
    const options: RequestInit = {
        agent,
        redirect: 'manual',
        signal: AbortSignal.timeout(requestTimeoutMs),
    };

    // @sarif-suppress 195 The URL is limited to HTTP(S), every resolved address
    // is public, the connection is pinned to that address, and redirects are
    // disabled here and revalidated by fetchPublicUrl.
    return await fetch(url, options);
}

const productionDependencies: PublicUrlDependencies = {
    resolve: resolveHost,
    request: requestPinnedUrl,
};
```

Implement the redirect loop:

```ts
export async function fetchPublicUrl(
    initialUrl: URL,
    dependencies: PublicUrlDependencies = productionDependencies
): Promise<Response> {
    let currentUrl = initialUrl;

    for (let redirectCount = 0; redirectCount <= maxRedirects; redirectCount++) {
        if (
            (currentUrl.protocol !== 'http:' && currentUrl.protocol !== 'https:') ||
            currentUrl.username ||
            currentUrl.password
        ) {
            throw new PublicUrlBlockedError();
        }

        const addresses = await dependencies.resolve(
            currentUrl.hostname.replace(/^\[|\]$/gu, '')
        );
        if (
            addresses.length === 0 ||
            addresses.some(result => !isPublicIpAddress(result.address))
        ) {
            throw new PublicUrlBlockedError();
        }

        const response = await dependencies.request(currentUrl, addresses[0]);
        if (!redirectStatuses.has(response.status)) {
            return response;
        }

        response.body?.destroy();
        const location = response.headers.get('location');
        if (!location || redirectCount === maxRedirects) {
            throw new PublicUrlBlockedError();
        }

        currentUrl = new URL(location, currentUrl);
    }

    throw new PublicUrlBlockedError();
}
```

- [ ] **Step 7: Implement Cloudflare detection**

Create `apps/pwabuilder-google-play/utils/cloudflare-detection.ts`:

```ts
import type { Response } from 'node-fetch';
import { fetchPublicUrl } from './public-url-fetch.js';

export type PublicUrlFetcher = (url: URL) => Promise<Response>;

export async function detectCloudflare(
    url: string,
    fetcher: PublicUrlFetcher = fetchPublicUrl
): Promise<boolean> {
    try {
        const response = await fetcher(new URL(url));
        try {
            return response.headers
                .get('server')
                ?.toLowerCase()
                .includes('cloudflare') ?? false;
        } finally {
            response.body?.destroy();
        }
    } catch {
        return false;
    }
}
```

- [ ] **Step 8: Replace the PackageCreator probe**

In `apps/pwabuilder-google-play/services/packageCreator.ts`:

1. Add:

```ts
import { detectCloudflare } from '../utils/cloudflare-detection.js';
```

2. Replace:

```ts
const isCloudflare = await this.TryCheckCloudflare(options.iconUrl);
```

with:

```ts
const isCloudflare = await detectCloudflare(options.iconUrl);
```

3. Delete `isSafeUrlForFetch` and `TryCheckCloudflare`.

4. Remove the direct `node-fetch` import only if no other code in the file uses
   it.

- [ ] **Step 9: Run focused and full verification**

Run:

```powershell
Set-Location apps\pwabuilder-google-play
npm test
npm run build
```

Expected: all existing and new tests PASS.

Run:

```powershell
git diff --check
```

Expected: exit code 0.

- [ ] **Step 10: Commit the SSRF remediation**

```powershell
git add apps\pwabuilder-google-play\package.json apps\pwabuilder-google-play\services\packageCreator.ts apps\pwabuilder-google-play\utils\public-url-fetch.ts apps\pwabuilder-google-play\utils\cloudflare-detection.ts apps\pwabuilder-google-play\tests\public-url-fetch.test.ts apps\pwabuilder-google-play\tests\cloudflare-detection.test.ts
git commit -m "fix: restrict CloudAPK diagnostic requests" -m "Co-authored-by: Copilot App <223556219+Copilot@users.noreply.github.com>" -m "Copilot-Session: 83102b33-f950-4f02-93ca-73300288c495"
```

### Task 2: Server-generated package job IDs

**Files:**
- Create: `apps/pwabuilder-google-play/utils/package-job-id.ts`
- Create: `apps/pwabuilder-google-play/tests/package-job-id.test.ts`
- Modify: `apps/pwabuilder-google-play/services/packageJobQueue.ts:1-5,137-153`
- Modify: `apps/pwabuilder-google-play/package.json:7-16`
- Delete: `apps/pwabuilder-google-play/utils/hashCode.ts`

- [ ] **Step 1: Add the emitted test to the test script**

Append:

```text
./tests/package-job-id.test.js
```

to the existing package `test` command.

- [ ] **Step 2: Write the failing ID tests**

Create `apps/pwabuilder-google-play/tests/package-job-id.test.ts`:

```ts
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createPackageJobId } from '../utils/package-job-id.js';

test('uses the PWA host and complete server-generated UUID', () => {
    const uuid = '12345678-1234-4234-8234-123456789abc';

    assert.equal(
        createPackageJobId('https://example.com/app', () => uuid),
        `googleplaypackagejob:example.com:${uuid}`
    );
});

test('does not derive the unique suffix from request data', () => {
    const first = createPackageJobId(
        'https://example.com/one',
        () => '11111111-1111-4111-8111-111111111111'
    );
    const second = createPackageJobId(
        'https://example.com/two',
        () => '22222222-2222-4222-8222-222222222222'
    );

    assert.equal(first.endsWith('11111111-1111-4111-8111-111111111111'), true);
    assert.equal(second.endsWith('22222222-2222-4222-8222-222222222222'), true);
    assert.notEqual(first, second);
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run:

```powershell
Set-Location apps\pwabuilder-google-play
npm run build
```

Expected: FAIL because `package-job-id.ts` does not exist.

- [ ] **Step 4: Implement the job ID utility**

Create `apps/pwabuilder-google-play/utils/package-job-id.ts`:

```ts
import { randomUUID } from 'node:crypto';

export type UuidFactory = () => string;

export function createPackageJobId(
    pwaUrl: string,
    createUuid: UuidFactory = randomUUID
): string {
    const pwaHost = new URL(pwaUrl).host;
    return `googleplaypackagejob:${pwaHost}:${createUuid()}`;
}
```

- [ ] **Step 5: Replace request hashing in the queue**

In `apps/pwabuilder-google-play/services/packageJobQueue.ts`, replace:

```ts
import { createHash } from "../utils/hashCode.js";
```

with:

```ts
import { createPackageJobId } from "../utils/package-job-id.js";
```

Replace:

```ts
const hash = createHash(packageArgs).toString() + createHash(Date.now());
const pwaUri = new URL(packageArgs.pwaUrl);
const id = `googleplaypackagejob:${pwaUri.host}:${hash.slice(-6)}`;
```

with:

```ts
const id = createPackageJobId(packageArgs.pwaUrl);
```

Delete `apps/pwabuilder-google-play/utils/hashCode.ts`.

- [ ] **Step 6: Prove request hashing is gone**

Run:

```powershell
Get-ChildItem apps\pwabuilder-google-play -Recurse -Filter *.ts |
    Select-String -Pattern 'createHash\(|utils/hashCode'
```

Expected: no matches.

- [ ] **Step 7: Run all tests and build**

Run:

```powershell
Set-Location apps\pwabuilder-google-play
npm test
npm run build
```

Expected: all tests PASS and TypeScript compilation succeeds.

- [ ] **Step 8: Commit the queue ID remediation**

```powershell
git add apps\pwabuilder-google-play\package.json apps\pwabuilder-google-play\services\packageJobQueue.ts apps\pwabuilder-google-play\utils\package-job-id.ts apps\pwabuilder-google-play\tests\package-job-id.test.ts
git rm apps\pwabuilder-google-play\utils\hashCode.ts
git commit -m "fix: generate CloudAPK job IDs server-side" -m "Co-authored-by: Copilot App <223556219+Copilot@users.noreply.github.com>" -m "Copilot-Session: 83102b33-f950-4f02-93ca-73300288c495"
```

### Task 3: Final CodeQL-path verification

**Files:**
- Verify all CloudAPK changes since `origin/main`
- Modify only if a review finds a concrete defect

- [ ] **Step 1: Run the complete local suite**

```powershell
Set-Location apps\pwabuilder-google-play
npm test
npm run build
```

Expected: all tests PASS.

- [ ] **Step 2: Check the two original data-flow sinks**

From the repository root:

```powershell
Get-ChildItem apps\pwabuilder-google-play -Recurse -Filter *.ts |
    Select-String -Pattern 'fetch\(iconUrl|createHash\(packageArgs|utils/hashCode'
```

Expected: no matches.

- [ ] **Step 3: Confirm the suppression is limited to the hardened sink**

```powershell
Get-ChildItem apps\pwabuilder-google-play -Recurse -Filter *.ts |
    Select-String -Pattern '@sarif-suppress 195'
```

Expected: the new DNS-pinned request plus the pre-existing `/fetch` endpoint
suppression are the only matches.

- [ ] **Step 4: Review and push**

Run:

```powershell
git diff --check
git status --short
git push
```

Expected: diff check succeeds, status is clean, and the existing PR branch is
updated.

- [ ] **Step 5: Verify PR checks**

Wait for PR #6327's CodeQL check to complete. The check must have no annotations
for `js/request-forgery` in `packageCreator.ts` or `js/loop-bound-injection` in
`hashCode.ts`.
