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

In this example, we've added a few extra fields to our shorcut. `short_name` provides an alternate name to display for your shortcut if there is limited display space, while `icons` allows you to specify a custom icon to display for your shorcut in the context menu. For shortcuts, the array you provide must include an icon that is 96x96.

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