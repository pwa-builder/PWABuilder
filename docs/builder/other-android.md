# Creating Android Packages

PWABuilder’s Android platform utilizes the [Bubblewrap tool](https://github.com/GoogleChromeLabs/bubblewrap) to generate a [Trusted Web Activity (TWA)](https://developer.chrome.com/docs/android/trusted-web-activity/) that will run on Android devices.

## Prerequisites

Before you can generate an Android package, you will need:

* A valid PWA with a web manifest, published to the web and secured through HTTPS
* An android device or Android emulator for testing

Once you have checked all these boxes, you are ready for packaging!

## Packaging

The first step is to generate your Android package with PWABuilder:

1. Navigate to PWABuilder.com.
   
2. Enter the URL of your PWA on the homepage.

<div class="docs-image">
     <img src="/assets/builder/general/pwabuilder-enter-url.png" alt="URL submission area on PWABuilder homepage" width=500>
</div>

3. Click the `Package for stores` button in the upper right to navigate to the package selection page.
   
4. Click on `Generate Package` in the Android section.

<div class="docs-image">
    <img src="/assets/builder/android/store_package.jpg" width=550 alt="Image of the Android store package option on pwabuilder.com">
</div>

5. Select the `Other Android` tab  in the dialog that pops up.

<div class="docs-image">
    <img src="/assets/builder/other-android/other-android.png" width=550 alt="Image of Other Android tab open on PWABuilder.com">
</div>

6. Customize any options as you see fit. The *Configuration Options* section below covers each setting in detail.
   
7. Click `Download Package` to download your files.

## Configuration Options

There are a ton of options you can configure when packaging for Android. Here's a breakdown of what each property means:

| Property | Description |
| :---------------|---------------------------------------------------------------------------------------------------------------- |
| **Package ID** | The Android identifier unique to your app                                                                                                                                                                                                        |
| **App name** | The full name of your app. We prepopulate this with the app name from your PWA’s app manifest.                                                                                                                                                     |
| **Launcher name** | The name of your app in the Android launcher. This is typically the same as app name, or a shortened version of it. We prepopulate this with short_name from your PWA’s app manifest.                                                         |
| **Version** | This is the version string displayed to end users, e.g. “1.0.0.0”                                                                                                                                                                               |
| **Version code** | This is an integer used as a private, internal version of your app.                                                                                                                                                                        |
| **Host, Start URL, Manifest URL** | The URLs used to launch your PWA in the Android app. We prepopulate these for you from your app manifest.                                                                                                                     |
| **Theme color** | The theme color used for the Android status bar in your app. Typically, this should be set to your manifest's theme_color.                                                                                                                      |
| **Background color** | The background color to use for your app's splash screen. Typically this is set to your manifest's background_color.                                                                                                                       |
| **Nav color** | The background color to use for your app's splash screen. Typically this is set to your manifest's background_color.                                                                                                                              |
| **Nav dark color** | The color of the Android navigation bar in your app when the Android device is in dark mode.                                                                                                                                                 |
| **Nav divider color** | The color of the Android navigation bar divider in your app.                                                                                                                                                                              |
| **Nav divider dark color** | The color of the Android navigation bar divider in your app when the Android device is in dark mode.                                                                                                                                 |
| **Icon URL** | The URL to a square PNG image to use for your app's icon. Can be absolute or relative to your manifest. Google recommends a 512x512 PNG without shadows.                                                                                           |
| **Maskable icon URL** | Optional. The URL to a PNG image with a minimum safe zone of trimmable padding, enabling rounded icons on certain Android versions. Google recommends a 512x512 PNG without shadows.                                                      |
| **Monochrome icon URL** | Optional. The URL to a PNG image containing only white and black colors, enabling Android to fill the icon with user-specified color or gradient depending on theme, color mode, or Android ontrast settings.                           |
| **Manifest URL** | The absolute URL of your web manifest.                                                                                                                                                                                                         |
| **Splash fade out duration (ms)** | How long the splash screen fade out animation should last in milliseconds.                                                                                                                                                    |
| **Fallback behavior** |  When the full TWA experience isn’t available, how should your app proceed, whether with a web view or [Chrome’s Custom Tabs](https://developer.chrome.com/docs/android/custom-tabs/) feature. We default to the latter.                  |
| **Display mode** | `Standalone` means your PWA takes up all the area except Android status bar and Navigation bar and `Fullscreen` hides both bars, which is intended for immersive experiences likes games and media playback.                                                                                                                                                                                                                                      |
| **Notifications** | If enabled, your PWA will use Android Notification Delegation for push notifications, meaning your installed PWA can send push notifications without browser permission prompts. You should enable this if your PWA sends push notifications. |
| **Notification delegation** | If enabled, your PWA can send push notifications without browser permission prompts.                                                                                                                                                |
| **Location delegation** | If enabled, your PWA can access navigator.geolocation without browser permission prompts.                                                                                                                                               |                                                                                                              |
| **Settings shortcut** | If enabled, users can long-press on your app tile and a Settings menu item will appear, letting users manage space for your app.                                                                                                          |
| **Include source code** | If enabled, your download will include the source code for your Android app.                                                                                                                                                            |