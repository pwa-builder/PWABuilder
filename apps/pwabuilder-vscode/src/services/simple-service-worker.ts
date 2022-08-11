import * as vscode from "vscode";
import { getAnalyticsClient } from "./usage-analytics";

let existingWorker: vscode.Uri | undefined = undefined;

const simple_worker = `
    // Based off of https://github.com/pwa-builder/PWABuilder/blob/main/docs/sw.js

    const HOSTNAME_WHITELIST = [
        self.location.hostname,
        'fonts.gstatic.com',
        'fonts.googleapis.com',
        'cdn.jsdelivr.net'
    ]

    // The Util Function to hack URLs of intercepted requests
    const getFixedUrl = (req) => {
        var now = Date.now()
        var url = new URL(req.url)

        // 1. fixed http URL
        // Just keep syncing with location.protocol
        // fetch(httpURL) belongs to active mixed content.
        // And fetch(httpRequest) is not supported yet.
        url.protocol = self.location.protocol

        // 2. add query for caching-busting.
        // Github Pages served with Cache-Control: max-age=600
        // max-age on mutable content is error-prone, with SW life of bugs can even extend.
        // Until cache mode of Fetch API landed, we have to workaround cache-busting with query string.
        // Cache-Control-Bug: https://bugs.chromium.org/p/chromium/issues/detail?id=453190
        if (url.hostname === self.location.hostname) {
            url.search += (url.search ? '&' : '?') + 'cache-bust=' + now
        }
        return url.href
    }

    /**
     *  @Lifecycle Activate
     *  New one activated when old isnt being used.
     *
     *  waitUntil(): activating ====> activated
     */
    self.addEventListener('activate', event => {
      event.waitUntil(self.clients.claim())
    })

    /**
     *  @Functional Fetch
     *  All network requests are being intercepted here.
     *
     *  void respondWith(Promise<Response> r)
     */
    self.addEventListener('fetch', event => {
    // Skip some of cross-origin requests, like those for Google Analytics.
    if (HOSTNAME_WHITELIST.indexOf(new URL(event.request.url).hostname) > -1) {
        // Stale-while-revalidate
        // similar to HTTP's stale-while-revalidate: https://www.mnot.net/blog/2007/12/12/stale
        // Upgrade from Jake's to Surma's: https://gist.github.com/surma/eb441223daaedf880801ad80006389f1
        const cached = caches.match(event.request)
        const fixedUrl = getFixedUrl(event.request)
        const fetched = fetch(fixedUrl, { cache: 'no-store' })
        const fetchedCopy = fetched.then(resp => resp.clone())

        // Call respondWith() with whatever we get first.
        // If the fetch fails (e.g disconnected), wait for the cache.
        // If there’s nothing in cache, wait for the fetch.
        // If neither yields a response, return offline pages.
        event.respondWith(
        Promise.race([fetched.catch(_ => cached), cached])
            .then(resp => resp || fetched)
            .catch(_ => { /* eat any errors */ })
        )

        // Update the cache with the version we fetched (only for ok status)
        event.waitUntil(
        Promise.all([fetchedCopy, caches.open("pwa-cache")])
            .then(([response, cache]) => response.ok && cache.put(event.request, response))
            .catch(_ => { /* eat any errors */ })
        )
    }
    })
`;

export async function handleServiceWorkerCommand() {
    const analyticsClient = getAnalyticsClient();
    analyticsClient.trackEvent({
        name: "generate",
        properties: { type: "service-worker" }
    });

    // first, check if the service worker already exists
    const existing_worker = await findWorker();
    if (existing_worker) {
        // ask user if they want to overwrite
        const overwrite = await vscode.window.showWarningMessage(
            "A service worker already exists. Do you want to overwrite it?",
            "Yes",
            "No"
        );

        if (overwrite === "No") {
            return;
        }
        else {
            await generateServiceWorker();
            await handleAddingToIndex();

            await vscode.commands.executeCommand("pwa-studio.refreshSWView");
            return;
        }
    }
    else {
        await generateServiceWorker();
        await handleAddingToIndex();

        await vscode.commands.executeCommand("pwa-studio.refreshSWView");
        return;
    }
}

