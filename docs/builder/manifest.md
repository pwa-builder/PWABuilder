# Customizing Your Web App Manifest

Many capabilities of Progressive Web Apps are exposed through your app's manifest, and you can use the PWABuilder service to edit your manifest and enhance your app.


To edit your manifest via the PWABuilder site:

1. Get to your app's report card page. If you need guidance on this, vist the [Quick Start.](/builder/quick-start)

2. In the `Manifest` subsection, click `Edit Your Manifest`.

3. A modal with several tabs will open. Each tab will contain different settings for editing your manifest, along with brief tooltips on what each member means.

4. Once you've edited your manifest to your liking, you can either download your manifest with the `Download Manifest` button at the bottom of the modal, or copy-paste it from the `Code` tab on the far right.

If you want more in depth documentation on manifest members, full descriptions for each member follow below. They are separated into the sections they appear in on the PWABuilder website.

## Info

### name: `string`

`name` is a required member that specifies the display name for your application. Anywhere where a name for this application would be displayed, this value will be used. 

This name should usually align with the store listings associate with your applications.

The name of your application also must be at least two characters in length.

```json
"name": "WebBoard: A Drawing App"
```

### short_name: `string`

`short_name` functions similarly as the `name` member, except that it will only be used when there is not enough character space to display the applications regular name. 

It is recommended that `short_name` be 12 characters or less in length.

```json
"short_name": "WebBoard"
```

?> `short_name` isn't required by Web Standards, but is a required member for packaging with the PWABuilder service. `short_name` must be 3 or more characters to ensure you can package for all stores.

### description: `string`

`description` is an optional member that can be used to describe the functionality and purpose of your app.

Just like `short_name`, this data should usually align with any store listings.

```json
"description": "WebBoard is your go to application for quick doodles, notes, or sketches!"
```

### background_color: `string`

`background_color` is an optional member that represents the page color of the window that your application will be opened in. This is the color that your app will default to before any styles are loaded. Once styles are loaded, your application will use the background color defined in your CSS.

```json
"background_color": "green"
```

