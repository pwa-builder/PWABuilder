import assert from 'node:assert/strict';
import { test } from 'node:test';
import { SafeKeyTool, type CreateKeyOptions, type KeyToolExecutor } from '../services/safe-key-tool.js';
import { redactSecretsFromError } from '../utils/redactSecrets.js';

test('redactSecretsFromError redacts overlapping values longest first, including spawnargs', () => {
    const shorterValue = 'secret';
    const longerValue = 'secret-suffix';
    const nonStringArgument = { retained: true };
    const error = Object.assign(new Error(`message ${longerValue}`), {
        cmd: `cmd ${longerValue}`,
        stdout: `stdout ${longerValue}`,
        stderr: `stderr ${longerValue}`,
        spawnargs: [longerValue, 42, nonStringArgument, null] as unknown[],
    });
    error.stack = `stack ${longerValue}`;

    const result = redactSecretsFromError(error, [shorterValue, longerValue, '', longerValue]);

    assert.strictEqual(result, error);
    for (const value of [error.message, error.cmd, error.stdout, error.stderr, error.stack]) {
        assert.equal(value.includes(longerValue), false);
        assert.equal(value.includes('-suffix'), false);
        assert.equal(value.includes('***REDACTED***'), true);
    }
    assert.deepEqual(error.spawnargs, ['***REDACTED***', 42, nonStringArgument, null]);
    assert.strictEqual(error.spawnargs[2], nonStringArgument);
});

test('SafeKeyTool redacts protected values from ENOENT spawn arguments', async () => {
    const options: CreateKeyOptions = {
        path: 'protected-keystore-path',
        alias: 'protected-key-alias',
        keypassword: 'protected-key-password',
        password: 'protected-store-password',
        fullName: 'Protected Certificate Name',
        organization: 'Protected Organization',
        organizationalUnit: 'Protected Release Unit',
        country: 'XZ',
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
    // Country is public certificate subject metadata, not a secret, so the `C=<country>`
    // fragment in the -dname argument remains visible and is intentionally excluded from
    // protectedValues/redaction below.
    const certificateFragment = `C=${options.country}`;
    const spawnargs = [
        '-genkeypair',
        '-dname',
        `CN=${options.fullName}, OU=${options.organizationalUnit}, O=${options.organization}, ${certificateFragment}`,
        '-alias',
        options.alias,
        '-keypass',
        options.keypassword,
        '-keystore',
        options.path,
        '-storepass',
        options.password,
    ];
    const executionError = Object.assign(new Error('spawn keytool ENOENT'), {
        code: 'ENOENT',
        errno: -4058,
        syscall: 'spawn keytool',
        path: 'keytool',
        spawnargs,
    });
    const executor: KeyToolExecutor = async () => {
        throw executionError;
    };
    const keyTool = new SafeKeyTool(() => ({}), executor);

    await assert.rejects(keyTool.createSigningKey(options, false), error => {
        assert.strictEqual(error, executionError);
        const serializedError = JSON.stringify(error);
        for (const protectedValue of protectedValues) {
            assert.equal(
                executionError.spawnargs.some(arg => arg.includes(protectedValue)),
                false,
                `spawnargs leaked ${protectedValue}`
            );
            assert.equal(serializedError.includes(protectedValue), false, `serialized error leaked ${protectedValue}`);
        }
        assert.equal(executionError.spawnargs.some(arg => arg.includes('***REDACTED***')), true);
        assert.equal(
            executionError.spawnargs.some(arg => arg.includes(certificateFragment)),
            true,
            'country certificate fragment should remain visible because it is not a secret'
        );
        return true;
    });
});
