# Contributing to the pwa-install component

The pwa-install component is a [web component](https://developer.mozilla.org/en-US/docs/Web/Web_Components) built using [lit-element](https://lit-element.polymer-project.org/). If you are not familiar with lit-element, we recommend reading through the [lit-element guide](https://lit-element.polymer-project.org/guide) before contributing.

## Get started developing

### Prerequisites

At a minimum, you will need the following things properly installed on your computer to get started:

* [Git](http://git-scm.com/)
* [Node.js](http://nodejs.org/) (with NPM)
* [NPM](http://npmjs.com/)

### Installation

* `git clone https://github.com/pwa-builder/pwa-install.git`
* navigate inside the new directory
* `npm install`

### Developing

* `npm run dev`
* Your browser will open `www/index.html` with a livereload dev server.

Once you have run `npm run dev` you can then start making your changes to `src/pwa-install.ts`. Every time you save your work the code will be re-compiled and the page will reload with your new code. 


# Frequently Asked Questions

## Who can contribute?

Anyone who wants to be part of bringing PWAs to the web can contribute to pwa-install! Skill level doesn't matter. All contributions big and small help us out. We have reviewers who can help you through the process the first few times.

## Why does Microsoft need contributors?

pwa-install was founded by Microsoft, but it's only moved forward because of the community's help.  We open-sourced this because Microsoft wants to support the cross-platform development ecosystem and work with the community and browsers to direct the future of PWAs.

## What kind of contributions is pwa-install seeking?

No contribution is too small or too big. Bigger tasks take longer to review while smaller ones get feedback more quickly. Most contributors start with a small update, a bug fix, or docs improvement, and then move on to bigger tasks as they gain more familiarity with the component.

## What should I check before submitting a pull request?

For every contribution, you must:

* Test: run `npm run test` and ensure that all tests pass.
* Target master branch (or an appropriate release branch if appropriate for a bug fix)
* Ensure that your contribution follows [standard accessibility guidelines](https://docs.microsoft.com/en-us/microsoft-edge/accessibility/design). Use tools like https://webhint.io/ to validate your changes.

If adding a new feature, 
    **you should open an issue with us** on the main pwa-install repo on Github (https://github.com/pwa-builder/pwa-install) before you start coding.

Once you have opened your PR, feel free to add a reviewer (Github should recommend people on the team). When the PR has been reviewed and is good to go, a team member will merge it.

## After my pull request gets merged, when does it become part of a pwa-install release?
 
We will usually add fixes in the next planned release, but sometimes it makes sense to add a contribution in a later update to ensure the quality and performance of the next release.

## Found bugs?
If you find a bug, you can help us by
[submitting an issue](https://github.com/pwa-builder/pwa-install/issues). Even better, you can
[submit a Pull Request](#pr) with a fix.

## Special thanks
This contributing doc was inspired by our friends' version at the [Windows Community Toolkit](https://github.com/windows-toolkit/WindowsCommunityToolkit/).
thank you!
