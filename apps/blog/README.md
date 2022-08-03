# PWA Builder Blog

## Setup

1. `git clone git@github.com:pwa-builder/pwabuilder-blog.git`
1. `cd pwabuilder-blog && npm install`
1. `npm run dev` to serve the site.
1. `npm run build` to build the site.

## Tag Styling

Tags are styled in `src/styles/tags.css`. Coloring custom tags works as such:

```css
...

.tag.beer {
  @apply bg-blue-700;
}

.tag.spirituality {
  @apply bg-indigo-700;
}

.tag.orcas {
  @apply bg-purple-700;
}

...
```

## Credits

- This project was forked from [11ty Starter](https://github.com/mattwaler/eleventy-starter) by [Matt Waler](https://mattwaler.com/).
- The code copying script was adapted from [https://codepen.io/wilbo/pen/xRVLOj](https://codepen.io/wilbo/pen/xRVLOj) by [Wilbert Schepenaar](https://wilbert.dev/).
- SEO handling was inspired from [Skeleventy](https://github.com/josephdyer/skeleventy) by [Joseph Dyer](https://github.com/josephdyer).

## Blog Template

```md
---
layout: post
title: Title
excerpt: Short description
description: Long description
date: 2021-01-01
updatedDate: 2021-01-01
trending: true
featured: true
image: placeholder.png
author:
name: John Doe
tags:
  - post
  - template
---

### Sub title

Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Congue quisque egestas diam in arcu cursus euismod quis. Ac auctor augue mauris augue. Convallis tellus id interdum velit laoreet id donec ultrices. Aliquam eleifend mi in nulla posuere. Pretium quam vulputate dignissim suspendisse in est. Orci sagittis eu volutpat odio facilisis mauris sit.
![test](/placeholder.png)
```
