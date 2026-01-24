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

## License

All files on the PWABuilder repository are subject to the MIT license. Please read the License file at the root of the project.


---

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/). For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.
