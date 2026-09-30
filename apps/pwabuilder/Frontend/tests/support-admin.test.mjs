import assert from 'node:assert/strict';
import { test } from 'node:test';
import { InteractionRequiredAuthError } from '@azure/msal-browser';
import { AdminClient, safeError } from '../src/support/admin-client.ts';
import { adminRoute, callbackPath, returnPathKey, takeReturnPath } from '../src/support/admin-route.ts';

const clientId = '11111111-1111-4111-8111-111111111111';
const config = { tenantId: '22222222-2222-4222-8222-222222222222', clientId, scope: `api://${clientId}/Support.Read` };
const analysisPath = '/admin/analyses/analysis%3Aexample.com%3A123456';
const packagePath = '/admin/package-jobs/33333333-3333-4333-8333-333333333333';

function fixture(pathname = '/admin', account = { homeAccountId: 'test-account' }) {
  const values = new Map();
  const sessionStorage = {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: key => values.delete(key),
  };
  const calls = [];
  const browser = {
    location: { origin: 'https://support.example', pathname },
    sessionStorage,
    history: { replaceState: (_state, _title, path) => { browser.location.pathname = path; } },
  };
  let activeAccount = account;
  const auth = {
    handleRedirectPromise: async () => { calls.push('redirect'); return null; },
    getAllAccounts: () => account ? [account] : [],
    getActiveAccount: () => activeAccount,
    setActiveAccount: value => { activeAccount = value; },
    acquireTokenSilent: async request => { calls.push(['silent', request]); return { accessToken: 'api-access-token', idToken: 'never-send-id-token' }; },
    acquireTokenRedirect: async request => { calls.push(['consent', request]); },
    loginRedirect: async request => { calls.push(['login', request]); },
    logoutRedirect: async request => { calls.push(['logout', request]); },
  };
  let msalConfig;
  let status = 200;
  const request = async (path, options) => {
    calls.push(['fetch', path, options]);
    return new Response(JSON.stringify(path === '/api/admin/config' ? config : { analyses: [], packages: [] }), { status });
  };
  const client = new AdminClient(browser, request, options => { msalConfig = options; return auth; });
  return { client, browser, auth, calls, getConfig: () => msalConfig, setStatus: value => { status = value; } };
}

test('admin routes reject external URLs, traversal and encoded separators', () => {
  for (const path of ['/admin', analysisPath, packagePath, '/admin/analyses/' + encodeURIComponent('analysis:例子.测试:123456')]) {
    assert.ok(adminRoute(path));
  }
  for (const path of [
    '//evil.test/admin', 'https://evil.test/admin', '/admin/signin-oidc',
    '/admin/package-jobs/not-a-uuid', '/admin/analyses/%2e%2e', '/admin/analyses/analysis%3Ahost%3A1%2fextra',
    '/admin/analyses/analysis%3Ahost%3A1%5csecret', '/admin/analyses/%', '/admin?next=https://evil.test',
    '/admin/analyses/analysis%3Ahost%3A1%3Fcode%3Dsecret', '/admin/unknown',
  ]) {
    assert.equal(adminRoute(path), null, path);
  }
});

test('only validated internal paths survive redirect and the value is consumed', () => {
  const { browser } = fixture();
  browser.sessionStorage.setItem(returnPathKey, '//evil.test/admin');
  assert.equal(takeReturnPath(browser.sessionStorage), '/admin');
  assert.equal(browser.sessionStorage.getItem(returnPathKey), null);
  browser.sessionStorage.setItem(returnPathKey, analysisPath);
  assert.equal(takeReturnPath(browser.sessionStorage), analysisPath);
});

