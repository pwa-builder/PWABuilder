const startMarker = '<!-- pwabuilder-pr-deployments:start -->';
const endMarker = '<!-- pwabuilder-pr-deployments:end -->';

function updateBody(body, links) {
  body = body ?? '';
  const section = [
    startMarker,
    '## PR deployments',
    ...links.map(({ name, url }) => `- ${name}: ${url}`),
    endMarker,
  ].join('\n');
  const start = body.indexOf(startMarker);
  const end = body.indexOf(endMarker);
  if (start === -1 && end === -1) {
    return `${body}${body ? '\n\n' : ''}${section}`;
  }
  if (start === -1 || end < start ||
      body.indexOf(startMarker, start + startMarker.length) !== -1 ||
      body.indexOf(endMarker, end + endMarker.length) !== -1) {
    throw new Error('PR deployment markers are malformed or duplicated; refusing to edit the description.');
  }
  return body.slice(0, start) + section + body.slice(end + endMarker.length);
}

async function publish({ github, context, core }) {
  const repo = context.repo;
  const number = context.payload.pull_request.number;
  const sha = context.payload.pull_request.head.sha;
  const args = { ...repo, pull_number: number };
  const { data: pr } = await github.rest.pulls.get(args);
  const isCurrent = (value) => value.state === 'open' &&
    value.head.sha === sha && value.head.repo?.full_name === `${repo.owner}/${repo.repo}`;
  if (!isCurrent(pr)) {
    core.info('Skipping deployment links: PR is closed, superseded, or outside the trusted scope.');
    return;
  }
  const services = [
    { app: 'pwabuilder', name: 'PWABuilder' },
    { app: 'pwabuilder-windows-docker', name: 'Microsoft Store' },
    { app: 'pwabuilder-cloudapk', name: 'Google Play' },
  ];
  const links = new Map();
  // Aggregate all services so GitHub replacing a pending publishing job cannot lose its link.
  const deployments = await github.paginate(github.rest.repos.listDeployments,
    { ...repo, sha, environment: 'staging', per_page: 100 });
  for (const deployment of deployments) {
    const statuses = await github.paginate(github.rest.repos.listDeploymentStatuses,
      { ...repo, deployment_id: deployment.id, per_page: 100 });
    for (const status of statuses) {
      if (status.state !== 'success') continue;
      for (const service of services) {
        const url = `https://${service.app}-pr-${number}.azurewebsites.net`;
        if (status.environment_url === url || status.environment_url === `${url}/`) {
          links.set(service.app, { name: service.name, url });
        }
      }
    }
  }
  if (links.size === 0) {
    core.info('No successful PR slot deployments to publish.');
    return;
  }
  const body = updateBody(pr.body, services.filter(({ app }) => links.has(app)).map(({ app }) => links.get(app)));
  if (body === pr.body) return;
  const { data: latest } = await github.rest.pulls.get(args);
  if (!isCurrent(latest)) return;
  if (latest.body !== pr.body) {
    throw new Error('PR description changed while collecting deployment links; rerun publishing rather than overwrite it.');
  }
  await github.rest.pulls.update({ ...args, body });
}

module.exports = { updateBody, publish };
