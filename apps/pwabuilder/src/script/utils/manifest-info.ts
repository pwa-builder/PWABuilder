export interface infoPanel {
  description: String[];
  purpose?: string | null;
  example?: string | null;
  code: string;
  required: boolean;
  location?: "info" | "settings" | "platform" | "icons" | "screenshots";
}

export const manifest_fields: { [field: string]: infoPanel} = {
  "name": {
      description:[`name is a required member that specifies the display name for your application. Anywhere where a name for this application would be displayed, this value will be used. This name should usually align with the store listings associate with your applications. The name of your application also must be at least two characters in length.`],
      purpose: null,
      example: null,
      code:`"name": "WebBoard: A Drawing App"`,
      location: "info",
      required: true
  },
  "short_name": {
      description:[`short_name functions similarly as the name member, except that it will only be used when there is not enough character space to display the applications regular name. It is recommended that short_name be 12 characters or less in length.`],
      purpose:null,
      example:null,
      code:`"short_name": "WebBoard"`,
      location: "info",
      required: true
  },
  "description": {
      description:[`description is an optional member that can be used to describe the functionality and purpose of your app. Just like short_name, this data should usually align with any store listings.`],
      purpose:null,
      example:null,
      code:`"description": "WebBoard is your go to application for quick doodles, notes, or sketches!"`,
      location: "info",
      required: false
  },
  "background_color": {
      description: [`background_color is an optional member that represents the page color of the window that your application will be opened in. This is the color that your app will default to before any styles are loaded. Once styles are loaded, your application will use the background color defined in your CSS.  In order to package with PWABuilder, this field must be a hex encoded string.`],
      purpose:null,
      example: null,
      code:`"background_color": "#4F3FB6"`,
      location: "info",
      required: false
  },
  "theme_color": {
      description:[`theme_color is an optional member that changes the default color used by certain OS features. For example, this would change the color of your title bar when the application is installed on Windows. In order to package with PWABuilder, this field must be a hex encoded string.`],
      purpose:null,
      example: null,
      code:`"theme_color": "#4F3FB6"`,
      location: "info",
      required: false
  },
  "start_url": {
      description:[`start_url is a required member that specifies that URL that will be launched when a user opens your application. This URL can either be an absolute or relative path.`],
      purpose:null,
      example:null,
      code:`"start_url": "https://docs.pwabuilder.com"`,
      location: "settings",
      required: true
  },
  "dir": {
      description:[`dir is an optional member that specifies the text direction for your PWA.`,
                  `It has three values to choose from:`,
`• auto - No set directionality for your app.`,
`• ltr - Text will go from left to right.`,
`• rtl - Text will go from right to left.`],
      purpose:null,
      example:null,
      code:`"dir": "ltr"`,
      location: "settings",
      required: false
  },
  "scope": {
      description: [`scope is an optional member that defines which URL are within the navigation scope of your application. If the user navigates outside of your app's scope, the will be navigated to a normal browser window. scope can often just be set to the base URL of your PWA.`],
      purpose: "Setting a scope ensures that your PWA only navigates within its desired context. Your PWA can maintain UI/UX consistency by opening external content in the browser.",
      example: null,
      code:`"scope": "https://docs.pwabuilder.com"`,
      location: "settings",
      required: false
  },
  "lang": {
      description: [`lang is an optional member that specifies the primary language of your app. The Language member expects a proper subtag for each langauge. For example, to specify English, you would use "en".`],
      purpose:null,
      example:null,
      code:`"lang": "en"`,
      location: "settings",
      required: false
  },
  "orientation": {
      description: [`orientation is an optional member that specifies the default display orientation for your application. It can be any of the following values:`,
      `• any`,
      `• natural`,
      `• portrait`,
      `• landscape`,
      `• potrait-primary`,
      `• portrait-secondary`,
      `• landscape-primary`,
      `• landscape-secondary`],
      purpose:`Indicating an orientation will allow your app to opened with an orientation that matches its design. This is especially important if you expect your application to be used on mobile devices.`,
      example: null,
      code:`"orientation": "portrait"`,
      location: "settings",
      required: false
  },
  "display": {
      description:[`display is an optional member that specifies the display mode that the website should default to.`,
      `display can take any of the following values:`,
      `• browser: The applications will open in a standard browser window.`,
      `• minimal-ui: The application will open in a minimal browser window that still includes certain UI features, such as navigation.`,
      `• standalone: The application will open in its own window with no browser UI elements.`,
      `• fullscreen: The application will make use of all available display space.`,
      `• display will default to browser if not specified.`],
      purpose:`Setting a display will help you control the look and feel of your application. Using an option that minimizes browser UI can make your PWA feel more like an application and less like a website.`,
      example:null,
      code:`"display": "standalone"`,
      location: "settings",
      required: false
  },
  "display_override": {
      description:[`display_override is similar to the display member, but allows you to select a fallback order for different display modes. In addition to the four display values, display_override can also take the value window-controls-overlay. Window-controls-overlay is a desktop-only display mode and adds a native-style overlay to the top of your application.`],
      purpose:`Using the display_override member gives you further control over how your application is displayed. By setting a custom fallback order, you can ensure your app stays as close to its intended design as possible.`,
      example:null,
      code:`"display_override": [
  "window-control-overlay",
  "standalone",
  "browser"
]`,
      location: "settings",
      required: false
  },
  "iarc_rating_id": {
      description: [`iarc_rating_id is an optional member that allows you to specify a suitable age range for their application. A rating ID is obtained by answering a questionnaire about an application, and then providing the associated ID for that application.`],
      purpose:`Having an IARC Rating ID associated with your app allows users to asses if your app may be suitable for children or if it is intended as a product primarily for adults.`,
      example:null,
      code:`"iarc_rating_id": "e58c174a-81d2-5c3c-32cc-34b8de4a52e9"`,
      location: "platform",
      required: false
  },
  "related_applications": {
      description: [`related_applications is an optional member that specifies applications that have similar or adjacent functionality to your application. This member allows users and store listings to complement your application with related technology. This member is an array of application objects, each of which contains a platform (the platform that the application is available on), url (the web URL where the app can be found), and id (the unique ID that specifies the application on the given platform) value.`],
      purpose:`Including related applications will allow users to find technology that can supplement your own PWA, or perhaps even make it more useful.`,
      example:null,
      code:`"related_applications": [
  {
    "platform": "windows",
    "url": "https://www.example-app.com",
    "id": "example.ExampleApp"
  },
  {
    "platform": "play",
    "url": "https://www.example-app-2.com"
  }
]`,
      location: "platform",
      required: false
  },
  "prefer_related_applications": {
      description: [`prefer_related_aplications is an optional member that specifies whether or not related_applications should be preferred to this one. This member defaults to false, but if set to true, the browser may recommend an alternate application to the user`],
      purpose:null,
      example:"It is important that the value of this field is a boolean.",
      code:`"prefer_related_applications": true`,
      location: "platform",
      required: false
  },
  "shortcuts": {
      description:[`shortcuts is an optional member that specifies a list of key tasks within your application. These shortcuts can be displayed by the operating system to allow a user to launch directly to a specific part of the application.`,
      `The shortcuts member is an array of shortcut objects, which can contain the following members:`,
      `• name (Required): The display name of the shorcut.`,
      `• url (Required): The url that the shortcut will open to.`,
      `• short_name: The shortened display name for when display space is limited.`,
      `• description: A string description of the shortcut.`,
      `• icons: A set of icons used to represent the shorcut. This array must include a 96x96 icon.`],
      purpose:`Shortcuts allow users to access certain areas of your PWA quickly and easily. Effectively implemeting shortcuts can reduce friction in your app and make your PWA feel more fully integrated with the native operating system.`,
      example:null,
      code:`"shortcuts": [
  {
    "name": "About",
    "url": "/about"
  },
  {
    "name": "Send Message",
    "url": "/new-message",
    "description": "Open a chat with another user and send a message to them."
  }dir
]`,
      location: "platform",
      required: false
  },
  "protocol_handlers": {
      description:[`protocol_handlers is an optional member that specifies an array of protocols that the application can handle. A protocol handler will contain protocol and url members to specify how each valid protocol is handled.`],
      purpose:`Making use of protocol handlers can make your application more dynamic and functional. By defining handlers for different protocol schemes, your app can navigate directly to the appropriate content for certain types of links.`,
      example:null,
      code:`"protocol_handlers": [
  {
    "protocol": "web+music",
    "url": "/play?track=%s"
  }
]`,
      location: "platform",
      required: false
  },
  "categories": {
      description:[`categories is an optional member that specifies an array of categories that the application belongs to.`],
      purpose: "It is often beneficial to use commonly known categories or similar categories to apps that are related to yours.",
      example: null,
      code:`"categories": ["games", "finance", "navigation"]`,
      location: "platform",
      required: false
  },
  "icons": {
      description:[`icons is a required member that specifies an array of icons to be used by your application for varying contexts and situations, such as in the action bar of your preferred operating system.`],
      purpose:null,
      example:null,
      code:`"icons": [
  {
    "src": "assets/icon1.png",
    "sizes": "48x48 96x96",
  },
  {
    "src": "assets/icon2.png",
    "sizes": "any"
  }
]`,
      location: "icons",
      required: true
  },
  "screenshots": {
      description:[`screenshots is an optional member that specifies an array of screenshots that can showcase your application in app stores.`],
      purpose:`Including screenshots will allow users to get a sneak peak of your application when it is published and packaged for stores.`,
      example:null,
      code:`"screenshots" : [
  {
    "src": "screenshot.jpg",
    "sizes": "1280x720",
    "type": "image/jpg",
    "platform": "wide",
  }
]`,
      location: "screenshots",
      required: false
  },
  /* "share_target": {
    description:[
      `share_target is an optional member that allows installed PWAs to be registered as a target in the system's share dialog. When defining how an application can receive share data, the share_target object in the manifest may contain the following properties:`,
      `• action (Required): The URL for the web share target.`,
      `• enctype: The encodeding of the data when a POST request is used. This step is ignored when using a GET request.`,
      `• method: either GET or POST.`,
      `• params (Required): An object to configure the share parameters. The keys correspond with the keys of naviagator.share() (title, text, url, files).`
  ],
    purpose: null,
    example: null,
    code:`"share_target": {
  "action": "/share-target/",
  "methods": ["GET"],
  "params": {
      "title": "title",
      "text": "text",
      "url": "url"
    }
}`,
    location: "info",
    required: true
}, */
};