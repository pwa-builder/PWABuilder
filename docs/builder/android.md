# Publishing PWAs to the Google Play Store

PWABuilder’s Android platform utilizes the [Bubblewrap tool](https://github.com/GoogleChromeLabs/bubblewrap) to generate a [Trusted Web Activity (TWA)](https://developer.chrome.com/docs/android/trusted-web-activity/) that can be installed on the Google Play Store. This TWA behaves like any other Android application and is a great way to ship your PWA to the Google Play Store.

## Prerequisites

Before you can package for the Google Play Store, you will need:

* A valid PWA with a web manifest, published to the web and secured through HTTPS
* A Google developer account ($25)
* An android device or Android emulator for testing

Once you have checked all these boxes, you are ready for packaging!

## Packaging

The first step is to generate your Android package with PWABuilder:

1. Navigate to PWABuilder.com.
   
2. Enter the URL of your PWA on the homepage.

<div class="docs-image">
     <img src="/assets/builder/general/pwabuilder-enter-url.png" alt="URL submission area on PWABuilder homepage" width=500>
</div>

3. Click `Package for stores` to navigate to the package selection page.
   
4. Click on `Generate Package` in the Android section.

<div class="docs-image">
    <img src="/assets/builder/android/store_package.jpg" alt="PWABuilder store package selection page showing options to generate packages for both Windows and Android" width=550>
</div>

5. Make sure you are on the `Google Play` tab and fill out the required options for your package.
   
6. Click `Download Package`.

<div class="docs-image">
    <img src="/assets/builder/android/android-options.png" alt="Android packaging options page on PWABuilder.com" width=550>
</div>

## Configuration Options

There are a ton of options you can configure when packaging for Android. Here's a breakdown of what each property means:

| Property | Description |
| :---------------|---------------------------------------------------------------------------------------------------------------- |
| **Package ID** | The ID of your app on Google Play. Google recommends a reverse-domain style string: com.domainname.appname. Letters, numbers, periods, hyphens, and underscores are allowed. |
| **App name** | The full name of your app as displayed to end users. We pre-populate this with the app name from your PWA’s app manifest. |
| **Short name** | The shorter version of your app name displayed on the Android home screen. Google recommends no more than 12 characters. We pre-populate this with short_name from your PWA’s app manifest. |
| **Include source code** | If enabled, your download will include the source code for your Android app. Recommended to experienced Android developers if you want to upgrade or modify dependencies and behaviors. |
| **Host** | The URL used to launch your PWA in the Android app. We pre-populate these for you from your app manifest. |
| **Start URL** | The start path for your PWA. Must be relative to the Host URL. If Host URL contains your PWA, you can use '/' to specify a default. We pre-populate these for you from your app manifest. |
| **App version** | The version of your app displayed to users. This is a string, typically in the form of '1.0.0.0'. Maps to android:versionName. |
| **App version code** | A positive integer used as an internal version number. This is not shown to users. This number is used by Google Play to determine whether one version is more recent than another, with higher numbers indicating more recent versions. Maps to android:versionCode. |
| **Theme color** | The theme color used for the Android status bar in your app. Typically, this should be set to your manifest's theme_color. |
| **Theme dark color** | The theme color used for the Android status bar in your app when the Android device is in dark mode. Typically this is set to your manifest's theme_color. |
| **Background color** | The background color to use for your app's splash screen. Typically this is set to your manifest's background_color. |
| **Nav color** | The color of the Android navigation bar in your app. Typically this is set to your manifest's theme_color. |
| **Nav dark color** | The color of the Android navigation bar in your app when the Android device is in dark mode. Typically this is set to your manifest's theme_color. |
| **Nav divider color** | The color of the Android navigation bar divider in your app. Typically this is set to your manifest's theme_color. |
| **Nav divider dark color** | The color of the Android navigation bar divider in your app when the Android device is in dark mode. Typically this is set to your manifest's theme_color. |
| **Icon URL** | The URL to a square PNG image to use for your app's icon. Can be absolute or relative to your manifest. Google recommends a 512x512 PNG without shadows.  |
| **Maskable icon URL** | Optional. The URL to a PNG image with a minimum safe zone of trimmable padding, enabling rounded icons on certain Android versions. Google recommends a 512x512 PNG without shadows. |
| **Monochrome icon URL** | Optional. The URL to a PNG image used when displaying notifications, designers of monochrome icons could set all pixels to black and only use transparency to create a silhouette of their icon. *In the future it can work as Themed icon enabling Android to fill the icon with user-specified color or gradient depending on theme, color mode, or Android contrast settings. |
| **Manifest URL** | The absolute URL of your web manifest. |
| **Splash fade out duration (ms)** | How long the splash screen fade out animation should last in milliseconds. |
| **Settings shortcut** | If enabled, users can long-press on your app tile and a Settings menu item will appear, letting users manage space for your app. |
| **Display mode** | `Standalone` Recommended for most apps. The Android status bar and navigation bar will be shown while your app is running. <br><br> `Fullscreen` The Android status bar and navigation bar will be hidden while your app is running. Suitable for immersive experiences such as games or media apps. <br><br> `Fullscreen sticky` The Android status bar and navigation bar will be hidden while your app is running, and if the user swipes from the edge of the Android device, the system bars will be semi-transparent, and the touch gesture will be passed to your app. Recommended for drawing apps, and games that require lots of swiping. |
| **Notification delegation** | If enabled, your PWA can send push notifications without browser permission prompts. |
| **Location delegation** | If enabled, your PWA can access navigator.geolocation without browser permission prompts. |
| **Google Play billing** | If enabled, your PWA can sell in-app purchases and subscriptions via the Digital Goods API. |
| **Signing key** | How the APK app package will be digitally signed: <br><br> `New`: Recommended for new apps in Google Play. PWABuilder will generate a new signing key for you and sign your package with it. Your download will contain the new signing details. <br><br> `Mine`: Recommended for existing apps in Google Play. Use this option if you already have a signing key and you want to publish a new version of an existing app in Google Play. <br><br> `None`: PWABuilder will generate a raw, unsigned APK. Raw, unsigned APKs cannot be uploaded to the Google Play Store. |
| **ChromeOS only** | If enabled, your Android package will only run on ChromeOS devices. |
| **Meta Quest compatible** | If enabled, your Android package will be compatible with Meta Quest devices. |
| **Fallback behavior** | `Custom Tabs` When Trusted Web Activity (TWA) is unavailable, use Chrome Custom Tabs as a fallback to run your app. [Reference](https://developer.chrome.com/docs/android/custom-tabs/) <br><br> `Web View` When Trusted Web Activity (TWA) is unavailable, use a web view as a fallback to run your app. |
  
## Publish

There are a few steps to take before your PWA is ready to be published. All the files you need to complete these steps are contained in the `.zip` file you downloaded from PWABuilder.

#### 1. Deploy the assetlinks.json file
Your zip file contains assetlinks.json. This is a digital asset links file that proves ownership of your PWA. 

To properly deploy this file, upload it to your server at `<Host URL of your PWA>/.well-known/assetlinks.json`.

?> **Note** To find out the Host URL of your PWA, please refer to the values you provided at the [Configuration options](/builder/android?id=configuration-options) step. Example: if the URL of your PWA is `https://foo.example.com/my/app`, upload the file at `https://foo.example.com/.well-known/assetlinks.json`.

!> Digital asset links are required for your PWA on Android. If you’re seeing a browser address bar in your app on Android, or if your app is crashing on launch, it means your assetlinks.json file is missing, inaccessible, or incorrect. See our [asset links helper](/builder/asset-links-faq) to fix this.
#### 2. Upload your app to the Google Play Store

Next, you'll upload your app package to the Google Play Console:

1. Log into the [Google Play console](https://accounts.google.com/ServiceLogin?service=androiddeveloper&passive=true&continue=https%3A%2F%2Fplay.google.com%2Fconsole%2Fdeveloper%2F&_ga=2.66648750.1051416686.1651811327-1598367844.1601053784&_gac=1.56812888.1651811327.CjwKCAjw682TBhATEiwA9crl3yKK_grMWzVOA0JoU2P7-u8rnAIT0dEfclwuycEkxU5CK27UGzUZAhoC7McQAvD_BwE) with your developer account.
   
2. You can follow the guidelines on the Google play console to create your app. 
   
!> Be aware that PWAs on Android cannot currently target children as their audience. To avoid issues with your store listing, set the age rating to `13+` and specify `Target Audience: Older Users`.
   
3. Your zip file contains an .aab (Android App Bundle) file which can be submitted directly to the Play Store through the Google Play Console.
   

#### 3. Update your asset links file for production

This step is required for running the production version of your app. If you skip this step, your app will crash or a browser address bar will appear inside your app. 

1. Once you’ve uploaded your .aab file, Google Play re-signs your app. Because of this, you’ll need to update your asset links file.
   
2. Go to the Google Play Console and select your app release:

<div class="docs-image">
    <img src="/assets/builder/android/google-play-app-release.png" alt="Image of where to find your app release in the Google Play Console" width=700>
</div>

3. Click `Setup` and then `App integrity` in the sidebar. Navigate to the `App signing` tab and copy your SHA-256 fingerprint:

<div class="docs-image">
    <img src="/assets/builder/android/google-play-sha256.png" alt="Image of where to find your SHA-256 fingerprint in the Google Play Console" width=700>
</div>


4. Then, paste the fingerprint into your assetlinks.json file:

```json
[
    {
        "relation": ...,
        "target": {
            "namespace": ...,
            "package_name": ...,
            "sha256_cert_fingerprints": [
                "...",
                "PASTE YOUR NEW SHA-256 FINGERPRINT HERE"
            ]
        }
    }
]
```
    
5. Once your updated assetlinks.json file is deployed to your server, the address bar will disappear from your app.


#### 4. Save your signing key

Your zip file contains ```signing.keystore``` and ```signing-key-info.txt```. ```signing.keystore``` is the Android key store file containing the signing key.
```signing-key-info.txt``` is a text file containing your signing key information, such as the key password, store password, and key alias.
Keep both of these files in a safe place. You’ll need them to deploy future versions of your app. 

## Update Existing PWA

If have an existing app in the Play Store and you want to publish a new version of it:

1. Generate a new package using the steps above.
   
2. Specify your new App version and App version code.
   
3. Scroll down to Signing key and choose `Use mine`
   
4. Choose your existing signing key file, and fill in your existing signing key information (key alias, key password, store password)
   
5. Build your package.
   
PWABuilder will build a package signed with your existing key. When you upload it to Google Play, it’ll automatically be recognized as a new version of your existing app.

?> **Note** If you want more info about quality control on Android, refer to this [article](https://blog.chromium.org/2020/06/changes-to-quality-criteria-for-pwas.html).


## Next Steps

Progressive web apps are cross-platform and can be used anywhere! 

After you've successfully published your app to the Google Play Store, you can package and publish for other platforms:

- [How to Package for Microsoft Store](/builder/windows)

- [How to Package for Meta Quest](/builder/meta)

- [How to Package for the App Store](/builder/app-store)
