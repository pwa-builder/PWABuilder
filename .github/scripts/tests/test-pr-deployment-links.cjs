const assert = require('node:assert/strict');
const { test } = require('node:test');
const { updateBody, publish } = require('../publish-pr-deployment-links.cjs');

test('appends links without changing the description', () => {
  const body = '## Existing description\nKeep this checklist.\n';
  const result = updateBody(body, [{ name: 'PWABuilder', url: 'https://pwabuilder-pr-123.azurewebsites.net' }]);
  assert.ok(result.startsWith(body));
  assert.match(result, /- PWABuilder: https:\/\/pwabuilder-pr-123.azurewebsites.net/);
});

test('replaces only the marked section and does not duplicate it', () => {
  const body = 'Before\n<!-- pwabuilder-pr-deployments:start -->\nOld links\n<!-- pwabuilder-pr-deployments:end -->\nAfter';
  const links = [{ name: 'Microsoft Store', url: 'https://pwabuilder-windows-docker-pr-123.azurewebsites.net' }];
  const updated = updateBody(body, links);
  assert.ok(updated.startsWith('Before\n'));
  assert.ok(updated.endsWith('\nAfter'));
  assert.equal(updateBody(updated, links), updated);
  assert.equal(updated.includes('Old links'), false);
});

test('supports an empty PR description', () => {
  assert.match(updateBody(null, []), /## PR deployments/);
});

test('rejects malformed or duplicate markers rather than changing user text', () => {
  for (const body of [
    '<!-- pwabuilder-pr-deployments:start -->',
    '<!-- pwabuilder-pr-deployments:end -->',
    '<!-- pwabuilder-pr-deployments:end --><!-- pwabuilder-pr-deployments:start -->',
    '<!-- pwabuilder-pr-deployments:start --><!-- pwabuilder-pr-deployments:start --><!-- pwabuilder-pr-deployments:end -->',
  ]) {
    assert.throws(() => updateBody(body, []), /markers/);
  }
});

function fixture() {
  const state = {
    pr: { state: 'open', body: 'User description', head: { sha: 'head', repo: { full_name: 'owner/repo' } } },
    deployments: [
      { id: 1, environment: 'staging' },
      { id: 2, environment: 'staging' },
      { id: 3, environment: 'staging' },
      { id: 4, environment: 'staging' },
    ],
    statuses: {
      1: [{ state: 'success', environment_url: 'https://pwabuilder-pr-123.azurewebsites.net' }],
      2: [{ state: 'inactive' }, { state: 'success', environment_url: 'https://pwabuilder-windows-docker-pr-123.azurewebsites.net' }],
      3: [{ state: 'failure', environment_url: 'https://pwabuilder-cloudapk-pr-123.azurewebsites.net' }],
      4: [{ state: 'success', environment_url: 'https://untrusted.example.com' }],
    },
    patches: [],
    gets: 0,
  };
  const github = {
    rest: {
      pulls: {
        get: async () => {
          state.gets++;
          return { data: structuredClone(state.pr) };
        },
        update: async (args) => state.patches.push(args),
      },
      repos: {
        listDeployments: 'deployments',
        listDeploymentStatuses: 'statuses',
      },
    },
    paginate: async (route, args) => {
      if (route === 'deployments') {
        assert.equal(args.sha, 'head');
        assert.equal(args.environment, 'staging');
        return state.deployments;
      }
      return state.statuses[args.deployment_id];
    },
  };
  const context = { repo: { owner: 'owner', repo: 'repo' }, payload: { pull_request: { number: 123, head: { sha: 'head' } } } };
  return { github, context, core: { info: () => {} }, state };
}

test('aggregates all successful service links even if another publishing job was displaced', async () => {
  const f = fixture();
  await publish(f);
  assert.equal(f.state.patches.length, 1);
  const body = f.state.patches[0].body;
  assert.match(body, /PWABuilder: https:\/\/pwabuilder-pr-123/);
  assert.match(body, /Microsoft Store: https:\/\/pwabuilder-windows-docker-pr-123/);
  assert.doesNotMatch(body, /Google Play|untrusted/);
});

test('skips closed, superseded, or fork PRs', async () => {
  for (const change of [
    (pr) => { pr.state = 'closed'; },
    (pr) => { pr.head.sha = 'newer'; },
    (pr) => { pr.head.repo.full_name = 'fork/repo'; },
  ]) {
    const f = fixture();
    change(f.state.pr);
    await publish(f);
    assert.equal(f.state.patches.length, 0);
  }
});

test('does not advertise slots from another PR or arbitrary URL paths', async () => {
  const f = fixture();
  f.state.statuses[1][0].environment_url = 'https://pwabuilder-pr-999.azurewebsites.net';
  f.state.statuses[2][1].environment_url += '/unexpected';
  await publish(f);
  assert.equal(f.state.patches.length, 0);
});

test('refuses to overwrite a concurrently edited description', async () => {
  const f = fixture();
  const get = f.github.rest.pulls.get;
  f.github.rest.pulls.get = async (...args) => {
    if (f.state.gets === 1) f.state.pr.body = 'New user edit';
    return get(...args);
  };
  await assert.rejects(publish(f), /changed/);
  assert.equal(f.state.patches.length, 0);
});

test('propagates GitHub API errors', async () => {
  const f = fixture();
  f.github.paginate = async () => { throw new Error('GitHub unavailable'); };
  await assert.rejects(publish(f), /GitHub unavailable/);
  assert.equal(f.state.patches.length, 0);
});
