# CloudAPK CodeQL Alert Remediation

## Problem

PR #6327 has two CodeQL findings unrelated to its keytool remediation:

1. Cloudflare diagnostics perform a second request to the user-provided icon URL.
   The existing hostname denylist does not prevent DNS rebinding, redirects to
   internal services, or all non-public IPv4 and IPv6 destinations.
2. Queue identifiers hash the complete request object with a hand-written loop.
   The request body is bounded, but CodeQL still traces user-controlled data into
   the loop bound.

The first finding is a real pre-existing SSRF risk. The second is not an
unbounded loop in practice, but server-generated identifiers eliminate the
tainted data flow and provide better uniqueness.

## Scope

This change will:

- Preserve Cloudflare-specific error guidance.
- Route the diagnostic request through a public-only, DNS-pinned fetch helper.
- Validate every redirect before following it.
- Replace request-derived queue hashes with full random UUIDs.
- Remove the unused hash helper.
- Add network-free regression tests for both findings.

It will not change normal package resource fetching, proxy behavior, queue
storage, or the keytool remediation.

## Public-only Fetch Boundary

A focused utility will accept an HTTP(S) URL and dependencies for DNS resolution
and fetching. Production dependencies use Node DNS, `http.Agent` or
`https.Agent`, and `node-fetch`; tests inject deterministic fakes.

For each request hop, the helper will:

1. Parse the URL and reject non-HTTP(S) schemes or embedded credentials.
2. Resolve all A and AAAA records with `dns.lookup(..., { all: true })`, unless
   the hostname is already an IP literal.
3. Reject the request if no address resolves or if any resolved address belongs
   to a non-public IPv4 or IPv6 range. IPv4 blocks are `0.0.0.0/8`,
   `10.0.0.0/8`, `100.64.0.0/10`, `127.0.0.0/8`, `169.254.0.0/16`,
   `172.16.0.0/12`, `192.0.0.0/24`, `192.0.2.0/24`, `192.88.99.0/24`,
   `192.168.0.0/16`, `198.18.0.0/15`, `198.51.100.0/24`,
   `203.0.113.0/24`, `224.0.0.0/4`, and `240.0.0.0/4`. IPv6 blocks are
   `::/128`, `::1/128`, `::ffff:0:0/96`, `64:ff9b::/96`,
   `64:ff9b:1::/48`, `100::/64`, `2001::/23`, `2001:db8::/32`,
   `2002::/16`, `3fff::/20`, `5f00::/16`, `fc00::/7`, `fe80::/10`, and
   `ff00::/8`.
4. Select one validated public address and pin the request agent's lookup
   callback to that address. The URL hostname remains unchanged for the Host
   header and TLS server-name validation.
5. Request with redirects disabled and a five-second timeout.
6. For HTTP redirect statuses, resolve a relative `Location` header against the
   current URL and repeat the complete validation process. At most three
   redirects are allowed.

The helper returns the final response after the caller can inspect its headers.
Response bodies will be destroyed after Cloudflare detection because their
contents are not needed.

The guarded `fetch` sink will carry a narrow SARIF suppression with a
justification describing complete address validation, DNS pinning, and redirect
revalidation. The suppression documents a static-analysis modeling gap; it does
not replace the runtime controls.

## Cloudflare Detection

`PackageCreator` will use the public-only helper rather than calling
`node-fetch` directly. It will identify Cloudflare from the final `Server`
response header case-insensitively.

Blocked destinations, DNS failures, timeouts, malformed redirects, excessive
redirects, and fetch failures will all produce `false`. Package generation will
continue to display the existing generic CDN/firewall guidance, preserving the
diagnostic's best-effort behavior without exposing internal error details.

## Queue Identifiers

A small utility will create IDs in this form:

```text
googleplaypackagejob:<PWA host>:<full UUID>
```

Production uses `node:crypto.randomUUID()`. Tests can provide a deterministic
UUID value. The queue no longer serializes or hashes package request data, and
the obsolete `hashCode.ts` utility will be deleted.

The host remains in the identifier to preserve operational readability. The
full UUID is retained rather than truncated to avoid unnecessary collision
risk.

## Testing

Public-only fetch tests will use injected DNS and fetch functions and will never
open a socket. They will cover:

- HTTP(S) acceptance and scheme/credential rejection.
- Public IPv4 and IPv6 resolution.
- Direct and DNS-resolved non-public addresses across every denied range.
- Mixed public and non-public DNS responses.
- DNS pinning passed to the request agent.
- Relative and absolute redirects, including redirect-to-private rejection.
- Missing locations, redirect limits, DNS failures, timeouts, and fetch errors.
- Cloudflare header detection and generic fallback behavior.

Queue ID tests will verify:

- The expected host and full deterministic UUID format.
- Different UUIDs produce different IDs for the same request.
- Request properties do not influence the random identifier suffix.
- The queue no longer imports or calls `createHash`.

The existing CloudAPK test suite and TypeScript build remain required gates.
