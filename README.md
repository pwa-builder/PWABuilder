# PWABuilder
The simplest way to create progressive web apps across platforms and devices.

This repo is home to several projects in the PWABuilder family of tools. The main projects are

| Name  | Overview | Project Root | Docs | Contribute |
|-------| ----- | --------------- | -------------- | --------|
| PWABuilder.com | Source code for [pwabuilder.com](https://pwabuilder.com) - the best way to package PWAs for various stores. | [/apps/pwabuilder](/apps/pwabuilder) | [PWABuilder docs](https://docs.pwabuilder.com) | [Wiki](https://github.com/pwa-builder/PWABuilder/wiki)
| PWABuilder docs | Source code for [docs.pwabuilder.com](https://docs.pwabuilder.com) | [/docs](/docs) | [TODO: add wiki link] | [TODO: add wiki link]

### Prerequisites

You will need the following things properly installed on your computer.

* [Node.js](http://nodejs.org/)
* [NPM](https://www.npmjs.com/get-npm)

You should also be familiar with [TypeScript](https://www.typescriptlang.org/) which we use for this project. This helps give you more guidance as you code from [intellisense](https://code.visualstudio.com/docs/editor/intellisense) when using [VSCode](https://code.visualstudio.com/).

### Recommended Development setup

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
