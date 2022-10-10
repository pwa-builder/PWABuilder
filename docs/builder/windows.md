# Publishing PWAs to the Microsoft Store

You can use PWABuilder to build application packages that are submittable the Microsoft Store. Once you have your packages through PWABuilder, you'll need to go through the <a href="https://partner.microsoft.com/en-us"> Microsoft Partner Center </a> to create your app submission.

!> In order to package for Windows and submit to the Microsoft Store, you will need a [Partner Center Account](https://partner.microsoft.com/en-us/dashboard/account/v3/enrollment/introduction/partnership).

#### How does it work?

The PWABuilder service creates both a `.msixbundle` and a `.classic.appxbundle`. 

The `.msixbundle` is the compatible
package type for newer versions of Windows while `.classic.appxbundle` works with older versions.

## Prerequisites
There are some boxes you'll need to check before your PWA is ready to be published to the Microsoft Store.

- A valid PWA with a web manifest, published to the web and secured through HTTPS

- A Microsoft Developer account with Partner Center (which are available for a one-time fee of $19). Create one [here.](https://partner.microsoft.com/en-us/dashboard/account/v3/enrollment/introduction/partnership)

## Reserve Your App

In order to create a proper package of your PWA, you'll first need to reserve a name for your application in the Microsoft Partner Center. This will also allow you to get package info that's required for PWABuilder:

1. Log in to the <a href="https://partner.microsoft.com/en-us/dashboard/home"> Partner Center Dashboard </a>

2. Navigate to the `Apps and Games` section.
   
3. Click the `+ New Product` button and select `App`.

4. You'll be prompted to reserve a name for your application submission.

5. Once you have reserved your name, you will be able to access your package info. Navigate to the `Product Identity` section and take note of these three values:

<div class="docs-image">
   <img src="/assets/builder/windows/package-identity.png" alt="Package identiy values open in Partner Center" width=600>
</div>

6. Write the three values down. The first is your `Package ID`, the second is your `Publisher ID`, and the last is your `Publisher Display Name`.

You will need **all three** to package with PWABuilder.

## Packaging

!> The packaging process requires data from Partner Center to properly create your package. Unless you are creating a test package, you will need to use [Partner Center](https://partner.microsoft.com/en-us/dashboard/account/v3/enrollment/introduction/partnership) prior to packaging.

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

1. Navigate back to the `Apps and Games` section in the <a href="https://partner.microsoft.com/en-us/dashboard/home"> Partner Center Dashboard </a>.

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

7. Your packages are succesfully associate with your submission! Complete the rest of the details for your submission to your liking and click `Submit to Store` when you are ready to have your PWA reviewed.

It usually takes 24 to 48 hours for your app to be reviewed, after which, it will be available on the Micrsoft Store.

If you want to view information about the status of your app, you can check through Partner Center at any time. This will be your go to spot for interacting with your listing.

## Next Steps

Progressive web apps are cross-platform and can be used anywhere! 

After you've sucessfully published your app to the Microsoft Store, you can package and publish for other platforms:

- [How to Package for the App Store](/builder/app-store)

- [How to Package for Meta Quest](/builder/meta)

- [How to Package for the Google Play Store](/builder/android)