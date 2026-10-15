// The supplied page must be on a Nimbus static build; all test data lives
// in a separate browser context and cannot overwrite the user's notebook.
export default async function checkNotebook(page) {
  const appUrl = await page.evaluate(() => new URL(document.querySelector('base').href).href);
  const context = await page.context().browser().newContext();
  await context.addInitScript(() => {
    window.testStreams = [];
    window.testSpeech = null;
    window.testDeniedCamera = false;
    window.testQuota = false;
    const originalPut = IDBObjectStore.prototype.put;
    IDBObjectStore.prototype.put = function (...args) {
      if (window.testQuota) throw new DOMException('Test quota exceeded', 'QuotaExceededError');
      return originalPut.apply(this, args);
    };
    class Recognition extends EventTarget {
      start() { window.testSpeech = this; }
      stop() { this.dispatchEvent(new Event('end')); }
      abort() { this.aborted = true; this.stop(); }
    }
    window.SpeechRecognition = Recognition;
    Object.defineProperty(navigator.mediaDevices, 'getUserMedia', {
      value: async () => {
        if (window.testDeniedCamera) throw new DOMException('Camera permission denied', 'NotAllowedError');
        const canvas = document.createElement('canvas');
        canvas.width = 160;
        canvas.height = 120;
        const drawing = canvas.getContext('2d');
        drawing.fillStyle = '#2587e5';
        drawing.fillRect(0, 0, 160, 120);
        const stream = canvas.captureStream(10);
        window.testStreams.push(stream);
        return stream;
      },
    });
  });
  const testPage = await context.newPage();
  const errors = [];
  testPage.on('pageerror', (error) => errors.push(error.message));
  const assert = (condition, message) => { if (!condition) throw new Error(message); };
  const saved = () => testPage.waitForFunction(() => {
    const notes = document.querySelector('app-index')?.shadowRoot?.querySelector('app-notes');
    return notes?.shadowRoot?.querySelector('.save-state')?.textContent === 'Saved on this device';
  });
  const title = () => testPage.getByRole('textbox', { name: 'Note title', exact: true });
  const body = () => testPage.getByRole('textbox', { name: 'Note text', exact: true });
  const button = (name) => testPage.getByRole('button', { name, exact: true });
  try {
    await testPage.goto(appUrl);
    await title().waitFor();
    await title().fill('First note');
    await body().fill('Original first note.');
    await button('New note').click();
    await title().fill('Second note');
    await body().fill('Second note text.');
    await saved();
    await testPage.locator('.note-item').filter({ hasText: 'First note' }).click();
    assert(await body().inputValue() === 'Original first note.', 'Rapid note switching lost text');

    await button('Add sketch').click();
    const canvas = testPage.locator('app-sketch canvas');
    const bounds = await canvas.boundingBox();
    await testPage.mouse.move(bounds.x + 20, bounds.y + 20);
    await testPage.mouse.down();
    await testPage.mouse.move(bounds.x + 160, bounds.y + 90, { steps: 10 });
    await testPage.mouse.up();
    const before = await canvas.evaluate((item) => item.toDataURL());
    await testPage.setViewportSize({ width: 390, height: 844 });
    assert(await canvas.evaluate((item) => item.toDataURL()) === before, 'Resizing erased the sketch');
    await button('Add sketch to note').click();
    await saved();

    await button('Add photo').click();
    await button('Start camera').click();
    await testPage.waitForFunction(() => {
      const notes = document.querySelector('app-index').shadowRoot.querySelector('app-notes');
      return notes.shadowRoot.querySelector('app-capture').shadowRoot.querySelector('video')?.videoWidth > 0;
    });
    await button('Take photo').click();
    await button('Sepia').click();
    await button('Add photo to note').click();
    await saved();
    assert(await testPage.evaluate(() => window.testStreams.every((stream) => stream.getTracks().every((track) => track.readyState === 'ended'))), 'Camera left running after capture');

    await button('Add photo').click();
    await button('Start camera').click();
    await testPage.locator('app-capture video').waitFor();
    await button('Cancel').click();
    assert(await testPage.evaluate(() => window.testStreams.every((stream) => stream.getTracks().every((track) => track.readyState === 'ended'))), 'Camera left running after Cancel');
    await testPage.evaluate(() => { window.testDeniedCamera = true; });
    await button('Add photo').click();
    await button('Start camera').click();
    await testPage.getByRole('alert').filter({ hasText: 'Camera permission denied' }).waitFor();
    await button('Cancel').click();

    await button('Note tools').click();
    await button('Dictate').click();
    await testPage.evaluate(() => {
      const event = new Event('result');
      event.resultIndex = 0;
      event.results = [{ isFinal: true, 0: { transcript: 'Dictated thought.' } }];
      window.testSpeech.dispatchEvent(event);
    });
    await saved();
    assert((await body().inputValue()).includes('Dictated thought.'), 'Dictation did not append to the note');
    await testPage.locator('.note-item').filter({ hasText: 'Second note' }).click();
    assert(await testPage.evaluate(() => window.testSpeech.aborted), 'Dictation did not stop when switching notes');
    assert(await body().inputValue() === 'Second note text.', 'Dictation leaked to another note');
    await testPage.locator('.note-item').filter({ hasText: 'First note' }).click();

    await testPage.evaluate(() => { window.testQuota = true; });
    await body().fill('Keep this text after a failed save.');
    await testPage.getByRole('alert').filter({ hasText: 'Could not save' }).waitFor();
    await testPage.getByRole('link', { name: 'About', exact: true }).click();
    assert(await body().inputValue() === 'Keep this text after a failed save.', 'Navigation discarded an unsaved note');
    await testPage.evaluate(() => { window.testQuota = false; });
    await button('Retry saving').click();
    await saved();

    await testPage.getByRole('link', { name: 'About', exact: true }).click();
    await testPage.getByRole('heading', { name: 'About Nimbus' }).waitFor();
    await testPage.getByRole('link', { name: 'Notes', exact: true }).click();
    await title().waitFor();
    assert(await body().inputValue() === 'Keep this text after a failed save.', 'Retry did not persist the edit');
    await testPage.waitForFunction(() => !!navigator.serviceWorker.controller);
    await context.setOffline(true);
    await testPage.reload();
    await testPage.waitForFunction(() => {
      const images = [...document.querySelector('app-index').shadowRoot.querySelector('app-notes').shadowRoot.querySelectorAll('.attachments img')];
      return images.length === 2 && images.every((image) => image.complete && image.naturalWidth > 0);
    });
    await button('Add sketch').click();
    await testPage.locator('app-sketch canvas').waitFor({ state: 'visible' });
    await button('Cancel').click();
    assert(await testPage.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Mobile layout overflows');
    await context.setOffline(false);

    // Delete immediately after typing: queued writes must never resurrect it.
    await body().fill('Delete this latest edit.');
    testPage.once('dialog', (dialog) => dialog.accept());
    await button('Delete note').click();
    await saved();
    await testPage.reload();
    await title().waitFor();
    assert(await testPage.locator('.note-item').filter({ hasText: 'First note' }).count() === 0, 'Deleted note was resurrected');
    assert(await title().inputValue() === 'Second note', 'Deleting one note affected another');
    await testPage.goto(`${appUrl}?new=sketch`);
    await testPage.locator('app-sketch canvas').waitFor({ state: 'visible' });
    await button('Cancel').click();
    await saved();
    const count = await testPage.locator('.note-item').count();
    await testPage.reload();
    await title().waitFor();
    assert(await testPage.locator('.note-item').count() === count, 'Refreshing a shortcut duplicated its note');
    await testPage.goto(`${appUrl}?title=Shared%20idea&text=Shared%20text`);
    await title().waitFor();
    assert(await title().inputValue() === 'Shared idea', 'Share target did not create a note');
    await saved();
    await testPage.reload();
    await title().waitFor();
    assert(await testPage.locator('.note-item').count() === count + 1, 'Refreshing the share target duplicated its note');
    for (const [tool, selector] of [['sketch', 'app-sketch canvas'], ['photo', 'app-capture'], ['tools', 'note-tools']]) {
      await testPage.goto(`${appUrl}?tool=${tool}`);
      await testPage.locator(selector).waitFor({ state: 'visible' });
    }
    assert(errors.length === 0, `Browser errors: ${errors.join('; ')}`);
    return { passed: true, cases: ['rapid switching', 'sketch resize and attachment', 'camera capture and filters', 'camera cleanup', 'permission denial', 'dictation binding and cleanup', 'quota failure and retry', 'client navigation', 'offline attachments and editor', 'mobile overflow', 'delete/write ordering', 'shortcuts and share target refresh', 'query tool links'] };
  } finally {
    await context.close();
  }
}
