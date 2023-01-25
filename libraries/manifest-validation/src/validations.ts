import { currentManifest } from ".";
import { Icon, Manifest, RelatedApplication, singleFieldValidation, Validation } from "./interfaces";
import { containsStandardCategory, isAtLeast, isStandardOrientation, isValidLanguageCode, validateSingleRelatedApp, validProtocols } from "./utils/validation-utils";

export const maniTests: Array<Validation> = [
    {
        infoString: "The name member is a string that represents the name of the web application as it is usually displayed to the user (e.g., amongst a list of other applications, or as a label for an icon)",
        displayString: "Manifest has name field",
        category: "required",
        member: "name",
        defaultValue: "placeholder name",
        docsLink: "https://docs.pwabuilder.com/#/builder/manifest?id=name-string",
        errorString: "name is required and must be a string with a length > 0",
        quickFix: true,
        test: (value: string) => {
            return value && typeof value === "string" && value.length > 0;
        }
    },
    {
        infoString: "share_target enables your app to get shared content from other apps",
        displayString: "Manifest has share_target field",
        category: "optional",
        member: "share_target",
        defaultValue: JSON.stringify({
            "action": "/share-target/",
            "methods": ["GET"],
            "params": {
                "title": "title",
                "text": "text",
                "url": "url"
              }
        }),
        docsLink: "https://web.dev/web-share-target/",
        errorString: "share_target must be an object",
        quickFix: true,
        test: (value: string) => {
            return value && typeof value === "object";
        }
    },
    {
        infoString: "The icons member specifies an array of objects representing image files that can serve as application icons for different contexts.",
        displayString: "Manifest has icons field",
        category: "required",
        member: "icons",
        defaultValue: JSON.stringify([
            {
                "src": "https://www.pwabuilder.com/assets/icons/icon_192.png",
                "sizes": "192x192",
                "type": "image/png",
                "purpose": "any"
            },
            {
                "src": "https://www.pwabuilder.com/assets/icons/icon_512.png",
                "sizes": "512x512",
                "type": "image/png",
                "purpose": "maskable"
            }
        ]),
        docsLink: "https://docs.pwabuilder.com/#/builder/manifest?id=icons",
        errorString: "icons is required and must be non-empty array",
        quickFix: true,
        test: (value: any[]) => {
            const isArray = value && Array.isArray(value) && value.length > 0 ? true : false;

            return isArray;
        }
    },
    {
        infoString: "The icons member specifies an array of objects representing image files that can serve as application icons for different contexts.",
        displayString: "Icons have at least one icon with purpose any",
        category: "recommended",
        member: "icons",
        defaultValue: JSON.stringify([
            {
                "src": "https://www.pwabuilder.com/assets/icons/icon_192.png",
                "sizes": "192x192",
                "type": "image/png",
                "purpose": "any"
            },
            {
                "src": "https://www.pwabuilder.com/assets/icons/icon_512.png",
                "sizes": "512x512",
                "type": "image/png",
                "purpose": "maskable"
            }
        ]),
        docsLink: "https://docs.pwabuilder.com/#/builder/manifest?id=icons",
        errorString: "Need at least one icon with purpose set to any",
        quickFix: true,
        test: (value: any[]) => {
            const isArray = value && Array.isArray(value) && value.length > 0 ? true : false;
            
            if (isArray) {
                const anyIcon = value.find(icon => icon.purpose === "any");

                return anyIcon ? true : false;
            }
            else {
                return false;
            }
        }
    },
    {
        infoString: "The icons member specifies an array of objects representing image files that can serve as application icons for different contexts.",
        displayString: "Icons have at least one PNG icon 512x512 or larger",
        category: "required",
        member: "icons",
        defaultValue: JSON.stringify([
            {
                "src": "https://www.pwabuilder.com/assets/icons/icon_192.png",
                "sizes": "192x192",
                "type": "image/png",
                "purpose": "any"
            },
            {
                "src": "https://www.pwabuilder.com/assets/icons/icon_512.png",
                "sizes": "512x512",
                "type": "image/png",
                "purpose": "maskable"
            }
        ]),
        docsLink: "https://docs.pwabuilder.com/#/builder/manifest?id=icons",
        errorString: "Need at least one PNG icon 512x512 or larger",
        quickFix: false,
        test: (value: any[]) => {
            const isArray = value && Array.isArray(value) && value.length > 0 ? true : false;
            
            if (isArray) {
                const anyIcon = value.find(icon => isAtLeast(icon.sizes, 512, 512) && (icon.type === 'image/png' || icon.src.endsWith(".png")));

                return anyIcon ? true : false;
            }
            else {
                return false;
            }
        }
    },
    {
        infoString: "The icons member specifies an array of objects representing image files that can serve as application icons for different contexts.",
        displayString: "Icons should have one icon with purpose set to any, and one for maskable",
        category: "required",
        member: "icons",
        defaultValue: JSON.stringify([
            {
                "src": "https://www.pwabuilder.com/assets/icons/icon_192.png",
                "sizes": "192x192",
                "type": "image/png",
                "purpose": "any"
            },
            {
                "src": "https://www.pwabuilder.com/assets/icons/icon_512.png",
                "sizes": "512x512",
                "type": "image/png",
                "purpose": "maskable"
            }
        ]),
        docsLink: "https://docs.pwabuilder.com/#/builder/manifest?id=icons",
        errorString: "Seperate Icons are needed for both maskable and any",
        quickFix: true,
        test: (value: any[]) => {
            const isArray = value && Array.isArray(value) && value.length > 0 ? true : false;
            
            if (isArray) {
                const wrongIcon = value.find(icon => icon.purpose === "any maskable");

                return wrongIcon ? false : true;
            }
            else {
                return false;
            }
        }
    },
    {
        infoString: "The scope member is a string that represents the name of the web application as it is usually displayed to the user (e.g., amongst a list of other applications, or as a label for an icon)",
        displayString: "Manifest has a scope field",
        category: "optional",
        member: "scope",
        defaultValue: "/",
        docsLink: "https://docs.pwabuilder.com/#/builder/manifest?id=scope-string",
        errorString: "scope must be a string with a length > 0",
        quickFix: true,
        test: (value: string) => {
            return value && typeof value === "string" && value.length > 0;
        }
    },
    {
        member: "name",
        testName: "whitespace",
        category: "required",
        displayString: "Name field doesn't have leading or trailing whitespace",
        errorString: "name should not have any leading or trailing whitespace",
        quickFix: true,
        test: (value: string) => {
            if (value.trim() !== value) {
                return false;
            }
            else {
                return true;
            }
        }
    },
    {
        infoString: "The short_name member is a string that represents the name of the web application displayed to the user if there is not enough space to display name. This name will show in the start menu on Windows and the homescreen on Android.",
        displayString: "Short name is the correct minimum length (3 characters)",
        category: "required",
        member: "short_name",
        defaultValue: "placeholder",
        docsLink:
            "https://docs.pwabuilder.com/#/builder/manifest?id=short_name-string",
        errorString: "short_name is required and must be a string with a length >= 3",
        quickFix: true,
        test: (value: string) => {
          const existsAndLength = value && value.length >= 3;
          return existsAndLength;
        },
    },
    {
        member: "short_name",
        displayString: "Short name field doesn't have leading or trailing whitespace",
        testName: "whitespace",
        category: "required",
        errorString: "short_name should not have any leading or trailing whitespace",
        quickFix: true,
        test: (value: string) => {
            if (value.trim() !== value) {
                return false;
            }
            else {
                return true;
            }
        }
    },
    {
        infoString: "The start_url member is a string that represents the start URL of the web application — the preferred URL that should be loaded when the user launches the web application",
        displayString: "Manifest has start url field",
        category: "required",
        member: "start_url",
        defaultValue: "/",
        docsLink:
            "https://docs.pwabuilder.com/#/builder/manifest?id=start_url-string",
        errorString: "start_url is required and must be a string with a length > 0",
        quickFix: true,
        test: (value: string) =>
            value && typeof value === "string" && value.length > 0
    },
    {
        infoString: "The start_url member is a string that represents the start URL of the web application — the preferred URL that should be loaded when the user launches the web application",
        displayString: "start_url is valid",
        category: "required",
        member: "start_url",
        defaultValue: "/",
        docsLink:
            "https://docs.pwabuilder.com/#/builder/manifest?id=start_url-string",
        errorString: "start_url is required and must be a string with a length > 0, must be a valid URL, and must be relative to the app scope (if specified)",
        quickFix: true,
        test: (value: string) => {
            if (value && typeof value === "string" && value.length > 0) {
                try {
                    // get current manifest
                    const currentMani = currentManifest;

                    const url = value;
                    //console.log("test url", url);

                    // is url relative to scope
                    let relativeToScope = false;
                    if (currentMani && currentMani.scope) {
                        //console.log("test scope", currentMani?.scope);
                        // is url relative to currentMani.scope
                        const scopeUrl = currentMani.scope;
                        //console.log("scope url", scopeUrl);

                        if (url.startsWith(scopeUrl)) {
                          relativeToScope = true;
                        }
                        else {
                            relativeToScope = false;
                        }
                    }
                    else if (currentMani && !currentMani.scope && (url.startsWith("/") || url.startsWith("https"))) {
                        relativeToScope = true;
                    }
                    else {
                        relativeToScope = false;
                    }

                    return relativeToScope;
                    
                }
                catch {
                    return false;
                }
            }
            else {
                return false;
            }
        }

    },
    {
        infoString: "The display member is a string that determines the developers' preferred display mode for the website. The display mode changes how much of browser UI is shown to the user and can range from browser (when the full browser window is shown) to fullscreen (when the app is fullscreened).",
        displayString: "Manifest has display field",
        category: "recommended",
        member: "display",
        defaultValue: "standalone",
        docsLink: "https://docs.pwabuilder.com/#/builder/manifest?id=display-string",
        errorString: "display must be one of the following strings: fullscreen, standalone, minimal-ui, browser",
        quickFix: true,
        test: (value: string) => {
            return ["fullscreen", "standalone", "minimal-ui", "browser"].includes(
                value
            );
        },
    },
    {
        infoString: "The background_color member defines a placeholder background color for the application page to display before its stylesheet is loaded.",
        displayString: "Manifest has hex encoded background color",
        category: "recommended",
        testRequired: true,
        member: "background_color",
        defaultValue: "#000000",
        docsLink:
            "https://docs.pwabuilder.com/#/builder/manifest?id=background_color-string",
        errorString: "background_color should be a valid hex color",
        quickFix: true,
        test: (value: string) => {
            if (value) {
                const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
                return hexRegex.test(value);
            }
            else {
                return false;
            }
        },
    },
    {
        infoString: "The theme_color member is a string that defines the default theme color for the application.",
        displayString: "Manifest has hex encoded theme color",
        category: "recommended",
        testRequired: true,
        member: "theme_color",
        defaultValue: "#000000",
        docsLink:
            "https://docs.pwabuilder.com/#/builder/manifest?id=theme_color-string",
        errorString: "theme_color should be a valid hex color",
        quickFix: true,
        test: (value: string) => {
            if (value) {
                const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
                return hexRegex.test(value);
            }
            else {
                return false;
            }
        },
    },
    {
        infoString: "The orientation mode changes the default orientation of the app. For example, if set to 'portrait', the app will be displayed in landscape mode by default.",
        displayString: "Manifest has orientation field",
        category: "recommended",
        member: "orientation",
        defaultValue: "any",
        docsLink:
            "https://docs.pwabuilder.com/#/builder/manifest?id=orientation-string",
        errorString: "orientation must be one of the following strings: any, natural, landscape, landscape-primary, landscape-secondary, portrait, portrait-primary, portrait-secondary",
        quickFix: true,
        test: (value: string) => {
            return isStandardOrientation(value);
        },
    },
    {
        infoString: "The screenshots member defines an array of screenshots intended to showcase the application.",
        displayString: "Manifest has screenshots field",
        category: "recommended",
        member: "screenshots",
        defaultValue: JSON.stringify([
            {
                "src": "https://www.pwabuilder.com/assets/screenshots/screen1.png",
                "sizes": "2880x1800",
                "type": "image/png",
                "description": "PWABuilder Home Screen"
            },
            {
                "src": "https://www.pwabuilder.com/assets/screenshots/screen2.png",
                "sizes": "2880/1800",
                "type": "image/png",
                "description": "PWABuilder Report Card"
            },
            {
                "src": "https://www.pwabuilder.com/assets/screenshots/screen3.png",
                "sizes": "2880x1800",
                "type": "image/png",
                "description": "Manifest information on the Report Card"
            },
        ]),
        docsLink:
            "https://docs.pwabuilder.com/#/builder/manifest?id=screenshots",
        errorString: "screenshots must be an array with a length > 0",
        quickFix: true,
        test: (value: string) =>
            value && Array.isArray(value) && value.length > 0 ? true : false,
    },
    {
        infoString: "The shortcuts member defines an array of shortcuts or links to key tasks or pages within a web app. Shortcuts will show as jumplists on Windows and on the home screen on Android.",
        displayString: "Manifest has shortcuts field",
        category: "recommended",
        member: "shortcuts",
        defaultValue: [],
        docsLink:
            "https://docs.pwabuilder.com/#/builder/manifest?id=shortcuts-array",
        errorString: "shortcuts should be a non-empty array and should not include webp images",
        quickFix: true,
        test: (value: any[]) => {
            const isArray = value && Array.isArray(value);
            if (isArray === true) {
                // check image types dont include webp
                const hasWebp = value.some(icon => icon.type === "image/webp");
                if (hasWebp) {
                    return false;
                }
                else {
                    return true;
                }
            }
            else {
                return false;
            }
        }
    },
    {
        infoString: "The shortcuts member defines an array of shortcuts or links to key tasks or pages within a web app. Shortcuts will show as jumplists on Windows and on the home screen on Android.",
        displayString: "Shortcuts have atleast a 96x96 icon",
        category: "recommended",
        member: "shortcuts",
        defaultValue: [],
        docsLink:
            "https://docs.pwabuilder.com/#/builder/manifest?id=shortcuts-array",
        errorString: "shortcuts should have atleast one icon with a size of 96x96",
        quickFix: false,
        test: (value: any[]) => {
            const isArray = value && Array.isArray(value);
            if (isArray === true) {
                const has96x96Icon = value.some((shortcut) => {
                    return shortcut.icons.some((icon: Icon) => {
                        return icon.sizes === "96x96";
                    });
                });
                return has96x96Icon;
            }
            else {
                return false;
            }
        }
    },
    {
        infoString: "The iarc_rating_id member is a string that represents the International Age Rating Coalition (IARC) certification code of the web application. It is intended to be used to determine which ages the web application is appropriate for.",
        displayString: "Manifest has IARC Rating ID field",
        category: "optional",
        member: "iarc_rating_id",
        defaultValue: "",
        docsLink:
            "https://docs.pwabuilder.com/#/builder/manifest?id=iarc_rating_id-string",
        quickFix: true,
        errorString: "iarc_rating_id must be a string with a length > 0",
        test: (value: string) => {
            // should exist
            return value && typeof value === "string" && value.length > 0;
        }
    },
    {
        infoString: "The related_applications field is an array of objects specifying native applications that are installable by, or accessible to, the underlying platform — for example, a platform-specific (native) Windows application.",
        displayString: "Manifest has related applications field",
        category: "optional",
        member: "related_applications",
        defaultValue: [],
        docsLink:
            "https://docs.pwabuilder.com/#/builder/manifest?id=related_applications-array",
        quickFix: true,
        test: (value: any[]) => {
            const isArray = value && Array.isArray(value);

            if (isArray) {
                value.forEach(async (app: RelatedApplication) => {
                    const check = await validateSingleRelatedApp(app);
                    if (check !== "valid") {
                        return false;
                    }
                    
                    return true;
                })

                return false;
            }
            else {
                return false;
            }
        },
        errorString: "related_applications should be a non-empty array",
    },
    {
        infoString: "The prefer_related_applications member is a boolean value that specifies that applications listed in related_applications should be preferred over the web application. If the prefer_related_applications member is set to true, the user agent might suggest installing one of the related applications instead of this web app.",
        displayString: "Manifest properly sets prefer related applications field",
        category: "optional",
        testRequired: true,
        member: "prefer_related_applications",
        defaultValue: false,
        docsLink:
            "https://docs.pwabuilder.com/#/builder/manifest?id=prefer_related_applications-boolean",
        quickFix: false, // @ Justin Willis, I added this but left it false because idk how to do quick fixes lol.
        test: (value: any) => {
            return typeof(value)  === "boolean"
        },
        errorString: "prefer_related_applications should be set to a boolean value",
    },
    {
        infoString: "The categories member is an array of strings that represent the categories of the web application.",
        displayString: "Manifest has categories field",
        category: "optional",
        testRequired: true,
        member: "categories",
        defaultValue: [],
        docsLink:
            "https://docs.pwabuilder.com/#/builder/manifest?id=categories-array",
        quickFix: true,
        test: (value: any[]) => {
            let isGood;
            if(value){
                containsStandardCategory(value) && Array.isArray(value) 
                ? 
                isGood = true 
                : 
                isGood = false;
            }

            return isGood
        },
        errorString: "categories should be a non-empty array"
    },
    {
        member: "lang",
        displayString: "Manifest specifies a language",
        infoString: "The lang member is a string that represents the default language of your PWA.",
        category: "optional",
        defaultValue: "en",
        docsLink:
            "https://docs.pwabuilder.com/#/builder/manifest?id=lang-string",
        errorString: "lang should be set to a valid language code",
        quickFix: true,
        test: (value: string) =>
                value && typeof value === "string" && value.length > 0 && isValidLanguageCode(value)
    },
    {
        member: "dir",
        displayString: "Manifest specifies a default direction of text",
        infoString: "The dir member is a string that represents the default text direction of your PWA.",
        errorString: "dir must be one of the following strings: ltr, rtl, or auto",
        category: "optional",
        defaultValue: "ltr",
        docsLink:
            "https://docs.pwabuilder.com/#/builder/manifest?id=dir-string",
        quickFix: true,
        test: (value: string) =>
                value && typeof value === "string" && value.length > 0 && (value === "ltr" || value === "rtl" || value === "auto")
    },
    {
        member: "description",
        displayString: "Manifest has description field",
        infoString: "The description member is a string that represents the description of your PWA.",
        category: "optional",
        defaultValue: "",
        docsLink:
            "https://docs.pwabuilder.com/#/builder/manifest?id=description-string",
        errorString: "description must be a string with a length > 0",
        quickFix: true,
        test: (value: string) =>
            value && typeof value === "string" && value.length > 0,
    },
    {
        member: "description",
        displayString: "Description field doesn't have leading or trailing whitespace",
        testName: "whitespace",
        category: "required",
        errorString: "description should not have any leading or trailing whitespace",
        quickFix: true,
        test: (value: string) => {
            if (value.trim() !== value) {
                return false;
            }
            else {
                return true;
            }
        }
    },
    {
        member: "protocol_handlers",
        displayString: "Manifest has protocol handlers field",
        infoString: "The protocol_handlers member specifies an array of objects that are protocols which this web app can register and handle. Protocol handlers register the application in an OS's application preferences; the registration associates a specific application with the given protocol scheme. For example, when using the protocol handler mailto:// on a web page, registered email applications open.",
        category: "optional",
        defaultValue: [],
        docsLink:
            "https://docs.pwabuilder.com/#/builder/manifest?id=protocol_handlers-array",
        quickFix: true,
        errorString: "protocol_handlers should be a non-empty array",
        test: (value: any[]) => {
            const isArray = value && Array.isArray(value);

            return isArray;
        }
    },
    {
        member: "protocol_handlers",
        displayString: "Protocol handlers field has valid protocol",
        infoString: "The protocol_handlers member specifies an array of objects that are protocols which this web app can register and handle. Protocol handlers register the application in an OS's application preferences; the registration associates a specific application with the given protocol scheme. For example, when using the protocol handler mailto:// on a web page, registered email applications open.",
        category: "optional",
        defaultValue: [],
        docsLink:
            "https://docs.pwabuilder.com/#/builder/manifest?id=protocol_handlers-array",
        quickFix: true,
        errorString: "protocol_handlers should all be relative URLs that are within the scope of the app, should have a url and a valid protocol",
        test: (value: any[]) => {
            const isArray = value && Array.isArray(value);

            if (isArray) {
                const allValid = value.every((protocolHandler: any) => {
                    const isRelativeUrl = protocolHandler.url && protocolHandler.url.startsWith("/");
                    const hasProtocol = protocolHandler.protocol && protocolHandler.protocol.length > 0;
                    const isProtocolValid = hasProtocol && validProtocols.includes(protocolHandler.protocol);
                    const hasUrl = protocolHandler.url && protocolHandler.url.length > 0;

                    return isRelativeUrl && hasProtocol && hasUrl && isProtocolValid;
                });

                return allValid;
            }
            else {
                return false;
            }
        }
    },
    {
        member: "display_override",
        displayString: "Manifest has display override field",
        infoString: "Its value is an array of display modes that are considered in-order, and the first supported display mode is applied.",
        category: "optional",
        defaultValue: [],
        docsLink:
            "https://docs.pwabuilder.com/#/builder/manifest?id=display_override-array",
        quickFix: true,
        errorString: "display_override must be a non-empty array",
        test: (value: any[]) => {
            const isArray = value && Array.isArray(value);

            return isArray;
        }
    },
    {
        member: "id",
        displayString: "Manifest has an app ID",
        infoString: "The id member is a string that represents the unique identifier of your PWA to the browser.",
        category: "recommended",
        defaultValue: "/",
        docsLink: "https://developer.chrome.com/blog/pwa-manifest-id",
        errorString: "id must be a string with a length > 0",
        quickFix: true,
        test: (value: string) =>
            value && typeof value === "string" && value.length > 0,
    },
    {
        member: "launch_handler",
        displayString: "Manifest has launch handler field",
        infoString: "The launch_handler member specifies how your app will launch when navigated to via URL, share_target etc.",
        category: "recommended",
        defaultValue: "",
        docsLink: "https://developer.chrome.com/docs/web-platform/launch-handler/",
        errorString: "launch_handler should be defined",
        quickFix: false,
        test: (value: any) => {
            return value && typeof value === "object";
        }
    }
];

