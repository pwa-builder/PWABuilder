?> **Note:** Stay tuned for new feature instructions as we update and expand this page.

# Integrating Native Features

One of the best ways to upgrade your progressive web app is to take advantage of web capabilites to integrate with the user's operating system. Modern web technology has enabled a whole host of ways to make your PWA behave more like a native application and interact seamlessly with the OS.

This article will showcase how to enable various native functionality for your progressive web app.

## Shortcuts 

Application shortcuts allow your user to directly navigate to certain parts of your progressive web app directly from the operating system. When shortctuts are enabled, they can be accessed through your application's context menu. In Windows, the context menu can be opened by right-clicking on your app's icon.

A context menu with shortcuts will look like this:

<div class="docs-image">
   <img src="assets/home/native-features/shortcuts.png" alt="The shortcuts menu open in Windows." width=600>
</div>

Clicking a specific shortcut will take you directly to the associated content within your PWA. For example, in the screenshot above, clicking "PWA Starter" would open the PWABuilder Documentation PWA and navigate directly to the documentation for the PWA Starter.

### How to Implement Shortcuts

All thats necessary to add shortcuts to your progressive web app is adding a valid `shortcuts` field to your web app manifest. The `shortcuts` field accepts a list of `shortcut` objects and a very basic example would look like this: 

```json
"shortcuts": [
  {
    "name": "News Feed",
    "url": "/feed",
    "description": "Noteworthy news from today."
  },
  {
    "name": "New Post",
    "url": "/post",
    "description": "Create a new post."
  }
]
```

These shortcut objects just have a `name`, a `url` to navigate to, and a brief `description` of the shortcut.

There are a few extra fields you can add to spruce up your shortcut. Another example:

```json
"shortcuts": [
  {
    "name": "News Feed",
    "short_name": "Feed",
    "url": "/feed",
    "description": "Noteworthy news from today.",
    "icons": [
      {
        "src": "assets/icons/news.png",
        "type": "image/png",
        "purpose": "any"
      }
    ]
  }
]
```

In this example, we've added a few extra fields to our shortcut. `short_name` provides an alternate name to display for your shortcut if there is limited display space, while `icons` allows you to specify a custom icon to display for your shortcut in the context menu. For shortcuts, the array you provide must include an icon that is 96x96.

## Window Controls Overlay

!> Window Controls Overlay will only work with certain browsers, such as Edge and Chrome.

Enabling the window controls overlay feature allows you to customize the space next to the window controls (minimize, close, etc.) with CSS and Javascript. This can give you more control over how your app is presented in a native context after it is installed.

Enabling window controls overlay gives you access to this space: 

<div class="docs-image">
   <img src="assets/home/native-features/display-spec-wco.png" alt="The shortcuts menu open in Windows.">
</div>

The area to the right of the controls becomes customizable.

### How to Enable and Use Window Controls Overlay

To enable window controls overlay, set the value of `display_override` in your web app manifest like this:

```json
{
    “display_override”: [“window-controls-overlay”],
    "display": "standalone"
}
```

As you can see, we've also set the `display` value. This ensures that our application has a fallback to use in instances where window controls overlay is unavailable.

### Customizing With CSS

Now that the area in the title bar area is available, we can make use of CSS environment variables to make use of it. Some key variables:

* `titlebar-area-x`: the distance from the left of the viewport where the title bar area appears
* `titlebar-area-y`: the distance from the top of the viewport where the title bar area appears
* `titlebar-area-width`: the width of the title bar area
* `titlebar-area-height`: the height of the title bar area

Some example CSS to see how these could be used: 

```CSS
.titleBar {
    position: fixed;
    left: env(titlebar-area-x, 0);
    top: env(titlebar-area-y, 0);
    width: env(titlebar-area-width, 100%);
    height: env(titlebar-area-height, 40px);
    -webkit-app-region: drag;
    app-region: drag;
}
```

Take note of the `-webkit-app-region` and `app-region` values being set to `drag`. This allows our title bar drag behavior to work properly when window controls overlay is enabled.

## Web Share API 

The Web Share API allows your app to use the operating system's native share dialog to share content (files, links) to and from your progressive web app.

On Windows, the dialog for sharing from your progressive web app looks like this:

<div class="docs-image">
   <img src="assets/home/native-features/pwinter-share.jpg" alt="The native share dialog open on Windows.">
</div>

Making use of the Web Share API will ease the process of sharing to and from your PWA, and allows apps that make use of files to interact more cleanly with the OS.

### How to Share *From* Your PWA

!> Using the Web Share API requires `HTTPS`. Your progressive web app should be using `HTTPS` anyway to properly enable your service worker.

The easiest use case for sharing from your progressive web app is with a web link. It can be implemented with a single function:

```js
async function shareLink(shareTitle, shareText, link) {
    const shareData = {
        title: shareTitle,
        text: shareText,
        url: link,
    };
    try {
        await navigator.share(shareData);
    } catch (e) {
        console.error(e);
    }
}
```

All you have to do is make a call to `navigator.share()` and pass in the desired share data. We are passing a title to display, some text to add more detail, and the actual link to share itself.

You can also share files with the Web Share API. The code to share files is very similar to sharing a link:

```js
async function shareFiles(filesArray, shareTitle, shareText) {
    if (navigator.canShare && navigator.canShare({ files: filesArray })) {
        try {
            await navigator.share({
                files: filesArray,
                title: shareTitle,
                text: shareText
            });
        } catch (error) {
            console.log('Sharing failed', error);
        }
    } else {
        console.log(`System doesn't support sharing.`);
    }
};
```

The only primary change here is that we are making a call to `navigator.canShare()` to confirm that the file types we are trying to share are compatible with the Web Share API. You can find a list of supported file types [here.](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share#shareable_file_types)

### How to Share *To* Your PWA

You can also enable your progressive web app to receive shared files from the native operating system. This is enabled in your PWA's web app manifest by adding the `share_target` member.

Here is an example of how to handle a shared URL:

```json
"share_target": {
      "action": "index.html?share-action",
      "method": "GET",
      "enctype": "application/x-www-form-urlencoded",
      "params": {
        "title": "title",
        "text": "text",
        "url": "url"
      }
    }
```

The key field here is `action`. This allows you to set a specific URL that will open and handle a shared link of this type. If you want to execute functionality based on a shared link, you can have this page parse a link and determine how to handle the shared data.