# PWA Starter Quick Start

You can start with the PWA Starter by using the PWABuilder CLI, which allows you to create a fresh, templated progressive web app (PWA) project in just few seconds.

## Prerequisites

The only prerequisite for using the PWA Starter and the PWABuilder CLI is [Node.js and npm.](https://nodejs.org/en/download)

We also recommend using [Git](https://git-scm.com/) and some sort of code editor, such as [VSCode](https://code.visualstudio.com/), but these are not required.

## Installing the CLI

Using [npm](https://nodejs.org/en/download), you can install the PWA Builder CLI with this command:

```
npm i -g @pwabuilder/cli
```

?> **Note** The `-g` flag installs the CLI globally, so that you can use it from anywhere. If you only want the CLI to be accessible from your project directory, run the same command without the `-g` flag.

Once you have installed the CLI, you can use it to create a new progressive web app.

?> **Note** Optionally, you can run the CLI without installing it using `npx`. Guidance on how to do this is included below.

## Start a New App

To start a new app using the CLI:

1. If you have installed the CLI, run the `create` command and provide a name for your app:

```
pwa create <app-name-here>
```

2. If you are using NPX, you can run the same command like so: 

```
npx @pwabuilder/cli create <app-name-here>
```

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