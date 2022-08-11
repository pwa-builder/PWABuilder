---
layout: doc
title: Update an existing app in the Microsoft Store
excerpt: Sometimes, you'll need to do an update
description: This guide shows how to publish your PWA as an update to an existing app in the Store
date: 2021-06-24
updatedDate: 2021-06-24
trending: false
featured: false
image: docs/windows/windows-store-documentation/StoreLogo.png
isDocumentation: true
backUrl: '/docs'
author:
  name: PWA Builder documentation
tags:
  - docs
  - Documentation
  - Windows
---

This guide shows how to publish your PWA as an update to an existing app in the Microsoft Store. If you don't have an app in the Store yet, you should instead [publish a new app](/publish-new-app.md).

## Choose the app you want to update

Login to [Windows Partner Center](https://partner.microsoft.com/dashboard), then go to `Windows & Xbox` -> `Overview`. Your existing apps will be listed:

<img loading="lazy" alt="A screenshot that shows your existing apps list" src="/docs/windows/update-existing-app/existing-apps.png" width="350px" />

Click the name of the app you want to update, and you'll be taken to the app details page.

## Add a new submission

On the app details page, you'll see your most recent app submission. Click `Update` to add a new submission:

<img loading="lazy" alt="A screenshot that shows where the update button is" src="/docs/windows/update-existing-app/add-submission.png" />

On the submission details page, choose `Packages`:

<img loading="lazy" alt="A screenshot that shows where the packages button is" src="/docs/windows/update-existing-app/packages.png" width="250px" />

On the packages screen, click `Browse your files`:

<img loading="lazy" alt="A screenshot that shows where the browse your files button is" src="/docs/windows/update-existing-app/browse-for-package.png" />

When browsing for your files, **choose both package files**, `*.msixbundle` and `*.appxbundle`.

> 💁🏾‍♂️ *Heads up*
> 
> Once your packages finish uploading, you may see the following warning about full trust: <br><img loading="lazy" src="/docs/windows/update-existing-app/full-trust.png" /><br>
> This warning can be safely ignored.


> 💁‍♂️ *Other errors*
> 
> If you're getting other errors when uploading your packages, see [fixing package errors](/package-errors.md).

Once you upload both package files, you should see something like this, with both packages listed:

<img loading="lazy" alt="A screenshot that shows what the uploaded packages look like" src="/docs/windows/update-existing-app/both-packages.png" />
<br>

> 💁🏽‍♀️ *Heads up*: 
> 
> Your classic app package has a lower version than the main app package. So if you packaged your PWA as version 2.0.0, the classic app package will be version 1.9.0. This way you can submit both packages as a single app.

Lastly, in the platforms support list, choose `Windows 10 Desktop` and uncheck all other platforms:

<img loading="lazy" alt="A screenshot that shows where the Windows 10 Desktop option is" src="/docs/windows/update-existing-app/win10-desktop-only.png" />
<br>

> 💁🏿‍♀️ *Heads up*
> 
> While your PWA will run on Windows 10 desktop today, we expect Xbox support to land in 2021. 😎

Click `Save` to save your packages and return to the  submission details screen.

## Complete remaining options

You should now see the submission status. Fill out any `in progress` or `incomplete` settings:

<img loading="lazy" alt="A screenshot that shows what in progress or incomplete settings look like" src="/docs/windows/update-existing-app/remaining-options.png" width="400px" />

Fill out the missing sections, then click `Submit to the Store` when finished.

> 💁🏼‍♀️ *Heads up*
> 
> In `Submission options`, you may receive a warning about full trust capability: <br> <img loading="lazy" alt="A screenshot that shows what the full trust capability warning is about" src="/docs/windows/update-existing-app/full-trust-restricted.png" width="400px" /><br>
> You can write, "Needed for PWA Hosted App model, created by pwabuilder.com"

## Need more help?

If you're having trouble with your app store submission, be sure to read [fixing package errors](/package-errors.md).

If you're still hitting issues, we're here to help. You can [open an issue](https://github.com/pwa-builder/pwabuilder/issues) and we'll help walk you through it.