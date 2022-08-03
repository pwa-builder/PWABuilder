import { open } from "fs/promises";
import * as vscode from "vscode";
import { getAnalyticsClient } from "../usage-analytics";

import { trackEvent } from "../usage-analytics";

let manifest: any | undefined;

export async function generateManifest(context: vscode.ExtensionContext) {
  const analyticsClient = getAnalyticsClient();
  analyticsClient.trackEvent({
    name: "generate",
    properties: { type: "manifest" }
  });

  // open information message about generating manifest
  // with an ok button
  const maniAnswer = await vscode.window.showInformationMessage(
    "PWA Studio will generate your Web Manifest, first, you will need to choose where to save your manifest.json file.",
    {
      title: "Ok",
    },
    {
      title: "Cancel",
    }
  );

  if (maniAnswer && maniAnswer.title === "Ok") {
    // ask user where they would like to save their manifest
    const uri = await vscode.window.showSaveDialog({
      defaultUri: vscode.Uri.file(
        `${vscode.workspace.workspaceFolders?.[0].uri.fsPath}/manifest.json`
      ),
      saveLabel: "Generate Web Manifest",
    });

    if (uri) {
      // write empty manifest file
      await open(uri.fsPath, "w+");

      // show manifest with vscode
      const editor = await vscode.window.showTextDocument(uri);

      // do refreshPackageView command
      await vscode.commands.executeCommand("pwa-studio.refreshEntry");

      // open information message about manifest snippet
      vscode.window.showInformationMessage(
        "Your Web Manifest file has been generated, follow the guided snippet to fill out your new manifest"
      );

      // insert interactive manifest snippet
      const maniSnippet = new vscode.SnippetString(
        "{" +
        "\n" +
        '"name": "${1:The name of your application}",' +
        "\n" +
        '"short_name": "${2:This name will show in your Windows taskbar, in the start menu, and Android homescreen}",' +
        "\n" +
        '"start_url": "${3:The URL that should be loaded when your application is opened}",' + 
        "\n" +
        '"display": "${4|standalone,fullscreen,minimal-ui,browser|}",' +
        "\n" +
        '"description": "${5:A description for your application}",' +
        "\n" +
        '"lang": "${6: The default language of your application}",' +
        "\n" +
        '"dir": "${7|auto, ltr, rtl|}",' +
        "\n" +
        '"theme_color": "#000000",' +
        "\n" +
        '"background_color": "#000000",' +
        "\n" +
        '"orientation": "${10|any,natural,landscape,landscape-primary,landscape-secondary,portrait,portrait-primary,portrait-secondary|}",' +
        "\n" +
        '"icons": [' +
        "\n" +
        "\t{" +
        "\n" +
        '\t\t"src": "https://www.pwabuilder.com/assets/icons/icon_512.png",' +
        "\n" +
        '\t\t"sizes": "512x512",' +
        "\n" +
        '\t\t"type": "image/png",' +
        "\n" +
        '\t\t"purpose": "maskable"' +
        "\n" +
        "\t}," +
        "\n" +
        "\t{" +
        "\n" +
        '\t\t"src": "https://www.pwabuilder.com/assets/icons/icon_192.png",' +
        "\n" +
        '\t\t"sizes": "192x192",' +
        "\n" +
        '\t\t"type": "image/png",' +
        "\n" +
        '\t\t"purpose": "any"' +
        "\n" +
        "\t}" +
        "\n" +
        "]," +
        "\n" +
        '"screenshots": [' +
        "\n" +
        "\t{" +
        "\n" +
        '\t\t"src": "https://www.pwabuilder.com/assets/screenshots/screen1.png",' +
        "\n" +
        '\t\t"sizes": "2880x1800",' +
        "\n" +
        '\t\t"type": "image/png",' +
        "\n" +
        '\t\t"description": "A screenshot of the home page"' +
        "\n" +
        "\t}" +
        "\n" +
        "]," +
        "\n" +
        '"related_applications": [' +
        "\n" +
        "\t{" +
        "\n" +
        '\t\t"platform":"${13|windows,play|}",' +
        "\n" +
        '\t\t"url": "${14: The URL to your app in that app store}"' +
        "\n" +
        "\t}" +
        "\n" +
        "]," +
        "\n" +
        '"prefer_related_applications": "${15|false, true|}",' +
        "\n" +
        '"shortcuts": [' +
        "\n" +
        "\t{" +
        "\n" +
        '\t\t"name":"${16:The name you would like to be displayed for your shortcut}",' +
        "\n" +
        '\t\t"url":"${17:The url you would like to open when the user chooses this shortcut. This must be a URL local to your PWA. For example: If my start_url is /, this URL must be something like /shortcut}",' +
        "\n" +
        '\t\t"description":"${18:A description of the functionality of this shortcut}"' +
        "\n" +
        "\t}" +
        "\n" +
        "]" +
        "\n" +
        "}"
      );

      editor.insertSnippet(maniSnippet);
    }
  }
}

