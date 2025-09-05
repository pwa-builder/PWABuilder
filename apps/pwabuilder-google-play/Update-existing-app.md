## Updating an existing app in the Play Store

If have an existing app in the Play Store and you want to publish a new version of it, follow these steps:

1. Go to [PWABuilder](https://www.pwabuilder.com) and input your PWA's URL
2. When analysis completes, click `Build My Package`
3. Choose `Android`, then click `Options`: <br><img src="/static/android-options.png" />
4. Specify your new `App version` and `App version code`:
<br><img src="/static/android-options-versions.png" />
5. Scroll down to `Signing key` and choose `Use mine`: <br><img src="/static/android-options-existing-signing-key.png" />
6. Choose your existing signing key file, and fill in your existing signing key information (`key alias`, `key password`, `store password`)
7. Build your package.

PWABuilder will build a package signed with your existing key. When you upload it to Google Play, it'll automatically be recognized as a new version of your existing app. 😎