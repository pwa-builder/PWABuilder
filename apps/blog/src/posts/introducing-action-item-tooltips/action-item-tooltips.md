---
layout: post
title: Introducing informative and actionable tooltips for the PWABuilder Action Items list!
excerpt: Receive more information about each action item right from the report card page.
description: Receive more information about each action item right from the report card page.
date: 2023-04-27
updatedDate: 2023-04-27
trending: true
featured: true
image: posts/introducing-action-item-tooltips/tooltips-cover-photo.png
isPost: true
backUrl: '/'
author:
  name: Jaylyn Barbee
  twitter: https://twitter.com/jaylynsatwork
  title: Software Engineer
tags:
  - post
  - PWA
  - PWABuilder
---

With the revamp of the report card page, PWABuilder saw the introduction of the action items list that gave users actionable tasks to that could help fix or improve their PWA. Previously, clicking on these tasks would trigger an animation, scrolling down to it's corresponding card where the user could then take actions by opening the respective modal and figuring out the rest on their own. To make this process more clear and efficient, starting with the manifest items, we added tooltips activated by hovering the (i) or clicking the action item as a whole. 

<img src="/posts/introducing-action-item-tooltips/tooltips-cover-photo.png" alt="image showing tooltips in use for the display override field">

In the image above you can see the tooltip that would be shown for the `display_override` field. There is a brief description, a photo showing the field in use, and a couple of quick actions at the bottom of the tooltip. It is important to not that photos will only show for fields where the name alone may not directly imply how the field will present in your PWA.

<img src="/posts/introducing-action-item-tooltips/edit-in-manifest-example.png" alt="image showing highlighted display override field in manifest editor">

Really putting the ACTION in action items, the two quick actions at the bottom give users two options.
1. "Learn more": which leads to [PWABuilder Suite Documentation](https://docs.pwabuilder.com/#/) right to the documentation for the field in the tooltip.  
2. "Edit in Manifest": which opens the manifest editor, straight to the tab where the field lives, highlights the field and will even scroll the field into view if necessary.

These actions save our users time and effort, as they no longer have to search for the field in the editor or for the associated information.

<img src="/posts/introducing-action-item-tooltips/before-and-after-manifest-editor-tt.png" alt="before and after tooltips in the manifest editor">

Moving forward, we plan to add more information for the service worker and security action items and all future manifest fields that are added to the site will have these tooltips as well. The manifest editor has also been updated to include these new tooltips. Previously, clicking on the (i) would lead users straight out to the PWABuilder documentation suite, but now the tooltips include the same brief description and a "Learn more" link if additional information is required.

The Action items tooltips feature is now live on [PWABuilder](https://www.pwabuilder.com/) visit now to give it a try!