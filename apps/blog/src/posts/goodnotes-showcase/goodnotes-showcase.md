---
layout: post
title: How GoodNotes uses web APIs to create a great PWA for Windows
excerpt: Let's explore how GoodNotes uses web APIs to make their PWA great on Windows, especially on devices that support pen and touch input.
description: In this blog post, we will explore how GoodNotes uses web APIs to make their PWA great on Windows, especially on devices that support pen and touch input.
date: 2024-01-24
updatedDate: 2024-01-24
trending: true
featured: true
image: posts/goodnotes-showcase/person-drawing.jpg
isPost: true
backUrl: '/'
author:
  name: Justin Willis
  twitter: Justinwillis96
  title: Software Engineer
  tagline: When i'm not developing PWAs you can find me hiking, gaming or playing with my pets!
  image: /author_images/justin_image.jpg
tags:
  - post
  - PWA
  - showcase
---

[GoodNotes](https://www.goodnotes.com/) is a popular note-taking app that lets you create and organize handwritten notes, sketches, and PDF annotations. It has been available on iOS / ipadOS for a long time and has [recently launched a Progressive Web Application (PWA)](https://www.goodnotes.com/windows) that works on any device with a web browser, including Windows, and is in the Microsoft Store!

In this blog post, we will explore how GoodNotes uses web APIs to make their PWA great on Windows, especially on devices that support pen and touch input. We will focus on two web APIs that GoodNotes utilizes: [the Ink API](https://blogs.windows.com/msedgedev/2021/08/18/enhancing-inking-on-the-web/) and the [Device Haptics API](https://github.com/MicrosoftEdge/MSEdgeExplainers/blob/main/HapticsDevice/explainer.md).

## The Ink API

When Inking, or drawing, on a device, low latency is paramount to having a good user experience. Too much latency while drawing can make drawing smooth lines difficult. Because of this, for the Web, it is paramount that your canvas code is as efficient as possible at drawing to the canvas as soon as the user presses their pen or finger to the screen.

[The Ink API](https://blogs.windows.com/msedgedev/2021/08/18/enhancing-inking-on-the-web/), which was announced at Microsoft Build 2021, uses a newer API in Windows 11 that works directly with the operating system’s compositor to draw additional ink strokes outside of Microsoft Edge’s application loop. This API allows your PWA to avoid the delay of sending the event down the entire rendering stack (which could cause latency and instead gives these points to the operating system compositor as soon as we get them. The compositor can then join the points with ink lines and show these lines in the next frame that is going to be displayed on the screen, greatly lowering latency and avoiding the normal browser rendering pipeline. GoodNotes was able to integrate this API into their existing canvas implementation to ensure that writing and drawing in their app gave users the low latency inking experience they expect on Windows, all through a PWA!

### Using the Ink API
To start using the Ink API, you first need to get an InkPresenter Object, which you can do with the following code:

```typescript
async getInkPresenter() {
    if ((navigator as any).ink) {
      const options = { presentationArea: this.canvasElement };
      console.log(options);

      try {
        this.presenter = await (navigator as any).ink.requestPresenter(options);
      }
      catch (err) {
        console.error("You are probably on Edge Stable with the ink flag turned on, this impl is broken");
      }
    }
}
```


This function is a method inside a class, and sets the presenter variable to the presenter returned from the Ink API. We can then use the presenter to start rendering points.

```typescript
const renderer = new InkRenderer();

renderInkPoint(evt) {
        // Render segments for any coalesced events delivered, for best possible
        // segment quality.
        let events = evt.getCoalescedEvents();
        events.forEach(event => {
            this.renderStrokeSegment(event.x, event.y);
        });

        // Render the actual dispatched PointerEvent, and let the
        // DelegatedInkTrailPresenter know about this rendering (along with
        // style information of the stroke).
        this.renderStrokeSegment(evt.x, evt.y);
        if (this.presenter) {
            this.presenterStyle = { color: "rgba(0, 0, 255, 0.5)", diameter: 4 * evt.pressure };
            this.presenter.updateInkTrailStartPoint(evt, this.presenterStyle);
        }
  }

window.addEventListener("pointermove", evt => {
        renderer.renderInkPoint(evt);
});  
```

### Browser Support
The Ink API is supported on Edge on Windows 11.


## The Device Haptics API

[The Device Haptics API](https://github.com/MicrosoftEdge/MSEdgeExplainers/blob/main/HapticsDevice/explainer.md) is a web standard that enables web applications to provide pen haptics on supported devices, such as the Surface Pro. It provides a simple and declarative way to specify the vibration patterns and intensity levels for different types of interactions.
GoodNotes uses the device haptics API to enhance the user experience of their PWA on Windows. By using the device haptics API, GoodNotes can provide subtle and intuitive feedback to the user when they perform actions like selecting, deleting, or moving the ink strokes. This means that GoodNotes can create a more immersive and engaging experience for their PWA on Windows, especially on devices that support haptic feedback.

### Using the Device Haptics API
Using the Device Haptics API starts with setting up a waveform, of which the browser has pre-defined ones you can use:

```typescript
const WAVEFORM_CLICK = 0x1003;

const waveform = new HapticsPredefinedWaveform({
      waveformId: WAVEFORM_CLICK
});

and then calling play when the user has drawn on the canvas:
<canvas id="b"></canvas>

document.querySelector('#b').addEventListener('pointerdown', function(e) {
        if (e.haptics) {
            e.haptics.play(waveform);
        }
});
```

### Browser Support
The Device Haptics API is supported on Edge on Windows with supporting hardware. 


[GoodNotes](https://www.goodnotes.com/) is a great example of how a PWA can use web APIs to create a rich and native-like experience on Windows. By using the Ink API and the device haptics API, GoodNotes can offer a smooth and natural writing experience, as well as physical and intuitive feedback to the user. GoodNotes shows that web applications can leverage the power and flexibility of the web platform to deliver a great PWA for Windows, but that also works cross-platform. Start using the APIs above to improve your drawing PWA today!
