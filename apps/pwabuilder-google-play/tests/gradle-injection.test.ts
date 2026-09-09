import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { TwaGenerator, TwaManifest } from '@bubblewrap/core';
import { ShortcutInfo } from '@bubblewrap/core/dist/lib/ShortcutInfo.js';
import { escapeGradleString, escapeJsonString } from '@bubblewrap/core/dist/lib/util.js';
import { FeatureManager } from '@bubblewrap/core/dist/lib/features/FeatureManager.js';
import { validOptions } from './fixtures/android-package-options.js';
import { BubbleWrapper } from '../services/bubbleWrapper.js';
import { normalizeAndroidHost } from '../utils/android-host.js';
import { validateAndroidOptionsRequest } from '../utils/android-options-validation.js';

function manifest(): TwaManifest {
    return new TwaManifest({
        ...validOptions(),
        shortcuts: [],
        signingKey: { path: '', alias: '' },
    });
}

async function renderGradle(twaManifest: TwaManifest): Promise<string> {
    const directory = await mkdtemp(join(tmpdir(), 'cloudapk-gradle-test-'));
    try {
        const generator = new TwaGenerator();
        const source = fileURLToPath(new URL(
            '../node_modules/@bubblewrap/core/template_project/app/build.gradle', import.meta.url));
        const target = join(directory, 'build.gradle');
        // Exercise Bubblewrap's installed renderer without downloading resources or executing Gradle.
        await generator['applyTemplate'](source, target, {
            ...twaManifest,
            ...new FeatureManager(twaManifest),
            generateShortcuts: twaManifest.generateShortcuts.bind(twaManifest),
            escapeGradleString,
            escapeJsonString,
        });
        return await readFile(target, 'utf8');
    } finally {
        await rm(directory, { recursive: true, force: true });
    }
}

