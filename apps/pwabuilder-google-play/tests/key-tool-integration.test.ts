import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

test('bubble wrapper uses SafeKeyTool for both keytool call sites', async () => {
    const bubbleWrapperSource = await readFile(
        new URL('../services/bubbleWrapper.js', import.meta.url),
        'utf8'
    );
    const bubblewrapKeyToolModule = [
        '@bubblewrap/core/dist/lib/jdk',
        'KeyTool.js',
    ].join('/');
    const unsafeKeyToolConstruction = ['new', 'KeyTool('].join(' ');

    assert.equal(bubbleWrapperSource.includes(bubblewrapKeyToolModule), false);
    assert.equal(bubbleWrapperSource.includes(unsafeKeyToolConstruction), false);
    assert.equal((bubbleWrapperSource.match(/new SafeKeyTool\(/g) ?? []).length, 2);
});
