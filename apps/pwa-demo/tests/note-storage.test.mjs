import 'fake-indexeddb/auto';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { putRecord, getAll, deleteRecord } from '../.test-build/db.js';
import { exportNoteFile, importNoteFile } from '../.test-build/note-files.js';

test('existing text-only notes remain readable without a schema migration', async () => {
  const note = { id: 'legacy', title: 'Old note', body: 'Keep me', updated: 1 };
  await putRecord('notes', note);
  assert.deepEqual((await getAll('notes')).find((item) => item.id === note.id), note);
});

test('notes persist image bytes and metadata together', async () => {
  const note = {
    id: 'images', title: 'Images', body: 'Sketch and photo', updated: 2,
    attachments: [
      { id: 'a', kind: 'sketch', name: 'Sketch', created: 1, blob: new Blob(['sketch bytes'], { type: 'image/png' }) },
      { id: 'b', kind: 'photo', name: 'Photo', created: 2, blob: new Blob(['photo bytes'], { type: 'image/jpeg' }), filter: 'sepia', location: { lat: 47, lon: -122 } },
    ],
  };
  await putRecord('notes', note);
  const stored = (await getAll('notes')).find((item) => item.id === note.id);
  assert.equal(await stored.attachments[0].blob.text(), 'sketch bytes');
  assert.equal(await stored.attachments[1].blob.text(), 'photo bytes');
  assert.deepEqual(stored.attachments[1].location, { lat: 47, lon: -122 });
  await deleteRecord('notes', note.id);
  assert.equal((await getAll('notes')).some((item) => item.id === note.id), false);
});

test('a request succeeding before transaction abort is not reported as saved', async () => {
  const original = IDBObjectStore.prototype.put;
  IDBObjectStore.prototype.put = function (...args) {
    const request = original.apply(this, args);
    request.addEventListener('success', () => this.transaction.abort());
    return request;
  };
  try {
    await assert.rejects(putRecord('notes', { id: 'aborted', body: '' }), /abort/i);
    assert.equal((await getAll('notes')).some((item) => item.id === 'aborted'), false);
  } finally {
    IDBObjectStore.prototype.put = original;
  }
});

test('Nimbus export/import preserves text, pins, locations, and all attachment bytes', async () => {
  const note = {
    id: 'original', title: 'A café sketch', body: 'Words\n\nMore words', updated: 1, pinned: true,
    location: { lat: 1, lon: 2 },
    attachments: [{
      id: 'original-image', kind: 'sketch', name: 'Sketch', created: 5,
      blob: new Blob([new Uint8Array([0, 128, 255])], { type: 'image/png' }),
    }],
  };
  const file = await exportNoteFile(note);
  assert.match(file.name, /\.nimbus\.json$/);
  const imported = await importNoteFile(file);
  assert.equal(imported.title, note.title);
  assert.equal(imported.body, note.body);
  assert.equal(imported.pinned, true);
  assert.deepEqual(imported.location, note.location);
  assert.notEqual(imported.id, note.id);
  assert.notEqual(imported.attachments[0].id, note.attachments[0].id);
  assert.deepEqual(new Uint8Array(await imported.attachments[0].blob.arrayBuffer()), new Uint8Array([0, 128, 255]));
});

test('Markdown/text import remains available', async () => {
  const note = await importNoteFile(new File(['# My note\nText'], 'draft.md', { type: 'text/markdown' }));
  assert.equal(note.title, 'draft');
  assert.equal(note.body, '# My note\nText');
});

test('invalid backup formats, executable images, and locations are rejected', async () => {
  const base = { format: 'nimbus-note', version: 1, title: 'T', body: 'B', attachments: [] };
  for (const value of [
    {},
    { ...base, version: 2 },
    { ...base, location: { lat: 1000, lon: 0 } },
    { ...base, attachments: [{ kind: 'photo', name: 'Bad', created: 1, data: 'data:image/svg+xml;base64,PHN2Zz4=' }] },
    { ...base, attachments: [{ kind: 'photo', name: 'Bad', created: 1, data: 'data:image/png;base64,!' }] },
  ]) {
    await assert.rejects(importNoteFile(new File([JSON.stringify(value)], 'invalid.json')));
  }
});

test('the legacy photo gallery is retained alongside notes', async () => {
  await putRecord('photos', { id: 'old-photo', created: 1, blob: new Blob(['old'], { type: 'image/png' }) });
  assert.equal(await (await getAll('photos'))[0].blob.text(), 'old');
});
