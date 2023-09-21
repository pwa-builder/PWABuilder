# Dev Dashboard

The PWABuilder Studio Dev Dashboard gives you access to one-click actions related to building, developing, and publishing your progressive web app. 

The Dev Dashboard can be accessed by clicking the PWABuilder Studio icon in the far left vertical bar of Visual Studio (where you would normally find your file explorer or search functionality, for example.)

<div class="docs-image">
    <img src="/assets/studio/dev-dashboard/dev-dashboard.png" alt="A screenshot of the developer dashboard" width=600/>
</div>

The Dev Dashboard is broken up into sections based on related functionality:

* **Dev Actions:** common developer actions, such as starting builds or running tests

* **Add Native Features:** add native functionality to your app, such as shortcuts or file handlers

* **Assets:** generate assets for your app, such as screenshots or icons

* **Packaging:** help with packaging your progressive web app for stores

Read below for further instructions on using each section of the Dev Dashboard.


## Dev Actions

The Dev Actions section is powered by your [package.json](https://docs.npmjs.com/files/package.json) file. It parses your package.json file and looks for scripts that match the following names:

* `start` or `dev` for a development build

* `build`, `build:prod`, `build-prod` for production builds

* `test` for running tests

If it finds any of these scripts, it will display a button under "Dev Actions" in the dev dashboard. Clicking this button will then open a built-in terminal and run the script.

## Add Native Features

The "Add Native Features" section allows you to add [Native Capabilities](https://learn.microsoft.com/en-us/microsoft-edge/progressive-web-apps-chromium/#native-like-experiences) features to your PWA. For example, want your users to be able to use shortcuts (also known as Jumplists on Windows) to jump into specific pages of your app from the taskbar or homescreen? 

Clicking any of the buttons under this section will navigate you through prompts to add the integrations to your progressive web app.

If you want more info on adding native capabilities to your PWA, check out the documentation on [Adding Native Features.](/home/native-features)

## Assets
For adding icons and screenshots, you will find two buttons under "Assets". Clicking these buttons will run the respective PWABuilder Studio Commands:

* `PWABuilder Studio: Generate Icons`

* `PWABuilder Studio: Generate Screenshots`

For more info on generating icons and screenshots with PWABuilder Studio, read our docs <a href="/studio/assets" aria-label="Click here to read docs">here</a> 

## Packaging

The "Package" section allows you to package your PWA for the Microsoft Store, Apple App Store, Google Play Store and Meta Quest devices, using the same services as the [PWABuilder website.](https://pwabuilder.com) 

Click the "package" button for the platforms you want to package for, and you'll be guided through the process of packaging your PWA. For more info on packaging with PWABuilder Studio, read our docs <a href="/studio/package" aria-label="Click here to learn more">here</a> 