import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { test } from 'node:test';
import { app, effects } from './fixtures/isolated-app.mjs';
import { validOptions } from './fixtures/android-package-options.js';

test('all public packaging endpoints reject injection before queueing or building', async () => {
    const server = createServer(app);
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const origin = `http://127.0.0.1:${server.address().port}`;
    try {
        for (const route of ['/generateAppPackage', '/generateApkZip', '/enqueuePackageJob']) {
            for (const override of [
                { host: "example.com', injected: (1 + 1), ignored: '" },
                { splashScreenFadeOutDuration: '(1 + 1)' },
                { minSdkVersion: '(1 + 1)' },
            ]) {
                const response = await fetch(origin + route, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...validOptions(), ...override }),
                });
                assert.equal(response.status, 500); // Existing API validation response contract.
                assert.match(await response.text(), /^Invalid PWA settings:/u);
                assert.equal(effects.builds, 0);
                assert.equal(effects.enqueued.length, 0);
            }
        }

        const response = await fetch(origin + '/enqueuePackageJob', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...validOptions(), host: 'https://example.com/subpath/' }),
        });
        assert.equal(response.status, 200);
        assert.equal(await response.text(), 'test-job');
        assert.equal(effects.enqueued.length, 1);
        assert.equal(effects.enqueued[0].host, 'example.com/subpath');
        assert.equal(effects.builds, 0);
    } finally {
        await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
    }
});
