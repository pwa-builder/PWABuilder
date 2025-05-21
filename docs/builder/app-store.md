!> Packaging PWAs for iOS is **Experimental**. Despite the numerous positive experiences of the community, the acceptance into Apple's App Store depends only on **UI/UX of your PWA** and usage of **native capabilities** such as Push Notification, In-app purchase, etc.

# Publishing PWAs to the App Store

PWABuilder now has support for creating iOS application packages that can be posted to the Apple App Store. However, there are a few extra steps to get your PWA ready for the App Store.

#### How does it work?
PWABuilder creates a native Swift app with a WebView that allows you to load your PWA within a native iOS application.

## Prerequisites
There are some boxes you'll need to check before your PWA is ready to be published to the App Store.

- A valid PWA with a web manifest, published to the web and secured through HTTPS
  
- A macOS device with Xcode installed

- Xcode should support iOS 17 or later
  
- An Apple Developer account (which are available for a yearly subscription of $99)

## Packaging

The first step for getting your PWA in the App Store is packaging the app with PWABuilder.

The whole process can be done in just a few steps:


1. Navigate to [PWABuilder.com](https://www.pwabuilder.com/).
   
2. Enter the URL of your PWA on the homepage.
   
<div class="docs-image">
     <img src="/assets/builder/general/pwabuilder-enter-url.png" alt="URL submission area on PWABuilder homepage" width=500>
</div>

3. Click `Package for stores` to navigate to the package selection page.
   
4. Select `Generate Package` in the iOS section.
   
<div class="docs-image">
    <img src="/assets/builder/ios/ios-publish-section.png" width=550>
</div>

5. You will prompted with editable metadata about your app. PWABuilder automatically populates these fields from your manifest.
   
6. Take note of your `Bundle ID`, you will need this info to publish to the App Store.
   
7. Click `Download Package`.

## Building Your App

Before you can start the submission process, you'll need to build the Swift project that will load your PWA:

1. Unzip the folder you downloaded from PWABuilder.
   
2. Open a terminal in the `src` directory.
   
3. Run this command: `pod install`

?> **Note** If you get an error running `pod install`, try running `brew install cocoapods` first. (If you need to install Homebrew, [click here](https://docs.brew.sh/Installation))

?> **Note** In case you already **have cocoapods installed**, check that the specs are up to date, otherwise you may receive a [missing privacy manifest error](https://github.com/pwa-builder/PWABuilder/issues/4877).
To solve this you can run `pod repo update`, and then `pod update` if you already run `pod install`.

4. Open the `.xcworkspace` file in your src directory. 

!> If you open and attempt to build the `.xcodeproj` file, your build will fail. The `.xcworkspace` file is the correct file you need to build.
   
5. Click `Product` > `Build` in Xcode to build your project.

6. With the project opened in Xcode, click ▶️ to test your PWA in an iPhone simulator. You may also choose other iOS simulators to try our your app on those devices.

## Adjusting Capabilities

Under xcode `Signing & Capabilities` tab, check and disable all capabilites your app don't needed.
Use only those that are actually involved in your application. This is important for passing publishing verification.  

<div class="docs-image">
     <img src="/assets/builder/ios/signing-and-capabilities.jpg" alt="XCode Signing and Capabilities tab" width=500>
</div>

## Publishing

The next portion of getting your PWA in the App Store is the most complicated, and may take some time to work through.

We'll go through each step in more detail, but the overall process is as follows:

1. Sign into your Apple Developer account
   
2. Create a Bundle ID
   
4. Create a certificate signing request (CSR)
   
5. Create a new certificate
   
6. Create a provisioning profile
   
7. Create an app reservation
   
8. Upload your app package
   
9. Submit your app for review

#### 1. Sign In To Your Apple Developer Account
To submit your app the iOS App Store, sign-in to your Apple Developer Account.

If you don’t have an Apple Developer account, enroll <a href="https://developer.apple.com/programs/enroll" aria-label="Click here to enroll">here</a> Enrollment costs $99 USD/year, though non-profits can have this fee waived.

#### 2. Create a Bundle ID

Next, you will need to create a Bundle ID on your Apple Developer Account that matches the Bundle ID associated with your package from PWABuilder.

1. Navigate to your [Apple Developer account page](https://developer.apple.com/account/) and select `Certificates, Identifiers & Profiles`
   
2. Select `Identifiers` and click the `+` symbol to add a new identifier.

<div class="docs-image">
     <img src="/assets/builder/ios/add-new-identifier.png" width=600 alt="">
</div>

3. Select `App IDs` and then choose `App` as the type.
   
4. Add any `Description` that you see fit.
   
5. Add your Bundle ID. **Important:** This must match the bundle ID you created with PWABuilder.

6. In the capabilites section, enable `Associated Domains` and `Push Notifications`.

7. Click `Continue` and then `Register` to finish adding the identifier.

?> **Note** If you didn't take note of your Bundle ID on PWABuilder, you can find it the `project.pbxproj` file.


#### 3. Create a Certificate Signing Request (CSR)

Next, you will need to use the Keychain Acess application to create a Certificate Signing Request:

1. Launch the `Keychain Access` app.
   
2. From the top menu bar, choose: `Keychain Access > Certificate Assistant > Request a Certificate from a Certificate Authority`

3. Enter your email address and your name. You may leave `CA Email Address` empty.

5. Choose the `Saved to disk` option and select `Continue`.

6. You'll be prompted to save a `.certSigningRequest` file to disk.

#### 4. Create a Certificate

Now, you will use the CSR we created in the last step to create a certificate:

1. Navigate back to the `Certificates, Identifiers, & Profiles` section on your [Apple Developer account page](https://developer.apple.com/account/) from Step 2.

2. Select `Certificates` and select the `+` symbol to add a new certificate.

3. Select `Apple Distribution` and click `Continue`.

4. You will be prompted to upload a Certificate Signing Request. Choose the file you created in the previous step, and click `Continue`.

5. On the final screen, Choose `Download` to save your `.cer` file to your disk.

#### 5. Install the Certificate

Now you just need to install the certificate you downloaded:

1. Open the `Keychain Access` app. 

2. Make sure you are in the `login` section on the left navigation bar.

3. Drag your downloaded `.cer` file onto the list of certificates.

<div class="docs-image">
     <img src="/assets/builder/ios/drag-cert.png" alt="">
</div>

#### 6. Create a Provisioning Profile

Next, you can use the certificate you created to create a Provisioning Profile:

1. Navigate back to the `Certificates, Identifiers, & Profiles` section on your [Apple Developer account page](https://developer.apple.com/account/) from Step 2 and 4.

2. Select `Profiles` and select the `+` symbol to add a new profile.

3. On the next page, select `App Store` under `Distribution` and click `Continue`.

4. You will be prompted to select an app ID, choose the Bundle ID you created in Step 2 and click `Continue`.

5. Next, you will be prompted to choose a certificate. Select the certificate you created in the last step and click `Continue`.

6. You'll asked for a Provisioning Profile Name. Use your Bundle ID and then click `Generate`.

7. Finally, select `Download` to download your `.mobileprovision` file.

#### 7. Create Your App Reservation

Once you have a provisioning profile, you can create an app reservation on your developer account.

1. Go back to your [Apple Developer account page](https://developer.apple.com/account/) and choose `App Store Connect`.

2. Select `My Apps`.

3. Select the `+` symbol and then click `New App`:

4. You will be prompted for details about your app:
   1. Choose `iOS` for the platform
   
   2. Use any name you would like.
   
   3. Select a language.

   4. Select the Bundle ID we created in the previous step.
   
   5. SKU can be any string you would like.
   
   6. Select `Full Access` under User Access.

5. Finally, click `Create` to complete your app reservation.

#### 8. Upload Your App Package

After you create your app reservation, you'll be redirected to the app details page. There, you can add metadata about your app,
including screenshots, description, and more.

After you've filled out any data you want to include with your app, it's time to upload your PWA app package. 

First, you'll need to **sign in to Xcode**:

1. Click `Xcode` in the top menu bar.

2. Click `Preferences`.

3. Navigate to the `Accounts` panel.

4. If you don't see your Apple Developer account already, click the `+` symbol in the bottom left.

5. Sign in to your account.

Next, you'll need to **assign your project to your account**:

1. Select the `Project Navigator` tab.

2. Select your application.

3. Select `Build Settings`.

<div class="docs-image">
     <img src="/assets/builder/ios/project-navigator.png" alt="">
</div>

4. Scroll down to the `Signing` section.

5. Under `Code Signing Identity`, set `Release` to `Apple Distribution`.
   
<div class="docs-image">
     <img src="/assets/builder/ios/signing-identity.png" alt="">
</div>

6. Under `Code Signing Style`, set `Release` to `Manual`.
   
<div class="docs-image">
     <img src="/assets/builder/ios/signing-style.png" alt="">
</div>

6. Under `Development Team`, set `Release` to your Apple Developer account team.
   
<div class="docs-image">
     <img src="/assets/builder/ios/development-team.png" alt="">
</div>

7. On the same project page, select `Signing & Capabilities` and then `Release`.

<div class="docs-image">
     <img src="/assets/builder/ios/signing-capabilities.png" alt="">
</div>

8. Under `Provisioning Profile`, select `Download Profile`.

9. Choose the profile you created in the previous steps.

Lastly, you just need to **create an archive and upload it:**

1. At the top of Xcode, select your iPhone simulator name and select `Any iOS Device (arm64)`.

<div class="docs-image">
     <img src="/assets/builder/ios/select-any-ios.png" alt="">
</div>

2. Next, select `Product > Archive` from the Mac OS top menu bar.

3. When the archive process finishes, select `Distribute App > App Store Connect > Upload`.

4. Follow the prompts to upload your application!


#### 9. Submit for Review 

The last thing you need to do is submit your app for review:

1. Go to your apps list at the [App Store Connect.](https://appstoreconnect.apple.com/apps)

2. Scroll to the `Build` section.

3. Click `Select a build before you submit your app`.

4. Choose the archive you just created.

5. Once you've set and reviewed the metadata for your app, hit `Submit for Review` to complete your submission.

Your PWA still has to be approved, but if it is, it will appear in the App Store typically within 24-48 hours.

## Push Notifications

PWABuilder for iOS supports `Push Notifications` via [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging).

Things you need to do to enable it:

1. Go to [AppDelegate](https://github.com/pwa-builder/pwabuilder-ios/blob/main/Microsoft.PWABuilder.IOS.Web/Resources/ios-project-src/pwa-shell/AppDelegate.swift) file and uncomment one row under each `TODO`.

2. Follow [FCM Documentation](https://firebase.google.com/docs/cloud-messaging/ios/first-message) for iOS.

3. For code on `JS` side, take a look at this [example component](https://github.com/khmyznikov/ios-pwa-shell/blob/main/src/components/push.ts).

4. Remember, Push Notifications debuggable only on real device.

## Apple In-app Purchase and Subscription

It is possible to enable StoreKit 2 IAP for you PWA, but more manual steps need to be done.

1. Use main branch of [our repository](https://github.com/khmyznikov/ios-pwa-wrap) as example.

2. Folow [our blogpost](https://blog.pwabuilder.com/posts/you-won't-believe-how-we-enabled-in-app-purchases-for-pwas-on-ios/) for further instructions.

## Additional code examples

Any non-standard APIs supported by this solution you can find in [our example repository](https://github.com/khmyznikov/ios-pwa-shell).

## Next Steps

Progressive web apps are cross-platform and can be used anywhere! 

After you've successfully published your app to the App Store, you can package and publish for other platforms:

- [How to Package for Microsoft Store](/builder/windows)

- [How to Package for Meta Quest](/builder/meta)

- [How to Package for the Google Play Store](/builder/android)
