import { expect, elementUpdated, html, fixture } from '@open-wc/testing';

import '../../dist/pwa-install.js';

it('does instantiate', async () => {
  const el = await fixture('<pwa-install></pwa-install>');
  expect(el.tagName).to.equal('PWA-INSTALL');
});

it('renders slot content correctly', async () => {
  const el = await fixture('<pwa-install>Slotted</pwa-install>');
  expect(el.textContent).to.equal('Slotted');
});

it('has correct default manifest path', async () => {
  const el = await fixture('<pwa-install></pwa-install>');
  expect(el.manifestpath).to.equal('manifest.json');
});

it('handles custom manifest paths', async () => {
  const el = await fixture('<pwa-install manifestpath="custom.json"></pwa-install>');
  expect(el.manifestpath).to.equal('custom.json');
});

it('shouldnt have manifest data', async () => {
  const el = await fixture('<pwa-install></pwa-install>');
  expect(el.manifestdata).to.be.undefined;
});

it ('still shouldnt have manifest data', async () => {
  const el = await fixture('<pwa-install></pwa-install>');
  await el.getManifestData();

  expect(el.manifestdata).to.be.undefined;
});

it('shouldShowInstall should return false if no manifest data', async () => {
  const el = await fixture('<pwa-install></pwa-install>');
  await el.getManifestData();

  const testResult = el.shouldShowInstall();
  expect(testResult).to.be.false;
});

it('should have manifest data', async () => {
  const manifestData = {
    short_name: "testName"
  };

  const el = await fixture('<pwa-install></pwa-install>');
  el.manifestdata = manifestData;
  await elementUpdated(el);

  expect(el.manifestdata).to.not.equal(null)
});

it('should detect supported browser', async () => {
  const el = await fixture('<pwa-install></pwa-install>');
  await elementUpdated(el);
  expect(el.isSupportingBrowser).to.be.true;
});

it('shouldShowInstall should return false', async () => {
  const el = await fixture('<pwa-install></pwa-install>');

  const testResult = el.shouldShowInstall();
  await elementUpdated(el);

  expect(testResult).to.be.false;
});

it('shouldShowInstall should still return false even if showopen is true', async () => {
  const el = await fixture('<pwa-install showopen></pwa-install>');

  const testResult = el.shouldShowInstall();
  await elementUpdated(el);

  expect(testResult).to.be.false;
});

it('shouldShowInstall should return false even if showeligible is on', async () => {
  const el = await fixture('<pwa-install showeligible></pwa-install>');

  const testResult = el.shouldShowInstall();
  await elementUpdated(el);

  expect(testResult).to.be.false;
});

it('deferredPrompt should be undefined if not in install eligible env', async () => {
  const el = await fixture('<pwa-install></pwa-install>');

  expect(el.deferredPrompt).to.be.undefined;
});

it('shouldnt use ios stuff on Chromium', async () => {
  const el = await fixture('<pwa-install></pwa-install>');
  expect(el.isIOS).to.be.false;
});

it('should use ios stuff when set', async () => {
  const el = await fixture(
    html`
      <my-el .isIOS=${true}></my-el>
    `,
  );
  expect(el.isIOS).to.be.true;
});

it('openmodal should be true when openPrompt is called', async () => {
  const el = await fixture('<pwa-install></pwa-install>');
  el.openPrompt();

  expect(el.openmodal).to.be.true;
});

it ('openmodal should be false once cancle is called', async () => {
  const el = await fixture('<pwa-install></pwa-install>');
  el.openPrompt();

  expect(el.openmodal).to.be.true;

  el.cancel();
  expect(el.openmodal).to.be.false;
});