function assertStringLiteral(source: string, prefix: string, expected: string): void {
    const line = source.split('\n').map(value => value.trim()).find(value => value.startsWith(prefix));
    assert.ok(line, `Missing ${prefix}`);
    // Match exactly one single-quoted Groovy literal, followed only by a comma/comment.
    const literal = /^'((?:\\(?:[\\'rn]|u[0-9a-f]{4})|[^'\\\r\n])*)',?(?:\s*\/\/.*)?$/u.exec(line.slice(prefix.length));
    assert.ok(literal, `Expected literal-only value for ${prefix}: ${line}`);
    const decoded = literal[1].replace(/\\(u([0-9a-f]{4})|[\\'rn])/gu, (_, escape: string, unicode: string | undefined) => {
        if (unicode) {
            return String.fromCharCode(parseInt(unicode, 16));
        }
        return escape === 'r' ? '\r' : escape === 'n' ? '\n' : escape;
    });
    assert.equal(decoded, expected);
}

test('normalizes DNS, IDNs, ports and legacy subpaths without discarding paths', () => {
    for (const [input, expected] of [
        ['example.com', 'example.com'],
        ['https://EXAMPLE.com/', 'example.com'],
        ['example.com:8443', 'example.com:8443'],
        ['https://ics.hutton.ac.uk/gridscore/', 'ics.hutton.ac.uk/gridscore'],
        ['example.com/path//', 'example.com/path'],
        ['https://b\u00fccher.example/path', 'xn--bcher-kva.example/path'],
        ['example.com./path%27name', 'example.com./path%27name'],
        [`${'a'.repeat(63)}.example`, `${'a'.repeat(63)}.example`],
    ]) {
        assert.equal(normalizeAndroidHost(input), expected);
        assert.equal(normalizeAndroidHost(expected), expected);
        assert.deepEqual(validateAndroidOptionsRequest({ ...validOptions(), host: input }).validationErrors, []);
    }
});

test('rejects malformed or executable hosts before URL parser normalization', () => {
    for (const host of [
        "example.com', injected: (1 + 1), ignored: '", 'example.com\\path',
        'example.com\n', '\texample.com', 'example.com\r/path', 'example.com\u0000',
        'example.com\u2028', '"example.com"', 'user@example.com', 'https://user:pass@example.com',
        'http://example.com', 'file:///tmp/file', '//example.com', 'https:///example.com',
        '-example.com', 'example-.com', 'example..com', '_example.com', 'example.com:abc',
        'example.com?query', 'example.com#fragment', 'example.com/path?query',
        `${'a'.repeat(64)}.example`, `${'a'.repeat(63)}.${'b'.repeat(63)}.${'c'.repeat(63)}.${'d'.repeat(63)}`,
    ]) {
        assert.equal(normalizeAndroidHost(host), null, JSON.stringify(host));
        assert.ok(validateAndroidOptionsRequest({ ...validOptions(), host }).validationErrors.length > 0);
    }
});

test('rejects wrong types and expressions in numeric and boolean Gradle inputs', () => {
    for (const field of ['splashScreenFadeOutDuration', 'minSdkVersion', 'appVersionCode']) {
        for (const value of ['(1 + 1)', '1', {}, [], true, null, -1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
            assert.ok(validateAndroidOptionsRequest({
                ...validOptions(), [field]: value,
            }).validationErrors.length > 0, `${field}: ${String(value)}`);
        }
    }
    for (const field of ['enableSiteSettingsShortcut', 'isChromeOSOnly']) {
        for (const value of ["true', injected: (1 + 1), ignored: '", {}, 1, null]) {
            assert.ok(validateAndroidOptionsRequest({ ...validOptions(), [field]: value }).validationErrors.length > 0);
        }
    }
    assert.ok(validateAndroidOptionsRequest({
        ...validOptions(), orientation: "default', injected: (1 + 1), ignored: '",
    }).validationErrors.length > 0);
    for (const packageId of ['../outside', 'com.example.app\n', 'com.example.app\r', 'com.example.app\u2028']) {
        assert.ok(validateAndroidOptionsRequest({ ...validOptions(), packageId }).validationErrors.length > 0);
    }
});

test('the worker rejects previously queued hostile options before creating a TWA project', () => {
    const options = validOptions();
    const wrapper = new BubbleWrapper(options, 'unused', null, 'node-fetch');
    for (const [field, value] of [
        ['host', "example.com', injected: (1 + 1), ignored: '"],
        ['splashScreenFadeOutDuration', '(1 + 1)'],
        ['minSdkVersion', '(1 + 1)'],
    ]) {
        assert.throws(() => wrapper['createTwaManifest']({
            ...options, [field]: value,
        }), /Invalid PWA settings/u);
    }
});

test('only supported options and features reach Bubblewrap from persisted JSON', () => {
    const options = validOptions();
    const wrapper = new BubbleWrapper(options, 'unused', null, 'node-fetch');
    const persisted = {
        ...options,
        ...{
            launchHandlerClientMode: "' + (1 + 1) + '",
            fileHandlers: [{ actionUrl: '${1 + 1}', accept: [] }],
            protocolHandlers: [{ protocol: 'web+test', url: 'https://example.com' }],
            generatorApp: '${1 + 1}',
            alphaDependencies: { enabled: true },
            features: { arCore: { enabled: true }, playBilling: { enabled: true } },
        },
    };
    const twa = wrapper['createTwaManifest'](persisted);
    assert.equal(twa.fileHandlers, undefined);
    assert.equal(twa.protocolHandlers, undefined);
    assert.equal(twa.launchHandlerClientMode, undefined);
    assert.equal(twa.generatorApp, 'PWABuilder');
    assert.equal(twa.features.arCore, undefined);
    assert.equal(twa.features.playBilling?.enabled, true);
    assert.equal(twa.alphaDependencies.enabled, true);
});

test('installed Gradle template emits literal strings for every string injection sink', async () => {
    const payload = "before\\', injected: (1 + 1), ignored: ' \"${1 + 1}\"\r\n\u2028after";
    const twa = manifest();
    for (const field of ['host', 'startUrl', 'packageId', 'appVersionName', 'generatorApp', 'fallbackType', 'orientation', 'launchHandlerClientMode']) {
        Reflect.set(twa, field, payload);
    }
    const url = new URL("https://example.com/path'quoted");
    twa.webManifestUrl = url;
    twa.fullScopeUrl = url;
    const source = await renderGradle(twa);
    for (const prefix of [
        'applicationId: ', 'hostName: ', 'launchUrl: ', 'generatorApp: ', 'fallbackType: ', 'orientation: ',
        'namespace ', 'applicationId ', 'versionName ', 'resValue "string", "launchHandlerClientMode", ',
    ]) {
        assertStringLiteral(source, prefix, payload);
    }
    assertStringLiteral(source, 'resValue "string", "webManifestUrl", ', url.toString());
    assertStringLiteral(source, 'resValue "string", "fullScopeUrl", ', url.toString());
});

test('app and shortcut names retain Android resource escaping and international text', async () => {
    const twa = manifest();
    twa.name = "Ben & Jerry's \u6771\u4eac\\app\n${1 + 1}";
    twa.launcherName = twa.name;
    const source = await renderGradle(twa);
    const androidResource = "Ben & Jerry\\'s \u6771\u4eac\\\\app\n${1 + 1}";
    assertStringLiteral(source, 'name: ', androidResource);
    assertStringLiteral(source, 'launcherName: ', androidResource);
});

test('shortcut URLs cannot break out of their generated Groovy literal', () => {
    const url = "https://example.com/path', injected: (1 + 1), ignored: '\\${1 + 1}\n";
    const shortcut = new ShortcutInfo('Example', 'Example', url, 'https://example.com/icon.png');
    const value = shortcut.toString(0);
    const urlLiteral = value.slice(value.indexOf('url:') + 4, value.lastIndexOf(", icon:"));
    assertStringLiteral(`url: ${urlLiteral}`, 'url: ', url);
});

test('the template rejects nonprimitive numeric and boolean values even if ingress is bypassed', async () => {
    for (const field of ['splashScreenFadeOutDuration', 'minSdkVersion', 'appVersionCode', 'enableNotifications', 'enableSiteSettingsShortcut']) {
        const twa = manifest();
        Reflect.set(twa, field, '(1 + 1)');
        await assert.rejects(renderGradle(twa), /Expected (?:a boolean|a non-negative safe integer) in the Gradle template/u);
    }
});

test('normal unsigned, signed, and Meta Quest manifests keep valid Gradle settings', async () => {
    for (const { isMetaQuest, signingKey } of [
        { isMetaQuest: false, signingKey: { path: '', alias: '' } },
        { isMetaQuest: false, signingKey: { path: 'signingKey.keystore', alias: 'release-key' } },
        { isMetaQuest: true, signingKey: { path: 'signingKey.keystore', alias: 'release-key' } },
    ]) {
        const twa = manifest();
        twa.isMetaQuest = isMetaQuest;
        twa.fullScopeUrl = isMetaQuest ? new URL('https://example.com/') : undefined;
        twa.minSdkVersion = 23;
        twa.splashScreenFadeOutDuration = 300;
        twa.enableNotifications = true;
        twa.enableSiteSettingsShortcut = false;
        twa.signingKey = signingKey;
        const source = await renderGradle(twa);
        assertStringLiteral(source, 'hostName: ', 'example.com');
        assertStringLiteral(source, 'versionName ', '1.0.0');
        assert.match(source, /minSdkVersion 23/u);
        assert.match(source, /versionCode 1/u);
        assert.match(source, /splashScreenFadeOutDuration: 300/u);
        assert.match(source, /enableNotifications: true/u);
        assert.match(source, /enableSiteSettingsShortcut: 'false'/u);
    }
});