export async function loopThroughKeys(manifest: Manifest): Promise<Array<Validation>> {
    return new Promise((resolve) => {
        let data: Array<Validation> = [];
  
        const keys = Object.keys(manifest);
  
        keys.forEach((key) => {
            maniTests.forEach(async (test) => {
                if (test.member === key && test.test) {
                    const testResult = await test.test(manifest[key]);
  
    
                    if(testResult){
                      test.valid = true;
                      data.push(test);
                    }
                    else {
                      test.valid = false;
                      data.push(test);
                    }
                }
            })
        })
  
        resolve(data);
    })
  }
  
  export async function loopThroughRequiredKeys(manifest: Manifest): Promise<Array<Validation>> {
    return new Promise((resolve) => {
      let data: Array<Validation> = [];
  
      const keys = Object.keys(manifest);
  
      keys.forEach((key) => {
        maniTests.forEach(async (test) => {
          if (test.category === "required") {
            if (test.member === key && test.test) {
              const testResult = await test.test(manifest[key]);
  
              if (testResult === false) {
                test.valid = false;
                data.push(test);
              }
              else {
                test.valid = true;
                data.push(test);
              }
            }
          }
        })
      })
  
      resolve(data);
    })
  }
  
  export async function findSingleField(field: string, value: any): Promise<singleFieldValidation> {
    return new Promise(async (resolve) => {
  
      // For && operations, true is the base.
      let singleField = true;
      let failedTests: string[] | undefined = [];
  
      maniTests.forEach((test) => {
        if (test.member === field && test.test) {
        
          const testResult = test.test(value);
  
          if(!testResult){
            failedTests!.push(test.errorString!);
          }
  
          // If the test passes true && true = true.
          // If the test fails true && false = false
          // If a field has MULTIPLE tests, they will stack
          // ie: true (base) && true (test 1) && false (ie test 2 fails).
          singleField = singleField && testResult;
        }
      });
  
      if(singleField){
        resolve({"valid": singleField})
      }
  
      resolve({"valid": singleField, "errors": failedTests});
    })
  }