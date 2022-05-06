# Removing the Browser Address Bar

If you're seeing a browser address bar in your PWA Android app, it means you need to update your digital asset links, the `assetlinks.json` file.

This document shows how fix this issue so the browser address bar won't show up.

Please note that a "Chrome is in use" banner is expected the first time your app is run. That is not evidence of a broken asset links. You'll know if your asset links are incorrect when the browser address bar shows up in your Android app. 

## Make sure assetlinks.json is valid and accessible

If you're not sure what asset links are or if you don't have an `assetlinks.json` file, go back and read our [Next Steps page](/Next-steps.md).

Once you have an `assetlinks.json` file deployed to your server, make sure it's accessible via a web browser at `https://<YOUR-PWA-URL>/.well-known/assetlinks.json`. (Replace `<YOUR-PWA-URL>`) 

It's important that this file be in the `/.well-known` subdirectory as shown above. Chrome on Android will look at this URL for your asset links file, and will show the browser addres bar if it's not found.

## Add production fingerprint

If you haven't already, you need to add Google Play's production fingerprint to your `assetlinks.json` file.

Login to the [Google Play Console](https://developer.android.com/distribute/console), select your app, then choose `Setup` -> `App integrity`, then copy your `SHA-256 fingerprint`:

<div class="docs-image">
     <img src="/assets/hidden/asset-links-faq/google-play-signing.png" alt="Image of Google Play signing page." width=600>
</div>

Paste that fingerprint into your `assetlinks.json` file:

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

Once you follow these steps, the browser address bar should no longer appear in your app. 😎

## Validate your `assetlinks.json` file

If your address bar is still showing up after the above steps, the issue is likely due to incorrect asset links: Android thinking your asset links are different than what your `assetlinks.json` file specifies.

To fix this, we'll check what Android believes is the asset links for your PWA, then update our `assetlinks.json` with the new value.

1. Install your app on an Android device or Android emulator
   
2. Install the [Asset Links Tool](https://play.google.com/store/apps/details?id=dev.conn.assetlinkstool) from the Google Play Store.
   
3. Run the Asset Links Tool and search for your PWA's package ID (e.g. `com.myawesomepwa`).
   
4. Tap your PWA's package ID to view its asset links, then tap `Copy Signature`.
   
5. Open your `assetlinks.json` file and find the `sha256_cert_fingerprints` array member. Paste the copied signature into the `sha256_cert_fingerprints`. Your `assetlinks.json` file should look something like this, with 2 fingerprints separated by a comma as shown below:


```json
[{
      "relation": ...,
      "target" : { 
            "namespace": ..., 
            "package_name": ...,
            "sha256_cert_fingerprints": [
                  "...",
                  "4B:C1:D7:C7:8D:74:21:56:8C:E0:13:00:12:35:19:94:4B:33:1E:3C:2B:E5:7A:04:04:FE:F9:3E:58:30:B0:F4"
            ] 
      }
}]
```

1. Save your `assetlinks.json` file and re-upload to your server. 

?> **Note** Make sure your pasted fingerprints have a comma between them, otherwise your `assetlinks.json` will contain invalid JSON. You can [validate your JSON](https://jsonformatter.curiousconcept.com/) to be sure everything's correct.

Once you follow these steps, the browser address bar should no longer appear in your app. 😎

## Make sure there are no redirects

Another common cause of the address bar showing is redirects across origins. (Cosmetic redirects are fine.)

For example, if your site automatically redirects to a different subdomain (e.g. https://myawesomepwa.com redirects to https://www.myawesomepwa.com), you'll need to make sure to generate your Android package on PWABuilder with the correct, canonical URL.

For example, if you always redirect to https://www.myawesomepwa.com (the `www` subdomain), you need to generate your Android package on PWABuilder using the *same URL*, in this case, the one with the `www` subdomain. 

Likewise, if you redirect the `www` subdomain to the bare domain, you'll need to use the bare domain in PWABuilder when generating your Android package.

Bottom line: **whatever URL you redirect to, that's the URL you need to put into PWABuilder**. If you don't do this, the Android platform will look for asset links at a URL that redirects, which renders your asset links invalid and causes the address bar to appear.

See [this issue](https://github.com/GoogleChromeLabs/bubblewrap/issues/310#issuecomment-685505871) for more information.

## Clearing your site's cache

If you had previously installed your PWA on an Android device, your `assetlinks.json` file might be cached. Uninstall isn't enough; you may have to manually clear the browser's cache for your site before Chrome detects an updated `assetlinks.json` file.
