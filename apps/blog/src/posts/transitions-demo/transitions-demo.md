---
layout: post
title: Mimic Native Transitions In Your Progressive Web App
excerpt: 
description: 
date: 2023-10-04
updatedDate: 2023-10-04
trending: true
featured: true
image: 
isPost: true
backUrl: '/'
author:
  name: Jaylyn Barbee
  twitter: 
  title: PWABuilder Engineer
tags:
  - PWA
  - PWA Starter
---

Good native applications take advantage of subtle transitions from page to page that give life to the application and achieving this just became easier for web applications. 

Previously, a combination of Typescript and CSS was required to replicate transitions like that of a native app, but thanks to the “CSS View Transitions” API that just became a lot easier. It’s as simple as calling .startViewTransition() and you’ve already implemented a cross fade transition from one page to another. 

Choosing when and where to use these transitions in your PWA is arguably more important than using them in the first place. Implementing a consistent and accessible set of transitions across your PWA can give your app that native feel but using transitions out of place can ruin the feel of your app all together. 

This blog will cover some transition tricks that to help upgrade your Progressive Web App and give it a more native feel.

## Types of Transition

Each type of transition has an optimal situation where it is best to use them, so before deciding which transition to use, it might be best to understand what you are trying to achieve by using the transition in the first place.  

1. Are you having to load data during this transition? 
2. How related are the pages that you are transitioning between? 
3. Do any of the page elements need to persist when the page transitions? 

The answers to these questions can help you decide what type of transition to use and when. Three common types of transition that can fit different scenarios are:

1. **Top level:** Usually, a crossfade between pages with unrelated content. Seen often with navigation bars or menus. 
2. **Container transform:** This is to be used to transition hero elements of a container from one page to another. This might look like a preview image expanding to take up more space on the hero section of the next page or title text from a store card element transitioning to the heading of a product description page. 
3. **Forward and Backward:** This transition describes the movement from one page to another forward and backward. You see this transition a lot on settings pages where you are clicking deeper into a hierarchy. This is the classic slide in/slide out page transition. 

Our main goals with transitions are to distract users from loading/page refreshes, to give life to our PWA through the movement from the transitions, and to make our PWA feel closer to that of a native application. 

The last bit of context I want to add is that for accessibility, we can use the prefers-reduced-motion CSS query to toggle the movement from these transitions on and off. It is important to take the time to implement this toggle to keep the web accessible for all. 

## The Top Level Transition 

The first transition we'll take a look at is the top-level transition, which is often used when a page switch occurs from a navigation menu. This transition will use a cross-fade, which is the default behavior for `startViewTransition`.

Our `handlePageChange` function looks like this:

```js
handlePageChange(page){ 
  if ("startViewTransition" in document) { 
    return (document as any).startViewTransition(() => { 
      Router.go(page); 
    }); 
  } else { 
    Router.go(page); 
  } 
} 
```

The above code runs whenever a navigation item is clicked in the sample app.  If the browser is compatible with the View Transitions API, we start the view transition and then run the page change through the router. If the API is unavailable, we just route normally. Without any additional code, this alone completes the top-level transition. 

You can add additional CSS to alter the transition using the `::view-transition-old()` and `::view-transition-new()` pseudo-selectors:

```css
::view-transition-old(root), 
::view-transition-new(root) { 
  animation-duration: .25s; 
} 
```

This ensures the animation completes in a fourth of a second. In the snippet above, you may notice the “root” being selected, this is the animation name. If you are using one animation, root is the default target and will suffice. However, if you are using multiple animations, you will need to isolate each animation by giving them names. We will explore this more in the next section.  

## Forward and Backward 

Another page transition that we have all encountered is the forward and backward transition. With this transition, we just want to slide from one page toward the direction of next, whether that be forward or backward. For my sample app, under the “Forward and Backward” tab, I had two pages, one with a forward button and one with a back button. On click of the forward button, the following code was run:  

