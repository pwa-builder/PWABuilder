import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { test } from 'node:test';
import {
    SafeKeyTool,
    type CreateKeyOptions,
    type KeyOptions,
    type KeyToolExecutionOptions,
    type KeyToolExecutor,
} from '../services/safe-key-tool.js';

interface ExecutorCall {
    executable: string;
    args: readonly string[];
    options: KeyToolExecutionOptions;
}

class KeyToolTestError extends Error {
    cmd: string;
    stdout: string;
    stderr: string;

    constructor(values: readonly string[]) {
        const reflectedValues = values.join(' | ');
        super(`Execution failed: ${reflectedValues}`);
        this.cmd = `keytool ${reflectedValues}`;
        this.stdout = `stdout ${reflectedValues}`;
        this.stderr = `stderr ${reflectedValues}`;
        this.stack = `stack ${reflectedValues}`;
    }
}

const baseKeyOptions: KeyOptions = {
    path: 'unused-keystore-path',
    alias: 'release-alias',
    keypassword: 'key-password',
    password: 'store-password',
};

const createKeyOptions: CreateKeyOptions = {
    ...baseKeyOptions,
    fullName: 'Name; remains data',
    organization: 'Example Organization',
    organizationalUnit: 'Release Engineering',
    country: 'us',
};

async function withTemporaryDirectory<T>(action: (directory: string) => Promise<T>): Promise<T> {
    const directory = await mkdtemp(path.join(process.cwd(), '.safe-key-tool-test-'));
    try {
        return await action(directory);
    } finally {
        await rm(directory, { recursive: true, force: true });
    }
}

function createRecordingExecutor(
    calls: ExecutorCall[],
    result: { stdout: string; stderr: string } = { stdout: '', stderr: '' }
): KeyToolExecutor {
    return async (executable, args, options) => {
        calls.push({ executable, args, options });
        return result;
    };
}

function assertArgumentAfter(args: readonly string[], flag: string, expected: string): void {
    const flagIndexes = args.flatMap((arg, index) => (arg === flag ? [index] : []));
    assert.deepEqual(flagIndexes.length, 1);
    assert.equal(args[flagIndexes[0] + 1], expected);
}

function assertValuesRedacted(error: KeyToolTestError, protectedValues: readonly string[]): void {
    const fields = [error.message, error.cmd, error.stdout, error.stderr, error.stack ?? ''];
    for (const [fieldIndex, field] of fields.entries()) {
        assert.equal(field.includes('***REDACTED***'), true, `field ${fieldIndex} was not redacted`);
        assert.equal(
            (field.match(/\*\*\*REDACTED\*\*\*/g) ?? []).length >= protectedValues.length,
            true,
            `field ${fieldIndex} did not redact every protected value`
        );
        for (const [valueIndex, protectedValue] of protectedValues.entries()) {
            assert.equal(
                field.includes(protectedValue),
                false,
                `field ${fieldIndex} leaked protected value ${valueIndex}`
            );
        }
    }
}

test('createSigningKey passes each keytool value as a discrete argument without a shell', async () => {
    const calls: ExecutorCall[] = [];
    const environment: NodeJS.ProcessEnv = { JAVA_HOME: 'test-jdk' };
    const keyTool = new SafeKeyTool(() => environment, createRecordingExecutor(calls));
    const options: CreateKeyOptions = {
        ...createKeyOptions,
        path: 'keystore path',
        alias: 'alias with spaces',
        keypassword: 'key password',
        password: 'store password',
        fullName: '  Name; remains data  ',
        organization: '  Example Organization  ',
        organizationalUnit: '  Release Engineering  ',
        country: ' us ',
    };

    await keyTool.createSigningKey(options, false);

    assert.equal(calls.length, 1);
    const call = calls[0];
    assert.ok(call);
    assert.equal(call.executable, 'keytool');
    assert.deepEqual(call.args, [
        '-genkeypair',
        '-dname',
        'CN=Name; remains data, OU=Release Engineering, O=Example Organization, C=US',
        '-alias',
        'alias with spaces',
        '-keypass',
        'key password',
        '-keystore',
        'keystore path',
        '-storepass',
        'store password',
        '-validity',
        '20000',
        '-keyalg',
        'RSA',
    ]);
    assertArgumentAfter(call.args, '-dname', 'CN=Name; remains data, OU=Release Engineering, O=Example Organization, C=US');
    assertArgumentAfter(call.args, '-alias', options.alias);
    assertArgumentAfter(call.args, '-keypass', options.keypassword);
    assertArgumentAfter(call.args, '-keystore', options.path);
    assertArgumentAfter(call.args, '-storepass', options.password);
    assert.equal(call.options.shell, false);
    assert.strictEqual(call.options.env, environment);
});

