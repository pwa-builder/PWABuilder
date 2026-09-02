# CloudAPK DName RCE Remediation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prevent remote command execution through CloudAPK signing fields by validating certificate subjects server-side and launching `keytool` without a shell.

**Architecture:** Add a pure signing-option validator to the shared request-validation path, protecting direct and queued packaging. Replace Bubblewrap's shell-backed `KeyTool` calls with a focused app-owned adapter that uses `execFile` with discrete arguments and `shell: false`, preserves key generation and fingerprint parsing, and redacts user-controlled values from process errors.

**Tech Stack:** TypeScript 7, Node.js 24+, Express, Node `child_process.execFile`, Node built-in test runner, existing Bubblewrap `JdkHelper`.

---

## File Structure

- Create `apps/pwabuilder-google-play/utils/signing-options-validation.ts`: pure validation for certificate subject fields.
- Create `apps/pwabuilder-google-play/tests/signing-options-validation.test.ts`: validator regression tests.
- Create `apps/pwabuilder-google-play/services/safe-key-tool.ts`: shell-free key generation, key listing, fingerprint parsing, and process-error redaction.
- Create `apps/pwabuilder-google-play/tests/safe-key-tool.test.ts`: argument-boundary, shell-option, overwrite, parsing, and redaction tests.
- Modify `apps/pwabuilder-google-play/routes/project.ts`: invoke the validator for `signingMode: "new"`.
- Modify `apps/pwabuilder-google-play/services/bubbleWrapper.ts`: use `SafeKeyTool` instead of Bubblewrap's `KeyTool`.
- Modify `apps/pwabuilder-google-play/package.json`: add a deterministic test command using the existing `ts-node` loader.
- Modify `docs/superpowers/specs/2026-09-02-cloudapk-dname-rce-design.md`: retain the clarified adapter-level error-redaction requirement.

### Task 1: Server-side certificate-subject validation

**Files:**
- Create: `apps/pwabuilder-google-play/tests/signing-options-validation.test.ts`
- Create: `apps/pwabuilder-google-play/utils/signing-options-validation.ts`
- Modify: `apps/pwabuilder-google-play/routes/project.ts:1-17,486-521`
- Modify: `apps/pwabuilder-google-play/package.json:7-15`

- [ ] **Step 1: Add the test command**

Add this script to `apps/pwabuilder-google-play/package.json`:

```json
"test": "node --loader ts-node/esm --test ./tests/signing-options-validation.test.ts ./tests/safe-key-tool.test.ts"
```

Until Task 2 creates the second test, run the first file explicitly rather than
running `npm test`.

- [ ] **Step 2: Write the failing validator tests**

Create `apps/pwabuilder-google-play/tests/signing-options-validation.test.ts`:

```ts
import assert from 'node:assert/strict';
import test from 'node:test';
import { SigningOptions } from '../models/signingOptions.js';
import { validateNewKeySigningOptions } from '../utils/signing-options-validation.js';

const validSigning: SigningOptions = {
    file: null,
    alias: 'release',
    fullName: 'Jose Example',
    organization: 'Example Org',
    organizationalUnit: 'Mobile Apps',
    countryCode: 'US',
    keyPassword: 'key-password',
    storePassword: 'store-password',
};

const nameFields = [
    'fullName',
    'organization',
    'organizationalUnit',
] as const;

test('accepts valid certificate subject values', () => {
    const signing = {
        ...validSigning,
            fullName: "Jos\u00e9 O'Connor",
        organization: 'Example (Europe)',
            organizationalUnit: '\u00c9quipe Num\u00e9ro 2',
    };

    assert.deepEqual(validateNewKeySigningOptions(signing), []);
});

test('rejects unsafe characters in every certificate name field', () => {
    const unsafeValues = [
        'quote"value',
        'comma,value',
        'equals=value',
        'shell;value',
        'pipe|value',
        'ampersand&value',
        'dollar$value',
        'backtick`value',
        'line\nbreak',
        'tab\tvalue',
        'backslash\\value',
    ];

    for (const field of nameFields) {
        for (const value of unsafeValues) {
            const errors = validateNewKeySigningOptions({
                ...validSigning,
                [field]: value,
            });

            assert.deepEqual(errors, [
                `Signing option ${field} contains unsupported characters`,
            ]);
        }
    }
});

