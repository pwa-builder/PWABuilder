---
layout: post
title: Announcing the App Capabilities Card
excerpt: Introducing the new App Capabilities section of the PWABuilder Report Card page
description: Introducing the new App Capabilities section of the PWABuilder Report Card page
date: 2023-10-16
updatedDate: 2024-1-26
trending: true
featured: true
image: posts/announcing-app-capabilities/hero.png
isPost: true
backUrl: '/'
author:
  name: Jaylyn Barbee
  twitter: jaylynsatwork
  title: Software Engineer
  tagline: East Coast based Software Engineer who loves to cooking, gaming, and playing volleyball!
  image: /author_images/jaylyn_image.jpg
tags:
  - post
  - PWABuilder.com
  - App Capabilities
  - Announcement
---


To increase discoverability and education surrounding the features that developers can take advantage of to make their apps feel more native, the [PWABuilder](https://www.pwabuilder.com/) team is introducing the brand new “App Capabilities” card. From customizing the physical appearance of the installed PWA with `display_override` to telling the PWA how to handle incoming files and links with `file_handlers` and `handle_links` respectively, implementing these capabilities can help a PWA embrace the “progressive” part of its name.

<img src="/posts/announcing-app-capabilities/ac-cards.png" alt="The new App Capabilities and Service Worker cards on the report card page."></img>


On hover, each of the bubbles will show a tooltip that has a brief description of the field, links to read more, and a link to edit the field directly in the Manifest Editor if PWABuilder currently supports the field. For the fields that are not supported, stay tuned for further updates in the months to come. 

<img src="/posts/announcing-app-capabilities/ac-tooltip.png" alt="An App Capabilities tooltip opened on the report card page."></img>

This update also changed the way users can interact with their Action Items. The indicator pills that live above the list are now clickable and filter the list to match the selected filter. Red filters required fields that block packaging, yellow indicates recommended or optional fields, and the new purple lightning bolt tells the user how many app capabilities they have left to potentially add to their PWA. 

<img src="/posts/announcing-app-capabilities/ac-items.png" alt="The new app capabilities display under the Action Items field."></img>

Visit [pwabuilder.com](https://www.pwabuilder.com) and enter a URL to check out the new App Capabilities card now!

For more info on adding these capabilities to your progressive web app, check out the PWABuilder documentation on [Adding App Capabilities.](https://docs.pwabuilder.com/#/home/native-features)