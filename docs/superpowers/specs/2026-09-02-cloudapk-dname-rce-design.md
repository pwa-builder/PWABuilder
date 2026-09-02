# CloudAPK DName Command-Injection Remediation

## Problem

CloudAPK passes certificate subject fields from unauthenticated package-generation
requests to Bubblewrap 1.25.0. Bubblewrap's `KeyTool` joins those values into a
single command string and executes it through a shell. Its DName escaping does
not make arbitrary input safe for that shell context, allowing crafted
certificate data to become commands executed with the CloudAPK process's
privileges.

Bubblewrap owns the unsafe command-execution primitive. PWABuilder makes the
primitive remotely reachable by forwarding request data after presence-only
validation. The fix must therefore remove PWABuilder's dependency on the unsafe
primitive and validate certificate data at the API boundary.

## Scope

This change will:

- Validate new-key certificate subject fields on the server before package
  generation or queueing.
- Replace both Bubblewrap `KeyTool` call sites with an app-owned adapter that
  invokes `keytool` without a shell.
- Preserve signing-key generation and SHA-256 fingerprint extraction behavior.
- Add focused regression tests for validation and process argument boundaries.

This change will not modify container users, managed-identity permissions, or
production infrastructure. Those are valuable defense-in-depth measures but are
separate deployment changes.

## Components

### Signing-option validation

A focused validation utility will validate certificate subject values used when
`signingMode` is `new`.

- `fullName`, `organization`, and `organizationalUnit` must be non-empty after
  trimming, contain at most 128 Unicode code points, and contain only Unicode
  letters and numbers, ASCII spaces, periods, apostrophes, hyphens, underscores,
  and parentheses.
- `countryCode` must contain exactly two ASCII letters.
- Invalid fields produce ordinary request validation errors before package work
  begins.
- The same request-validation path serves direct and queued packaging routes, so
  one implementation protects every affected endpoint.

### Shell-free keytool adapter

An app-owned adapter will preserve the required subset of Bubblewrap `KeyTool`:

- Create or overwrite a signing key.
- List a key and parse its SHA-1 and SHA-256 fingerprints.

It will invoke the `keytool` executable through Node's `execFile` API using a
discrete argument array and `shell: false`. The DName will be passed as one
argument rather than embedded in a command string. Passwords, aliases, paths,
and DName values will likewise remain individual arguments.

The adapter will accept an injectable process executor so tests can inspect the
executable, arguments, and options without starting `keytool`.

## Data Flow

1. Express parses the package request.
2. Existing request validation checks required package and signing fields.
3. New server-side validation checks certificate subject syntax.
4. Invalid requests receive a validation response and never reach package
   creation.
5. Valid requests reach `BubbleWrapper`.
6. `BubbleWrapper` calls the shell-free adapter for key creation and fingerprint
   inspection.
7. The operating system launches `keytool` directly, with no shell parsing
   between request data and the executable.

## Error Handling

Validation failures will use the existing package-request error path and name
the invalid field without reflecting its submitted value. The adapter will
redact passwords, aliases, paths, and subject values from process failures
before rethrowing them into the existing error path. It will not log complete
process arguments.

## Testing

Node's built-in test runner will cover:

- Valid internationalized subject names and valid country codes.
- Empty, oversized, control-character, DName-delimiter, quote, backtick, dollar,
  and shell-operator inputs.
- Validation of each DName field and the country code.
- Direct argument construction for key creation and key listing.
- `shell: false` and one-argument preservation for every untrusted value.
- Overwrite behavior and fingerprint parsing.

The TypeScript build remains the compatibility gate for all production and test
code.

## Upstream Follow-up

The underlying Bubblewrap behavior should be reported and fixed upstream.
PWABuilder must retain its server-side validation and shell-free adapter until a
released Bubblewrap version provides equivalent guarantees and migration is
verified.
