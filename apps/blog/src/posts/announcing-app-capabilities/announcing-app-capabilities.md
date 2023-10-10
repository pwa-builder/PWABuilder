---
layout: post
title: Introducing the new App Capabilities section of the PWABuilder Report Card page
excerpt: Introducing the new App Capabilities section of the PWABuilder Report Card page
description: Introducing the new App Capabilities section of the PWABuilder Report Card page
date: 2023-10-16
updatedDate: 2023-10-16
trending: true
featured: true
image: 
isPost: true
backUrl: '/'
author:
  name: Jaylyn Barbee
  twitter: https://twitter.com/devteutsch
  title: Software Engineer
tags:
  - PWA Builder
  - PWA
  - Report Card
---

To increase discoverability and education surrounding the features that developers can take advantage of to make their apps feel more native, the PWABuilder team is introducing the brand new “App Capabilities” card. From customizing the physical appearance of the installed PWA with display_override to telling the PWA how to handle incoming files and links with file_handlers and handle_links respectively, implementing these capabilities can help a PWA embrace the “progressive” part of its name.

<div styles="display: flex; gap: 20px; aling-items: center; justify-content: center" >
    <img src="ac-cards.png" alt="PWABuilder CLI create command output after executing."></img>
    <img src="ac-tooltip.png" alt="PWABuilder CLI create command output after executing."></img>
</div>

On hover, each of the bubbles will show a tooltip that has a brief description of the field, links to read more, and a link to edit the field directly in the Manifest Editor if PWABuilder currently supports the field. For the fields that are not supported, they will be getting added in the months to come. 

<img src="ac-items.png" alt="PWABuilder CLI create command output after executing."></img>

This update also changed the way users can interact with their Action Items. The indicator pills that live above the list are now clickable and filter the list to match the selected filter. Red filters required fields that block packaging, yellow indicates recommended or optional fields, and the new purple lightning bolt tells the user how many app capabilities they have left to potentially add to their PWA. 

Visit [pwabuilder.com](https://www.pwabuilder.com) to check out the new App Capabilities card now!