export async function generateServiceWorker(): Promise<vscode.Uri | undefined> {
    // ask user where they want to save the service worker
    const save_location = await vscode.window.showSaveDialog({
        defaultUri: vscode.Uri.file("service-worker.js"),
        filters: {
            "Javascript": ["js"],
            "Typescript": ["ts"]
        },
        saveLabel: "Save your Service Worker?"
    });

    if (!save_location) {
        // user cancelled, so we should cancel
        return;
    }

    // create the service worker
    const serviceWorker = await getServiceWorkerContents();

    if (serviceWorker) {
        await vscode.workspace.fs.writeFile(save_location, new TextEncoder().encode(serviceWorker));
        existingWorker = save_location;

        await vscode.window.showTextDocument(save_location);

        return existingWorker;
    }
}

async function handleAddingToIndex(): Promise<void> {
    let indexFile: undefined | vscode.Uri;
    const indexFileData = await vscode.workspace.findFiles(
        "**/index.html",
        "**/node_modules/**"
    );

    if (indexFileData && indexFileData.length > 0) {
        indexFile = indexFileData[0];
    } else {
        let indexFileDialogData = await vscode.window.showOpenDialog({
            canSelectFiles: true,
            canSelectFolders: false,
            canSelectMany: false,
            title: "Select your index.html",
            filters: {
                HTML: ["html"],
            },
        });

        if (indexFileDialogData) {
            indexFile = indexFileDialogData[0];
        }
    }


    if (existingWorker) {
        const goodPath = vscode.workspace.asRelativePath(existingWorker.fsPath);

        const registerCommand = `<script>navigator.serviceWorker.register("${goodPath}")</script> \n`;

        if (indexFile) {
            const editor = await vscode.window.showTextDocument(indexFile);

            // find head in index file
            const start = editor.document.positionAt(
                editor.document.getText().indexOf("</head>")
            );
            // insert registerCommand in head
            editor.insertSnippet(
                new vscode.SnippetString(registerCommand),
                start.translate(-1, 0)
            );

            vscode.window.showInformationMessage(
                "Service Worker added to index.html"
            );

        }
    }
}

export function getWorker():
    | vscode.Uri
    | PromiseLike<vscode.Uri>
    | vscode.Uri[]
    | undefined {
    return existingWorker;
}

export async function findWorker(): Promise<any | undefined> {
    return new Promise<vscode.Uri | undefined>(async (resolve, reject) => {
        try {
            const advWorker = await vscode.workspace.findFiles(
                "**/pwabuilder-adv-sw.js"
            );

            if (advWorker.length > 0) {
                existingWorker = advWorker[0];
            } else {
                const worker = await vscode.workspace.findFiles("**/sw.js");

                if (worker.length > 0) {
                    existingWorker = worker[0];
                } else {
                    const workerTryTwo = await vscode.workspace.findFiles(
                        "**/pwabuilder-sw.ts"
                    );

                    if (workerTryTwo.length > 0) {
                        existingWorker = workerTryTwo[0];
                    } else {
                        const workerTryThree = await vscode.workspace.findFiles(
                            "**/service-worker.js"
                        );
                        if (workerTryThree.length > 0) {
                            existingWorker = workerTryThree[0];
                        }
                    }
                }
            }

            if (existingWorker) {
                // do refreshPackageView command
                await vscode.commands.executeCommand("pwa-studio.refreshPackageView");

                resolve(existingWorker);
            } else {
                // await vscode.commands.executeCommand("pwa-studio.refreshPackageView");
                resolve(undefined);
            }
        } catch (err) {
            reject(`Error adding service worker to index file: ${err}`);
        }
    });
}

async function getServiceWorkerContents(): Promise<string | undefined> {
    return new Promise<string | undefined>(async (resolve, reject) => {
        try {
            resolve(simple_worker);
        } catch (err) {
            reject(`Error getting service worker contents: ${err}`);
        }
    });
}

export async function chooseServiceWorker(): Promise<void> {
    const serviceWorker = await vscode.window.showOpenDialog({
        canSelectFiles: true,
        canSelectFolders: false,
        canSelectMany: false,
        title: "Select your Service Worker",
        filters: {
            JavaScript: ["js", "ts"],
        },
    });

    if (serviceWorker) {
        existingWorker = serviceWorker[0];
    }
}