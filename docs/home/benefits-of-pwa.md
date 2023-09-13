# Benefits of Progressive Web Apps

Building a Progressive Web App has plenty of advantages, from both a developer and user perspective. If you're looking for a summary of what PWAs can bring to the table, the following article covers several benefits, broken down by how they affect either the development experience or the user experience.

If you are unclear on what a Progressive Web App is from a technical perspective, feel free to check out our [Beginner's Guide to Progressive Web Apps.](/home/pwa-intro/)

## Developers

### Multiple Platforms - Single Codebase

Progressive Web Apps are built with web technology, and as a result, run on any platform with minimal changes to a single, primary codebase. If you develop your app with responsive display design in mind, the same code base will work just as well on mobile, tablet and desktop devices, on any operating system.

You can reach as many users as possible while minimizing the amount of work required to maintain your app, easing development flow and saving time in the process.

### Discoverability

Progressive Web Apps are discoverable and installable from both the web and app stores, such as Google Play and the Microsoft Store. And again, with just one codebase.

By packaging your PWA with PWABuilder and delivering it to as many app stores as possible, your app can reach the largest available audience.

### Ease of Updating

Because Progressive Web Apps are served and updated over the web, and make use of the cache to enable offline capability, updates are automatically reflected for your users. Any time the served version of your app is updated, users will see changes in installed versions of your app the next time they connect to the network. 

Re-uploading your app to native app stores is only necessary if you change your Web App Manifest or if you want to change the listing itself. New content can be delivered quickly and effectively without waiting on native app store processes.

### Variety of Development Options

The only requirement when developing a progressive web app is that you are using a technology that is capable of being deployed to the web. Because the web has been open and iterated on for so long, the number of development options is nearly endless. You can use thousands of frameworks on the front end to any language on the backend, and even use things like WebAssembly or WebGPU for high performance and critical code.

PWABuilder advocates the use of Web Components to build out our resources, but any web framework you are comfortable with will work.

If you want to get started with building a progressive web app with PWABuilder's recommended set of tooling, check out the documentation for the [PWA Starter.](/starter/quick-start/)

## Users

### Consistent Experience Across Platforms

Applications developed for the web aren't as dependent on individual platforms requirements and specifications, and because of this, progressive web apps are great for creating a consistent experience across different platforms.

A user who uses Windows for the desktop computer and Android for their mobile phone can install the exact same app to both of their devices, and have a familiar user experience even though the application is running on two entirely different platforms.

### Accessible from Anywhere

Another huge advantage is that even though progressive web apps can be installed to enable better functionality, they don't *need* to be. If a user doesn't have access to their personal device, they can access a favorite PWA of theirs from any device with browser capability.

Additionally, PWAs also give the user freedom of choice - to be able to install an app or not, and still being able to make effective use of that app regardless of that choice.

### Native Integration

In the past, one of the main advantages native app development technology has had over web apps is the ability to integrate with the native platform easily and quickly with built-in APIs. However, with the advent of modern web technology, many integrations that were previously inaccessible from the web are now implemented in most modern Web Browsers (especially those built on Chromium, like Edge or Chrome itself).

Native features that can be implemented from the web include, but are not limited to:

- Push notifications
- Background sync
- Sharing files to and from your applications 
- Custom file and URL handling
- Integration with hardware devices, like touch screens, microphones, and other sensors

You can learn about how to add native features to your PWA [here.](/home/native-features/)

### Reliable Offline Experience

Another huge edge that native apps used to have on web apps was offline reliability. Classically, web apps would be rendered nonfunctional without access to the internet. Now, with the development of modern web caching and service worker capabilities, progressive web apps can keep a functional and interactive UI even without connectivity.

You can learn more about service workers, the force behind PWA offline functionality, [here.](/home/sw-intro/)

## Next Steps
 
### Want to Learn More About Progressive Web Apps?
The PWABuilder documentation contains some starter materials and how progressive web apps work.

Some articles you can check out:

* [Beginner's Guide to Progressive Web Apps](/home/pwa-intro/) - A crash course on what defines a PWA and the basics of how they operate

* [Introduction to Service Workers](/home/sw-intro) - A surface level overview of one of the most important pieces to a PWA: the service worker.

* [Integrating Native Features](/home/native-features/) - A guide to some of the native integrations you can add to your Progressive Web App.


### Want to Build Your First PWA?

The PWABuilder team also supports the PWA Starter: a progressive web app template that comes with everything you need to get started developing.

Take a look at the [Quick Start Guide](/starter/quick-start/) to learn more.

### Want to Package a PWA You Already Built?

PWABuilder original tool was its packaging service, which now enables manifest and service worker editing capabilities.

If you want to package or evaluate an existing PWA, head to [PWABuilder.com](https://www.pwabuilder.com/) to try out our service.

You can also take a look at the [PWABuilder Quick Start Guide.](/builder/quick-start)