!> PWABuilder expects a HEX color value for this member. You can convert an RGB color value to HEX [here.](https://www.rgbtohex.net/)

### theme_color: `string`

`theme_color` is an optional member that changes the default color used by certain OS features. For example, this would change the color of your title bar when the application is installed on Windows.

```json
"theme_color": "purple"
```

!> PWABuilder expects a HEX color value for this member. You can convert an RGB color value to HEX [here.](https://www.rgbtohex.net/)

## Settings

### start_url: `string`

`start_url` is a required member that specifies that URL that will be launched when a user opens your application. This URL can either be an absolute or relative path.

```json
"start_url": "https://docs.pwabuilder.com"
```

### dir: `string`

`dir` is an optional member that specifies the text direction for your PWA. 

It has three values to choose from:

* `auto` - No set directionality for your app.
* `ltr` - Text will go from left to right.
* `rtl` - Text will go from right to left.

```json
"dir": "ltr"
```

### scope: `string`

`scope` is an optional member that defines which URL are within the navigation scope of your application. If the user navigates outside of your app's scope, the will be navigated to a normal browser window.

`scope` can often just be set to the base URL of your PWA.

```json
"scope": "https://docs.pwabuilder.com"
```

### lang: `string`
`lang` is an optional member that specifies the primary language of your app. The `Language` member expects a proper subtag for each language, and a list can be found [here.](https://www.iana.org/assignments/language-subtag-registry/language-subtag-registry)

```json
"lang": "en"
```

### orientation: `string`

`orientation` is an optional member that specifies the default display orientation for your application. It can be any of the following values:

* `any`
* `natural`
* `portrait`
* `landscape`
* `portrait-primary`
* `portrait-secondary`
* `landscape-primary`
* `landscape-secondary`

```json
"orientation": "portrait"
```


### display: `string`

`display` is an optional member that specifies the display mode that the website should default to.

`display` can take any of the following values:

* `browser`: The applications will open in a standard browser window.
* `minimal-ui`: The application will open in a minimal browser window that still includes certain UI features, such as navigation.
* `standalone`: The application will open in its own window with no browser UI elements.
* `fullscreen`: The application will make use of all available display space.

`display` will default to `browser` if not specified.

```json
"display": "standalone"
```

### display_override: `Array`

`display_override` is similar to the `display` member, but allows you to select a fallback order for different display modes.

In addition to the four display values above, `display_override` can also take the value `window-control-overlay`. `Window-control-overlay` is a desktop-only display mode and adds a native-style overlay to the top of your application.

```json
"display_override": [
  "window-control-overlay",
  "standalone",
  "browser"
]
```

## Platform

### iarc_rating_id: `string`

`iarc_rating_id` is an optional member that allows you to specify a suitable age range for their application. A rating ID is obtained by answering a questionnaire about an application, and then providing the associated ID for that application.


You can read more about IARC [here.](https://www.globalratings.com/how-iarc-works.aspx)

```json
"iarc_rating_id": "e58c174a-81d2-5c3c-32cc-34b8de4a52e9"
```

### related_applications: `Array`

`related_applications` is an optional member that specifies applications that have similar or adjacent functionality to your application. This member allows users and store listings to complement your application with related technology.

This member is an array of application objects, each of which contains a `platform` (the platform that the application is available on), `url` (the web URL where the app can be found), and `id` (the unique ID that specifies the application on the given platform) value. 

```json
"related_applications": [
  {
    "platform": "windows",
    "url": "https://www.example-app.com",
    "id": "example.ExampleApp"
  },
  {
    "platform": "play",
    "url": "https://www.example-app-2.com"
  }
]
```

### prefer_related_applications: `boolean`

`prefer_related_applications` is an optional member that specifies whether or not `related_applications` should be preferred to this one. This member defaults to `false`, but if set to true, the browser may recommend an alternate application to the user.

```json
"prefer_related_applications": true
```

### shortcuts: `Array`

`shortcuts` is an optional member that specifies a list of key tasks within your application. These shortcuts can be displayed by the operating system to allow a user to launch directly to a specific part of the application.

The `shortcuts` member is an array of `shortcut` objects, which can contain the following members:

*  `name`: The display name of the shortcut. ***Required member*** 
*  `url`: The url that the shortcut will open to. ***Required member***
* `short_name`: The shortened display name for when display space is limited.
* `description`: A string description of the shortcut.
* `icons`: A set of icons used to represent the shortcut. This array must include a 96x96 icon.

```json
"shortcuts": [
  {
    "name": "About",
    "url": "/about"
  },
  {
    "name": "Send Message",
    "url": "/new-message",
    "description": "Open a chat with another user and send a message to them."
  }
]
```

### protocol_handlers: `Array`

`protocol_handlers` is an optional member that specifies an array of protocols that the application can handle. A protocol handler will contain `protocol` and `url` members to specify how each valid protocol is handled.

```json
"protocol_handlers": [
  {
    "protocol": "web+music",
    "url": "/play?track=%s"
  }
]
```

?> The `%s` token will be replaced with the URL starting with that protocol handler.

### categories: `Array`

`categories` is an optional member that specifies an array of categories that the application belongs to. Though this array isn't limited to specific values, you can find a list of known categories [here.](https://github.com/w3c/manifest/wiki/Categories)

```json
"categories": ["games", "finance", "navigation"]
```

## Icons

### icons: `Array`
`icons` is a required member that specifies an array of icons to be used by your application for varying contexts and situations, such as in the action bar of your preferred operating system.
#### PWABuilder Icon Validations

The PWABuilder service enforces several validations to keep the icons for your app optimal:

* Your icons array must have at least one icon with purpose set to `any`.

* Your icons array must have at least one icon with a size of at least `512x512`.

* If your icons array includes a `maskable` icon, this must be included as a **separate** icon, and can't be added as a dual icon type (like `any maskable`, for example). This is because using `maskable` icons as `any` can result in icons not being displayed optimally.

These validations are implemented so that your progressive web app will always have an icon that looks appropriate, regardless of the operating system or context they are viewed in.

```json
"icons": [
  {
      "src": "https://www.pwabuilder.com/assets/icons/icon_192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
  },
  {
      "src": "https://www.pwabuilder.com/assets/icons/icon_512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
  }
]
```

If you only want to provide a single icon, your icons array could also look like this:

```json
"icons": [
  {
      "src": "https://www.pwabuilder.com/assets/icons/icon_512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
  }
]
```

?> You can use PWABuilder to help you generate icons.

## Screenshots

### screenshots: `Array`

`screenshots` is an optional member that specifies an array of screenshots that can showcase your application in app stores.

```json
"screenshots" : [
  {
    "src": "screenshot.jpg",
    "sizes": "1280x720",
    "type": "image/jpg",
    "platform": "wide",
  }
]
```

?> You can use PWABuilder to help you generate screenshots.
