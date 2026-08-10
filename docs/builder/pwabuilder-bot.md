# PWABuilder bot

PWABuilder is a developer tool that fetches a web app at the URL supplied by a user. It analyzes the app against progressive web app criteria and can package the app for submission to app stores.

## How the bot works

The PWABuilder bot:

* visits a web app only when a user explicitly directs PWABuilder to analyze that URL
* fetches the web app and the resources needed to evaluate its progressive web app capabilities
* analyzes the app for progressive web app criteria, including its web app manifest and service worker
* uses the analysis to help the user prepare and package the app for app stores

## What the bot does not do

The PWABuilder bot:

* does not crawl a web app without a user's express directive
* does not crawl a web app on an ongoing or scheduled basis
* does not revisit a web app unless a user explicitly directs PWABuilder to analyze it again
* does not use data from a web app to train AI models

PWABuilder's access is user-initiated and limited to the analysis or packaging task requested by that user.

## Questions

For questions about the PWABuilder bot, [open an issue in the PWABuilder GitHub repository](https://github.com/pwa-builder/pwabuilder/issues).
