import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

// Bubblewrap 1.25.0 interpolates request data into executable Groovy. Keep this
// local patch until upstream encodes these sinks; dependency changes must be reviewed.
// Single-quoted Groovy literals deliberately avoid GString (${...}) interpolation.
const stringLiteralFunction = String.raw`function gradleString(value) {
    if (typeof value !== 'string') {
        throw new Error('Expected a string in the Gradle template');
    }
    const escapes = { '\\': '\\\\', "'": "\\'", '\r': '\\r', '\n': '\\n',
        '\u2028': '\\u2028', '\u2029': '\\u2029' };
    return "'" + value.replace(/[\\'\r\n\u2028\u2029]/g, character => escapes[character]) + "'";
}`;

const templatePreamble = `<%\n${stringLiteralFunction}\n` + String.raw`
function gradleInteger(value) {
    if (!Number.isSafeInteger(value) || value < 0) {
        throw new Error('Expected a non-negative safe integer in the Gradle template');
    }
    return value;
}
function gradleBoolean(value) {
    if (typeof value !== 'boolean') {
        throw new Error('Expected a boolean in the Gradle template');
    }
    return value;
}
function gradleResourceString(value) {
    // Preserve Bubblewrap's additional Android resource escaping for app names.
    return gradleString(value.replace(/[\\']/g, '\\$&'));
}
%>
`;

const stringFields = [
    'packageId', 'host', 'startUrl', 'generatorApp', 'fallbackType', 'orientation',
    'launchHandlerClientMode', 'webManifestUrl.toString()', 'fullScopeUrl.toString()',
    'themeColor.hex()', 'themeColorDark.hex()', 'navigationColor.hex()',
    'navigationColorDark.hex()', 'navigationDividerColor.hex()',
    'navigationDividerColorDark.hex()', 'backgroundColor.hex()', 'dep',
];
const patches = [
    {
        path: 'template_project/app/build.gradle',
        sha256: '8d8c2e53522217487d55a0c21d8e400c458d885086547392a1b813de716e94d9',
        replacements: [
            ["import groovy.xml.MarkupBuilder", `${templatePreamble}import groovy.xml.MarkupBuilder`],
            ...stringFields.map(field => [
                `'<%= ${field.replace('.toString()', '')} %>'`,
                `<%= gradleString(${field}) %>`,
            ]),
            ...['namespace', 'applicationId'].map(method => [
                `${method} "<%= packageId %>"`, `${method} <%= gradleString(packageId) %>`,
            ]),
            ['versionName "<%= appVersionName %>"', 'versionName <%= gradleString(appVersionName) %>'],
            ...['name', 'launcherName'].map(field => [
                `'<%= escapeGradleString(${field}) %>'`,
                `<%= gradleResourceString(${field}) %>`,
            ]),
            ...['splashScreenFadeOutDuration', 'minSdkVersion', 'appVersionCode'].map(field => [
                `<%= ${field} %>`, `<%= gradleInteger(${field}) %>`,
            ]),
            ...['enableNotifications', 'enableSiteSettingsShortcut'].map(field => [
                `<%= ${field} %>`, `<%= gradleBoolean(${field}) %>`,
            ]),
        ],
    },
    {
        path: 'dist/lib/ShortcutInfo.js',
        sha256: '1eed841c96aff06887910aed04e3c2b59c970555f6a5a7bf1c6d81002855ca9a',
        replacements: [
            ['const util_1 = require("./util");', `const util_1 = require("./util");\n${stringLiteralFunction}`],
            ["url:'${this.url}'", 'url:${gradleString(this.url)}'],
        ],
    },
];

function hash(source) {
    return createHash('sha256').update(source).digest('hex');
}

function patchSource(source, patch) {
    const original = hash(source) === patch.sha256 ? source :
        [...patch.replacements].reverse().reduce(
            (text, [before, after]) => text.replaceAll(after, () => before), source);
    if (hash(original) !== patch.sha256) {
        throw new Error(`Unexpected Bubblewrap source in ${patch.path}; review the Gradle security patch before upgrading`);
    }
    const patched = patch.replacements.reduce((text, [before, after]) => {
        if (!text.includes(before)) {
            throw new Error(`Missing Bubblewrap patch context in ${patch.path}`);
        }
        return text.replaceAll(before, () => after);
    }, original);
    if (source !== original && source !== patched) {
        throw new Error(`Incomplete Bubblewrap security patch in ${patch.path}`);
    }
    return patched;
}

export async function patchBubblewrapGradle(
    coreDirectory = new URL('../node_modules/@bubblewrap/core/', import.meta.url)
) {
    const packageJson = JSON.parse(await readFile(new URL('package.json', coreDirectory), 'utf8'));
    if (packageJson.version !== '1.25.0') {
        throw new Error('Review the Gradle security patch for this Bubblewrap version');
    }

    // Validate every file before writing anything, and accept only pristine or fully patched files.
    const files = [];
    for (const patch of patches) {
        const path = new URL(patch.path, coreDirectory);
        const source = await readFile(path, 'utf8');
        files.push({ path, source, patched: patchSource(source, patch) });
    }
    for (const { path, source, patched } of files) {
        if (source !== patched) {
            await writeFile(path, patched);
        }
    }
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
    await patchBubblewrapGradle();
}