test('createSigningKey preserves an existing keystore when overwrite is false', async () => {
    await withTemporaryDirectory(async directory => {
        const keyPath = path.join(directory, 'existing.keystore');
        await writeFile(keyPath, 'existing contents');
        const calls: ExecutorCall[] = [];
        const keyTool = new SafeKeyTool(() => ({}), createRecordingExecutor(calls));

        await keyTool.createSigningKey({ ...createKeyOptions, path: keyPath }, false);

        assert.equal(calls.length, 0);
        assert.equal(await readFile(keyPath, 'utf8'), 'existing contents');
    });
});

test('createSigningKey removes an existing keystore before executing when overwrite is true', async () => {
    await withTemporaryDirectory(async directory => {
        const keyPath = path.join(directory, 'existing.keystore');
        await writeFile(keyPath, 'existing contents');
        let fileExistedDuringExecution = true;
        const executor: KeyToolExecutor = async () => {
            fileExistedDuringExecution = existsSync(keyPath);
            return { stdout: '', stderr: '' };
        };
        const keyTool = new SafeKeyTool(() => ({}), executor);

        await keyTool.createSigningKey({ ...createKeyOptions, path: keyPath }, true);

        assert.equal(fileExistedDuringExecution, false);
    });
});

test('keyInfo rejects a missing keystore with a constant non-reflective error', async () => {
    await withTemporaryDirectory(async directory => {
        const missingPath = path.join(directory, 'missing-sensitive-name.keystore');
        const calls: ExecutorCall[] = [];
        const keyTool = new SafeKeyTool(() => ({}), createRecordingExecutor(calls));

        await assert.rejects(keyTool.keyInfo({ ...baseKeyOptions, path: missingPath }), error => {
            assert.ok(error instanceof Error);
            assert.equal(error.message, 'Keystore file does not exist.');
            assert.equal(error.message.includes(missingPath), false);
            return true;
        });
        assert.equal(calls.length, 0);
    });
});

test('keyInfo invokes keytool without a shell and parses SHA fingerprints', async () => {
    await withTemporaryDirectory(async directory => {
        const keyPath = path.join(directory, 'existing.keystore');
        await writeFile(keyPath, 'existing contents');
        const calls: ExecutorCall[] = [];
        const output = [
            'Alias name: release-alias',
            'Creation date: Sep 2, 2026',
            'Certificate fingerprints:',
            '         SHA1:  11:22:33:44  ',
            '         SHA256: AA:BB:CC:DD:EE',
            'Signature algorithm name: SHA256withRSA',
            'Unrelated: ignored',
        ].join('\n');
        const environment: NodeJS.ProcessEnv = { JAVA_HOME: 'test-jdk' };
        const keyTool = new SafeKeyTool(
            () => environment,
            createRecordingExecutor(calls, { stdout: output, stderr: 'warning ignored' })
        );
        const options: KeyOptions = { ...baseKeyOptions, path: keyPath };

        const info = await keyTool.keyInfo(options);

        assert.equal(calls.length, 1);
        const call = calls[0];
        assert.ok(call);
        assert.equal(call.executable, 'keytool');
        assert.deepEqual(call.args, [
            '-J-Duser.language=en',
            '-list',
            '-v',
            '-keystore',
            keyPath,
            '-alias',
            options.alias,
            '-storepass',
            options.password,
            '-keypass',
            options.keypassword,
        ]);
        assert.equal(call.options.shell, false);
        assert.strictEqual(call.options.env, environment);
        assert.deepEqual([...info.fingerprints], [
            ['SHA1', '11:22:33:44'],
            ['SHA256', 'AA:BB:CC:DD:EE'],
        ]);
    });
});

