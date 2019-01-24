# Contributing to PWABuilder

PWABuilder was founded by Microsoft as a community guided, open source project to help move PWA adoption forward. We want to make sure that as the project evolves, it remains simple to get started, maintain, and improve.

Many of the guidelines of this document are focused on promoting this sustainable simplicity.

## Quick tech overview
PWABuilder is built with the following tech stack:

- https://nuxtjs.org/
- https://vuejs.org/
- https://www.typescriptlang.org/

It is helpful to be familiar with these technologies before contributing.

## Get started developing

### Prerequisites

At a minimum, you will need the following things properly installed on your computer to get started:

* [Git](http://git-scm.com/)
* [Node.js](http://nodejs.org/) (with NPM)
* [NPM](http://npmjs.com/)

To run e2e test coverage and build your changes (in production mode) you must also install: 

 * [Java JDK](http://www.oracle.com/technetwork/java/javase/downloads/index.html) 
 * [Docker](https://www.docker.com/) 



### Installation

* `git clone <repository-url>` this repository
* navigate inside the new directory
* `npm install`

### Running in Development mode

* `npm run dev`
* visit your app at [http://localhost:3000](http://localhost:3000)

## Run tests on your (development mode) contributions

### Running Unit Test Coverage

* `npm test`

### Running e2e Test Coverage

* `npm install selenium-standalone@latest -g` _only once_
* `selenium-standalone install` _only once_
* `npm run e2e` 

> The [Java JDK](http://www.oracle.com/technetwork/java/javase/downloads/index.html) must be installed to perform these commands.

## Run & build the production code

Production mode requires the same prerequisites and installation steps as development mode above. 

However, production mode has a different build process outlined below:

* `npm run build` (builds and compiles the production code)
>> [Docker](https://www.docker.com/) must be installed to perform the above command.

* `npm start` (doesn't compile the code)

## Where should I start contributing?

PWABuilder is split into multiple repositories. We recommend you get started with the following repos:

* https://github.com/pwa-builder/PWABuilder: This is the repo for the pwabuilder.com site. The master branch is the current public stable version. The redesign branch is where all new work is at the moment and will be merged to master when released.
* https://github.com/pwa-builder/PWABuilder-CLI: This is the repo for the PWABuilder CLI.
* https://github.com/pwa-builder/pwabuilder-api: This is the repo for the backend API used by PWABuilder. It is a node/express server and is currently deployed on Azure.
* https://github.com/pwa-builder/pwabuilder-serviceworkers: This is the repo for the service worker snippits used by the PWABuilder site.
* https://github.com/pwa-builder/pwabuilder-snippits: This is the repo for the features snippits used by the PWABuilder site.

## What should I check before submitting a pull request?
For every contribution, you must:

* Test your code
* Target master branch (or an appropriate release branch if appropriate for a bug fix)
* Ensure that your contribution follows [standard accessibility guidelines](https://docs.microsoft.com/en-us/microsoft-edge/accessibility/design). Use tools like https://webhint.io/ to validate your changes.

If adding a new feature, 
    **you should open an issue with us** on the main PWABuilder repo on Github (https://github.com/pwa-builder/PWABuilder) before you start coding.

Once you have opened your PR, feel free to add a reviewer (Github should recommend people on the team). When the PR has been reviewed and is good to go, a team member will merge it.


## Have questions?
Please do not open issues for general support questions and keep our GitHub issues for bug reports and feature requests. There is a much better chance of getting your question answered on [StackOverflow](https://stackoverflow.com/questions/tagged/pwabuilder) where questions should be tagged with `pwabuilder`

## Found bugs?
If you find a bug, you can help us by
[submitting an issue](https://github.com/pwa-builder/PWABuilder/issues). Even better, you can
[submit a Pull Request](#pr) with a fix.

## Special thanks
This contributing doc was inspired by our friends' version at the [Windows Community Toolkit](https://github.com/windows-toolkit/WindowsCommunityToolkit/).

