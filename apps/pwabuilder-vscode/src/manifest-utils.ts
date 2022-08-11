import { isStandardOrientation } from "./services/validation/validation";

export const maniTests = [
  {
    infoString:
      "The icons member specifies an array of objects representing image files that can serve as application icons for different contexts.",
    category: "required",
    member: "icons",
    defaultValue: JSON.stringify([
      {
        src: "https://www.pwabuilder.com/assets/icons/icon_192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "https://www.pwabuilder.com/assets/icons/icon_512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ], null, 2),
    docsLink: "https://developer.mozilla.org/en-US/docs/Web/Manifest/icons",
    errorString: "icons should be an array with a length > 0",
    quickFix: true,
    test: (value: any[]) => {
      const isArray =
        value && Array.isArray(value) && value.length > 0 ? true : false;

      if (isArray) {
        return true;
      } else {
        return false;
      }
    },
  },
  {
    infoString:
      "The name member is a string that represents the name of the web application as it is usually displayed to the user (e.g., amongst a list of other applications, or as a label for an icon)",
    category: "required",
    member: "name",
    defaultValue: "placeholder name",
    docsLink: "https://developer.mozilla.org/en-US/docs/Web/Manifest/name",
    errorString: "name is required and should be a string with a length > 0",
    quickFix: true,
    test: (value: string) => {
      return value && typeof value === "string" && value.length > 0;
    },
  },
  {
    member: "name",
    testName: "whitespace",
    category: "required",
    errorString: "name should not have any leading or trailing whitespace",
    quickFix: true,
    test: (value: string) => {
      if (value.trim() !== value) {
        return value.trim();
      } else {
        return true;
      }
    },
  },
  {
    infoString:
      "The short_name member is a string that represents the name of the web application displayed to the user if there is not enough space to display name. This name will show in the start menu on Windows and the homescreen on Android.",
    category: "required",
    member: "short_name",
    defaultValue: "placeholder",
    docsLink:
      "https://developer.mozilla.org/en-US/docs/Web/Manifest/short_name",
    errorString:
      "short_name is required and should be a string with a length > 0 and should not have any whitespace",
    quickFix: true,
    test: (value: string) => {
      const existsAndLength =
        value &&
        typeof value === "string" &&
        value.length > 0 &&
        value.trim() === value;
      return existsAndLength;
    },
  },
  {
    member: "short_name",
    testName: "whitespace",
    category: "required",
    errorString:
      "short_name should not have any leading or trailing whitespace",
    quickFix: true,
    test: (value: string) => {
      if (value.trim() !== value) {
        return value.trim();
      } else {
        return true;
      }
    },
  },
  {
    infoString:
      "The start_url member is a string that represents the start URL of the web application — the preferred URL that should be loaded when the user launches the web application",
    category: "required",
    member: "start_url",
    defaultValue: "/",
    docsLink: "https://developer.mozilla.org/en-US/docs/Web/Manifest/start_url",
    errorString:
      "start_url is required and should be a string with a length > 0",
    quickFix: true,
    test: (value: string) =>
      value && typeof value === "string" && value.length > 0,
  },
  {
    infoString:
      "The display member is a string that determines the developers' preferred display mode for the website. The display mode changes how much of browser UI is shown to the user and can range from browser (when the full browser window is shown) to fullscreen (when the app is fullscreened).",
    category: "required",
    member: "display",
    defaultValue: "standalone",
    docsLink: "https://developer.mozilla.org/en-US/docs/Web/Manifest/display",
    errorString:
      "display is required and should be either fullscreen, standalone, minimal-ui, browser",
    quickFix: true,
    test: (value: string) => {
      return ["fullscreen", "standalone", "minimal-ui", "browser"].includes(
        value
      );
    },
  },
  {
    infoString:
      "The background_color member defines a placeholder background color for the application page to display before its stylesheet is loaded.",
    category: "required",
    member: "background_color",
    defaultValue: "#000000",
    docsLink:
      "https://developer.mozilla.org/en-US/docs/Web/Manifest/background_color",
    errorString: "background_color is required and should be a valid hex color",
    quickFix: true,
    test: (value: string) => {
      const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
      return hexRegex.test(value);
    },
  },
  {
    infoString:
      "The theme_color member is a string that defines the default theme color for the application.",
    category: "required",
    member: "theme_color",
    defaultValue: "#000000",
    docsLink:
      "https://developer.mozilla.org/en-US/docs/Web/Manifest/theme_color",
    errorString: "theme_color is required and should be a valid hex color",
    quickFix: true,
    test: (value: string) => {
      const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
      return hexRegex.test(value);
    },
  },
  {
    infoString:
      "The orientation mode changes the default orientation of the app. For example, if set to 'portrait', the app will be displayed in landscape mode by default.",
    category: "recommended",
    member: "orientation",
    defaultValue: "any",
    docsLink:
      "https://developer.mozilla.org/en-US/docs/Web/Manifest/orientation",
    errorString:
      "orientation is required and should be either any, natural, landscape, landscape-primary, landscape-secondary, portrait, portrait-primary, portrait-secondary",
    quickFix: true,
    test: (value: string) => {
      return isStandardOrientation(value);
    },
  },
  {
    infoString:
      "The screenshots member defines an array of screenshots intended to showcase the application.",
    category: "recommended",
    member: "screenshots",
    defaultValue: JSON.stringify([
      {
        src: "https://www.pwabuilder.com/assets/screenshots/screen1.png",
        sizes: "2880x1800",
        type: "image/png",
        description: "PWABuilder Home Screen",
      },
      {
        src: "https://www.pwabuilder.com/assets/screenshots/screen2.png",
        sizes: "2880/1800",
        type: "image/png",
        description: "PWABuilder Report Card",
      },
      {
        src: "https://www.pwabuilder.com/assets/screenshots/screen3.png",
        sizes: "2880x1800",
        type: "image/png",
        description: "Manifest information on the Report Card",
      },
    ], null, 2),
    docsLink:
      "https://developer.mozilla.org/en-US/docs/Web/Manifest/screenshots",
    errorString:
      "screenshots is required and should be an array with a length > 0",
    quickFix: true,
    test: (value: string) =>
      value && Array.isArray(value) && value.length > 0 ? true : false,
  },
  {
    infoString:
      "The shortcuts member defines an array of shortcuts or links to key tasks or pages within a web app. Shortcuts will show as jumplists on Windows and on the home screen on Android.",
    category: "recommended",
    member: "shortcuts",
    defaultValue: JSON.stringify([
      {
        "name": "Start Live Session",
        "short_name": "Start Live",
        "description": "Jump direction into starting or joining a live session",
        "url": "/?startLive",
        "icons": [{ "src": "https://pwabuilder.com/assets/icons/icon_192.png", "sizes": "192x192" }]
      }
    ], null, 2),
    docsLink: "https://developer.mozilla.org/en-US/docs/Web/Manifest/shortcuts",
    errorString:
      "shortcuts should be an array with a length > 0 and should not include webp images",
    quickFix: true,
    test: (value: any[]) => {
      const isArray =
        value && Array.isArray(value) && value.length > 0 ? true : false;
      if (isArray === true) {
        // check image types dont include webp
        const hasWebp = value.some((icon) => icon.type === "image/webp");
        if (hasWebp) {
          return false;
        }
      } else {
        return false;
      }
    },
  },
  {
    infoString:
      "The iarc_rating_id member is a string that represents the International Age Rating Coalition (IARC) certification code of the web application. It is intended to be used to determine which ages the web application is appropriate for.",
    category: "optional",
    member: "iarc_rating_id",
    defaultValue: "",
    docsLink:
      "https://developer.mozilla.org/en-US/docs/Web/Manifest/iarc_rating_id",
    quickFix: true,
  },
  {
    infoString:
      "The related_applications field is an array of objects specifying native applications that are installable by, or accessible to, the underlying platform — for example, a platform-specific (native) Windows application.",
    category: "optional",
    member: "related_applications",
    defaultValue: [],
    docsLink:
      "https://developer.mozilla.org/en-US/docs/Web/Manifest/related_applications",
    quickFix: true,
  },
  {
    member: "lang",
    infoString:
      "The lang member is a string that represents the default language of your PWA.",
    category: "optional",
    defaultValue: "en-US",
    docsLink: "https://developer.mozilla.org/en-US/docs/Web/Manifest/lang",
    errorString: "lang is required and should be set to a valid language code",
    quickFix: true,
    test: (value: string) =>
      value && typeof value === "string" && value.length > 0,
  },
  {
    member: "dir",
    infoString:
      "The dir member is a string that represents the default text direction of your PWA.",
    category: "optional",
    defaultValue: "ltr",
    docsLink: "https://developer.mozilla.org/en-US/docs/Web/Manifest/dir",
    quickFix: true,
  },
  {
    member: "description",
    infoString:
      "The description member is a string that represents the description of your PWA.",
    category: "optional",
    defaultValue: "",
    docsLink:
      "https://developer.mozilla.org/en-US/docs/Web/Manifest/description",
    errorString: "description and should be a string with a length > 0",
    quickFix: true,
    test: (value: string) =>
      value && typeof value === "string" && value.length > 0,
  },
  {
    member: "description",
    testName: "whitespace",
    category: "required",
    errorString:
      "description should not have any leading or trailing whitespace",
    quickFix: true,
    test: (value: string) => {
      if (value.trim() !== value) {
        return value.trim();
      } else {
        return true;
      }
    },
  },
  {
    member: "protocol_handlers",
    infoString:
      "The protocol_handlers member specifies an array of objects that are protocols which this web app can register and handle. Protocol handlers register the application in an OS's application preferences; the registration associates a specific application with the given protocol scheme. For example, when using the protocol handler mailto:// on a web page, registered email applications open.",
    category: "optional",
    defaultValue: [],
    docsLink:
      "https://developer.mozilla.org/en-US/docs/Web/Manifest/protocol_handlers",
    quickFix: true,
  },
  {
    member: "display_override",
    infoString:
      "Its value is an array of display modes that are considered in-order, and the first supported display mode is applied.",
    category: "optional",
    defaultValue: [],
    docsLink:
      "https://developer.mozilla.org/en-US/docs/Web/Manifest/display_override",
    quickFix: true,
  },
];