export async function convertBaseToFile(
  iconsList: Array<any>
): Promise<{ path: string; icons: Array<any> }> {
  // ask user to choose a directory to save files to
  const uri = await vscode.window.showSaveDialog({
    defaultUri: vscode.Uri.file(
      `${vscode.workspace.workspaceFolders?.[0].uri.fsPath}/icons`
    ),
    saveLabel: "Save Icons",
    title: "Choose a directory to save generated icons to",
  });

  if (uri) {
    // create directory based on uri
    await vscode.workspace.fs.createDirectory(uri);
  }

  let newIconsList: Array<any> | undefined;

  if (uri) {
    newIconsList = iconsList.map((icon) => {
      return new Promise(async (resolve) => {
        // create file path to write file to
        const iconFile = vscode.Uri.file(
          `${uri.fsPath}/${icon.sizes}-icon.${icon.type.substring(
            icon.type.indexOf("/") + 1
          )}`
        );

        // create buffer from icon base64 data
        const buff: Buffer = Buffer.from(icon.src.split(",")[1], "base64");

        // write file to disk
        await vscode.workspace.fs.writeFile(iconFile, buff);

        icon.src = vscode.workspace.asRelativePath(iconFile.fsPath);

        resolve(icon);
      });
    });

    vscode.window.showInformationMessage(`Icons saved to ${uri.fsPath}`);

    return { path: uri.fsPath, icons: (await Promise.all(newIconsList)) || [] };
  } else {
    return { path: "", icons: [] };
  }
}

export async function chooseManifest() {
  const manifestFile = await vscode.window.showOpenDialog({
    canSelectFiles: true,
    canSelectFolders: false,
    canSelectMany: false,
    title: "Select your Web Manifest",
    filters: {
      JSON: ["json", "webmanifest"],
    },
  });

  if (manifestFile && manifestFile.length > 0) {
    await findManifest(manifestFile);
    // manifest = manifestFile[0];
  }
}

export function getManifest(): any | undefined {
  return manifest;
}

export async function findManifest(manifestFile?: vscode.Uri[] | undefined) {
  if (manifest) {
    return manifest;
  }

  if (manifestFile && manifestFile.length > 0) {
    manifest = manifestFile[0];
  } else {
    const rootFolder = vscode.workspace.workspaceFolders?.[0];
    if (rootFolder) {

      const mani = await vscode.workspace.findFiles(
        new vscode.RelativePattern(rootFolder, 'manifest.json'),
        "/node_modules/"
      );

      if (mani.length > 0) {
        // check if file actually exists
        const info = await vscode.workspace;
        manifest = mani[0];
      } else {
        const maniTryTwo = await vscode.workspace.findFiles(
          new vscode.RelativePattern(rootFolder, 'web-manifest.json'),
          "/node_modules/"
        );

        if (maniTryTwo.length > 0) {
          manifest = maniTryTwo[0];
        } else {
          const maniTryThree = await vscode.workspace.findFiles(
            new vscode.RelativePattern(rootFolder, "*.webmanifest"),
            "/node_modules/"
          );

          if (maniTryThree.length > 0) {
            manifest = maniTryThree[0];
          }
          else {
            // dont use RelativePattern here
            const maniTryFour = await vscode.workspace.findFiles("public/manifest.json", "/node_modules/");

            if (maniTryFour.length > 0) {
              manifest = maniTryFour[0];
            }
          }
        }
      }
    }

  }

  if (manifest) {
    // do refreshPackageView command
    await vscode.commands.executeCommand("pwa-studio.refreshPackageView");
    await vscode.commands.executeCommand("pwa-studio.refreshEntry");
  }

  return manifest;
}

async function handleAddingManiToIndex(): Promise<void> {
  let indexFile: undefined | vscode.Uri;
  const indexFileData = await vscode.workspace.findFiles(
    "**/index.html"
    // "**/node_modules/**"
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

  if (indexFile) {
    const document = await vscode.workspace.openTextDocument(indexFile);
    const editor = await vscode.window.showTextDocument(document);

    const manifest = getManifest();

    const goodPath = vscode.workspace.asRelativePath(manifest.fsPath);

    let linkString = `<link rel="manifest" href="${goodPath}">`;

    // find head in index file
    const start = editor.document.positionAt(
      editor.document.getText().indexOf("</head>")
    );
    // insert registerCommand in head
    editor.insertSnippet(
      new vscode.SnippetString(linkString),
      start.translate(-1, 0)
    );

    await vscode.commands.executeCommand("pwa-studio.refreshEntry");
  }
}
