# Converting Existing Web Apps to PWAs

If you have an existing web app that you want to convert to a progressive web app, you can use PWA Studio to add the necessary pieces to your app.
Every [installable PWA](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Installable_PWAs) needs a web manifest and a service worker in order to be ready to be published on app stores.

PWA Studio comes with tooling for adding both manifests and service workers for your web application. After you've added both, you can also use the extension to [validate]() that your PWA is properly store-ready.


## Add a Web Manifest

?> **Note** We're going to add a manifest and service workers using the PWA interface, but you can just as easily run the command by hitting `ctrl-shift-P` and searching `PWA Studio: Generate Web Manifest`.

To add a manifest using the interface:

1. Click the PWA Studio icon on the left side of the VSCode Window.
   
2. One the left side of your Code window, you should see the PWA Studio UI.
   
3. In the "Web Manifest" section, click the `Generate a Web Manifest` button.
   
4. Fill out the Web Manifest form and click `Submit Manifest Options`. You can learn more about the Manifest fields [here.](https://developer.mozilla.org/en-US/docs/Web/Manifest)

<div class="docs-image">
    <img src="/assets/studio/existing-app/web-manifest-form.png" width=650>
</div>


After clicking submit, the extension will generate your `manifest.json` file and automatically add the required `link` tag to your `index.html`:
```html
<link rel="manifest" href="manifest.json">
```

Next up: adding a service worker! 


## Add a Service Worker
This tutorial also uses the interface to create a service worker, but can also be done by hitting `ctrl-shift-P` and searching `PWA Studio: Generate Service Worker`.

The extension uses [Workbox](https://developers.google.com/web/tools/workbox/) to generate a Service Worker. Workbox is a helpful tool for creating and managing service workers that abstracts away a lot of the complexity.

1. Tap the PWABuilder icon on the right side of the VSCode Window

2. Tap the `Generate Service Worker` button

3. Choose a `basic` or `advanced` Service Worker.
The basic service worker will work for most cases and will ensure your PWA works offline. If you want to add your own code to your service worker, choose the advanced option.

4. The Workbox CLI will be installed and will run `workbox wizard`. This command is used to learn about the structure of your PWA for [pre-caching.](https://developers.google.com/web/tools/workbox/modules/workbox-precaching#what_is_precaching) 
[](..\..\..\pwabuilder-vscode.wiki\images\generate-icons.png)5. Follow the CLI prompts.
   
After filling out the prompts, Workbox will generate a Service Worker for you and add the register code to your `index.html`:

```html
<script>navigator.serviceWorker.register("public/sw.js")</script>
```

Be sure to check out the [Workbox documentation](https://developers.google.com/web/tools/workbox/modules/workbox-cli#setup_and_configuration) for more information about Workbox and service workers.

## Generate Icons

Currently, PWAs running on different platforms, such as Windows, Android and iOS all require different sized icons for your PWA to display properly. The PWA Studio extension can help you generate the correct sized Icons for your application, using your [existing 512x512 sized icon](https://blog.pwabuilder.com/docs/image-recommendations-for-windows-pwa-packages/) and add them directly to your manifest.

To generate icons:

1. Ensure you have a web manifest. See the [validation documentation.](Validate.md)
   
2. Hit `ctrl-shift-P` with Code open.
   
3. Search for and run the command `PWA Studio: Generate Icons`.
   
4. The generate icon dialogue will open up and ask you to select a file.
   
5. Click `Generate Icons`.
   
6. Your icons will be automatically added to your web manifest.

<div class="docs-image">
    <img src="/assets/studio/existing-app/generate-icons.png" width=500>
</div>