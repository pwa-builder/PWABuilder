# Microsoft.PWABuilder.Windows.Chromium

This project contains the source code for the PWABuilder Microsoft Store packaging service, which generates Store-ready .msix packages for Progressive Web Apps (PWAs). These packages can then be uploaded to [Microsoft Partner Center](https://partner.microsoft.com) for listing in the Microsoft Store.

This is implemented as a web API that takes a URL and generates an .msix app package. This .msix package can be installed on Windows devices and can optionally be uploaded to Partner Center for listing in the Microsoft Store.

## Running locally

To run this project locally requires Windows 10 version 2004 (May 2020 Update, Build 10.0.19041) or later.

You'll also need Windows SDK 10.0.19041.0 or later installed. appsettings.development.json has a WindowsSdkDirectory setting - you should modify this to point to your installed Windows SDK.

## Modern, Classic, and Spartan packages

This project can generate 3 types of packages for the Microsoft Store.

- Modern packages (via ModernWindowsPackageCreator.cs). These are packages that use the [Hosted App model](https://blogs.windows.com/windowsdeveloper/2020/03/19/hosted-app-model/) on versions of Windows May 2020 update and later. These packages use Microsoft Edge as the host. These packages are built using Edge's pwa_builder.exe internal tool.
- Classic packages (via ClassicWindowsPackageCreator.cs). These packages are meant for use on versions of Windows prior to Windows 10 May 2020 Update. These packages use the legacy EdgeHTML engine as the host. These packages are built using the MakeAppx.exe tool that comes with the Windows SDK.
- Spartan packages (via SpartanWindowsPackageCreator.cs). These packages are meant for use on the now-obsolete version of Edge based on EdgeHTML, also known as Spartan. This is not used today and may be removed in the future.

PWABuilder.com today calls the `/msix/generateZip` endpoint, which creates a modern package and a classic package, and bundles them into a .zip file. Both packages can be uploaded to Partner Center. When a user installs your app from the Microsoft Store, the Store will install the appropriate package based on the version of Windows they are using.

## The API

The web API exposes 6 endpoints:

- `/msix/generateZip` - generates a zip file containing the .msixbundle file that runs on newer versions of Windows, a classic .appx package that runs on older versions of Windows, and a .sideload.msix package that can run locally on a developer's machine. This is the API called by pwabuilder.com's frontend.
- `/msix/generate` - generates a single .msix package
- `/msix/isPwaPackage` - checks whether the specific file is a PWA app package.
- `/msix/updatePackage` - updates the Package ID, Publisher ID, and Publisher Display Name of an existing PWA app package.
- `/msix/bundle` - accepts a .appx or .msix and creates a bundle file from it.
- `/msix/createPackageFromLoose` - accepts a .zip file containing loose layout app files (e.g. AppxManifest.xml, resources.pri, Images, etc.) and generates a .msix package from it.

## Usage

### `/msix/generate` or `/msix/generateZip`

To call `create` or `createZip`, issue a HTTP POST to `/msix/generate` or `/msix/generateZip` with the following body:

```json
{
    "name": "Sad Chonks",
    "packageId": "ChonkCompany.SadChonks",
    "applicationId": "ChonkCompany.SadChonks",
    "url": "https://sadchonks.com",
    "version": "1.1.0",
    "allowSigning": true,
    "publisher": {
        "displayName": "Chonk Company, Inc.",
        "commonName": "CN=3a54a224-05dd-42aa-85bd-3f3c1478fdca",
    },
    "generateModernPackage": true,
    "classicPackage": {
        "generate": true,
        "version": "1.0.5",
        "url": "https://sadchonks.com?v=classic-win"
    },
    "edgeHtmlPackage": {
        "generate": false,
        "version": "1.0.0",
        "url": "https://sadchonks.com?v=legacy-edge-html"
    },
    "edgeChannel": "stable",
    "edgeLaunchArgs": "--ignore-certificate-errors --unsafely-treat-insecure-origin-as-secure=* --auto-select-desktop-capture-source=\"Entire screen\"",
    "appUserModelId": "Microsoft.MicrosoftEdge.stable_8wekyb3d8bbwe!MSEDGE",
    "manifestUrl": "https://sadchonks.com/manifest.json",
    "startUrl": "https://sadchonks.com/saved",
    "resourceLanguage": "EN-US",
    "usePwaBuilderWithCustomManifest": false,
    "manifest": {
        "short_name": "Chonks",
        "name": "Sad Chonks",
        "icons": [{
            "src": "/favicon.png",
            "type": "image/png",
            "sizes": "128x128"
        }, {
            "src": "/kitteh-192.png",
            "type": "image/png",
            "sizes": "192x192"
        }, {
            "src": "/kitteh-512.png",
            "type": "image/png",
            "sizes": "512x512"
        }],
        "start_url": "/saved",
        "background_color": "#3f51b5",
        "display": "standalone",
        "scope": "/",
        "theme_color": "#3f51b5",
        "shortcuts": [{
            "name": "New Chonks",
            "short_name": "New",
            "url": "/?shortcut",
            "icons": [{
                "src": "/favicon.png",
                "sizes": "128x128"
            }]
        }, {
            "name": "Saved Chonks",
            "short_name": "Saved",
            "url": "/saved?shortcut",
            "icons": [{
                "src": "/favicon.png",
                "sizes": "128x128"
            }]
        }]
    },
    "images": {
        "baseImage": "https://sadchonks.com/kitteh-512.png",
        "backgroundColor": "transparent",
        "padding": 0.3,
        "splashScreen": {
            "image": "https://someurl.com/image-620x300.png",
            "image125": "https://someurl.com/image-775x375.png",
            "image150": "https://someurl.com/image-930x450.png",
            "image200": "https://someurl.com/image-1280x600.png",
            "image400": "https://someurl.com/image-2480x1200.png"
        },
        "appIcon": {
            "image": "https://someurl.com/image-44x44.png",
            "image125": "https://someurl.com/image-55x55.png",
            "image150": "https://someurl.com/image-66x66.png",
            "image200": "https://someurl.com/image-88x88.png",
            "image400": "https://someurl.com/image-176x176.png"
        },
        "smallTile": {
            "image": "https://someurl.com/image-71x71.png",
            "image125": "https://someurl.com/image-89x89.png",
            "image150": "https://someurl.com/image-107x107.png",
            "image200": "https://someurl.com/image-142x142.png",
            "image400": "https://someurl.com/image-284x284.png"
        },
        "mediumTile": {
            "image": "https://someurl.com/image-150x150.png",
            "image125": "https://someurl.com/image-188x188.png",
            "image150": "https://someurl.com/image-255x255.png",
            "image200": "https://someurl.com/image-300x300.png",
            "image400": "https://someurl.com/image-600x600.png"
        },
        "largeTile": {
            "image": "https://someurl.com/image-310x310.png",
            "image125": "https://someurl.com/image-388x388.png",
            "image150": "https://someurl.com/image-465x465.png",
            "image200": "https://someurl.com/image-620x620.png",
            "image400": "https://someurl.com/image-1240x1240.png"
        },
        "wideTile": {
            "image": "https://someurl.com/image-310x150.png",
            "image125": "https://someurl.com/image-388x188.png",
            "image150": "https://someurl.com/image-465x225.png",
            "image200": "https://someurl.com/image-620x300.png",
            "image400": "https://someurl.com/image-1240x600.png"
        },
        "storeLogo": {
            "image": "https://someurl.com/image-50x50.png",
            "image125": "https://someurl.com/image-63x63.png",
            "image150": "https://someurl.com/image-75x75.png",
            "image200": "https://someurl.com/image-100x100.png",
            "image400": "https://someurl.com/image-200x200.png"
        },
        "appIcon16": {
            "image": "https://someurl.com/image-16x16.png",
            "imageLightTheme": "https://someurl.com/image-light-16x16.png",
            "imageUnplated": "https://someurl.com/image-unplated-16x16.png"
        },
        "appIcon24": {
            "image": "https://someurl.com/image-24x24.png",
            "imageLightTheme": "https://someurl.com/image-light-24x24.png",
            "imageUnplated": "https://someurl.com/image-unplated-24x24.png"
        },
        "appIcon48": {
            "image": "https://someurl.com/image-48x48.png",
            "imageLightTheme": "https://someurl.com/image-light-48x48.png",
            "imageUnplated": "https://someurl.com/image-unplated-48x48.png"
        },
        "appIcon256": {
            "image": "https://someurl.com/image-256x256.png",
            "imageLightTheme": "https://someurl.com/image-light-256x256.png",
            "imageUnplated": "https://someurl.com/image-unplated-256x256.png"
        }
    }
}
```

The following fields are required: `version`, `url`, `packageId`. All other fields are optional.

Note the `usePwaBuilderWithCustomManifest` flag can be used to use a different manifest than the one used by the PWA. This can be used for testing manifests for non-public websites or non-public manifests, or to force a different manifest for an existing site. If the flag is set to true, the package will be created using the manifest specified by `manifestUrl`, disregarding the manifest actually used by the site. This is discouraged as it can cause problems related to app identity - speak to Mustapaha Jaber for more details - but it can be useful in creating prototypes or test packages. It does this using the old v91 of pwa_builder.exe tool.

### `/msix/isPwaPackage`

Issue an HTTP POST to `/msix/isPwaPackage` with a form file (JS `File` or `Blob`) containing the package you wish to inspect.

The result will be a `bool` indicating whether the file is a PWA app package.

### `/msix/updatePackage`

Issue an HTTP POST to `/msix/updatePackage` with a form containing:

| Form field   | Type     | Description |
|--------------|-----------|------------|
| package      | `File` \| `Blob`  | The PWA package to update. This can be a .appx, .msix, .appxbundle, or .msixbundle. |
| packageId      | `string`  | The desired package ID. Partner Center calls this "Package/Identity/Name"       |
| publisherId      | `string`  | The desired publisher ID. Partner Center calls this "Package/Identity/Publisher"       |
| publisherDisplayName      | `string`  | The desired publisher display name. Partner Center calls this "Package/Properties/PublisherDisplayName"       |

The result will be a new PWA app package (File or Blob in Javascript) with the updated information.

### `/msix/bundle`

Bundles a .msix or .appx into a .msixbundle or .appxbundle.

Issue an HTTP POST to `/msix/bundle` with a form containing:

| Form field   | Type     | Description |
|--------------|-----------|------------|
| package      | `File` \| `Blob`  | The package to bundle. This should be an .appx or .msix file. |
| version      | `string`  | The desired bundle version. This should match the .appx or .msix version.       |

The result will be a .msixbundle or .appxbundle file.

### `/msix/createPackageFromLoose`

Creates a .msix file from a [loose file layout](https://docs.microsoft.com/en-us/windows/uwp/debug-test-perf/loose-file-registration#what-is-a-loose-file-layout).

Issue an HTTP POST to `/msix/createFromLoose` with a form containing:

| Form field   | Type     | Description |
|--------------|-----------|------------|
| LooseFileLayoutZip      | `File` \| `Blob`  | A zip file containing the loose file layout of the app. Loose file layouts should contain files like AppxManifest.xml, resources.pri, etc. See [details here](https://docs.microsoft.com/en-us/windows/uwp/debug-test-perf/loose-file-registration#what-is-a-loose-file-layout). |

The result will be a .msixbundle or .appxbundle file.

## The pwa_builder.exe tool

The pwa_builder.exe tool is an internal command-line tool built by the Microsoft Edge team to generate Hosted App web packages that rely on Edge and can be uploaded to Partner Center and published as apps in the Microsoft Store.

This tool is not publicly available.

The tool is injected into Resources\cli\pwa\pwabuilder folder at build time by GitHub Actions build pipeline. If you need access to it to run this solution locally, grab the file from the `pwabuildercommon` Azure Storage account, inside the `resources` directory.

To upgrade to the latest pwa_builder.exe tool:

1. Go to [Edge's Nuget feed](https://dev.azure.com/microsoft/Edge/_artifacts/feed/edge)
2. Filter by "pwa"
3. Choose the `pwa_builder` feed.
4. Click `Download` to download the latest Nuget package containing the pwa_builder.exe tool.
5. Rename the file to `pwa__builder.zip`
6. Upload to the `pwabuildercommon` Azure Storage account, inside the `resources` directory, overwriting the existing `pwa_builder.zip` file.
