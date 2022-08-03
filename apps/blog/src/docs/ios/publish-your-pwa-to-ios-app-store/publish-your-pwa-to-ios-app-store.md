---
layout: doc
title: Publish Your PWA to the iOS App Store
excerpt: A step-by-step visual guide to publishing your PWA to the iOS App Store
description: A step-by-step visual guide to publishing your PWA to the iOS App Store
date: 2021-10-28
updatedDate: 2021-10-28
trending: false
featured: false
recommended: false
isDocumentation: true
backUrl: '/docs'
image: docs/ios/ios-platform/ios-store-logo.svg
author:
  name: PWA Builder documentation
tags:
  - docs
  - Documentation
  - iOS
---

Once you've packaged your PWA for iOS using [PWABuilder](https://www.pwabuilder.com) and [followed the steps to build your iOS app package](/docs/build-your-ios-app), you're ready to publish your app to the iOS App Store.

The process looks like this:

1. Sign into your Apple Developer account
2. Create a Bundle ID
3. Create a certificate signing request (CSR)
4. Create a new certificate
5. Create a provisioning profile
6. Create an app reservation
7. Upload your app package
8. Submit for review

Each step is described below.

## <span id="sign-into-your-developer-account">1. Sign into your Apple Developer account</span>

To submit your app the iOS App Store, [sign-in to your Apple Developer Account](https://developer.apple.com/account/).

If you don't have an Apple Developer account, [enroll here](https://developer.apple.com/programs/enroll). Enrollment costs $99 USD/year, though [non-profits can have this fee waived](https://developer.apple.com/support/membership-fee-waiver/).

## <span id="create-your-bundle-id">2. Create your Bundle ID</span>

Once you're signed in, you'll need to create a Bundle ID for your app. 

> 💁‍♀️ What's a Bundle ID?
> 
> A Bundle ID is a string (e.g. com.myawesomepwa) that uniquely identifies your app in the App Store.
> Apple recommends using a reverse-domain style string, such as com.domainname.appname.
>
> This string must be the same string you used in PWABuilder when packaging your iOS app. By default, PWABuilder uses the reverse-domain of your PWA as your Bundle ID.
>
> If you're unsure what value you should use as your Bundle ID, go back to PWABuilder, package for iOS, and take note of the Bundle ID in PWABuilder's iOS options dialog.

Go to your [Apple Developer account page](https://developer.apple.com/account/) and choose `Certificates, Identifiers & Profiles` to create your Bundle ID.

![image](https://user-images.githubusercontent.com/312936/138008456-bc72e5c5-1314-4844-8065-8a9c2f1a231b.png)

Then choose `Identifiers` and click `+` to add a new identifier.

![image](https://user-images.githubusercontent.com/312936/138008541-9ae86cac-05e2-4b50-a0e9-1f6297638bd3.png)

Choose `App IDs`, then choose `App` as the type. You'll be prompted for a `Description` and `Bundle ID`.

Add any `Description` you like, then paste in your Bundle ID into the `Identifier` text box:

![image](https://user-images.githubusercontent.com/312936/138008584-7aaf1b12-2423-4a1d-9de2-d473d4fe6330.png)

> 💁‍♂️ Remember, **`Bundle ID` must be set to the same value you used when generating your package in PWABuilder.**
> 
> If you're unsure what your Bundle ID is, go back to PWABuilder, package for iOS, and take note of your `Bundle ID`.
> 
> Alternately, you can find your Bundle ID inside your `project.pbxproj` file, next to the `PRODUCT_BUNDLE_IDENTIFIER` string.

Under `Capabilities`, **enable** the following capabilities:

- Associated Domains
- Push Notifications

Click `Continue` and then `Register` to finish creating your Bundle ID.

## 3. Create a Certificate Signing Request (CSR)

On your Mac, launch `Keychain Access` app. 

From the top menu bar, choose `Keychain Access` -> `Certificate Assistant` -> `Request a Certificate from a Certificate Authority`

![image](https://user-images.githubusercontent.com/312936/138376813-73100ac3-832a-4fda-8f9d-583b0517a398.png)

Add your email address and your name. You may leave `CA Email Address` empty. Choose `Saved to disk`, then click `Continue`:

![image](https://user-images.githubusercontent.com/312936/138376830-23a307d3-19be-44db-bf66-18d5186afc96.png)

You'll be prompted to save the `.certSigningRequest` file to disk.

## 4. Create a certificate

Go to your [Apple Developer Account page](https://developer.apple.com/account) and choose `Certificates, Identifiers & Profiles` -> `Certificates`. Click `+` to add a new certificate:

![image](https://user-images.githubusercontent.com/312936/138376850-de8b9d84-2ee1-4906-a3f7-7dc2ebbd8d06.png)

Choose `Apple Distribution` and click `Continue`:

![image](https://user-images.githubusercontent.com/312936/138535541-a1ffc1d6-2fa5-429f-98b2-bc6108393866.png)

You'll be prompted to upload a Certificate Signing Request (`.certSigningRequest`) file. Choose the file you saved to disk in the previous step, then click `Continue`:

![image](https://user-images.githubusercontent.com/312936/138388987-d836fb02-55ae-4ac8-8542-dae042445375.png)

On the final certificate screen, choose `Download` to save your `.cer` certificate file to disk.

To install this `.cer` file, open `Keychain Access` app and drag the `.cer` file onto the list of certificates:

![image](https://user-images.githubusercontent.com/312936/138757045-42335e86-76c2-4432-abc5-a73f48cefa7c.png)

You should see the certificate appear in the list.

## 5. Create a Provisioning Profile

Go back to your [Apple Developer Account page](https://developer.apple.com/account) and choose `Certificates, Identifiers & Profiles` -> `Profiles`. Then click `+` to create a new Provisioning Profile:

![image](https://user-images.githubusercontent.com/312936/138376889-6f87cd34-f416-4b19-8efb-8514375e2978.png)

On the New Provisioning Profile page, choose `App Store`, and click `Continue`:

![image](https://user-images.githubusercontent.com/312936/138376946-84c4cae2-d85e-4e29-8b48-e5eec81e4815.png)

On the next screen, choose your desired app ID -- the Bundle ID you created in step 2 -- then click `Continue`:

![image](https://user-images.githubusercontent.com/312936/138376988-9536f349-8b7a-48b2-8d1e-7b03ae9ba267.png)

On the next page, you'll be asked to choose an existing certificate. Choose the certificate you created in the previous step, then click `Continue`:

![image](https://user-images.githubusercontent.com/312936/138389449-cf00a013-294a-42e8-afca-8c3660e66843.png)

On the next page, you'll be asked for `Provisioning Profile Name`. Use your `Bundle ID` (e.g. com.mydomain.myapp) as the name, then click `Generate`:

![image](https://user-images.githubusercontent.com/312936/138535867-4d2cf78b-de43-4b4f-b096-ebabae697254.png)

On the final page, choose `Download` to download your `.mobileprovision` Provisioning Profile file.

## 6. Create your app reservation

Go back to [developer.apple.com/account](https://developer.apple.com/account/) and choose `App Store Connect`:

![image](https://user-images.githubusercontent.com/312936/138008617-5205be9e-a750-40fa-a35c-13a43fda8d48.png)

Once you're in [App Store Connect](https://appstoreconnect.apple.com), choose `My Apps`

![image](https://user-images.githubusercontent.com/312936/138008636-9871da39-34f5-433a-817c-cafd76daf4bd.png)

Your existing apps will be listed. If you want to update an existing app, choose that app. Otherwise, click `+` -> `New App`:

![image](https://user-images.githubusercontent.com/312936/138008660-842d5edb-a4bd-4875-b997-0df931a4f3dd.png)

You'll be asked for details about your new app. For platform, choose `iOS`. For `Bundle ID`, choose the Bundle ID you created in the previous step. For `SKU`, you can use any string you like. For `User Access`, specify `Full Access`:

![image](https://user-images.githubusercontent.com/312936/138008701-ee5e070d-6569-42d3-9b0b-c5ad9fcbc04d.png)

Click `Create` to complete your app reservation.

## 7. Upload your app package

After creating your app reservation in the last step, you'll be redirected to your app details page where you'll upload your app package, add screenshots, description of your app, and more.

![image](https://user-images.githubusercontent.com/312936/138389550-2770562d-fef5-4164-833e-337c82a0865b.png)

On this page, fill our the information about your app, such as `Version`, `Description`, `Keywords`, Support URL, screenshots, and other metadata.

When you're ready to upload your PWA app package, you'll submit your package by signing into Xcode, assigning your project to your Apple Developer account, then creating an archive.

Each step is described below.

#### Uploading your package: Sign into Xcode

Go to `Xcode` menu -> `Preferences`:

![image](https://user-images.githubusercontent.com/312936/138536067-df7e0276-bda2-4e29-ac1f-231324435af6.png)

In the Preferences dialog, choose `Accounts`. If your Apple Developer account isn't listed, click the `+` button to add it to Xcode:

![image](https://user-images.githubusercontent.com/312936/138536011-f8d4d24d-e3c2-4eae-a245-933ba8a49103.png)

Once you've signed into your Apple Developer account in Xcode, dismiss the Preferences dialog.

#### Uploading your package: Assign your project to your account

In Xcode, choose `Project Navigator (📁)` -> `[your app name]` -> `Build Settings`:

![image](https://user-images.githubusercontent.com/312936/138536316-baaad18c-5706-40bd-8a21-14e46225c6d4.png)

Scroll down to the `Signing` section, and set `Code Signing Identity` -> `Release` to `Apple Distribution`:

![image](https://user-images.githubusercontent.com/312936/138536454-1a11dc69-0340-4391-acc3-8ff5e303729d.png)

Then set `Code Signing Style` -> `Release` to `Manual`:

![image](https://user-images.githubusercontent.com/312936/138536492-e21a7cd9-1664-4909-8966-9c4ccdca2c2d.png)

Finally, set `Development Team` -> `Release` to your Apple Developer account team:

![image](https://user-images.githubusercontent.com/312936/138536529-86a1f46d-8417-44f0-b72e-229aa8d36856.png)

On the same project page, choose `Signing & Capabilities` -> `Release`:

![image](https://user-images.githubusercontent.com/312936/138536678-0507aa82-88c3-4508-a87a-75bb5db3eb70.png)

Under `Provisioning Profile`, choose `Download Profile...`:

![image](https://user-images.githubusercontent.com/312936/138536799-650f408d-216c-455d-b3cc-316de71ce055.png)

On the download profile prompt, choose the profile you created in the previous steps.

#### Uploading your package: Create an archive

On the top menu bar of Xcode where you see your iPhone simulator name, choose the simulator name, and select `Any iOS Device (arm64)`:

![image](https://user-images.githubusercontent.com/312936/138537055-7e558abb-7b31-4d9d-b3bd-1794fe267742.png)

Then from the top menu, choose `Product` -> `Archive`:

![image](https://user-images.githubusercontent.com/312936/138537627-c443aa49-a82b-45de-b750-00affa0e2cf1.png)

When the archive process finishes, the Archive window will appear:

![image](https://user-images.githubusercontent.com/312936/138537562-23d336c1-c79e-4e1d-bb49-b798ead440f5.png)

Choose `Distribute App` -> `App Store Connect` -> `Upload`.

Follow the prompts to complete your upload to the App Store Connect:

![image](https://user-images.githubusercontent.com/312936/138749331-da7d7a6f-c5ca-49e8-b88d-f39f5d9b7b61.png)

Congrats, you've uploaded your PWA to App Store Connect. 😎

## Submit for Review

Go to [appstoreconnect.apple.com/apps](https://appstoreconnect.apple.com/apps) and select your app. Scroll down to `Build` section and choose `Select a build before you submit your app`:

![image](https://user-images.githubusercontent.com/312936/138750856-18f7f63d-b816-4da6-95f2-c59a9c408c62.png)

Choose the archive you created in the previous step.

When you've finished preparing for submission (pricing, screenshots, localization etc.), choose `Submit for Review` to complete your submission:

![image](https://user-images.githubusercontent.com/312936/138752930-1a23107a-5e71-4c74-9d0e-a290502d78ca.png)

App reviews typically take 24-48 hours. Once approved, your PWA will be listed in the iOS App Store. 🎉