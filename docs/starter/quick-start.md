# PWA Starter Quick Start

You can start with the PWA Starter by using the PWABuilder CLI, which allows you to create a fresh, templated progressive web app (PWA) project in just few seconds.

There are just a couple things you will need before getting started:

- A code editor, such as [Visual Studio Code](https://code.visualstudio.com/).
- [Node.js and npm](https://docs.microsoft.com/en-us/windows/dev-environment/javascript/nodejs-on-windows)

## Installing the CLI

If you have [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) already, you can install the PWABuilder CLI for global usage with this command:

```
npm install -g @pwabuilder/cli
```

?> **Note** The `-g` flag installs the CLI globally, so that you can use it from anywhere. If you only want the CLI to be accessible from your project directory, run the same command without the `-g` flag.

Once you have installed the CLI, you can use it to create a new progressive web app.

## Start a New App

To start a new app using the CLI:

1. Run the `create` command:

```
pwa create
```

2. Enter a name for your progressive web app:

<div class="docs-image">
    <img src="assets/starter/quick-start/enter-name-cli.png" alt="Image of prompt for create command in the PWABuilder CLI">
</div>

3.  After you hit enter, the CLI will fetch the template for you and install all npm dependencies.

Once the process completes, you can start developing on your PWA. If you want to learn how to add content to your new app, check out [this article](/starter/adding-content)

## Deploy Locally

Deploying your PWA locally is easy with the PWABuilder CLI.

From the root of your project, just run:

```
pwa start
```

Your progressive web app will then open in a new browser window.

## Next Steps

To learn how to use the CLI in depth, go [here.](/starter/cli-usage)

To learn more about adding content to your PWA, go [here.](/starter/adding-content)

To learn more about the service worker in the starter, go [here.](/starter/service-worker)

To learn how to deploy your PWA to the web, go [here.](/starter/publish)

To learn about the technical structure of the starter, go [here.](/starter/tech-overview)