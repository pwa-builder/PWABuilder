import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createSigningCommandCredentials } from '../utils/signing-command-credentials.js';

const signingOptions = {
    alias: 'release"alias$`\\path',
    keyPassword: 'shared$`\\secret',
    storePassword: 'shared$`\\secret-suffix',
};

test('createSigningCommandCredentials preserves Bubblewrap quoted escaping', () => {
    const credentials = createSigningCommandCredentials(signingOptions);

    assert.equal(credentials.alias, '"release' + '\\"' + 'alias' + '\\$' + '\\`' + '\\\\path"');
    assert.equal(credentials.keyPassword, '"shared' + '\\$' + '\\`' + '\\\\secret"');
    assert.equal(credentials.storePassword, '"shared' + '\\$' + '\\`' + '\\\\secret-suffix"');
});

test('createSigningCommandCredentials redacts raw and transformed credential forms', () => {
    const credentials = createSigningCommandCredentials(signingOptions);
    const protectedValues = [
        signingOptions.alias,
        signingOptions.keyPassword,
        signingOptions.storePassword,
        credentials.alias,
        credentials.keyPassword,
        credentials.storePassword,
    ];
    const leakedText = protectedValues.join(' | ');
    const error = {
        name: 'Error',
        message: `message ${leakedText}`,
        cmd: `cmd ${leakedText}`,
        stderr: `stderr ${leakedText}`,
        stdout: `stdout ${leakedText}`,
        stack: `stack ${leakedText}`,
        spawnargs: [...protectedValues],
    };

    const result = credentials.redactError(error);
    const serializedResult = JSON.stringify(result);
    const redactedValues = [
        result.message,
        result.cmd,
        result.stderr,
        result.stdout,
        result.stack,
        ...result.spawnargs,
    ];

    assert.strictEqual(result, error);
    for (const protectedValue of protectedValues) {
        for (const redactedValue of redactedValues) {
            assert.equal(redactedValue.includes(protectedValue), false, `error property leaked ${protectedValue}`);
        }
        const serializedProtectedValue = JSON.stringify(protectedValue).slice(1, -1);
        assert.equal(
            serializedResult.includes(serializedProtectedValue),
            false,
            `serialized error leaked ${protectedValue}`
        );
    }
    assert.equal(serializedResult.includes('***REDACTED***'), true);
});
