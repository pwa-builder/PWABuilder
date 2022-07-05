# Service Workers

Service workers are on of the key components of a progressive web app, and are a requirement for your PWA to be installable and work properly offline.

This article will provide an overview of service worker basics and what they can do for your PWA.

## Overview

Service workers are a specific type of [web worker](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers) that serve as a proxy between your application and the network. All requests that go to or from your PWA will pass through the service worker first. 
This allows your service worker to handle requests in situations where the network may be unavailable.

Service workers are event-driven and run separately from your applications primary thread. Instead of blocking the user interface, a service worker will listen for events (like a `fetch` event, for example) and handle it asynchronously.

Some common use cases for service workers:

* Precaching assets

* Handling asset requests, such as deciding when to use the cache or go to the network

* Handling web notification related events, such as notification clicks and push events

* Syncing your application in the background
