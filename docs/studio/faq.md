# Frequently Asked Questions

If you have a question that isn't addressed here or elsewhere in the documentation, feel free to open an [issue.](https://github.com/pwa-builder/PWABuilder/issues/new/choose)

#### I have a web manifest, but the extension says it can't be found?
The extension may not be able to find your manifest if it is not using the standard naming scheme for Web Manifest files (`web-manifest.json`, `manifest.json`). 

To fix this, tap the "I have a Web Manifest" button in the Web Manifest section to tell the extension where your Web Manifest is located, or rename your manifest to match naming conventions.

#### I have a service worker, but the extension says it can't be found?
As with the above issue, to fix this tap the "I have a Service Worker" button in the Service Worker section to tell the extension where your Service Worker is located.

#### I have generated my Web Manifest / Service Worker, but devtools says my PWA does not have this asset?
You most likely have not saved your `index.html` file. The extension will insert the needed html into your `index.html`, but you will need to hit save to save the changes.

#### I would like to try a pre-release version of PWA Studio

1. [Open our Github Actions](https://github.com/pwa-builder/pwa-studio/actions)
2. Choose your workflow run. Normally the first one is the latest one.
3. Click on the workflow run, scroll to the bottom, and download the vsix file in the `Artifacts` section.
4. Install [this extension](https://marketplace.visualstudio.com/items?itemName=fabiospampinato.vscode-install-vsix&msclkid=d9be3152b46711ecb569dbe40d0a72c0) to install that VSIX file we downloaded in step 3
