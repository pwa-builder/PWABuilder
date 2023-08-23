# PWABuilder - Manifest previewer
A [web component](https://developer.mozilla.org/en-US/docs/Web/Web_Components) that allows you to preview your PWA on Windows, Android and iOS, based on your app's `manifest.json` file!

The table below shows the manifest attributes that this component covers.

Attribute | Description | Screen
----------| ----------- |------- 
`display` | Determines the developers' preferred display mode for the website. The display mode changes how much of browser UI is shown to the user and can range from fullscreen to browser (the default mode). | ![Display](https://github.com/MariaSolOsso/PWABuilder-previewer/blob/main/assets/readme-images/display.png)
`screenshots` | Defines an array of screenshots that showcases the application, used by progressive web app stores. | ![Screenshots](https://github.com/MariaSolOsso/PWABuilder-previewer/blob/main/assets/readme-images/screenshots.png)
`background_color` | Placeholder background color for the application page to display before its stylesheet is loaded. Several platforms use this value to style the splash screen. | ![Background color](https://github.com/MariaSolOsso/PWABuilder-previewer/blob/main/assets/readme-images/backgroundcolor.jpeg)
`name` | String that represents the name of the PWA as it is usually displayed to the user (e.g., amongst a list of other applications in settings, or in menus). | ![Name](https://github.com/MariaSolOsso/PWABuilder-previewer/blob/main/assets/readme-images/name.png)
`short_name` | String that represents the name of the PWA displayed to the user if there is not enough space to display the `name` (e.g., as a label for the app's icon on the phone home screen).| ![Short name](https://github.com/MariaSolOsso/PWABuilder-previewer/blob/main/assets/readme-images/shortname.png)
`theme_color` | Defines the default color theme for the application, and affects how the platform displays the site. | ![Theme color](https://github.com/MariaSolOsso/PWABuilder-previewer/blob/main/assets/readme-images/themecolor.png)
`shortcuts` | Array of shortcuts or links to key tasks or pages within a web app, assembling a context menu to be displayed by the OS when a user engages with the app's icon. | ![Shortcuts](https://github.com/MariaSolOsso/PWABuilder-previewer/blob/main/assets/readme-images/shortcuts.png)
`categories` | Defines the names of categories that describe your application. Used by stores for listing web applications. | ![Categories](https://github.com/MariaSolOsso/PWABuilder-previewer/blob/main/assets/readme-images/categories.png)
`share_target` | Allows the PWA to receive media content from other apps. | ![Share target](https://github.com/MariaSolOsso/PWABuilder-previewer/blob/main/assets/readme-images/sharetarget.png)
`description` | Description of your app. Used by stores in app listings. | ![Description](https://github.com/MariaSolOsso/PWABuilder-previewer/blob/main/assets/readme-images/categories.png)

## Built with
- [Lit](https://lit.dev/)
- [Typescript](https://www.typescriptlang.org/)
- The project generator from [Open Web Components](https://open-wc.org/docs/development/generator/)

## Prerequisites
To run this project, you will need to have [`node.JS`](https://nodejs.org/en/) and [`npm`](https://docs.npmjs.com/getting-started) installed on your computer. Knowledge of Typescript, web components and CSS is also encouraged. 

## Using this component
The `manifest-previewer` web component needs the following attributes to be defined:
- `manifestUrl`: The URL of the `manifest.json` file. This is necessary for generating the `src` URLs of image previews.
- `manifest`: A valid `manifest.json` file. For the best experience with this tool, this file should at least contain the entries especified above.
  - Default:
  ```
  {
    "name": "PWA App",
    "background_color": "#FFF",
    "theme_color": "#EBD0FE",
    "description": "A description of your app.",
    "display": "standalone"
  }
  ```

In addition, the properties below can be added for further programmatic control:
- `siteUrl`: The PWA's URL.
  - Default: The result of `this.manifestUrl.substring(0, this.manifestUrl.lastIndexOf('manifest.json'))`
- `enlargeText`: Text of the button that triggers the enlarge-preview mode. An empty string will hide the text, and hence disable the enlarge feature.
  - Default: "Click to enlarge Preview"
- `onEnlarge`: Callback function fired when requesting to enlarge the preview.
  - Default: Fullscreen request (refer to [https://developer.mozilla.org/en-US/docs/Web/API/Fullscreen_API](https://developer.mozilla.org/en-US/docs/Web/API/Fullscreen_API)) from the main preview content.
- `cardTitle`: The main title of the component.
  - Default: "Preview"
- `platform`: The platform to preview (this component currently supports `'windows'`, `'android'` and `'iOS'`). Note that clicking the platform buttons also changes the value of this property.
  - Default: `windows`
- `stage`: The preview screen. It must be one of `'install'`, `'splashScreen'`, `'name'`, `'shortName'`
`'themeColor'`, `'shortcuts'`, `'display'`, `'categories'`, `'shareTarget'`, or `'description'`.
The navigation arrows change this value as well. 
  - Default: `name`
- `titles`: Object with key-value pairs of stage names and custom screen titles. For example, if a custom description for the `name` screen is desired, then `titles` should be:
```
{
  name: 'My custom title!'
}
```
 - Default:
 ```
{
  install: 'Installation dialog',
  splashScreen: 'Splash screen',
  name: 'The name attribute',
  shortName: 'The short name attribute',
  themeColor: 'The theme color attribute',
  shortcuts: 'The shortcuts attribute',
  display: 'The display attribute',
  categories: 'The categories attribute',
  shareTarget: 'The share target attribute',
  description: 'The description attribute'
}
 ```
- `descriptions`: Object where the keys are stage names and the values are objects with key-value pairs of platform and a string to be displayed on the respective screen. For example, if a custom description for the `name` screen when `windows` is the selected platform is desired, then `descriptions` should be:
```
{
  name: {
    windows: 'My custom description.'
  }
}
```
If a certain description is not specified, the default one is used.
  - Defaults:
  ```
  {
    install: {
      windows: "Windows includes the application's icon, name, and website URL in its installation dialog.",
      android: 'When installing a PWA on Android, the description, name, icon and screenshots are used for giving a preview of the application.',
      iOS: "iOS uses the application's icon, name, and website URL in its installation screen."
    },
    splashScreen: {
      windows: 'Splash screens are used to provide a smooth transition between the loading state and the initial launch of the application.',
      android: 'When launching the PWA, Android uses the background color, theme color, name and icon for displaying the splash screen.',
      iOS: 'When launching the PWA, iOS uses the background color, name and icon for displaying the splash screen while the content loads.'
    },
    name: {
      windows: "The name of the web application is displayed on Window's start menu, application preferences, title bar, etc.",
      android: 'The name of the web application will be included in the app info screen on Android.',
      iOS: 'On iOS, the name of the web application will be used on settings.'
    },
    shortName: {
      windows: 'Windows uses the short name as a fallback when the manifest does not specify a value for the name attribute.',
      android: "On Android, the application's short name is used in the home screen as a label for the icon.",
      iOS: "On iOS, the application's short name is used in the home screen as a label for the icon."
    },
    themeColor: {
      windows: "The theme color defines the default color theme for the application, and is used for the PWA's title bar.",
      android: 'The theme color defines the default color theme for the application, and affects how the site is displayed.',
      iOS: 'The theme color defines the default color theme for the PWA, and defines the background color of the status bar when using the application.'
    },
    shortcuts: {
      windows: "This attribute (A.K.A. jump list) assembles a context menu that is shows when a user right-clicks on the app's icon on the taskbar.",
      android: "This attribute (A.K.A. jump list) assembles a context menu that is shows when a user long-presses the app's icon on the home screen.",
      iOS: "This attribute (A.K.A. jump list) defines a list of shortcuts/links to key tasks or pages within a web app, assembling a context menu when a user interacts with the app's icon."
    },
    display: {
      windows: "The display mode changes how much of the browser's UI is shown to the user. It can range from browser (the full browser window is shown) to fullscreen (the app is full-screened).",
      android: "The display mode changes how much of the browser's UI (like the status bar and navigation buttons) is shown to the user.",
      iOS: "The display mode changes how much of the browser's UI is shown to the user. It can range from browser (the full browser window is shown) to fullscreen (the app is full-screened)."
    },
    categories: {
      windows: "The Microsoft Store uses the indicated categories as tags in the app's listing.",
      android: "Google Play includes the categories specified in the manifest in the application's listing page.",
      iOS: "On iOS, your application's categories are set from a predetermined set of options and enhance the discoverability of your app."
    },
    shareTarget: {
      windows: 'As a share target, your app can receive text, links, and files from other Windows apps.',
      android: 'As share target, your app can receive text, links, and files from other Android apps.',
      iOS: 'As a share target, your app can receive text, links, and files shared from other iOS apps.'
    },
    description: {
      windows: "The Microsoft Store shows the app's description in the app's product description page.",
      android: "Google Play shows the app's description in the app's product description page.",
      iOS: "The iOS App Store shows your app's description in the app's product description page."
    }
  }
  ```
- `disabledPlatforms`: String indicating the platforms that shouldn't be previewed. The name of the platforms should be separated by white space (eg: `'iOS android'`)
  - Default: `''`

## Development
For contributing to this project, download the source code from [the repository](https://github.com/MariaSolOsso/PWABuilder-previewer), run `npm install` and then `npm start:build`. This will start the web dev server in your default browser. Your changes will be automatically reflected on the running application.

## Custom styles
This application exposes the platform buttons, title, and navigation arrows for CSS customization (via the [`::part()`](https://developer.mozilla.org/en-US/docs/Web/CSS/::part) pseudo-element). 

The following are the parts available for styling:
Part name | Description
----------|------------
`card` | The container card object.
`card-title` | The component's main title.
`platform-buttons` | The `div` that contains the platform buttons.
`platform-button` | Platform button.
`app-name` | The PWA's name title.
`screen-title` | The title of the current preview stage.
`screen-description` | The description of the current preview stage.
`nav-arrow-right` | The right navigation arrow.
`nav-arrow-left` | The left navigation arrow.
`enlarge-toggle` | The text that when clicked requests to enlarge the preview.

In addition, the following [CSS variables](https://developer.mozilla.org/en-US/docs/Web/CSS/--*) can be provided:
Variable name | Description | Default
--------------|-------------|--------
`--font-family` | The global font family. | Arial
`--windows-font-family` | Font family to use in the Windows previews. | Arial
`--android-font-family` | Font family to use in the Android previews. | Arial
`--ios-font-family` | Font family to use in the iOS previews. | Arial
`--font-color` | The global font color. | `#292C3A`
`--secondary-font-color` | Color used for the screen descriptions, the "enlarge content" text and disclaimer messages. | `#808080`
`--pwa-background-color` | Fallback background color to use in case it is not defined in the manifest. | `#FFF`
`--pwa-theme-color` | Fallback theme color to use in case it is not defined in the manifest. | `#EBD0FE`

