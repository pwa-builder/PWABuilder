# Using PWABuilder Features

In addition to packaging, the PWABuilder site also has some tools for improving your progressive web app and editing your manifest. This page will show you how to use the manifest editor, download a new manifest, and add that manifest to your progressive web app.

All of the PWABuilder related tools can be accessed from the report card page. Take a look at the [PWABuilder Quick Start](/builder/quick-start) to see how to get started and navigate to the report card page for your app.

## Editing Your Manifest

To edit your manifest on the PWABuilder site:

1. From the report card page, select the `Edit Your Manifest` button.

<div class="docs-image">
   <img src="assets/builder/using-features/edit-manifest-button.png" alt="The location of the edit manifest button on the PWABuilder report card page.">
</div>

2. The manifest editor modal will appear, allowing you to edit the fields of your manifest using a form.

<div class="docs-image">
   <img src="assets/builder/using-features/edit-manifest-modal.png" alt="The Edit Manifest modal open on the PWABuilder site.">
</div>

3. The manifest editor has six tabs, each for editing or displaying a different part of your manifest:

   * `Info` contains manifest members that contain display information for your application.

   * `Settings` contains manifest members that manage how your application runs and displays at the most basic level. This includes how your applications is oriented, it's start URL, and other important options.

   * `Platform` contains manifest members that relate to how your application interact with native operating systems and app stores.

   * `Icons` allows you to generate proper icons for your progressive web app.

   * `Screenshots` allows you to generate screenshots to be displayed with your progressive web app in stores.

   * `Code` contains a preview of the manifest code that will be generated if you download your edited manifest.

4. Once you have edited and reviewed your manifest, you can download a copy to add to your PWA by clicking the `Download Manifest` button.

That's it! Once you've downloaded your manifest, you still need to add it to your progressive web app. Linking a manifest is quick and easy, and the next section will demonstrate how to do it with your newly generated file.

?> **Note** You can find an in-depth breakdown of all the members in the manifest editor on the [***Manifest Options***](/builder/manifest) page.

## Adding Your Manifest

Adding a manifest to your web app is easy and only requires adding a single line of code to your `index.html`.

To link a manifest to your app:

1. Either create your own or generate a manifest using PWABuilder.

2. Name the file `manifest.json` and add it to the root directory of your web project.

3. In your `index.html`, add this `link` tag that references your manifest:

```html
<link rel="manifest" href="manifest.json">
```

That's it! Your web app manifest should now be linked to your web app.