import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { createPackageJobId } from '../utils/package-job-id.js';

const injectedUuid = '12345678-1234-4234-8234-123456789abc';
const uuidV4Pattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

test('createPackageJobId builds the id from host and the complete injected UUID', () => {
    const id = createPackageJobId('https://example.com/app', () => injectedUuid);

    assert.strictEqual(id, `googleplaypackagejob:example.com:${injectedUuid}`);
});

test('createPackageJobId retains the full UUID and derives the suffix only from it', () => {
    const firstUuid = '12345678-1234-4234-8234-123456789abc';
    const secondUuid = 'abcdef00-1111-4222-8333-444455556666';
    const firstId = createPackageJobId('https://example.com/app/one', () => firstUuid);
    const secondId = createPackageJobId('https://example.com/app/two', () => secondUuid);

    // Same host, different paths + different injected UUIDs: suffix is the whole UUID and differs.
    assert.strictEqual(firstId, `googleplaypackagejob:example.com:${firstUuid}`);
    assert.strictEqual(secondId, `googleplaypackagejob:example.com:${secondUuid}`);
    assert.ok(firstId.endsWith(firstUuid));
    assert.ok(secondId.endsWith(secondUuid));
    assert.notStrictEqual(firstId, secondId);
    // The UUID is not sliced down to a shorter hash.
    assert.ok(firstId.includes(firstUuid));
});

test('createPackageJobId uses URL.host, preserving a non-default port', () => {
    const id = createPackageJobId('https://example.com:8443/app', () => injectedUuid);

    assert.strictEqual(id, `googleplaypackagejob:example.com:8443:${injectedUuid}`);
});

test('createPackageJobId defaults to a full RFC 4122 v4 UUID that varies per call', () => {
    const firstId = createPackageJobId('https://example.com/app');
    const secondId = createPackageJobId('https://example.com/app');

    const firstSuffix = firstId.slice('googleplaypackagejob:example.com:'.length);
    const secondSuffix = secondId.slice('googleplaypackagejob:example.com:'.length);

    assert.match(firstSuffix, uuidV4Pattern);
    assert.match(secondSuffix, uuidV4Pattern);
    assert.notStrictEqual(firstSuffix, secondSuffix);
});

test('createPackageJobId throws for an invalid pwaUrl via URL parsing', () => {
    assert.throws(() => createPackageJobId('not a url', () => injectedUuid));
});

test('packageJobQueue uses createPackageJobId and no longer uses the request-derived hash', async () => {
    const queueSource = await readFile(
        fileURLToPath(new URL('../services/packageJobQueue.ts', import.meta.url)),
        'utf8'
    );

    assert.ok(queueSource.includes('createPackageJobId'), 'queue should import/use createPackageJobId');
    assert.ok(queueSource.includes('createPackageJobId(packageArgs.pwaUrl)'), 'queue should build the id from pwaUrl only');
    assert.ok(!queueSource.includes('createHash'), 'queue should no longer call createHash');
    assert.ok(!queueSource.includes('utils/hashCode'), 'queue should no longer reference utils/hashCode');
});

test('the CodeQL sink file utils/hashCode.ts is deleted', async () => {
    await assert.rejects(
        readFile(fileURLToPath(new URL('../utils/hashCode.ts', import.meta.url)), 'utf8'),
        (error: NodeJS.ErrnoException) => error.code === 'ENOENT'
    );
});
