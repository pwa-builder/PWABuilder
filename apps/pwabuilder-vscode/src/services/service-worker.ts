import { writeFile } from "fs/promises";
import * as vscode from "vscode";
import { injectManifest } from "workbox-build";
import { isNpmInstalled, noNpmInstalledWarning } from "./new-pwa-starter";

import { getAnalyticsClient } from "./usage-analytics";

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

export async function handleServiceWorkerCommand(): Promise<void> {
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
    handleAdvServiceWorkerCommand();
  } else {
    try {
      vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
        },
        async (progress) => {
          progress.report({ message: "Generating Workbox Config..." });
          await runWorkboxTool();
          progress.report({ message: "Workbox Config added!" });
        }
      );
    } catch (err) {
      vscode.window.showErrorMessage(
        err && (err as Error).message
          ? (err as Error).message
          : "There was an issue adding your service worker"
      );
    }
  }
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
    existingWorker = serviceWorker;
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

  const worker = await findWorker();
  if (worker) {
    const goodPath = vscode.workspace.asRelativePath(worker.fsPath);

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

      const docsAnswer = await vscode.window.showInformationMessage(
        "Check the Workbox documentation to add workbox to your existing build command.",
        {},
        {
          title: "Open Workbox Documentation",
        }
      );

      if (docsAnswer && docsAnswer.title === "Open Workbox Documentation") {
        await vscode.env.openExternal(
          vscode.Uri.parse(
            "https://developers.google.com/web/tools/workbox/modules/workbox-cli#setup_and_configuration"
          )
        );
      }

      await vscode.commands.executeCommand("pwa-studio.refreshSWView");
    }
  }
}
