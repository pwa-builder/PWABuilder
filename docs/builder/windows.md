# Publishing PWAs to the Microsoft Store

You can use PWABuilder to build application packages that are submittable the Microsoft Store. Once you have your packages through PWABuilder, you'll need to go through the [Microsoft Partner Center](https://aka.ms/partnercenterregistration) to create your app submission.

!> In order to package for Windows and submit to the Microsoft Store, you will need a [Partner Center Account](https://aka.ms/partnercenterregistration).

#### How does it work?

The PWABuilder service creates both a `.msixbundle` and a `.classic.appxbundle`. 

The `.msixbundle` is the compatible
package type for newer versions of Windows while `.classic.appxbundle` works with older versions.

## Prerequisites
There are some boxes you'll need to check before your PWA is ready to be published to the Microsoft Store.

- A valid PWA with a web manifest, published to the web and secured through HTTPS

- A Windows Developer account with Partner Center. <a href="https://aka.ms/partnercenterregistration">Create your Partner Center account</a>.

!> If you want in-depth guidance on how to enroll as a Windows Developer, see [opening a Partner Center developer account.](https://learn.microsoft.com/windows/apps/publish/partner-center/open-a-developer-account)

## Reserve Your App

In order to create a proper package of your PWA, you'll first need to reserve a name for your application in the Microsoft Partner Center. This will also allow you to get package info that's required for PWABuilder:

1. Log in to the [Partner Center Dashboard](https://partner.microsoft.com/dashboard). Remember, you will need to be enrolled as a Windows Developer before you can complete these next steps.

2. Navigate to the `Apps and Games` section. If you don't see `Apps and Games` on your dashboard, check the navigation menu in the top left.

3. Click the `+ New Product` button and select `MSIX or PWA app`.

<div class="docs-image">
    <img src="assets/builder/windows/windows-partner-center-new-product.png" alt="Create a new MSIX or PWA reservation in Partner Center." width=500>
</div>

4. You'll be prompted to reserve a name for your application submission.

5. Once you have reserved your name, you will be able to access your package info. Navigate to the `Product Identity` section and take note of these three values:

<div class="docs-image">
   <img src="/assets/builder/windows/package-identity.png" alt="Package identity values open in Partner Center" width=600>
</div>

6. Write the three values down. The first is your `Package ID`, the second is your `Publisher ID`, and the last is your `Publisher Display Name`.

You will need **all three** to package with PWABuilder.

## Packaging

!> The packaging process requires data from Partner Center to properly create your package. Unless you are creating a test package, you will need to use [Partner Center](https://aka.ms/partnercenterregistration) prior to packaging.

Before you can submit your PWA to the Microsoft Store, you'll need to create the proper packages with PWABuilder.

1. Navigate to [PWABuilder.com](https://www.pwabuilder.com/).
   
2. Enter the URL of your PWA on the homepage and click `Start`.

<div class="docs-image">
     <img src="/assets/builder/general/pwabuilder-enter-url.png" alt="URL submission area on PWABuilder homepage" width=500>
</div>

3. Click `Package for stores` to navigate to the package selection page.

4. Select `Generate Package` underneath `Windows` in the upper left.

<div class="docs-image">
    <img src="/assets/builder/windows/windows-package-select.png" alt="Windows store package on PWABuilder" width=550>
</div>

5. You will be prompted to provide some options for your app. Fill these out with the three values you got from reserving your app name.

<div class="docs-image">
   <img src="/assets/builder/windows/windows-app-options.png" alt="Windows App options dialog" width=500>
</div>

6. Click `Download Package`.


You can now use the packages you downloaded to submit your application through Partner Center.

?> **Note** PWABuilder generates icons for you when creating your package. These are the icons that will appear on the OS when your application is installed.

## Submitting Your PWA

To submit your PWA through Partner Center:

1. Navigate back to the [Apps and Games section](https://partner.microsoft.com/dashboard/apps-and-games) in the [Partner Center Dashboard.](https://partner.microsoft.com/dashboard)

2. Select the listing you create earlier from your app list.

<div class="docs-image">
   <img src="/assets/builder/windows/app-list.png" alt="App list open in Partner Center" width=550>
</div>

3. Click the `Start your submission` button on the next page.

4. You'll have to complete each section to publish your PWA to the store, but for now, select the `Packages` section.

<div class="docs-image">
   <img src="/assets/builder/windows/submission-options.png" alt="Submission options list open in Partner Center" width=550>
</div>

5. Drag and drop both of the packages you downloaded from PWABuilder (.msixbundle and .classic.appxbundle) or use the file browser option.

6. Click `Save`.

7. Your packages are successfully associate with your submission! Complete the rest of the details for your submission to your liking and click `Submit to Store` when you are ready to have your PWA reviewed.

It usually takes 24 to 48 hours for your app to be reviewed, after which, it will be available on the Microsoft Store.

If you want to view information about the status of your app, you can check through Partner Center at any time. This will be your go to spot for interacting with your listing.

!> After submitting your packages, you may see `Package validation acceptance warnings` about restricted capabilities (such as `runFullTrust` and `packageManagement`). These warnings can be safely ignored.

## Next Steps

Progressive web apps are cross-platform and can be used anywhere! 

After you've successfully published your app to the Microsoft Store, you can package and publish for other platforms:

- [How to Package for the App Store](/builder/app-store)

- [How to Package for Meta Quest](/builder/meta)

- [How to Package for the Google Play Store](/builder/android)