test('redirect processing precedes private API access; only scoped access tokens are sent', async () => {
  const f = fixture(callbackPath);
  f.browser.sessionStorage.setItem(returnPathKey, analysisPath);
  await assert.rejects(f.client.get('/admin'), /Sign in/);
  await Promise.all([f.client.initialize(), f.client.initialize()]);
  await f.client.get(f.browser.location.pathname);
  assert.equal(f.calls.filter(call => call === 'redirect').length, 1);
  const msal = f.getConfig();
  assert.equal(msal.auth.authority, `https://login.microsoftonline.com/${config.tenantId}`);
  assert.equal(msal.auth.redirectUri, `https://support.example${callbackPath}`);
  assert.equal(msal.auth.postLogoutRedirectUri, msal.auth.redirectUri);
  assert.equal(msal.auth.navigateToLoginRequestUrl, false);
  assert.equal(msal.cache.cacheLocation, 'sessionStorage');
  assert.equal(msal.cache.temporaryCacheLocation, 'sessionStorage');
  assert.equal(msal.cache.storeAuthStateInCookie, false);
  const silent = f.calls.find(call => call[0] === 'silent');
  assert.deepEqual(silent[1].scopes, [config.scope]);
  const api = f.calls.find(call => call[0] === 'fetch' && call[1] !== '/api/admin/config');
  assert.ok(f.calls.indexOf('redirect') < f.calls.indexOf(api));
  assert.equal(api[1], `/api${analysisPath}`);
  assert.equal(api[2].headers.Authorization, 'Bearer api-access-token');
  assert.equal(api[2].cache, 'no-store');
  assert.equal(api[2].credentials, 'omit');
  assert.equal(api[2].redirect, 'error');
  await assert.rejects(f.client.get('https://evil.test/api/admin'), /not valid/);
});

test('interaction_required is actionable but never automatically redirects', async () => {
  const f = fixture();
  await f.client.initialize();
  f.auth.acquireTokenSilent = async () => { throw new InteractionRequiredAuthError('interaction_required'); };
  await assert.rejects(f.client.get('/admin'), error => safeError(error).interactionRequired);
  assert.ok(!f.calls.some(call => ['login', 'consent'].includes(call[0])));
  await f.client.signIn(packagePath);
  assert.equal(f.browser.sessionStorage.getItem(returnPathKey), packagePath);
  assert.deepEqual(f.calls.find(call => call[0] === 'consent')[1].scopes, [config.scope]);
});

test('signed-out flow is explicit and signout prevents further diagnostics', async () => {
  const f = fixture('/admin', null);
  await f.client.initialize();
  await assert.rejects(f.client.get('/admin'), /Sign in/);
  assert.ok(!f.calls.some(call => call[0] === 'login'));
  await f.client.signIn(analysisPath);
  assert.equal(f.calls.find(call => call[0] === 'login')[1].prompt, 'select_account');
  await f.client.signOut();
  assert.equal(f.browser.sessionStorage.getItem(returnPathKey), null);
  assert.equal(f.client.signedIn, false);
  await assert.rejects(f.client.get('/admin'), /Sign in/);
});

test('401/403/404 and unexpected errors never reveal response or MSAL details', async () => {
  const f = fixture();
  await f.client.initialize();
  for (const [status, expected] of [[401, /Sign in again/], [403, /Access denied/], [404, /not found/], [500, /temporarily unavailable/]]) {
    f.setStatus(status);
    await assert.rejects(f.client.get('/admin'), expected);
  }
  assert.ok(!safeError(new Error('secret-token raw server error')).message.includes('secret-token'));
});

test('failed redirect clears callback parameters and never loads private data', async () => {
  const f = fixture(callbackPath);
  f.auth.handleRedirectPromise = async () => { throw new Error('private-protocol-details'); };
  await assert.rejects(f.client.initialize());
  assert.equal(f.browser.location.pathname, '/admin');
  await assert.rejects(f.client.get('/admin'), /Sign in/);
  assert.equal(f.calls.filter(call => call[0] === 'fetch').length, 1);
});

test('invalid authority or API scope cannot initialize MSAL', async () => {
  for (const data of [
    { ...config, tenantId: '//evil.test' },
    { ...config, clientId: '../other' },
    { ...config, scope: 'https://graph.microsoft.com/User.Read' },
    { ...config, scope: 'api://another-app/Support.Read' },
  ]) {
    const { browser } = fixture();
    let created = false;
    const client = new AdminClient(browser,
      async () => new Response(JSON.stringify(data)),
      () => { created = true; throw new Error('Must not initialize'); });
    await assert.rejects(client.initialize(), /not configured/);
    assert.equal(created, false);
  }
});

test('a token arriving after cancellation or signout cannot initiate an API request', async () => {
  for (const signOut of [false, true]) {
    const f = fixture();
    await f.client.initialize();
    let finish;
    f.auth.acquireTokenSilent = () => new Promise(resolve => { finish = resolve; });
    const abort = new AbortController();
    const pending = f.client.get('/admin', abort.signal);
    if (signOut) {
      await f.client.signOut();
    } else {
      abort.abort();
    }
    finish({ accessToken: 'late-token' });
    await assert.rejects(pending, /cancelled/);
    assert.equal(f.calls.filter(call => call[0] === 'fetch').length, 1);
  }
});
