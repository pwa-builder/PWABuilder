import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { matchRoute, viewPath } from '../.test-build/routes.js';

for (const base of ['/', '/PWABuilder/', '/nested/nimbus/']) {
  test(`query routes and note links stay at ${base}`, () => {
    assert.equal(viewPath(base), base);
    assert.equal(viewPath(base, 'about'), `${base}?view=about`);
    for (const query of ['', '?note=ABC', '?new=photo', '?title=Shared&text=Hello', '?protocol=web%2Bnimbus%3Atest']) {
      assert.deepEqual(matchRoute(new URL(`https://example.test${base}${query}`), base), { view: 'notes', tool: '' });
    }
    assert.deepEqual(matchRoute(new URL(`https://example.test${base}?view=about&note=ABC`), base), { view: 'about', tool: '' });
    assert.deepEqual(matchRoute(new URL(`https://example.test${base}?tool=sketch`), base), { view: 'notes', tool: 'sketch' });
    assert.deepEqual(matchRoute(new URL(`https://example.test${base}index.html?view=about`), base), { view: 'about', tool: '' });
    assert.equal(matchRoute(new URL(`https://example.test${base}missing.js`), base), undefined);
    assert.equal(matchRoute(new URL(`https://example.test${base}unrelated/path`), base), undefined);
  });

  test(`manifest URLs resolve within ${base}`, async () => {
    const manifest = JSON.parse(await readFile(new URL('../public/manifest.json', import.meta.url)));
    const manifestUrl = `https://example.test${base}manifest.json`;
    const root = `https://example.test${base}`;
    assert.equal(new URL(manifest.scope, manifestUrl).href, root);
    // An explicit relative manifest id resolves against the origin, not the
    // manifest directory. Omitting it defaults identity to resolved start_url.
    assert.equal(manifest.id, undefined);
    assert.equal(new URL(manifest.start_url, manifestUrl).href, root);
    const paths = [
      manifest.start_url, manifest.share_target.action,
      ...manifest.shortcuts.map((item) => item.url),
      ...manifest.file_handlers.map((item) => item.action),
      ...manifest.protocol_handlers.map((item) => item.url),
    ];
    for (const path of paths) assert.equal(new URL(path, manifestUrl).pathname, base);
    for (const image of [...manifest.icons, ...manifest.screenshots]) {
      assert.ok(new URL(image.src, manifestUrl).href.startsWith(root));
    }
  });
}

test('project routes cannot escape into neighboring Pages projects', () => {
  for (const path of ['/', '/Other/', '/PWABuilder-other/', '/PWABuilder']) {
    assert.equal(matchRoute(new URL(`https://example.test${path}`), '/PWABuilder/'), undefined);
  }
});

test('legacy routes are recognized only within this app', () => {
  for (const [path, view, tool] of [
    ['notes', 'notes', ''], ['about', 'about', ''],
    ['sketch', 'notes', 'sketch'], ['capture', 'notes', 'photo'], ['powers', 'notes', 'tools'],
  ]) {
    assert.deepEqual(matchRoute(new URL(`https://example.test/PWABuilder/${path}`), '/PWABuilder/'), { view, tool });
  }
});
