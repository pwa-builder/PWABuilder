# Package for Stores
Once your app is published to the web, PWA Studio can use [PWABuilder]() APIs to package your PWA for various app stores, including iOS, Google Play, and Microsoft. Your PWA just needs to be available on the web, and you're all set. If you need help publishing your app to the web, check out this documentation on using [Azure Static Web Apps]().

## Add Your App's URL
You can use PWA Studio to associate your progressive web app with a URL.

To provide your progressive web app's URL:

1. Hit in `ctrl-shift-P` in VS Code.
   
2. Search for `PWA Studio: Set App URL`.
   
3. Select `Yes` if you already have a URL.
   
4. Provide the URL for your web application.

If you select `No` and don't have a URL, you will see this popup:

<div class="docs-image">
<img src="/assets/studio/package/static-web-notification.png">
</div>

You can follow this link to get more info about Azure Static Web Apps.

## Validate Your PWA

PWA Studio can evaluate and validate your PWA to ensure it is both [installable from the browser](https://docs.microsoft.com/en-us/microsoft-edge/progressive-web-apps-chromium/ux#installing-a-pwa) and ready to publish to the app stores.

To validate your PWA:

1. Navigate to the PWA Studio pane by clicking the icon the left-most bar of VS Code.
   
2. The bottom most section of the PWA Studio pane has a checklist where you can see what your PWA has and what it is missing.
   
3. Evaluate what your PWA needs to be store-ready.

The checklist should look like this:

<div class="docs-image">
    <img src="/assets/studio/package/checklist.png" width=350>
</div>

In the example above, you can see that our app has the necessary features of a PWA, but hasn't yet be published to the web. As a result, the store-ready check fails overall.

If your PWA is missing some features (like a service worker or web manifest), learn how to [convert an existing web app](/docs/studio/existing-app.md) to a PWA.

## Packaging for Stores

Once your application is published to web and validated, you can package your PWA for stores.


1. Hit `ctrl-shift-P` with Code open.
   
2. Search for and run the command `PWA Studio: Package your PWA`.
   
3. Select which platform  you wish to package your PWA for.
   
4. Follow the prompts for the platform you selected.
   
5. Your PWA's package will be generated!

After you have your package, a notification will pop up to take you to the next steps documentation for whatever platform you selected.