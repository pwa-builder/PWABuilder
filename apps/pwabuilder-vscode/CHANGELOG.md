# Change Log

All notable changes to the "pwa-studio" extension will be documented in this file.

## [v1.0.4]
- New snippets for screenshots and shortcuts + remove pwa prefix from snippets for better discoverability: https://github.com/pwa-builder/pwa-studio/pull/75
- Preview builds available on our Actions tab here on Github from the dev branch
- Guidance messages for Web Manifest generation: https://github.com/pwa-builder/pwa-studio/commit/6d7fcc6760e7f5e1176e65d68ea67bdbd7e92f7d

## [v1.0.3]

- New Web Manifest editing and auditing experience: https://github.com/pwa-builder/pwa-studio/pull/68
    - Fixes https://github.com/pwa-builder/PWABuilder/issues/2671
    - Fixes https://github.com/pwa-builder/PWABuilder/issues/2395
    - Fixes https://github.com/pwa-builder/PWABuilder/issues/2403
    - Fixes https://github.com/pwa-builder/PWABuilder/issues/2629
    - Fixes https://github.com/pwa-builder/PWABuilder/issues/2400
    - Fixes https://github.com/pwa-builder/PWABuilder/issues/2384
- Extension is now bundled to reduce startup time: https://github.com/pwa-builder/pwa-studio/pull/67
- New snippets: https://github.com/pwa-builder/pwa-studio/pull/70
- New usage analytics: https://github.com/pwa-builder/pwa-studio/pull/72


## [v0.3.1]

- Fixed: https://github.com/pwa-builder/PWABuilder/issues/2635 

## [v0.3.0]

- Fixed: https://github.com/pwa-builder/PWABuilder/issues/2626
- Fixed: https://github.com/pwa-builder/PWABuilder/issues/2424
- New Help Panel feature: https://github.com/pwa-builder/PWABuilder/issues/2514
- PWA Starter now uses [Vite](https://github.com/pwa-builder/pwa-starter/wiki): https://github.com/pwa-builder/PWABuilder/issues/2670

## [v0.2.6]

- Workaround for analytics issue: https://github.com/pwa-builder/pwa-studio/compare/help-panel?expand=1#diff-3e1333fb5dae3594a3e5ba561f7937487c8fe8d3a1bba91c706e213b5b69e5b1L41
- Manifest and Icon generation views will not generate until required fields are filled out, including icon file input: https://github.com/pwa-builder/PWABuilder/issues/2627

## [v0.2.5]

- Added better usage analytics. No personal information is handled, only command usage. This will allow
us to better scope our work in the future to what is being used the most in PWA Studio.

## [v0.2.4]

- More readme updates for the VSCode Marketplace

## [v0.2.3]

- Updated readme for VSCode Marketplace


## [v0.2.2]

- Updated the Windows packaging URL to our new Windows packaging server

## [v0.2.1]

- Fixed: https://github.com/pwa-builder/PWABuilder/issues/2579
- Fixed: https://github.com/pwa-builder/PWABuilder/issues/2557

- Setup tests: https://github.com/pwa-builder/PWABuilder/issues/2588
- Better Typescript usage: https://github.com/pwa-builder/PWABuilder/issues/2595

## [v0.2.0]

- Better error messages
- Webviews now use the VSCode UI toolkit
- Submit buttons in webviews now have "generating..." UI to let the user know something is going on in the background
- We now use the built in VSCode icons
- Our Icon now matches the VSCode extension design guidelines
- Bug fixes around manifest generation
- Actions in the bottom bar now live in the view panels

## [v0.1.2]

- Paths for save dialogs are now correct
- Icons generated for the default manifest are converted to files
- diagnostics are only ran on JSON files

## [v0.1.0]

- Icons are now generated as files, not base64 strings.

## [v0.0.9]

- New in-manifest error prompts for key manifest issues.

## [v0.0.8]

- Major fix around windows paths causing the manifest / service worker to not be found.
