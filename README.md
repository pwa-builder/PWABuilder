# PWABuilder
The simplest way to create progressive web apps across platforms and devices.

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
| `<pwa-auth>`<br /><br /> [![npm version](https://badge.fury.io/js/@pwabuilder%2Fpwaauth.svg)](https://badge.fury.io/js/@pwabuilder%2Fpwaauth) | Web component for authenticating users | [/components/pwa-auth](/components/pwa-auth) | [/components/pwa-auth/docs](/components/pwa-auth/docs) | [Wiki](https://github.com/pwa-builder/PWABuilder/wiki)
| `<pwa-update>`<br /><br /> [![npm version](https://badge.fury.io/js/@pwabuilder%2Fpwaupdate.svg)](https://badge.fury.io/js/@pwabuilder%2Fpwaupdate) | Web component for great PWA update experience | [/components/pwa-update](/components/pwa-update) | [/components/pwa-update](/components/pwa-update) | [Wiki](https://github.com/pwa-builder/PWABuilder/wiki)
| `<pwa-install>`<br /><br /> [![npm version](https://badge.fury.io/js/@pwabuilder%2Fpwainstall.svg)](https://badge.fury.io/js/@pwabuilder%2Fpwainstall) | Web component for great PWA install experience | [/components/pwa-install](/components/pwa-install) | [/components/pwa-install](/components/pwa-install) | [Wiki](https://github.com/pwa-builder/PWABuilder/wiki)
| `<pwa-inking>`<br /><br /> [![npm version](https://badge.fury.io/js/@pwabuilder%2Fpwa-inking.svg)](https://badge.fury.io/js/@pwabuilder%2Fpwa-inking) | Web component for adding inking to your PWAs | [/components/pwa-inking](/components/pwa-inking) | [/components/pwa-inking](/components/pwa-inking) | [Wiki](https://github.com/pwa-builder/PWABuilder/wiki)


## Recommended Development setup

You will need the following things properly installed on your computer.

* [Node.js](http://nodejs.org/)
* [NPM](https://www.npmjs.com/get-npm)

You should also be familiar with [TypeScript](https://www.typescriptlang.org/) which we use for this project. This helps give you more guidance as you code from [intellisense](https://code.visualstudio.com/docs/editor/intellisense) when using [VSCode](https://code.visualstudio.com/).


We recommend the following tools for your dev setup:

* Editor: [VSCode](https://code.visualstudio.com/)
* Terminal: [Windows Terminal](https://www.microsoft.com/en-us/p/windows-terminal-preview/9n0dx20hk701?activetab=pivot:overviewtab) or [hyper](https://hyper.is/)

Additionally, when you open the project in VS Code, you'll be prompted to install recommended extensions.

### Development

Navigate to the folder of the project you plan to work on (example [/apps/pwabuilder](/apps/pwabuilder)), and follow the README for how to get started. 

Running `npm install` in the project folder will automatically install and build all dependencies.


### About this monorepo

This monorepo does not use a root package.json like other monorepos you might be used to. Instead, projects live in their separate folders and are mostly independent of each other. 

However, when there are dependencies between projects, our tooling should automatically handle linking and dependency building when you run `npm install` in the project root. 

For example `/apps/pwabuilder` has a dependency on `library/site-analytics`. This dependency is defined in the pwabuilder package.json like so: 

```json
  //package.json
  "dependencies": {
    "@pwabuilder/site-analytics": "file:../../libraries/site-analytics",
    ...
```

Running `npm install` in the pwabuilder folder will also run `npm install` and `npm run build` for the `site-analytics` project. In most cases, and unless working on a dependency, a developer will not have to worry about how these projects are linked.

For automatic linking of projects to work, ensure each project has a `preinstall` script like so:

```json
  // package.json
  "scripts": {
    "preinstall": "node ../../scripts/setupDeps.js",
    ...
```


## License

All files on the PWABuilder repository are subject to the MIT license. Please read the License file at the root of the project.


---

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/). For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.
