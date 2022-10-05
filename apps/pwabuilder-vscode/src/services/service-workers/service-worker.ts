import * as vscode from 'vscode';
import { handleServiceWorkerCommandAdv } from './adv-service-worker';
import { handleServiceWorkerCommand } from './simple-service-worker';

export async function handleSW() {
    const answer = await vscode.window.showQuickPick(
        [
            {
                label: "Basic",
            },
            {
                label: "Advanced",
            },
        ],
        {
            title:
                "Would you like to generate a Basic or Advanced Service Worker? Basic is a good fit for most apps, however if you want to have full control over your Service Worker, Advanced is the best option.",
        }
    );

    if (answer && answer.label === "Advanced") {
        handleServiceWorkerCommandAdv();
    }
    else {
        handleServiceWorkerCommand();
    }
}

export async function findWorker(): Promise<any | undefined> {
    return new Promise<vscode.Uri | undefined>(async (resolve, reject) => {
        try {
            let existingWorker: any | undefined;

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

export async function handleAddingToIndex(): Promise<void> {
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

    const existingWorker = await findWorker();

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