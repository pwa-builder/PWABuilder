# PWABuilder
The simplest way to create [progressive web apps](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps) across platforms and devices.

This repo is home to several projects in the PWABuilder family of tools. 

## Tools

| Tools  | Overview | Source | Docs | Contribute |
|-------| ----- | -------- | -------------- | --------|
| [PWABuilder.com](https://pwabuilder.com) | The best way to package PWAs for various stores. | [/apps/pwabuilder](/apps/pwabuilder) | [PWABuilder docs](https://docs.pwabuilder.com) | [Wiki](https://github.com/pwa-builder/PWABuilder/wiki)
| [PWA Studio](https://marketplace.visualstudio.com/items?itemName=PWABuilder.pwa-studio) | PWA Studio makes VSCode the BEST developer environment for building Progressive Web Apps. | [/apps/pwabuilder-vscode](/apps/pwabuilder-vscode) | [PWA Studio docs](https://docs.pwabuilder.com/#/studio/quick-start) | [Wiki](https://github.com/pwa-builder/PWABuilder/wiki)
| [PWA Starter](https://github.com/pwa-builder/pwa-starter) | Our opinionated and production tested progressive web app (PWA) template for creating new projects. | [Repo](https://github.com/pwa-builder/pwa-starter) | [PWA Starter docs](https://docs.pwabuilder.com/#/starter/quick-start) | [Wiki](https://github.com/pwa-builder/PWABuilder/wiki)

## Docs

| Docs | Source | Contribute |
| -------- | -------------- | --------|
| [docs.pwabuilder.com](https://docs.pwabuilder.com) | [/docs](/docs) | [Wiki](https://github.com/pwa-builder/PWABuilder/wiki/Documentation)
| [blog.pwabuilder.com](https://blog.pwabuilder.com) | [/apps/blog](/apps/blog) | [/apps/blog](/apps/blog)

## Components

| Components  | Overview | Source | Docs | Contribute |
|-------| ----- | -------- | -------------- | --------|
| `<pwa-install>`<br /><br /> [![npm version](https://badge.fury.io/js/@khmyznikov%2Fpwainstall.svg)](https://badge.fury.io/js/@khmyznikov%2Fpwainstall) | Web component for great PWA install experience | [pwa-install](https://github.com/khmyznikov/pwa-install) | [pwa-install](https://github.com/khmyznikov/pwa-install) | [Wiki](https://github.com/khmyznikov/pwa-install?tab=readme-ov-file#pwa-install)


## Recommended Development setup

You will need the following things properly installed on your computer.

* [Node.js](http://nodejs.org/)
* [NPM](https://www.npmjs.com/get-npm)
* [.NET 9.0 SDK](https://dotnet.microsoft.com/en-us/download/dotnet/9.0) 
* [Docker Desktop]()

You should also be familiar with [TypeScript](https://www.typescriptlang.org/) which we use for this project. This helps give you more guidance as you code from [intellisense](https://code.visualstudio.com/docs/editor/intellisense) when using [VSCode](https://code.visualstudio.com/).


We recommend the following tools for your dev setup:

* Editor: [VSCode](https://code.visualstudio.com/)
* Terminal: [Windows Terminal](https://www.microsoft.com/en-us/p/windows-terminal-preview/9n0dx20hk701?activetab=pivot:overviewtab) or [hyper](https://hyper.is/)

Additionally, when you open the project in VS Code, you'll be prompted to install recommended extensions.

### Development

Set the `NODE_BIN` environment variable, `.vscode/launch.json` for VS code and `apps\pwabuilder\Properties\launchSettings.json` for Visual Studio:
- Windows: `C:/Program Files/nodejs/node.exe`
- Mac: `/usr/local/bin/node`
- Linux: `/usr/bin/node`

Using VS Code (App and API)
- Run `VSCode Run and Debug` (F5 key) to build the project and start a local Edge browser.
- Closing the Edge browser will terminate the debug session.

Using Visual Studio (API only)
- Open the solution and run the `https` profile (F5 key)

Alternatively, build the `Dockerfile.production` container and access it from `http://localhost:8080` 

### Deployment

The web app, Microsoft Store, and Google Play deployment workflows publish uniquely tagged
images containing the commit SHA, workflow run ID, and run attempt. Each workflow
deploys the digest captured from its pushed image, not a mutable `:production`
or `:latest` tag. This prevents a subsequent preview build from changing the
image a deployed slot pulls on restart or scale-out.

Promote the tested image by swapping slots or deploying its exact digest.
Existing production slots using mutable tags must be pinned separately to their
verified known-good digests; changing these workflows does not update live slots.
Retain images referenced by deployed slots and images needed for rollback.
Breaking web app and Google Play API changes still require coordinated releases.

#### Pull request deployment slots

Pushes to `main` deploy changed services to their existing shared slots:
`pwabuilder/preview`, `pwabuilder-windows-docker/staging`, and
`pwabuilder-cloudapk/staging`. Manual packager workflow runs also use their shared
slots. The web app deploys to shared preview only on a push to `main` (including
PR merges); manual web workflow runs build an image but do not deploy it.
PRs targeting `main` from branches in this repository instead create or update
`pr-<number>` slots on the affected apps. Fork PRs are skipped before any build
or Azure login. The deployed slot URLs appear in workflow run summaries and
GitHub's `staging` environment deployment records.

The three service workflows retain their own builds and call `deploy-pr-slot.yml`
for PR deployment. `delete-pr-slots.yml` handles both merged and unmerged closed
PRs, without path filters, and executes only the trusted default branch.
Cleanup checks all three apps and tolerates missing slots, but reports Azure
errors. Deploy and cleanup jobs share a per-app/PR concurrency lock and recheck
the current PR state; obsolete builds are skipped, late builds clean up closed
PRs, and cleanup skips reopened PRs. A reopened PR gets a fresh deployment.
If cleanup fails or is cancelled, rerun the cleanup workflow run.

Before enabling PR deployments, configure Azure and GitHub:

* Ensure each App Service plan has spare deployment slots and enough shared
  compute capacity. Slots require Standard, Premium, or Isolated plans.
  Standard supports five deployment slots per app, including existing staging
  slots; reaching the limit fails deployment rather than replacing another slot.
* Grant the deployment identities permission to list apps, read source slot
  configuration, and create, configure, restart, and delete slots on their
  corresponding apps. `AZURE_WESTUS3_APP_ID` handles the web app,
  `AZURE_EASTUS_APP_ID` handles Microsoft Store, and `AZURE_CENTRALUS_APP_ID`
  handles Google Play. The existing `AZURE_WESTUS_APP_ID` build identity still
  pushes packager images to ACR. Subscription and tenant secrets are unchanged.
* Configure federated OIDC credentials for the contexts used by these workflows.
  This repository uses customized subjects with stable owner/repository IDs:
  builds without a GitHub environment use
  `repository_owner_id:11843769:repository_id:33142199:ref:refs/heads/main` or
  `repository_owner_id:11843769:repository_id:33142199:pull_request`;
  PR deployments and cleanup use
  `repository_owner_id:11843769:repository_id:33142199:environment:staging`.
  The existing Azure identities already trust these required subjects.
  Keep any GitHub `staging` environment protection rules compatible with PR
  deployments and cleanup. Required approval rules also delay slot deletion.
* Source slots must have auto-swap disabled and working container registry
  authentication. User-assigned identities are attached to PR slots without
  creating new role assignments; the workflow identity needs permission to
  assign them, and those identities need existing access to ACR and any runtime
  dependencies. A source with both system- and user-assigned identities is
  supported: PR slots use the existing user-assigned identity, not a new
  system-assigned principal. The helper selects the configured ACR identity or
  the single attached user identity, sets the PR slot's ACR client ID and
  `AZURE_CLIENT_ID`, and fills an empty
  `AppSettings__AzureManagedIdentityApplicationId` with that client ID.
  It rejects system-only or ambiguous identity configurations. Existing source
  slots retain their original identity selections.
* Each deployment identity has **Managed Identity Operator** scoped to its own
  existing user-assigned identity and **Network Contributor** scoped to the
  existing staging subnet. PR slots attach those identities and join those
  subnets without changing subnet delegation or source slot configuration.
  These grants do not authorize changing unrelated identities or networks.
  Runtime data permissions (such as Cosmos DB data roles) are separate from
  these deployment permissions and must cover the selected user identity.
  Microsoft Store's `pwabuilder-managed-id-east-us` has Cosmos DB Built-in Data
  Contributor scoped to `pwabuilder-cosmosdb`'s
  `PWABuilder/PWABuilderPackages` container for PR package analytics.
* Review the cloned staging configuration, credentials, network dependencies,
  and background workers. PR slots share staging databases, queues, and other
  configured dependencies; they are not isolated test infrastructure. Private
  endpoints are not automatically provisioned by this workflow. VNet integration
  reuses the source slot's subnet, which must have spare addresses for PR slots.
  All source app settings and typed connection strings, including sticky values,
  are copied explicitly on deployment. Only the PR slot's values are written;
  app-wide sticky setting metadata and source/production values are unchanged.
  Configuration values are not printed or passed as command-line arguments;
  temporary request files are private on Linux and removed even after failure.

The web PR slot retains the preview slot's packaging endpoints. It does not
automatically route to matching PR packager slots, and the existing Android
endpoint allowlist is unchanged. Packager PR slots can be tested directly.
Never swap a PR slot into production. Deleting a slot does not delete its ACR
images; apply an image retention policy that preserves deployed and rollback
digests.

Run the slot lifecycle regression checks with
`pwsh -NoProfile -File .github/scripts/tests/test-pr-slot.ps1`.
They simulate Azure and GitHub responses without changing cloud resources.

## License

All files on the PWABuilder repository are subject to the MIT license. Please read the License file at the root of the project.


---

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/). For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.
