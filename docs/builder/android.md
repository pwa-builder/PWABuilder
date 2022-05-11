# Publishing to the Google Play Store with PWABuilder

PWABuilder’s Android platform utilizes the [Bubblewrap tool](https://github.com/GoogleChromeLabs/bubblewrap) to generate a [Trusted Web Activity (TWA)](https://developer.chrome.com/docs/android/trusted-web-activity/) that can be installed on the Google Play Store. This TWA behaves like any other Android application and is a great way to ship your PWA to the Google Play Store.

## Prerequisites

You will need: 
* A valid PWA with a web manifest, published to the web and secured through HTTPS
* A Google developer account ($25)
* An android device or Android emulator for testing

An Apple Developer account (which are available for a yearly subscription of $99)
## Packaging

The first step is to generate your Android package with PWABuilder.

1. Navigate to PWABuilder.com.
2. Enter the URL of your PWA on the homepage.

<div class="docs-image">
    <img src="../assets/builder/android/url.jpg" width=450>
</div>

3. Click `Next` to navigate to the package selection page.
4. Click on `Store Package` in the Android section.
   
<div class="docs-image">
    <img src="../assets/builder/android/store_package.jpg" width=550>
</div>

5. Next you will see a list of the different options for the Android platform that are covered in more detail below.
6. When you are ready, tap the Generate button to generate your Android app, and then the Download button when it pops up to download the generated App and associated files.

## Customize your Android package
* **Package ID**: The Android identifier unique to your app
* **App name**: The full name of your app. We prepopulate this with the app name from your PWA’s app manifest.
* **Launcher name**: The name of your app in the Android launcher. This is typically the same as app name, or a shortened version of it. We prepopulate this with short_name from your PWA’s app manifest.
* **App version**: This is the version string displayed to end users, e.g. “1.0.0.0”
* **App version code**: This is an integer used as a private, internal version of your app.
* **Host, Start URL, Manifest URL**: The URLs used to launch your PWA in the Android app. We prepopulate these for you from your app manifest.
* **Theme color**: The theme color used for the Android status bar in your app. Typically, this should be set to your manifest's theme_color.
* **Background color**: The background color to use for your app's splash screen. Typically this is set to your manifest's background_color.
* **Nav color**: The background color to use for your app's splash screen. Typically this is set to your manifest's background_color.
* **Nav dark color**: The color of the Android navigation bar in your app when the Android device is in dark mode.
* **Nav divider color**: The color of the Android navigation bar divider in your app.
* **Nav divider dark color**: The color of the Android navigation bar divider in your app when the Android device is in dark mode.
* **Icon URL**: The URL to a square PNG image to use for your app's icon. Can be absolute or relative to your manifest. Google recommends a 512x512 PNG without shadows.
* **Maskable icon URL**: Optional. The URL to a PNG image with a minimum safe zone of trimmable padding, enabling rounded icons on certain Android versions. Google recommends a 512x512 PNG without shadows.
* **Monochrome icon URL**: Optional. The URL to a PNG image containing only white and black colors, enabling Android to fill the icon with user-specified color or gradient depending on theme, color mode, or Android ontrast settings.
* **Manifest URL**: The absolute URL of your web manifest.
* **Splash fade out duration (ms)**: How long the splash screen fade out animation should last in milliseconds.
* **Fallback behavior**:  When the full TWA experience isn’t available, how should your app proceed, whether with a web view or [Chrome’s Custom Tabs](https://developer.chrome.com/docs/android/custom-tabs/) feature. We default to the latter.
* **Display mode**: 
  - Standalone means your PWA takes up all the area except Android status bar and Navigation bar.
  - Fullscreen hide both bars. This is intended for immersive experiences likes games and media playback.
* **Notifications**: If enabled, your PWA will use Android Notification Delegation for push notifications, meaning your installed PWA can send push notifications without browser permission prompts. You should enable this if your PWA sends push notifications.
* **Notification delegation**: If enabled, your PWA can send push notifications without browser permission prompts.
* **Location delegation**: If enabled, your PWA can access navigator.geolocation without browser permission prompts.
* **Google Play billing**: If enabled, your PWA can sell in-app purchases and subscriptions via the Digital Goods API.
* **Settings shortcut**: If enabled, users can long-press on your app tile and a Settings menu item will appear, letting users manage space for your app.
* **ChromeOS only**: If enabled, your Android package will only run on ChromeOS devices.
* **Include source code**: If enabled, your download will include the source code for your Android app.
* **Signing key**: How the APK app package will be digitally signed:
  - None: your app package won’t be signed. Unsigned packages will be signed by the Google Play Store. This is Google’s recommendation, and our default.
  - New: PWABuilder will create a new signing key for you. The signing key will be included in your zip download. Choosing this will let you fill in details like password, alias, and more.
  - Mine: Upload an existing .keystore file to use for signing the app package. This should be used if you are updating an existing app in the Store. You’ll be prompted to specify your existing key passwords and alias.

## Test and publish
* ### Deploy assetlinks.json
    - Your zip file contains assetlinks.json. This is a digital asset links file that proves ownership of your PWA. Upload this file to your server at https://example.com/.well-known/assetlinks.json. (Replace example.com with your PWA’s URL.) 
    - Digital asset links are required for your PWA on Android. If you’re seeing a browser address bar in your app on Android, or if your app is crashing on launch, it means your assetlinks.json file is missing, inaccessible, or incorrect. See our asset links helper to fix this.
* ### Test your app on an Android device or Android emulator
    - Your zip file contains an .apk (Android Package) file, which can be loaded on your personal Android device or Android emulator. To test your app, install the .apk file on your Android device or emulator. If you don’t have a physical Android device, you can use an Android emulator such as the [free Android Emulator](https://developer.android.com/studio/run/emulator) included in Android Studio. Run the emulator and open the .apk file to install your app. You can also drag and drop the .apk file onto the Android emulator to install it.
* ### Upload your app to the Google Play Store
    - Log into the [Google Play console](https://accounts.google.com/ServiceLogin?service=androiddeveloper&passive=true&continue=https%3A%2F%2Fplay.google.com%2Fconsole%2Fdeveloper%2F&_ga=2.66648750.1051416686.1651811327-1598367844.1601053784&_gac=1.56812888.1651811327.CjwKCAjw682TBhATEiwA9crl3yKK_grMWzVOA0JoU2P7-u8rnAIT0dEfclwuycEkxU5CK27UGzUZAhoC7McQAvD_BwE) with your developer account.
    - You can follow the guidelines on the Google play console to create your app. Don’t forget to choose the age range from 13+ or your app publishing request won’t be accepted.
    - Your zip file contains an .aab (Android App Bundle) file which can be submitted directly to the Play Store through the Google Play Console.
* ### Update your [ asset links file](https://blog.pwabuilder.com/Asset-links.md#validate-your-assetlinksjson-file) for production
    - This step is required for running the production version of your app. If you skip this step, your app will crash or a browser address bar will appear inside your app. 
    - Once you’ve uploaded your .aab file, Google Play re-signs your app. Because of this, you’ll need to update your asset links file.
    - Go to Google Play Console, select your app release then choose Setup -> App integrity, then copy your SHA-256 fingerprint.
    - Then, paste the fingerprint into your assetlinks.json file:
        <div class="docs-image">
            <img src="../assets/builder/android/assetlinks.jpg" width=550>
        </div>
    - Once your updated assetlinks.json file is deployed to your server, the address bar will disappear from your app.
    
## Save your signing key
Your zip file contains ```signing.keystore``` and ```signing-key-info.txt```. ```signing.keystore``` is the Android key store file containing the signing key.
```signing-key-info.txt``` is a text file containing your signing key information, such as the key password, store password, and key alias.
Keep both of these files in a safe place. You’ll need them to deploy future versions of your app. 

## Updating an existing app
1. If have an existing app in the Play Store and you want to publish a new version of it, follow these steps:
    - Generate a new package by following steps 1-5 in the packaging section
2. Specify your new App version and App version code:
3. Scroll down to Signing key and choose Use mine:
4. Choose your existing signing key file, and fill in your existing signing key information (key alias, key password, store password)
5. Build your package.
PWABuilder will build a package signed with your existing key. When you upload it to Google Play, it’ll automatically be recognized as a new version of your existing app.

## Quality control on Android
Refer to this [article](https://blog.chromium.org/2020/06/changes-to-quality-criteria-for-pwas.html) to look up quality control requirements for Chrome. 

### Note about Apps for Children
Be aware that PWAs on Android cannot currently target children as their audience.
Google Play’s Children And Families Policy blocks PWAs from targetting children because PWAs potentially have full access to the web.
If you’re building an education app, for example, you’ll need to specify ```Target Audience: Older Users``` when submitting your app to Google Play. Otherwise your app may not be approved, or may be removed from the Store.



