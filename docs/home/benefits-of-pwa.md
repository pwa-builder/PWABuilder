# Benefits of Progressive Web Apps

Building a Progressive Web App has plenty of advantages, from both a developer and user perspective. If you're looking for a summary of what PWAs can bring to the table, the following article covers several benefits, broken down by how they affect either the development experience or the user experience.

If you are unclear on what a Progressive Web App is from a technical perspective, feel free to check out our [Beginner's Guide to Progressive Web Apps.](/home/pwa-intro/)

## Developer

### Multiple Platforms - Single Codebase

Progressive Web Apps are built with web technology, and as a result, run on any platform with minimal changes to a single, primary codebase. If you develop your app with responsive display design in mind, the same code base will work just as well any mobile (Android, iOS) and any native (Windows, OSX) platform.

You can reach as many users as possible while minimizing the amount of work required to maintain your app, easing development flow and saving time in the process.

### Discoverability

Progressive Web Apps can be packaged and delivered to many native app stores, which allows them to be discoverable from two different paths: on the web and through app stores.

By packaging your PWA with PWABuilder and delivering it to as many app stores as possible, your app can find the largest available audience.

### Ease of Updating

Packaged progressive web apps are still served via the web, and make use of the cache to enable offline capability. Because of this, any time the served version of your app is updated, these changes will automatically be reflected in any store listings or installed versions of your app the next time they connect to the network. Re-uploading your app to native app stores is only necessary if you change your Web App Manifest or if you want to change the listing itself.

New content can be delivered quickly and effectively without waiting on native app store policies or processes.

### Variety of Development Options

The only requirement when developing a progressive web app is that you are using a technology that is capable of being deployed to the web. Because the web has been open and iterated on for so long, the number of development options is nearly endless. You can use anything from Vanilla JavaScript, to React, and everything in between.

PWABuilder advocates the use of Web Components to build out our resources, but any web framework you are comfortable with will work.

## User

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