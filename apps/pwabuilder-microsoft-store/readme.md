# Microsoft.PWABuilder.Windows.Chromium

This project contains the source code for the PWABuilder Microsoft Store packaging service, which generates Store-ready .msix packages for Progressive Web Apps (PWAs). These packages can then be uploaded to [Microsoft Partner Center](https://partner.microsoft.com) for listing in the Microsoft Store.

This is implemented as a web API that takes a URL and generates an .msix app package. This .msix package can be installed on Windows devices and can optionally be uploaded to Partner Center for listing in the Microsoft Store.

## Running locally

To run this project locally requires Windows 10 version 2004 (May 2020 Update, Build 10.0.19041) or later.

You'll also need Windows SDK 10.0.19041.0 or later installed. appsettings.development.json has a WindowsSdkDirectory setting - you should modify this to point to your installed Windows SDK.

To run locally:

- For VSCode (preferred), open the root PWABuilder folder in VSCode, hit Debug -> Choose `launch.microsoft-package-generator` and hit F5.
- For Visual Studio, open PWABuilder.MicrosoftStore.csproj and hit F5.

## Production details

In deployed staging and production environments, this project is a Windows-based docker image that has the necessary Windows SDK components to run the package generation process. The docker image is built using GitHub Actions and pushed to the PWABuilder container registry.

## Modern, Classic, and Spartan packages

This project can generate 3 types of packages for the Microsoft Store.

- Modern packages (via ModernWindowsPackageCreator.cs). These are packages that use the [Hosted App model](https://blogs.windows.com/windowsdeveloper/2020/03/19/hosted-app-model/) on versions of Windows May 2020 update and later. These packages use Microsoft Edge as the host. These packages are built using Edge's pwa_builder.exe internal tool.
- Classic packages (via ClassicWindowsPackageCreator.cs). These packages are meant for use on versions of Windows prior to Windows 10 May 2020 Update. These packages use the legacy EdgeHTML engine as the host. These packages are built using the MakeAppx.exe tool that comes with the Windows SDK.
- Spartan packages (via SpartanWindowsPackageCreator.cs). These packages are meant for use on the now-obsolete version of Edge based on EdgeHTML, also known as Spartan. This is not used today and may be removed in the future.

PWABuilder.com today calls the `/msix/generateZip` endpoint, which creates a modern package and a classic package, and bundles them into a .zip file. Both packages can be uploaded to Partner Center. When a user installs your app from the Microsoft Store, the Store will install the appropriate package based on the version of Windows they are using.

## The API

The web API exposes these synchronous endpoints:

- `/msix/generateZip` - generates a zip file containing the .msixbundle file that runs on newer versions of Windows, a classic .appx package that runs on older versions of Windows, and a .sideload.msix package that can run locally on a developer's machine. This is the API called by pwabuilder.com's frontend.
- `/msix/generate` - generates a single .msix package
- `/msix/isPwaPackage` - checks whether the specific file is a PWA app package.
- `/msix/updatePackage` - updates the Package ID, Publisher ID, and Publisher Display Name of an existing PWA app package.
- `/msix/bundle` - accepts a .appx or .msix and creates a bundle file from it.
- `/msix/createPackageFromLoose` - accepts a .zip file containing loose layout app files (e.g. AppxManifest.xml, resources.pri, Images, etc.) and generates a .msix package from it.

An opt-in asynchronous packaging API is described in [Queued Windows packaging](#queued-windows-packaging-opt-in).

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

### Queued Windows packaging (opt-in)

The asynchronous API runs alongside `/msix/generateZip`; existing callers and response formats are unchanged. It is disabled by default. Enabling it requires provisioning Azure resources and configuring the service; deploying code alone does not enable it.

#### Resources and configuration

Use separate resources for production and staging even when both deployments set `ASPNETCORE_ENVIRONMENT=Production`. For example, provision the queues and Blob container in `pwabuildercommon`, and the job container in the existing Cosmos database:

- Queues `windows-package-jobs-prod` and `windows-package-jobs-prod-poison`; use `-nonprod` and `-nonprod-poison` for staging.
- A **private** Blob container `windows-package-jobs-prod` for `inputs/` and `artifacts/`.
- A **dedicated** Cosmos container `windows-package-jobs-prod`, partition key `/id`, default TTL `-1` (TTL enabled with per-document expiration), in the database configured by `AppSettings.CosmosDbDatabaseName`. Keep the default indexing policy for outbox queries. Do not reuse the package analytics container.

Grant the service's managed identity access to these specific resources: Storage Queue Data Contributor (including the poison queue), Storage Blob Data Contributor, and Cosmos DB Built-in Data Contributor for the job container. The existing `AppSettings.AzureManagedIdentityApplicationId` selects a user-assigned identity; omit it to use the system-assigned identity. Provision resources separately; workers do not create queues, Blob containers, or Cosmos containers.

Configure this top-level section through deployment settings (double underscores for environment variables):

```json
{
  "WindowsPackageJobs": {
    "Enabled": true,
    "QueueServiceUri": "https://pwabuildercommon.queue.core.windows.net",
    "QueueName": "windows-package-jobs-prod",
    "BlobServiceUri": "https://pwabuildercommon.blob.core.windows.net",
    "BlobContainerName": "windows-package-jobs-prod",
    "CosmosContainerName": "windows-package-jobs-prod",
    "RunWorkers": true,
    "WorkerCount": 1,
    "MaxAttempts": 3,
    "JobLifetimeHours": 168,
    "AttemptTimeoutMinutes": 30,
    "VisibilitySeconds": 120,
    "RenewalSeconds": 30,
    "PollSeconds": 2,
    "RetryDelaySeconds": 30
  }
}
```

`AppSettings.CosmosDbEndpoint` and `AppSettings.CosmosDbDatabaseName` must also be configured. `RenewalSeconds` must be at most one third of `VisibilitySeconds`. Retention and attempt deadlines are configurable; jobs are not discarded merely because a browser stopped polling.

Enable Blob lifecycle deletion for both `inputs/` and `artifacts/` after **at least `JobLifetimeHours / 24 + 1` days**, rounded up. This removes abandoned inputs, stale attempt artifacts, and completed downloads. Cosmos job TTL includes an additional day; the API enforces `ExpiresAt` independently of storage cleanup.

#### Calling the API

1. `POST /msix/enqueuePackageJob` with the same JSON options as `/msix/generateZip`. Optional `platform-identifier`, `platform-identifier-version`, `correlation-id`, and `?ref=` attribution are persisted with the job. A valid request returns **202 Accepted**, a job status body, a polling `Location`, and `Retry-After`.
2. `GET /msix/getPackageJob?id=<id>` returns `Queued`, `InProgress`, `Completed`, `Failed`, or `Expired`, plus timestamps, attempt count, and a safe error description. It does not expose the input manifest, options, logs, or storage paths.
3. `GET /msix/downloadPackageZip?id=<id>` streams the completed ZIP from private Blob Storage. It returns 409 if not completed, 410 if expired, or 404 for an unknown job.

Requests to the asynchronous API return 503 while the feature is disabled. Invalid packaging options return 400 before any job is accepted. Enqueue requests have a 2 MiB body limit.

Job IDs are random bearer capabilities: anyone with an ID can poll and download that job. Treat IDs and polling URLs as sensitive, use HTTPS, and do not publish them. The platform header is self-reported attribution, **not authentication**. Put partner authentication and rate limits at the gateway before enabling this for partner traffic. The API returns only safe error summaries; detailed failures remain in server logs.

#### Delivery, recovery, and scaling

Inputs are saved to Blob Storage, then a Cosmos job with a pending-dispatch flag is persisted before returning 202. A dispatcher retries pending records until their job-ID-only queue messages have been sent. A crash between sending and clearing the flag can duplicate delivery, but does not lose an accepted job.

Workers receive messages **without deleting them**, claim jobs through Cosmos ETag conditional writes, and renew both queue visibility and job ownership while building. Ownership loss, shutdown, expiration, and attempt deadlines cancel builds and their native child processes. A fresh DI scope owns each build's temporary files.

Artifacts are uploaded to attempt-specific Blob paths. The worker conditionally persists completion before acknowledging the latest queue receipt. Terminal redeliveries do not rebuild packages. This is **at-least-once**, not exactly-once execution: a crash can cause an unfinished attempt to run again. Failed attempts retry with bounded exponential delay; exhausted jobs are persisted as failed and copied to the poison queue before acknowledgement. Poison entries can duplicate and must not be automatically replayed without investigating the failure.

Keep the returned job ID and poll it rather than resubmitting the POST. Each new POST currently creates a new job; the correlation ID is tracing metadata, not a deduplication key.

Start with one queued build per Windows instance and tune against representative package sizes, widget builds, child-process memory/CPU, and temporary-disk usage. Scale on queue age/depth and resource usage. Legacy synchronous endpoints do not share this worker limit. For strict partner isolation, use a separate Windows deployment/compute plan. `RunWorkers=false` supports API-only instances; these still dispatch accepted jobs, while another enabled deployment with the same resource configuration must run workers.

Monitor pending-dispatch records, queue age/depth, failed renewal logs, poison deliveries, and terminal jobs by `PlatformId`. Do not configure a busy-but-healthy worker to restart solely because its queue has a backlog. Keep Windows instances warm and allow graceful shutdown; interrupted jobs recover through visibility/ownership expiration.

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
7. Trigger a new build of this solution in GitHub Actions. The build pipeline will pick up the new pwa_builder.zip file and inject it into the Docker image.

## Updating the classic Windows package template

The classic Windows package template file is located in `Resources\Windows\ClassicPackageTemplate.appx`.

The source code for this template is located in the `/ClassicPackage` directory.

The classic package also uses a special launcher executable. The source code for this launcher is located in the /`ClassicPackage.Launcher` directory.

The classic package is used for compatibility with versions of Windows prior to Windows 10 May 2020 Update. Long-term, the classic package will be deprecated once those versions of Windows are no longer supported by Microsoft.

## Sideloader source code

PWABuilder Microsoft Store packages include a sideloader app that allows users to test their PWA package locally before uploading to the Store.

The source code for this sideloader app is located in the `/Sideloader` directory.
