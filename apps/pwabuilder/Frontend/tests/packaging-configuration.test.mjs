import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getAndroidServiceUrl } from '../src/script/utils/packaging-configuration.ts';

test('each operation reads the destination slot again after a swap', async () => {
    let endpoint = 'https://pwabuilder-cloudapk-staging.azurewebsites.net';
    let calls = 0;
    const request = async (url, options) => {
        calls++;
        assert.equal(url, '/api/packaging/config');
        assert.equal(options.cache, 'no-store');
        assert.equal(options.redirect, 'error');
        assert.equal(options.credentials, 'omit');
        return Response.json({ androidPackageGeneratorUrl: endpoint });
    };
    assert.equal(await getAndroidServiceUrl(false, request), endpoint);
    endpoint = 'https://pwabuilder-cloudapk.azurewebsites.net';
    assert.equal(await getAndroidServiceUrl(false, request), endpoint);
    endpoint = 'https://pwabuilder-cloudapk-staging.azurewebsites.net';
    assert.equal(await getAndroidServiceUrl(false, request), endpoint);
    assert.equal(calls, 3);
});

test('missing, unsafe and unavailable configuration never falls back to production', async () => {
    for (const endpoint of [undefined, '', 'http://localhost:5858',
        'https://pwabuilder-cloudapk.azurewebsites.net.evil.test',
        'https://pwabuilder-cloudapk.azurewebsites.net/path',
        'https://pwabuilder-cloudapk.azurewebsites.net?token=bad',
        'http://pwabuilder-cloudapk.azurewebsites.net']) {
        await assert.rejects(getAndroidServiceUrl(false, async () => Response.json({
            androidPackageGeneratorUrl: endpoint
        })), /not configured/);
    }
    await assert.rejects(getAndroidServiceUrl(false, async () => new Response('', { status: 503 })), /unavailable/);
    await assert.rejects(getAndroidServiceUrl(false, async () => { throw new Error('offline'); }), /offline/);
    await assert.rejects(getAndroidServiceUrl(false, async () => new Response('<html>')), SyntaxError);
    assert.equal(await getAndroidServiceUrl(true, async () => Response.json({
        androidPackageGeneratorUrl: 'http://localhost:5858'
    })), 'http://localhost:5858');
});