test('rejects blank and oversized certificate name fields', () => {
    for (const field of nameFields) {
        assert.deepEqual(
            validateNewKeySigningOptions({ ...validSigning, [field]: '   ' }),
            [`Signing option ${field} must not be blank`],
        );
        assert.deepEqual(
            validateNewKeySigningOptions({ ...validSigning, [field]: 'a'.repeat(129) }),
            [`Signing option ${field} must contain at most 128 characters`],
        );
    }
});

test('requires a two-letter country code without reflecting input', () => {
    for (const countryCode of ['U', 'USA', '1A', 'U$', ' U', 'us\n']) {
        assert.deepEqual(
            validateNewKeySigningOptions({ ...validSigning, countryCode }),
            ['Signing option countryCode must contain exactly two letters'],
        );
    }
});
```

- [ ] **Step 3: Run the validator test to verify it fails**

Run:

```powershell
Set-Location apps\pwabuilder-google-play
node --loader ts-node/esm --test .\tests\signing-options-validation.test.ts
```

Expected: FAIL because `utils/signing-options-validation.ts` does not exist.

- [ ] **Step 4: Implement the validator**

Create `apps/pwabuilder-google-play/utils/signing-options-validation.ts`:

```ts
import { SigningOptions } from '../models/signingOptions.js';

