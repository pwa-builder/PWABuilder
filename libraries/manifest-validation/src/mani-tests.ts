import { Icon, RelatedApplication, Validation } from "./interfaces.js";
import { isAtLeast, isStandardOrientation, isValidLanguageCode, validProtocols, validateSingleRelatedApp } from "./utils/validation-utils.js";

import { widgetsSchema, fileHandlersSchema } from "./utils/values-schema.js";
import ajvModule from "ajv";
const Ajv = ajvModule.default;
const ajv = new Ajv({allErrors: true});

const widgetsValidator = ajv.compile(widgetsSchema);
const fileHandlersValidator = ajv.compile(fileHandlersSchema);

export const maniTests: Array<Validation> = [
    {
        infoString: "The name member is a string that represents the name of the web application as it is usually displayed to the user (e.g., amongst a list of other applications, or as a label for an icon)",
        displayString: "Manifest has name field",
        category: "required",
        member: "name",
        defaultValue: "cool PWA",
        docsLink: "https://docs.pwabuilder.com/#/builder/manifest?id=name-string",
        errorString: "",
        quickFix: true,
        test: function (value: string) {
            const exist = value && typeof value === "string" && value.length > 0;
            if (!exist) {
                this.errorString = "name is required and must be a string with a length > 0";
                return false;
            }
            const valid = value.trim() == value;
            if (!valid) {
                this.errorString = "name should not have any leading or trailing whitespace";
                return false;
            }
            return true;
        }
    },
    // {
    //     member: "name",
    //     testName: "whitespace",
    //     category: "required",
    //     displayString: "Name field doesn't have leading or trailing whitespace",
    //     errorString: "name should not have any leading or trailing whitespace",
    //     quickFix: true,
    //     test: function (value: string) {
    //         this.errorString = "name should not have any leading or trailing whitespace";
    //         if (value.trim() !== value) {
    //             return false;
    //         }
    //         else {
    //             return true;
    //         }
    //     }
    // },
    {
        infoString: "The handle_links field specifies how links to your app are opened, either in your app itself or in the users browser",
        displayString: "Manifest has handle_links field",
        category: "enhancement",
        member: "handle_links",
        defaultValue: "auto",
        docsLink: "https://docs.pwabuilder.com/#/builder/manifest?id=handle_links-string",
        errorString: "handle_links should be either auto, preferred or not-proferred",
        quickFix: true,
        test: (value: string) => {
            if (value && typeof value === "string") {
                if (value === "auto" || "preferred" || "not-preferred") {
                    return true;
                }
                else {
                    return false;
                }
            }
            else {
                return false;
            }
        }
    },
    {
        infoString: "share_target enables your app to get shared content from other apps",
        displayString: "Manifest has share_target field",
        category: "enhancement",
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
        docsLink: "https://docs.pwabuilder.com/#/home/native-features?id=web-share-api",
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
        errorString: "",
        quickFix: true,
        test: function (value: any[]) {
            const exist = value && Array.isArray(value) && value.length > 0 ? true : false;
            if (!exist) {
                this.errorString = "icons is required and must be non-empty array";
                return false;
            }
            // const anyIcon = value.find(icon => icon.purpose === "any");
            // if (!anyIcon) {
            //     this.errorString = "Need at least one icon with purpose set to any";
            //     return false;
            // }
            const wrongIcon = value.find(icon => icon.purpose === "any maskable");
            if (wrongIcon) {
                this.errorString = "Seperate Icons are needed for both maskable and any";
                return false;
            }
            const icon512 = value.find(icon => isAtLeast(icon.sizes, 512, 512) && (icon.type === 'image/png' || icon.src.endsWith(".png")));
            if (!icon512) {
                this.errorString = "Need at least one PNG icon 512x512 or larger";
                return false;
            }
            return true;
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
    // {
    //     infoString: "The icons member specifies an array of objects representing image files that can serve as application icons for different contexts.",
    //     displayString: "Icons have at least one PNG icon 512x512 or larger",
    //     category: "required",
    //     member: "icons",
    //     defaultValue: JSON.stringify([
    //         {
    //             "src": "https://www.pwabuilder.com/assets/icons/icon_192.png",
    //             "sizes": "192x192",
    //             "type": "image/png",
    //             "purpose": "any"
    //         },
    //         {
    //             "src": "https://www.pwabuilder.com/assets/icons/icon_512.png",
    //             "sizes": "512x512",
    //             "type": "image/png",
    //             "purpose": "maskable"
    //         }
    //     ]),
    //     docsLink: "https://docs.pwabuilder.com/#/builder/manifest?id=icons",
    //     errorString: "Need at least one PNG icon 512x512 or larger",
    //     quickFix: false,
    //     test: (value: any[]) => {
    //         const isArray = value && Array.isArray(value) && value.length > 0 ? true : false;

    //         if (isArray) {
    //             const anyIcon = value.find(icon => isAtLeast(icon.sizes, 512, 512) && (icon.type === 'image/png' || icon.src.endsWith(".png")));

    //             return anyIcon ? true : false;
    //         }
    //         else {
    //             return false;
    //         }
    //     }
    // },
    // {
    //     infoString: "The icons member specifies an array of objects representing image files that can serve as application icons for different contexts.",
    //     displayString: "Icons should have one icon with purpose set to any, and one for maskable",
    //     category: "required",
    //     member: "icons",
    //     defaultValue: JSON.stringify([
    //         {
    //             "src": "https://www.pwabuilder.com/assets/icons/icon_192.png",
    //             "sizes": "192x192",
    //             "type": "image/png",
    //             "purpose": "any"
    //         },
    //         {
    //             "src": "https://www.pwabuilder.com/assets/icons/icon_512.png",
    //             "sizes": "512x512",
    //             "type": "image/png",
    //             "purpose": "maskable"
    //         }
    //     ]),
    //     docsLink: "https://docs.pwabuilder.com/#/builder/manifest?id=icons",
    //     errorString: "Seperate Icons are needed for both maskable and any",
    //     quickFix: true,
    //     test: (value: any[]) => {
    //         const isArray = value && Array.isArray(value) && value.length > 0 ? true : false;

    //         if (isArray) {
    //             const wrongIcon = value.find(icon => icon.purpose === "any maskable");

    //             return wrongIcon ? false : true;
    //         }
    //         else {
    //             return false;
    //         }
    //     }
    // },
    {
        infoString: "The scope member is a string that represents the name of the web application as it is usually displayed to the user (e.g., amongst a list of other applications, or as a label for an icon)",
        displayString: "Manifest has scope field",
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
        infoString: "The short_name member is a string that represents the name of the web application displayed to the user if there is not enough space to display name. This name will show in the start menu on Windows and the homescreen on Android.",
        displayString: "Manifest has a short_name field",
        category: "required",
        member: "short_name",
        defaultValue: "placeholder",
        docsLink:
            "https://docs.pwabuilder.com/#/builder/manifest?id=short_name-string",
        errorString: "",
        quickFix: true,
        test: function (value: string) {
            const exist = value && value.length >= 3;
            if (!exist) {
                this.errorString = "short_name is required and must be a string with a length >= 3";
                return false;
            }
            const valid = value.trim() == value;
            if (!valid) {
                this.errorString = "short_name should not have any leading or trailing whitespace";
                return false;
            }

            return true;
        },
    },
    // {
    //     member: "short_name",
    //     displayString: "The short_name field doesn't have leading or trailing whitespace",
    //     testName: "whitespace",
    //     category: "required",
    //     errorString: "short_name should not have any leading or trailing whitespace",
    //     quickFix: true,
    //     test: (value: string) => {
    //         if (value.trim() !== value) {
    //             return false;
    //         }
    //         else {
    //             return true;
    //         }
    //     }
    // },
    {
        infoString: "The start_url member is a string that represents the start URL of the web application — the preferred URL that should be loaded when the user launches the web application",
        displayString: "Manifest has start_url field",
        category: "required",
        member: "start_url",
        defaultValue: "/",
        docsLink:
            "https://docs.pwabuilder.com/#/builder/manifest?id=start_url-string",
        errorString: "start_url is required and must be a string with a length > 0",
        quickFix: true,
        test: function(value: string) {
            const exist = value && typeof value === "string" && value.length > 0;
            if (!exist) {
                this.errorString = "start_url is required and must be a string with a length > 0";
                return false;
            }
            // TODO: write test for this
            const valid = true;
            if (!valid) {
                this.errorString = "start_url must be a valid URL, and must be relative to the app scope (if specified)";
                return false;
            }
            return true;
        }
    },
    // {
    //     infoString: "The start_url member is a string that represents the start URL of the web application — the preferred URL that should be loaded when the user launches the web application",
    //     displayString: "start_url is valid",
    //     category: "required",
    //     member: "start_url",
    //     defaultValue: "/",
    //     docsLink:
    //         "https://docs.pwabuilder.com/#/builder/manifest?id=start_url-string",
    //     errorString: "start_url is required and must be a string with a length > 0, must be a valid URL, and must be relative to the app scope (if specified)",
    //     quickFix: true,
    //     test: (value: string) => {
    //         if (value && typeof value === "string" && value.length > 0) {
    //             return true;
    //         }
    //         else {
    //             return false;
    //         }
    //     }
    // },
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
        displayString: "Manifest has hex encoded background_color",
        category: "recommended",
        testRequired: undefined,
        member: "background_color",
        defaultValue: "#000000",
        docsLink:
            "https://docs.pwabuilder.com/#/builder/manifest?id=background_color-string",
        errorString: "background_color should be a valid hex color",
        quickFix: true,
        test: function (value: string) {
            if (typeof value === "undefined") {
                this.testRequired = false;
                return false;
            }
            if (typeof value === "string") {
                const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
                this.testRequired = true;
                return hexRegex.test(value);
            }
            else {
                this.testRequired = true;
                return false;
            }
        },
    },
    {
        infoString: "The theme_color member is a string that defines the default theme color for the application.",
        displayString: "Manifest has hex encoded theme_color",
        category: "recommended",
        testRequired: undefined,
        member: "theme_color",
        defaultValue: "#000000",
        docsLink:
            "https://docs.pwabuilder.com/#/builder/manifest?id=theme_color-string",
        errorString: "theme_color should be a valid hex color",
        quickFix: true,
        test: function(value: string) {
            if (typeof value === "undefined") {
                this.testRequired = false;
                return false;
            }
            if (value && typeof value === "string") {
                const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
                this.testRequired = true;
                return hexRegex.test(value);
            }
            else {
                this.testRequired = true;
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
        category: "enhancement",
        member: "shortcuts",
        defaultValue: [],
        docsLink:
            "https://docs.pwabuilder.com/#/builder/manifest?id=shortcuts-array",
        errorString: "",
        quickFix: true,
        test: function(value: any) {
            const exist = value && Array.isArray(value) && value.length > 0 ? true : false;
            if (!exist) {
                this.errorString = "shortcuts must be an array with a length > 0";
                return false;
            }
            
            const supportedFormats = value.every((shortcut: {icons?: Icon[]}) => {
                // If there are no icons, then it cannot contain webp.
                if (!shortcut.icons) return true;
                // this returns TRUE if every icon in the shortcut does not have webp or svg.
                return shortcut.icons!.every((icon: Icon) => {
                    return icon.type !== "image/webp" && icon.type !== "image/svg+xml";
                });
            });
            if (!supportedFormats) {
                this.errorString = "shortcuts cannot contain icons with type image/webp or image/svg+xml";
                return false;
            }

            /* we use every here bc every shortcut needs at 
                least one icon with size 96x96 no  icons at all */
            const has96x96Icon = value.every((shortcut: {icons?: Icon[]}) => {
                if (!shortcut.icons) return true;
                // we use some here bc only one icon has to be that size
                return shortcut.icons!.some((icon: Icon) => {
                    return icon.sizes === "96x96";
                });
            });
            if (!has96x96Icon) {
                this.errorString = "One or more of your shortcuts has icons but does not have one with size 96x96";
                return false;
            }

            return true;
        }
    },
    // {
    //     infoString: "The shortcuts member defines an array of shortcuts or links to key tasks or pages within a web app. Shortcuts will show as jumplists on Windows and on the home screen on Android.",
    //     displayString: "Shortcuts have at least a 96x96 icon",
    //     category: "recommended",
    //     member: "shortcuts",
    //     defaultValue: [],
    //     docsLink:
    //         "https://docs.pwabuilder.com/#/builder/manifest?id=shortcuts-array",
    //     errorString: "One or more of your shortcuts has icons but does not have one with size 96x96",
    //     quickFix: false,
    //     test: (value: any[]) => {
    //         if (value && value.length === 0) return true;
    //         const isArray = value && Array.isArray(value);
    //         if (isArray) {
    //             /* we use every here bc every shortcut needs at 
    //             least one icon with size 96x96 no  icons at all */
    //             const has96x96Icon = value.every((shortcut) => {
    //                 if (!shortcut.icons) return true;
    //                 // we use some here bc only one icon has to be that size
    //                 return shortcut.icons!.some((icon: Icon) => {
    //                     return icon.sizes === "96x96";
    //                 });
    //             });
    //             return has96x96Icon;
    //         }
    //         else {
    //             return false;
    //         }
    //     }
    // },
    {
        infoString: "The iarc_rating_id member is a string that represents the International Age Rating Coalition (IARC) certification code of the web application. It is intended to be used to determine which ages the web application is appropriate for.",
        displayString: "Manifest has iarc_rating_id field",
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
        displayString: "Manifest has related_applications field",
        category: "optional",
        member: "related_applications",
        defaultValue: [],
        docsLink:
            "https://docs.pwabuilder.com/#/builder/manifest?id=related_applications-array",
        quickFix: true,
        test: (value: any[]) => {
            const isArray = value && Array.isArray(value);
            if (value && value.length === 0) return true;
            if (isArray) {
                let passed = value.every((app: RelatedApplication) => {
                    const check = validateSingleRelatedApp(app);
                    return check;
                });
                return passed;
            }
            else {
                return false;
            }
        },
        errorString: "related_applications should contain a valid store, url and id",
    },
    {
        infoString: "The prefer_related_applications member is a boolean value that specifies that applications listed in related_applications should be preferred over the web application. If the prefer_related_applications member is set to true, the user agent might suggest installing one of the related applications instead of this web app.",
        displayString: "Manifest properly sets prefer_related_applications field",
        category: "optional",
        testRequired: undefined,
        member: "prefer_related_applications",
        defaultValue: false,
        docsLink:
            "https://docs.pwabuilder.com/#/builder/manifest?id=prefer_related_applications-boolean",
        quickFix: false, // @ Justin Willis, I added this but left it false because idk how to do quick fixes lol.
        test: function(value: any) {
            if (typeof value === "undefined") {
                this.testRequired = false;
                return false;
            }
            this.testRequired = true;
            return typeof (value) === "boolean"
        },
        errorString: "prefer_related_applications should be set to a boolean value",
    },
    {
        infoString: "The categories member is an array of strings that represent the categories of the web application.",
        displayString: "Manifest has categories field",
        category: "optional",
        testRequired: undefined,
        member: "categories",
        defaultValue: [],
        docsLink:
            "https://docs.pwabuilder.com/#/builder/manifest?id=categories-array",
        quickFix: true,
        test: function(value: any[]) {
            if (typeof value === "undefined") {
                this.testRequired = false;
                return false;
            }
            this.testRequired = true;
            return value && Array.isArray(value) && value.length > 0;
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
        category: "recommended",
        defaultValue: "",
        docsLink:
            "https://docs.pwabuilder.com/#/builder/manifest?id=description-string",
        errorString: "",
        quickFix: true,
        test: function (value: string) {
            const exist = value && typeof value === "string" && value.length > 0;
            if (!exist) {
                this.errorString = "description must be a string with a length > 0";
                return false;
            }
            const valid = value.trim() == value;
            if (!valid) {
                this.errorString = "description should not have any leading or trailing whitespace";
                return false;
            }
            return true;
        }
    },
    // {
    //     member: "description",
    //     displayString: "Description field doesn't have leading or trailing whitespace",
    //     testName: "whitespace",
    //     category: "required",
    //     errorString: "description should not have any leading or trailing whitespace",
    //     quickFix: true,
    //     test: (value: string) => {
    //         if (value.trim() !== value) {
    //             return false;
    //         }
    //         else {
    //             return true;
    //         }
    //     }
    // },
    {
        member: "protocol_handlers",
        displayString: "Manifest has protocol_handlers field",
        infoString: "The protocol_handlers member specifies an array of objects that are protocols which this web app can register and handle. Protocol handlers register the application in an OS's application preferences; the registration associates a specific application with the given protocol scheme. For example, when using the protocol handler mailto:// on a web page, registered email applications open.",
        category: "optional",
        defaultValue: [],
        docsLink:
            "https://docs.pwabuilder.com/#/builder/manifest?id=protocol_handlers-array",
        quickFix: true,
        errorString: "",
        test: function(value: any[]) {
            const exist = value && Array.isArray(value);
            if (!exist) {
                this.errorString = "protocol_handlers should be a non-empty array";
                return false;
            }

            const valid = value.every((protocolHandler: any) => {
                const isRelativeUrl = protocolHandler.url && protocolHandler.url.startsWith("/");
                const hasProtocol = protocolHandler.protocol && protocolHandler.protocol.length > 0;
                const isProtocolValid = hasProtocol && (validProtocols.includes(protocolHandler.protocol) || protocolHandler.protocol.startsWith("web+"));
                const hasUrl = protocolHandler.url && protocolHandler.url.length > 0;

                return isRelativeUrl && hasProtocol && hasUrl && isProtocolValid;
            });
            if (!valid) {
                this.errorString = "protocol_handlers should all be relative URLs that are within the scope of the app, should have a url and a valid protocol";
                return false;
            }

            return true;
        }
    },
    // {
    //     member: "protocol_handlers",
    //     displayString: "Protocol handlers field has protocol",
    //     infoString: "The protocol_handlers member specifies an array of objects that are protocols which this web app can register and handle. Protocol handlers register the application in an OS's application preferences; the registration associates a specific application with the given protocol scheme. For example, when using the protocol handler mailto:// on a web page, registered email applications open.",
    //     category: "optional",
    //     defaultValue: [],
    //     docsLink:
    //         "https://docs.pwabuilder.com/#/builder/manifest?id=protocol_handlers-array",
    //     quickFix: true,
    //     errorString: "protocol_handlers should all be relative URLs that are within the scope of the app, should have a url and a valid protocol",
    //     test: (value: any[]) => {
    //         const isArray = value && Array.isArray(value);

    //         if (isArray) {
    //             const allValid = value.every((protocolHandler: any) => {
    //                 const isRelativeUrl = protocolHandler.url && protocolHandler.url.startsWith("/");
    //                 const hasProtocol = protocolHandler.protocol && protocolHandler.protocol.length > 0;
    //                 const isProtocolValid = hasProtocol && (validProtocols.includes(protocolHandler.protocol) || protocolHandler.protocol.startsWith("web+"));
    //                 const hasUrl = protocolHandler.url && protocolHandler.url.length > 0;

    //                 return isRelativeUrl && hasProtocol && hasUrl && isProtocolValid;
    //             });

    //             return allValid;
    //         }
    //         else {
    //             return false;
    //         }
    //     }
    // },
    {
        member: "file_handlers",
        displayString: "Manifest has file_handlers field",
        infoString: "The file_handlers member specifies an array of objects representing the types of files an installed PWA can handle",
        category: "enhancement",
        defaultValue: [],
        docsLink:
            "https://docs.pwabuilder.com/#/builder/manifest?id=file_handlers-array",
        quickFix: true,
        errorString: "file_handlers array should have objects with action and accept fields",
        test: (value: any[]) => {
            const validation = fileHandlersValidator(value);
            // fileHandlersValidator.errors
            return validation;
        }
    },
    {
        member: "display_override",
        displayString: "Manifest has display_override field",
        infoString: "Its value is an array of display modes that are considered in-order, and the first supported display mode is applied.",
        category: "enhancement",
        defaultValue: [],
        docsLink:
            "https://docs.pwabuilder.com/#/builder/manifest?id=display_override-array",
        quickFix: true,
        errorString: "",
        test: function(value: any[]) {
            const exist = value && Array.isArray(value);
            if (!exist) {
                this.errorString = "display_override must be a non-empty array";
                return false;
            }

            const valid = value.some(override => override == 'window-controls-overlay');
            if (!valid) {
                this.errorString = "display_override array should have window-controls-overlay value";
                return false;
            }

            return true;
        }
    },
    // {
    //     member: "display_override",
    //     displayString: "Manifest has display_override with window-controls-overlay",
    //     infoString: "This display mode only applies when the application is in a separate PWA window and on a desktop operating system. The application will opt-in to the Window Controls Overlay feature, where the full window surface area will be available for the app's web content",
    //     category: "recommended",
    //     defaultValue: [],
    //     docsLink:
    //         "https://docs.pwabuilder.com/#/builder/manifest?id=display_override-array",
    //     quickFix: true,
    //     errorString: "display_override array should have window-controls-overlay value",
    //     test: (value: any[]) => {
    //         return value && Array.isArray(value) && value.some(override => override == 'window-controls-overlay');
    //     }
    // },
    {
        member: "scope_extensions",
        displayString: "Manifest has scope_extensions field",
        infoString: "Allow PWA that control multiple subdomains and top level domains to behave as one contiguous app. E.g. a site may span example.com, example.co.uk and support.example.com",
        category: "optional",
        defaultValue: [],
        docsLink:
            "https://docs.pwabuilder.com/#/builder/manifest?id=scope_extensions-array",
        quickFix: true,
        errorString: "scope_extensions should be a valid array with origin",
        test: (value: any[]) => {
            const isArray = value && Array.isArray(value);

            if (isArray) {
                const allValid = value.every((extensions: any) => {
                    return typeof extensions == 'object' && typeof extensions.origin == 'string';
                });

                return allValid;
            }
            else {
                return false;
            }
        }
    },
    {
        member: "widgets",
        displayString: "Manifest has widgets field",
        infoString: "Enable Windows 11 widgets board support",
        category: "enhancement",
        defaultValue: [],
        docsLink:
            "https://learn.microsoft.com/en-us/microsoft-edge/progressive-web-apps-chromium/how-to/widgets",
        quickFix: true,
        errorString: "widgets should be an array of valid objects",
        test: (value: unknown[]) => {
            const validation = widgetsValidator(value);
            // widgetsValidator.errors;
            return validation;
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
        displayString: "Manifest has launch_handler field",
        infoString: "The launch_handler member specifies how your app will launch when navigated to via URL, share_target etc.",
        category: "recommended",
        defaultValue: "",
        docsLink: "https://docs.pwabuilder.com/#/builder/manifest?id=launch_handlers-string-array",
        errorString: "",
        quickFix: false,
        test: function(value: any) {
            const exist = value && typeof value === "object";
            if (!exist) {
                this.errorString = "launch_handler should be object";
                return false;
            }
            const valid = value.client_mode;
            if (!valid) {
                this.errorString = "launch_handler should have client_mode";
                return false;
            }
            
            return true;
        }
    },
    {
        member: "edge_side_panel",
        displayString: "Manifest has edge_side_panel field",
        infoString: "The edge_side_panel member specifies if your app supports the side panel in the Edge browser.",
        category: "enhancement",
        defaultValue: "",
        docsLink: "https://learn.microsoft.com/microsoft-edge/progressive-web-apps-chromium/how-to/sidebar",
        errorString: "The value entered for edge_side_panel.preferred_width should be a number",
        quickFix: false,
        test: (value: any) => {
            let valid: boolean = value && typeof value === "object";
            valid = valid && (typeof value.preferred_width === "number" || !value.hasOwnProperty("preferred_width"));
            return valid;
        }
    }
];