test('createSigningKey redacts key and certificate values from executor errors', async () => {
    await withTemporaryDirectory(async directory => {
        const options: CreateKeyOptions = {
            path: path.join(directory, 'protected-path.keystore'),
            alias: 'protected-alias',
            keypassword: 'protected-key-password',
            password: 'protected-store-password',
            fullName: 'Protected Full Name',
            organization: 'Protected Organization',
            organizationalUnit: 'Protected Unit',
            country: 'ZX',
        };
        const protectedValues = [
            options.path,
            options.alias,
            options.keypassword,
            options.password,
            options.fullName,
            options.organization,
            options.organizationalUnit,
        ];
        // Country is public certificate subject metadata, not a secret, so it's reflected
        // in the diagnostic (as it would be in the real -dname certificate fragment) but is
        // deliberately excluded from protectedValues above/redaction.
        const certificateFragment = `C=${options.country}`;
        const executionError = new KeyToolTestError([...protectedValues, certificateFragment]);
        const executor: KeyToolExecutor = async () => {
            throw executionError;
        };
        const keyTool = new SafeKeyTool(() => ({}), executor);

        await assert.rejects(keyTool.createSigningKey(options, false), error => {
            assert.strictEqual(error, executionError);
            assertValuesRedacted(executionError, protectedValues);
            assert.equal(
                executionError.message.includes(certificateFragment),
                true,
                'country certificate fragment should remain visible because it is not a secret'
            );
            return true;
        });
    });
});

test('createSigningKey does not let a country code corrupt ordinary diagnostic words', async () => {
    await withTemporaryDirectory(async directory => {
        // Regression test: a two-letter country code such as "in" must not be treated as a
        // secret, because redactSecretsFromError performs global substring replacement, and
        // "in" is a substring of ordinary words like "signing" and "using". Country is public
        // certificate subject metadata, not a secret, so it must never corrupt diagnostics.
        const options: CreateKeyOptions = {
            path: path.join(directory, 'protected-path.keystore'),
            alias: 'protected-alias',
            keypassword: 'protected-key-password',
            password: 'protected-store-password',
            fullName: 'Protected Full Name',
            organization: 'Protected Organization',
            organizationalUnit: 'Protected Unit',
            country: 'in',
        };
        const diagnosticMessage =
            'keytool error: failed while signing using keytool during key generation; verify your keystore configuration.';
        const executionError = Object.assign(new Error(diagnosticMessage), {
            cmd: diagnosticMessage,
            stdout: diagnosticMessage,
            stderr: diagnosticMessage,
        });
        executionError.stack = diagnosticMessage;
        const executor: KeyToolExecutor = async () => {
            throw executionError;
        };
        const keyTool = new SafeKeyTool(() => ({}), executor);

        await assert.rejects(keyTool.createSigningKey(options, false), error => {
            assert.strictEqual(error, executionError);
            const fields = [
                executionError.message,
                executionError.cmd,
                executionError.stdout,
                executionError.stderr,
                executionError.stack ?? '',
            ];
            for (const [fieldIndex, field] of fields.entries()) {
                assert.equal(field.includes('signing'), true, `field ${fieldIndex} corrupted "signing"`);
                assert.equal(field.includes('using'), true, `field ${fieldIndex} corrupted "using"`);
                assert.equal(field.includes('generation'), true, `field ${fieldIndex} corrupted "generation"`);
                assert.equal(
                    field.includes('***REDACTED***'),
                    false,
                    `field ${fieldIndex} was redacted even though it contains no protected values, only a country-code bigram`
                );
            }
            return true;
        });
    });
});

test('keyInfo redacts all key options from executor errors', async () => {
    await withTemporaryDirectory(async directory => {
        const options: KeyOptions = {
            path: path.join(directory, 'protected-path.keystore'),
            alias: 'protected-alias',
            keypassword: 'protected-key-password',
            password: 'protected-store-password',
        };
        await writeFile(options.path, 'existing contents');
        const protectedValues = [options.path, options.alias, options.keypassword, options.password];
        const executionError = new KeyToolTestError(protectedValues);
        const executor: KeyToolExecutor = async () => {
            throw executionError;
        };
        const keyTool = new SafeKeyTool(() => ({}), executor);

        await assert.rejects(keyTool.keyInfo(options), error => {
            assert.strictEqual(error, executionError);
            assertValuesRedacted(executionError, protectedValues);
            return true;
        });
    });
});