```js
async handleForward(){ 
  let host = this.shadowRoot!.host; 
  if ("startViewTransition" in document) { 
    //@ts-ignore 
    host!.style.viewTransitionName = 'forward'; 
    // @ts-ignore 
    const transition = document.startViewTransition(); 
    Router.go(`/backward-page`); 
    await transition.finished; 
    // @ts-ignore 
    host!.style.viewTransitionName = ''; 
  } else { 
    Router.go(`/backward-page`); 
  } 
} 
```

And on the backwards page, the following CSS is necessary:  

```css
:host { 
  view-transition-name: forward; 
} 
```

This time, we set the name of the transition (which must be unique), execute the transition, wait for it to finish, and then remove the transition name when the transition is complete. The CSS on the backwards page is telling the API that the host of the backwards page is the “element” that we are transitioning on, which in the context of my sample app, refers to the whole backwards page. To achieve the sliding effect, the following CSS is required:  

```css
@keyframes fade-in { 
  from { opacity: 0; } 
} 
@keyframes fade-out { 
  to { opacity: 0; } 
} 
@keyframes slide-from-right { 
  from { transform: translateX(30px); } 
}  
@keyframes slide-to-left { 
  to { transform: translateX(-30px); } 
} 
@keyframes slide-to-right { 
  to { transform: translateX(30px); } 
} 
@keyframes slide-from-left { 
  from { transform: translateX(-30px); } 
} 
::view-transition-old(forward) { 
  animation: 200ms cubic-bezier(0.4, 0, 1, 1) both fade-out, 
    600ms cubic-bezier(0.4, 0, 0.2, 1) both slide-to-left; 
} 
::view-transition-new(forward) { 
  animation: 400ms cubic-bezier(0, 0, 0.2, 1) 200ms both fade-in, 
    600ms cubic-bezier(0.4, 0, 0.2, 1) both slide-from-right; 
}  
::view-transition-old(backward) { 
  animation-name: fade-out, slide-to-right; 
}
::view-transition-new(backward) { 
  animation-name: fade-in, slide-from-left; 
} 
```

Notice this time inside of the ::view-transition-old/new selectors, we are target specific transition names which allows us to give different behaviors to different transitions. Forwards slides out to the left and then in from the right, backwards does the opposite.  

## Container Transform 

Thus far, we have focused on transitioning between pages with unrelated content. What if there were elements on one page that we wanted to persist to the next? That is where the Container Transform transition type should be used. This transition type has a lot of moving pieces, so it is important to remember to keep the transition clean. We do not need any extra bouncing movements as the transition completes, we want to move our elements along one axis and make sure the elements do not overlap or cause other elements to shift. You can see examples of what NOT to do for this transition type on the Material Designs demonstration.  

In my sample app, my “persistent element” was an album art and when clicked, I wanted it to come front and center on a new page with the respective track list. Like using startViewTransition page to page, using it for an element automatically does a default sliding animation from its old location to its new location. The Typescript is very close to that of the forward and backward transition: 

```js
async handleAlbumClick(name: string, index: number){ 
  let album: HTMLElement = this.shadowRoot!.querySelector(`[data-name="${name}"]`)! 
  if ("startViewTransition" in document) { 
    //@ts-ignore 
    album!.style.viewTransitionName = 'container-transform'; 
    // @ts-ignore 
    const transition = document.startViewTransition(); 
    Router.go(`/album-details/${name}/${index}`); 
    await transition.finished; 
    // @ts-ignore 
    album!.style.viewTransitionName = ''; 
  }
```

And to link the album cover on the old page to the album on the new page, I gave the view-transition-name of “container-transform” to the album art on the new page. Additionally, I wanted the track list to reveal itself as a part of the animation. Since the track list has nothing to do with page transitions, I was able to use normal CSS animations to achieve the reveal I was looking for. A reminder that using the View Transitions API in tandem with the CSS animations that we are used to is completely acceptable.  


We have only just begun to explore the power of page transitions and with this technology only being a few months old, there is only more to come. If you want to do some reading about the feature I would recommend the Chrome Developer article which breaks down the API completely with code examples via a demo app. For more information about the different types of transitions and when to use them, check out the Material Design article that I mentioned a few times through the course of this blog post. I am excited to see this API be used more widespread and who knows, maybe you’ll see some of this on the PWABuilder site soon!  