const maxDNameValueLength = 128;
const validDNameValuePattern = /^[\p{L}\p{N} .'_()-]+$/u;
const dNameFields = [
    'fullName',
    'organization',
    'organizationalUnit',
] as const;

export function validateNewKeySigningOptions(signing: SigningOptions): string[] {
    const errors: string[] = [];

    for (const field of dNameFields) {
        const value = signing[field];
        if (!value) {
            continue;
        }

        const trimmedValue = value.trim();
        if (!trimmedValue) {
            errors.push(`Signing option ${field} must not be blank`);
        } else if ([...trimmedValue].length > maxDNameValueLength) {
            errors.push(`Signing option ${field} must contain at most 128 characters`);
        } else if (!validDNameValuePattern.test(trimmedValue)) {
            errors.push(`Signing option ${field} contains unsupported characters`);
        }
    }

    if (signing.countryCode && !/^[A-Za-z]{2}$/.test(signing.countryCode)) {
        errors.push('Signing option countryCode must contain exactly two letters');
    }

    return errors;
}
```

- [ ] **Step 5: Wire validation into every package route**

In `apps/pwabuilder-google-play/routes/project.ts`, add:

```ts
import { validateNewKeySigningOptions } from '../utils/signing-options-validation.js';
```

Inside the existing `if (options.signingMode === 'new')` block, after adding the
required fields, add:

```ts
if (options.signing) {
    validationErrors.push(...validateNewKeySigningOptions(options.signing));
}
```

Remove this existing statement from the outer signing-validation block so
passwords and subject data are never written to logs:

```ts
console.log("options.signing", options.signing);
```

This shared function is called by both direct package generation and queued job
submission, so no route-specific duplicate is needed.

- [ ] **Step 6: Run the validator tests and TypeScript build**

Run:

```powershell
Set-Location apps\pwabuilder-google-play
node --loader ts-node/esm --test .\tests\signing-options-validation.test.ts
npm run build
```

Expected: all four tests PASS and `tsc --noEmitOnError` exits successfully.

- [ ] **Step 7: Commit the validation layer**

```powershell
git add apps\pwabuilder-google-play\package.json apps\pwabuilder-google-play\routes\project.ts apps\pwabuilder-google-play\utils\signing-options-validation.ts apps\pwabuilder-google-play\tests\signing-options-validation.test.ts
git commit -m "fix: validate CloudAPK certificate subjects" -m "Co-authored-by: Copilot App <223556219+Copilot@users.noreply.github.com>" -m "Copilot-Session: 83102b33-f950-4f02-93ca-73300288c495"
```

### Task 2: Shell-free keytool adapter

**Files:**
- Create: `apps/pwabuilder-google-play/tests/safe-key-tool.test.ts`
- Create: `apps/pwabuilder-google-play/services/safe-key-tool.ts`
- Reuse: `apps/pwabuilder-google-play/utils/redactSecrets.ts`

- [ ] **Step 1: Write failing process-boundary tests**

Create `apps/pwabuilder-google-play/tests/safe-key-tool.test.ts`:

```ts
import assert from 'node:assert/strict';
import { promises as fs } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import test from 'node:test';
import {
    KeyToolExecutor,
    SafeKeyTool,
} from '../services/safe-key-tool.js';

test('passes signing values as discrete arguments with shell disabled', async () => {
    const calls: Parameters<KeyToolExecutor>[] = [];
    const executor: KeyToolExecutor = async (...args) => {
        calls.push(args);
        return { stdout: '', stderr: '' };
    };
    const keyPath = join(tmpdir(), `${randomUUID()}.jks`);
    const keyTool = new SafeKeyTool(() => ({ PATH: process.env.PATH }), executor);

    await keyTool.createSigningKey({
        path: keyPath,
        alias: 'release alias',
        keypassword: 'key password',
        password: 'store password',
        fullName: 'Name; remains data',
        organizationalUnit: 'Mobile Apps',
        organization: 'Example Org',
        country: 'US',
    });

    assert.equal(calls.length, 1);
    const [executable, args, options] = calls[0];
    assert.equal(executable, 'keytool');
    assert.equal(options.shell, false);
    assert.equal(args[args.indexOf('-dname') + 1],
        'CN=Name; remains data, OU=Mobile Apps, O=Example Org, C=US');
    assert.equal(args[args.indexOf('-alias') + 1], 'release alias');
    assert.equal(args[args.indexOf('-keypass') + 1], 'key password');
    assert.equal(args[args.indexOf('-storepass') + 1], 'store password');
});

test('lists a key without shell parsing and extracts fingerprints', async () => {
    const calls: Parameters<KeyToolExecutor>[] = [];
    const executor: KeyToolExecutor = async (...args) => {
        calls.push(args);
        return {
            stdout: 'SHA1: 11:22\nSHA256: AA:BB:CC\n',
            stderr: '',
        };
    };
    const keyPath = join(tmpdir(), `${randomUUID()}.jks`);
    await fs.writeFile(keyPath, 'test');

    try {
        const keyTool = new SafeKeyTool(() => ({ PATH: process.env.PATH }), executor);
        const info = await keyTool.keyInfo({
            path: keyPath,
            alias: 'release',
            keypassword: 'key-password',
            password: 'store-password',
        });

        assert.equal(calls[0][2].shell, false);
        assert.equal(info.fingerprints.get('SHA256'), 'AA:BB:CC');
    } finally {
        await fs.rm(keyPath, { force: true });
    }
});

test('honors overwrite behavior before launching keytool', async () => {
    const executor: KeyToolExecutor = async () => ({ stdout: '', stderr: '' });
    const keyPath = join(tmpdir(), `${randomUUID()}.jks`);
    await fs.writeFile(keyPath, 'old-key');
    const keyTool = new SafeKeyTool(() => ({ PATH: process.env.PATH }), executor);

    await keyTool.createSigningKey({
        path: keyPath,
        alias: 'release',
        keypassword: 'key-password',
        password: 'store-password',
        fullName: 'Example',
        organizationalUnit: 'Mobile',
        organization: 'Org',
        country: 'US',
    }, true);

    await assert.rejects(fs.access(keyPath));
});

test('redacts every user-controlled value from process failures', async () => {
    const executor: KeyToolExecutor = async () => {
        throw Object.assign(new Error('failed with store-password and Example'), {
            cmd: 'keytool release key-password store-password Example',
        });
    };
    const keyPath = join(tmpdir(), `${randomUUID()}.jks`);
    const keyTool = new SafeKeyTool(() => ({ PATH: process.env.PATH }), executor);

    await assert.rejects(
        keyTool.createSigningKey({
            path: keyPath,
            alias: 'release',
            keypassword: 'key-password',
            password: 'store-password',
            fullName: 'Example',
            organizationalUnit: 'Mobile',
            organization: 'Org',
            country: 'US',
        }),
        error => {
            const serialized = JSON.stringify(error, Object.getOwnPropertyNames(error));
            for (const value of ['release', 'key-password', 'store-password', 'Example']) {
                assert.equal(serialized.includes(value), false);
            }
            return true;
        },
    );
});
```

- [ ] **Step 2: Run the adapter tests to verify they fail**

Run:

```powershell
Set-Location apps\pwabuilder-google-play
node --loader ts-node/esm --test .\tests\safe-key-tool.test.ts
```

Expected: FAIL because `services/safe-key-tool.ts` does not exist.

- [ ] **Step 3: Implement the adapter types and executor**

Create `apps/pwabuilder-google-play/services/safe-key-tool.ts` with:

```ts
import { execFile } from 'node:child_process';
import { existsSync, promises as fs } from 'node:fs';
import { redactSecretsFromError } from '../utils/redactSecrets.js';

export interface KeyOptions {
    path: string;
    alias: string;
    keypassword: string;
    password: string;
}

export interface CreateKeyOptions extends KeyOptions {
    fullName: string;
    organizationalUnit: string;
    organization: string;
    country: string;
}

export interface KeyInfo {
    fingerprints: Map<string, string>;
}

export interface KeyToolExecutionOptions {
    env: NodeJS.ProcessEnv;
    shell: false;
}

export type KeyToolExecutor = (
    executable: string,
    args: readonly string[],
    options: KeyToolExecutionOptions,
) => Promise<{ stdout: string; stderr: string }>;

const executeKeyTool: KeyToolExecutor = async (executable, args, options) =>
    await new Promise((resolve, reject) => {
        execFile(
            executable,
            [...args],
            { env: options.env, shell: false, encoding: 'utf8' },
            (error, stdout, stderr) => {
                if (error) {
                    reject(Object.assign(error, { stdout, stderr }));
                    return;
                }

                resolve({ stdout, stderr });
            },
        );
    });
```

- [ ] **Step 4: Implement creation, listing, parsing, and redaction**

Append this class to `apps/pwabuilder-google-play/services/safe-key-tool.ts`:

```ts
export class SafeKeyTool {
    constructor(
        private readonly getEnvironment: () => NodeJS.ProcessEnv,
        private readonly executor: KeyToolExecutor = executeKeyTool,
    ) {}

    async createSigningKey(options: CreateKeyOptions, overwrite = false): Promise<void> {
        if (existsSync(options.path)) {
            if (!overwrite) {
                return;
            }

            await fs.unlink(options.path);
        }

        const dname = [
            `CN=${options.fullName.trim()}`,
            `OU=${options.organizationalUnit.trim()}`,
            `O=${options.organization.trim()}`,
            `C=${options.country.toUpperCase()}`,
        ].join(', ');
        const args = [
            '-genkeypair',
            '-dname', dname,
            '-alias', options.alias,
            '-keypass', options.keypassword,
            '-keystore', options.path,
            '-storepass', options.password,
            '-validity', '20000',
            '-keyalg', 'RSA',
        ];

        try {
            await this.executor('keytool', args, {
                env: this.getEnvironment(),
                shell: false,
            });
        } catch (error) {
            throw redactSecretsFromError(error, [
                options.path,
                options.alias,
                options.keypassword,
                options.password,
                options.fullName,
                options.organizationalUnit,
                options.organization,
                options.country,
            ]);
        }
    }

    async keyInfo(options: KeyOptions): Promise<KeyInfo> {
        const result = await this.list(options);
        return SafeKeyTool.parseKeyInfo(result.stdout);
    }

    private async list(
        options: KeyOptions,
    ): Promise<{ stdout: string; stderr: string }> {
        if (!existsSync(options.path)) {
            throw new Error('Could not find signing key');
        }

        const args = [
            '-J-Duser.language=en',
            '-list',
            '-v',
            '-keystore', options.path,
            '-alias', options.alias,
            '-storepass', options.password,
            '-keypass', options.keypassword,
        ];

        try {
            return await this.executor('keytool', args, {
                env: this.getEnvironment(),
                shell: false,
            });
        } catch (error) {
            throw redactSecretsFromError(error, [
                options.path,
                options.alias,
                options.keypassword,
                options.password,
            ]);
        }
    }

    private static parseKeyInfo(rawKeyInfo: string): KeyInfo {
        const fingerprints = new Map<string, string>();
        for (const line of rawKeyInfo.split('\n')) {
            const trimmedLine = line.trim();
            for (const tag of ['SHA1', 'SHA256']) {
                if (trimmedLine.startsWith(`${tag}:`)) {
                    fingerprints.set(tag, trimmedLine.slice(tag.length + 1).trim());
                }
            }
        }

        return { fingerprints };
    }
}
```

- [ ] **Step 5: Run adapter tests and the complete test command**

Run:

```powershell
Set-Location apps\pwabuilder-google-play
node --loader ts-node/esm --test .\tests\safe-key-tool.test.ts
npm test
```

Expected: all adapter tests PASS, followed by all validator and adapter tests
passing together.

- [ ] **Step 6: Commit the shell-free adapter**

```powershell
git add apps\pwabuilder-google-play\services\safe-key-tool.ts apps\pwabuilder-google-play\tests\safe-key-tool.test.ts
git commit -m "fix: launch CloudAPK keytool without a shell" -m "Co-authored-by: Copilot App <223556219+Copilot@users.noreply.github.com>" -m "Copilot-Session: 83102b33-f950-4f02-93ca-73300288c495"
```

### Task 3: Remove vulnerable Bubblewrap KeyTool usage

**Files:**
- Modify: `apps/pwabuilder-google-play/services/bubbleWrapper.ts:1-27,221-247,307-318`

- [ ] **Step 1: Replace the unsafe import**

Remove:

```ts
import { KeyTool, CreateKeyOptions } from '@bubblewrap/core/dist/lib/jdk/KeyTool.js';
```

Add:

```ts
import { CreateKeyOptions, SafeKeyTool } from './safe-key-tool.js';
```

- [ ] **Step 2: Replace both KeyTool constructors**

In `createSigningKey` and `generateAssetLinks`, replace:

```ts
const keyTool = new KeyTool(this.jdkHelper);
```

with:

```ts
const keyTool = new SafeKeyTool(() => this.jdkHelper.getEnv());
```

Leave the existing option mapping and fingerprint lookup intact.

- [ ] **Step 3: Prove the vulnerable call sites are gone**

Run:

```powershell
rg "new KeyTool|@bubblewrap/core/dist/lib/jdk/KeyTool|child_process\.exec\(" apps\pwabuilder-google-play
```

Expected: no matches.

- [ ] **Step 4: Run tests and build**

Run:

```powershell
Set-Location apps\pwabuilder-google-play
npm test
npm run build
```

Expected: all tests PASS and TypeScript compilation succeeds.

- [ ] **Step 5: Commit the integration**

```powershell
git add apps\pwabuilder-google-play\services\bubbleWrapper.ts
git commit -m "fix: remove Bubblewrap shell-backed keytool calls" -m "Co-authored-by: Copilot App <223556219+Copilot@users.noreply.github.com>" -m "Copilot-Session: 83102b33-f950-4f02-93ca-73300288c495"
```

### Task 4: Final security verification and PR preparation

**Files:**
- Verify: `apps/pwabuilder-google-play/package-lock.json`
- Verify: all files changed since `main`

- [ ] **Step 1: Confirm no dependency installation was introduced**

Run:

```powershell
git diff main...HEAD -- apps\pwabuilder-google-play\package-lock.json
```

Expected: no diff because the test runner uses existing dependencies.

- [ ] **Step 2: Run final focused verification**

Run:

```powershell
Set-Location apps\pwabuilder-google-play
npm test
npm run build
```

Expected: all tests PASS and TypeScript compilation succeeds.

- [ ] **Step 3: Inspect the final diff for secret or payload leakage**

Run:

```powershell
Set-Location ..\..
git diff --check
rg "console\.(log|info|error).*signing|options\.signing|exec\(" apps\pwabuilder-google-play
```

Expected: `git diff --check` succeeds. Review any logging matches and remove the
existing signing-options log must already be absent. No shell-backed `exec()`
call may remain in the changed keytool path.

- [ ] **Step 4: Request a security-focused code review**

Review the complete branch diff against `main`, specifically checking:

- No request field can reach a shell-backed `KeyTool`.
- Direct and queued packaging share the new server validator.
- Tests do not execute `keytool` or include a working exploit payload.
- Process errors cannot expose passwords, aliases, paths, or certificate data.
- Existing key generation and fingerprint extraction semantics are preserved.

- [ ] **Step 5: Create the pull request**

Use the repository's pull-request workflow with:

```text
Title: Fix CloudAPK DName command injection

Summary:
- validate signing certificate subjects on the server
- replace Bubblewrap's shell-backed KeyTool with execFile argument arrays
- redact keytool failures and stop logging signing options
- add regression tests for validation and process boundaries

Security:
- fixes unauthenticated CWE-78 command injection in CloudAPK package generation
- does not include proof-of-concept payloads or report attachments
```
