import { writeFile } from "fs/promises";
import * as vscode from "vscode";
import { injectManifest } from "workbox-build";
import { isNpmInstalled, noNpmInstalledWarning } from "../new-pwa-starter";

import { getAnalyticsClient } from "../usage-analytics";
import { findWorker, handleAddingToIndex } from "./service-worker";

const vsTerminal = vscode.window.createTerminal();

let existingWorker: any | undefined = undefined;

// Advanced Service Worker file content
const advSW = `
  import { precacheAndRoute } from 'workbox-precaching/precacheAndRoute';
  precacheAndRoute(self.__WB_MANIFEST);
`;

export async function updateAdvServiceWorker(): Promise<void> {
    let swFileDialogData = await vscode.window.showOpenDialog({
        canSelectFiles: true,
        canSelectFolders: false,
        canSelectMany: false,
        title: "Select your Service Worker",
        filters: {
            JavaScript: ["js"],
        },
    });

    if (swFileDialogData) {
        // user can only have one Service Worker,
        // so no need to loop through the array
        let swFile = swFileDialogData[0];

        vscode.window.showInformationMessage("Updating your precache manifest");

        const buildDir = await vscode.window.showOpenDialog({
            canSelectFiles: false,
            canSelectFolders: true,
            canSelectMany: false,
            title: "Select your build directory",
        });

        if (buildDir) {
            const swSrc = swFile.fsPath;
            const swDest = swFile.fsPath;

            try {
                await injectManifest({
                    swSrc,
                    swDest,
                    globDirectory: buildDir[0].fsPath,
                });
            } catch (err) {
                await Promise.reject(err);
            }
        } else {
            vscode.window.showErrorMessage(
                "You must choose a build directory, normally this is either dist, public or build"
            );
        }
    }
}

export async function handleAdvServiceWorkerCommand(): Promise<void> {
    const uri = await vscode.window.showSaveDialog({
        title: "Where would you like to save your new Service Worker to?",
        defaultUri: vscode.workspace.workspaceFolders
            ? vscode.Uri.file(
                `${vscode.workspace.workspaceFolders[0].uri.fsPath}/pwabuilder-adv-sw.js`
            )
            : undefined,
    });

    const buildDir = await vscode.window.showOpenDialog({
        canSelectFiles: false,
        canSelectFolders: true,
        canSelectMany: false,
        title: "Select your build directory",
    });

    if (uri && buildDir) {
        const advSWFileWatcher = vscode.workspace.createFileSystemWatcher(
            "**/pwabuilder-adv-sw.js"
        );

        advSWFileWatcher.onDidCreate(async (uri) => {
            if (uri) {
                advSWFileWatcher.dispose();
                await handleAddingToIndex();
            }
        });

        vscode.window.showInformationMessage(
            "Writing a new service worker to your PWA..."
        );

        try {
            await writeFile(uri.fsPath, advSW);

            vscode.window.showInformationMessage(
                "Installing the needed dependencies and Injecting a precache manifest"
            );

            vsTerminal.show();
            vsTerminal.sendText("npm install workbox-precaching");

            const swSrc = uri.fsPath;
            const swDest = uri.fsPath;
            try {
                await injectManifest({
                    swSrc,
                    swDest,
                    globDirectory: buildDir[0].fsPath,
                });
            } catch (err) {
                console.error("error", err);
            }

            vscode.window.showInformationMessage(
                "Your Service Worker will now precache your assets. Remember to tap the `Update Precache Manifest` button when you do a new build of your PWA"
            );
        } catch (err) {
            await vscode.window.showErrorMessage(
                `Error writing file to your PWA: ${err}`
            );
        }
    }
}

export async function handleServiceWorkerCommandAdv(): Promise<void> {
    const analyticsClient = getAnalyticsClient();
    analyticsClient.trackEvent({
        name: "generate",
        properties: { type: "service-worker" }
    });

    //setup file watcher for workbox config file
    const watcher = vscode.workspace.createFileSystemWatcher(
        "**/workbox-config.js"
    );

    const swFileWatcher = vscode.workspace.createFileSystemWatcher("**/sw.js");

    swFileWatcher.onDidCreate(async (uri) => {
        if (uri) {
            swFileWatcher.dispose();
            await handleAddingToIndex();
        }
    });

    swFileWatcher.onDidChange(async (uri) => {
        if (uri) {
            swFileWatcher.dispose();
            await handleAddingToIndex();
        }
    });

    watcher.onDidCreate((uri) => {
        if (uri) {
            watcher.dispose();
            generateServiceWorker();
        }
    });

    watcher.onDidChange((uri) => {
        if (uri) {
            watcher.dispose();
            generateServiceWorker();
        }
    });

    handleAdvServiceWorkerCommand();
}

export function generateServiceWorker(): void {
    vsTerminal.show();

    vscode.window.withProgress(
        {
            location: vscode.ProgressLocation.Notification,
        },
        async (progress) => {
            progress.report({ message: "Generating Service Worker..." });
            vsTerminal.sendText("workbox generateSW");
        }
    );
}

async function runWorkboxTool(): Promise<void> {
    return new Promise(async (resolve, reject) => {
        try {
            const npmCheck = isNpmInstalled();
            if (npmCheck) {
                vsTerminal.show();
                vsTerminal.sendText("npm install workbox-cli --global");

                vsTerminal.sendText("workbox wizard");
                resolve();
            } else {
                noNpmInstalledWarning();
            }
        } catch (err) {
            reject(err);
        }
    });
}