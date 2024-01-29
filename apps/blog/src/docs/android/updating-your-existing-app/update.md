---
layout: doc
title: Updating your existing app
excerpt: How to update your existing app
description: How to update your existing app
date: 2021-09-17
updatedDate: 2021-09-17
trending: false
featured: false
isDocumentation: true
backUrl: '/docs/android-platform-documentation/'
author:
  name: PWA Builder documentation
tags:
  - docs
  - Documentation
  - Android
  - PlayStore
---

## Updating an existing app in the Play Store

If have an existing app in the Play Store and you want to publish a new version of it, follow these steps:

1. [Generate your new package](/docs/android/generating-android-package)
4. Specify your new `App version` and `App version code`:
<br><img alt="A screenshot of the version code and version input on the PWABuilder Android options UI" src="/docs/android/updating-your-existing-app/version-code.png" />
5. Scroll down to `Signing key` and choose `Use mine`: <br><img alt="A screenshot of the Signing Key input on the PWABuilder Android options UI" src="/docs/android/updating-your-existing-app/signing-options.png" />
6. Choose your existing signing key file, and fill in your existing signing key information (`key alias`, `key password`, `store password`)
7. Build your package.

[PWABuilder](https://www.pwabuilder.com) will build a package signed with your existing key. When you upload it to Google Play, it'll automatically be recognized as a new version of your existing app. 😎