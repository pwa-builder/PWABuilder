# Dev Dashboard

The PWABuilder Studio Dev Dashboard gives you easy access to the key actions you need while building your PWA:

- Buttons for common developer actions, such as starting your developer build, production build and running tests
- Buttons to generate icons or screenshots for your PWA
- Buttons to add key native capabilities to your PWA, such as shortcuts and and file handlers
- And finally, quick access to packaging your PWA for the Microsoft Store, Apple App Store, and Google Play Store.

## Using The Interface

To get started, click either the "PWABuilder Studio" icon in the Activity Bar, or the "PWABuilder Studio" panel in the Explorer View. You will then see the "Dev Dashboard" view. This view has four sections:

- Dev Actions
- Add Native Features
- Assets
- Package

<div class="docs-image">
    <img src="/assets/studio/dev-dashboard/dev-dashboard.png" alt="A screenshot of the developer dashboard" width=800/>
</div>

### Dev Actions
The Dev Actions section is powered by your [package.json](https://docs.npmjs.com/files/package.json) file. It parses your package.json file and looks for scripts that match the following names:

- `start`, or `dev` for a development build
- `build`, `build:prod`, `build-prod` for production builds
- `test` for running tests

If it finds any of these scripts, it will display a button under "Dev Actions" in the dev dashboard. Clicking this button will then open a built-in terminal and run the script.

### Add Native Features
The "Add Native Features" section allows you to add [Native Capabilities](https://learn.microsoft.com/en-us/microsoft-edge/progressive-web-apps-chromium/#native-like-experiences) features to your PWA. For example, want your users to be able to use shortcuts (also known as Jumplists on Windows) to jump into specific pages of your app from the tasbkar or homescreen? 

1. Click the "Add Shortcuts" button and you'll be guided through the process of adding shortcuts to your PWA.

### Assets
For adding icons and screenshots, you will find two buttons under "Assets". Clicking these buttons will run the respective PWABuilder Studio Commands:

- `PWABuilder Studio: Generate Icons`
- `PWABuilder Studio: Generate Screenshots`

For more info on generating icons and screenshots with PWABuilder Studio, [read our docs here.](/studio/assets)

### Package
The "Package" section allows you to package your PWA for the Microsoft Store, Apple App Store, Google Play Store and Meta Quest devices, using the same services as https://pwabuilder.com. Click the "package" button for the platforms you want to package for, and you'll be guided through the process of packaging your PWA. For more info on packaging with PWABuilder Studio, [read our docs here.](/studio/package)



