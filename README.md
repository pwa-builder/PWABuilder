# PWABuilder
TODO - update this README 

## Working with this monorepo

### Pre-reqs

* node v14 or greater
* npm v7 or greater (update npm if using an older version)

### Adding a new project

1. Create a new project in packages
1. Add package to root `package.json` under `workspaces`. Order is important - make sure the package is after any dependencies or before any packages that might depend on this packages


### Built with the [PWABuilder PWA Starter](https://github.com/pwa-builder/pwa-starter)

Welcome to [PWABuilder](https://www.pwabuilder.com/) Read our launch blog [here](https://blog.pwabuilder.com/posts/introducing-the-brand-new-pwa-builder/) for all the details! 

[Try It](https://www.pwabuilder.com)

Want to help us build PWABuilder? Check out the info below and our [developer's wiki](https://github.com/pwa-builder/PWABuilder/wiki) to get started!

### Prerequisites

You will need the following things properly installed on your computer.

* [Node.js](http://nodejs.org/) (with NPM)
* [NPM](https://www.npmjs.com/get-npm)

You should also be familiar with [TypeScript](https://www.typescriptlang.org/) which we use for this project. This helps give you more guidance as you code from [intellisense](https://code.visualstudio.com/docs/editor/intellisense) when using [VSCode](https://code.visualstudio.com/).

### Recommended Development setup

We recommend the following tools for your dev setup:

* Editor: [VSCode](https://code.visualstudio.com/)
* Terminal: [Windows Terminal](https://www.microsoft.com/en-us/p/windows-terminal-preview/9n0dx20hk701?activetab=pivot:overviewtab) or [hyper](https://hyper.is/)

Additionally, when you open the project in VS Code, you'll be prompted to install recommended extensions.

### Development

Run `npm install` and then run `npm run dev`, the project should open in your default browser. From here you can start developing, your changes will be rebuilt and reloaded in the browser as you develop.

### Running Tests
We currently have E2E tests that are run using the [Playwright test-runner](https://playwright.dev/docs/test-intro).
Currently they can be run by running the following commands:
- npm run dev (We are going to run the E2E tests on your latest local changes)
- npm run test (This will make sure the needed dependences are installed and will start running the tests)

The output of the tests can be found in the console.

*Notes*
- If a test fails it will retry twice. The reason this is needed is our tests are relying on network requests, of which many are happening at once as tests run which can cause false positives.
- Playwright spins up workers for tests to try to spread the load on your CPU and avoid false positives. I have set this to 2 when running in a CI (recommended), when running locally it will use your number of CPU cores - 1. So on a Surface Pro X with 8 cores it will attempt to spin up 7 workers.
- I have also set a timeout of a minute for each test.

### Debugging in VS Code

In VS Code, install [Debugger for Microsoft Edge extension](https://marketplace.visualstudio.com/items?itemName=msjsdiag.debugger-for-edge).

In VSCode, set a breakpoint in a TypeScript file. Then press F5 to launch debugging.

### Building for Production

Run `npm run build`, the `dist/` folder will contain your built PWA. The production build will also generate a pre-caching service worker using [Workbox](https://developers.google.com/web/tools/workbox/modules/workbox-precaching).





