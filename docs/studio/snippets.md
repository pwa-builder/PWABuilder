# Code Snippets
PWA Studio also adds support for PWA-related code snippets, allowing you to quickly add web capabilities and other features to your app. 

When you type the `Trigger` of a snippet, Code will autocomplete the rest of the necessary code. All of the snippets are prefaced with `pwa` to make filtering for them quick and easy.

?> **Note** All of the Javascript snippets below also work in Typescript.

## Badging

#### pwa-badge-display
Display a badge on a PWA app icon by using the [App Badging API](https://developer.mozilla.org/docs/Web/API/Badging_API).

```javascript
navigator.setAppBadge().then(() => {
    console.log("The badge was added");
}).catch(e => {
    console.error("Error displaying the badge", e);
});
```

#### pwa-badge-clear
Remove the badge on the PWA app icon.
```javascript
navigator.clearAppBadge().then(() => {
    console.log("The badge was cleared");
}).catch(e => {
    console.error("Error clearing the badge", e);
});
```

## Notifications

#### pwa-notification-request-permission
Request user's permission to display messages.

```javascript
button.addEventListener("click", () => {
    Notifications.requestPermission().then(permission => {
        if (permission === "granted") {
            console.log("The user accepted");
        }
    });
});
```

#### pwa-notification-display
Display a notification by creating a `Notification` object.

```javascript
const notification = new Notification("Hello World!", {
    body: "Body of my notification message",
    icon: "/path/to/icon.png",
});
```

#### pwa-notification-display-sw
Display a notification with actions from app's service worker.

```javascript
self.registration.showNotification("Your content is ready", {
    body: "Your content is ready to be viewed. View it now?",
    icon: "/path/to/icon.png",
    actions: [
        {action: "view", title: "View"},
        {action: "dismiss", title: "Dismiss"} 
    ],
});
```

#### pwa-notification-click-sw
Handle the click of actions in notification from your service worker.

```javascript
self.addEventListener("notificationclick", event => {
    event.notification.close();
    if (event.action === 'action1') {
        console.log("action1 was clicked");
    } else if (event.action === 'action2') {
        console.log("action2 was clicked");
    } else {
        console.log("main body of the notification was clicked");
    }
}, false);
```

## Files

Handle your application being launched with a file.

```javascript
if ('launchQueue' in window) {
    console.log('File Handling API is supported!');
    window.launchQueue.setConsumer(launchParams => {
        handleFiles(launchParams.files);
    });
} else {
    console.log('File Handling API is not supported!');
}

async function handleFiles(files) {
    for (const file of files) {
        const blob = await file.getFile();
        blob.handle = file;
        const text = await blob.text();
        console.log(file.name + ' ' + text);
    }
}
```

## Manifest

#### pwa-icons
Define the `icons` member in the web app manifest file.

```json
"icons": [
    {
        "src": "icon-192x192.png",
        "type": "image/png",
        "sizes": "192x192"
    },
    {
        "src": "icon-256x256.png",
        "type": "image/png",
        "sizes": "256x256"
    },
    {
        "src": "icon-384x384.png",
        "type": "image/png",
        "sizes": "384x384"
    },
    {
        "src": "icon.png",
        "type": "image/png",
        "sizes": "512x512"
    }
]
```

#### pwa-theme-color
Define the `theme_color` member in the web app manifest file.

```json
"theme_color": "#0d4c73"
```

#### pwa-file-handlers
Define the `file_handlers` array member in the app manifest file to declare which types of files an app handles

```json
"file_handlers": [
    {
        "action": "The URL the operating system should navigate to when launching your PWA",
        "accept": {
            "*/*": [
                ".txt"
            ]
        }
    }
]
```