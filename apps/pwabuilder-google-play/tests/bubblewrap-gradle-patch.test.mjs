import assert from 'node:assert/strict';
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, sep } from 'node:path';
import { pathToFileURL } from 'node:url';
import { test } from 'node:test';
import { patchBubblewrapGradle } from '../scripts/patch-bubblewrap-gradle.mjs';

test('the installed security patch is idempotent', async () => {
    const template = new URL('../node_modules/@bubblewrap/core/template_project/app/build.gradle', import.meta.url);
    const shortcut = new URL('../node_modules/@bubblewrap/core/dist/lib/ShortcutInfo.js', import.meta.url);
    const before = [await readFile(template, 'utf8'), await readFile(shortcut, 'utf8')];
    await patchBubblewrapGradle();
    assert.deepEqual([await readFile(template, 'utf8'), await readFile(shortcut, 'utf8')], before);
});

test('unexpected upstream source or version fails closed without changing other files', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'cloudapk-patch-test-'));
    const core = pathToFileURL(directory + sep);
    try {
        await mkdir(new URL('template_project/app/', core), { recursive: true });
        await mkdir(new URL('dist/lib/', core), { recursive: true });
        for (const path of ['package.json', 'template_project/app/build.gradle', 'dist/lib/ShortcutInfo.js']) {
            await copyFile(new URL(`../node_modules/@bubblewrap/core/${path}`, import.meta.url), new URL(path, core));
        }
        const template = new URL('template_project/app/build.gradle', core);
        const shortcut = new URL('dist/lib/ShortcutInfo.js', core);
        const before = await readFile(shortcut, 'utf8');
        await writeFile(template, await readFile(template, 'utf8') + '\n// Unreviewed upstream change\n');
        await assert.rejects(patchBubblewrapGradle(core), /Unexpected Bubblewrap source/u);
        assert.equal(await readFile(shortcut, 'utf8'), before);

        await writeFile(new URL('package.json', core), JSON.stringify({ version: '1.26.0' }));
        await assert.rejects(patchBubblewrapGradle(core), /Review the Gradle security patch/u);
    } finally {
        await rm(directory, { recursive: true, force: true });
    }
});
