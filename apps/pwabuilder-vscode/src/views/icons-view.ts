import { writeFile } from "fs/promises";
import * as vscode from "vscode";
import { Manifest } from "../interfaces";
import {
  convertBaseToFile,
  findManifest,
} from "../services/manifest/manifest-service";
import { getUri } from "../utils";

import { trackEvent } from "../services/usage-analytics";

export class IconGenerationPanel {
  public static currentPanel: IconGenerationPanel | undefined;
  private readonly _panel: vscode.WebviewPanel;
  private _disposables: vscode.Disposable[] = [];

  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    this._panel = panel;

    this._panel.onDidDispose(this.dispose, null, this._disposables);

    this._panel.webview.html = this._getWebviewContent(
      this._panel.webview,
      extensionUri
    );

    let iconsObject: any;
    // Handle messages from the webview
    this._panel.webview.onDidReceiveMessage(
      async (message) => {
        switch (message.command) {
          case "prompt":
            trackEvent("generate", { type: "icons" } );

            iconsObject = message.iconsObject;
            const manifest: vscode.Uri = await findManifest();

            if (manifest && iconsObject.icons) {
              // read manifest file
              const manifestFile = await vscode.workspace.openTextDocument(
                manifest
              );

              const manifestObject: Manifest = JSON.parse(
                manifestFile.getText()
              );

              const newIconsData = await convertBaseToFile(iconsObject.icons);

              // add icons to manifest
              manifestObject.icons = newIconsData.icons;

              // write manifest file
              await writeFile(
                manifest.fsPath,
                JSON.stringify(manifestObject, null, 2)
              );

              // show manifest with vscode
              await vscode.window.showTextDocument(manifestFile);
            } else {
              vscode.window.showErrorMessage(
                "You first need a Web Manifest. Tap the Generate Manifest button at the bottom to get started."
              );
            }

            return;
        }
      },
      undefined,
      this._disposables
    );
  }

  private _getWebviewContent(
    webview: vscode.Webview,
    extensionUri: vscode.Uri
  ) {
    const toolkitUri = getUri(webview, extensionUri, [
      "node_modules",
      "@vscode",
      "webview-ui-toolkit",
      "dist",
      "toolkit.js",
    ]);

    // Tip: Install the es6-string-html VS Code extension to enable code highlighting below
    return /*html*/ `
    <!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="icon" href="https://glitch.com/favicon.ico" />

    <title>PWA VSCode Extension Manifest Form</title>

    <script type="module" src="${toolkitUri}"></script>

    <!-- Ionicons Import -->
    <script src="https://unpkg.com/ionicons@4.5.10-0/dist/ionicons.js"></script>
  </head>
  <body>
    <div id="central">
      <form id="manifest-options" onsubmit="handleSubmit(event)">

      <div id="submit-block">
        <h1>Generate Icons</h1>
        <button type="submit" id="submit" type="submit">Generate Icons</vscode-button>
      </div>

        <div id="first-six">
          <div class="six">
            <label for="file_input">Choose a 512x512 icon:</label>
            <div class="input-area">
              <input type="file" name="file_input" id="file_input" required />

              <a
                href="https://developer.mozilla.org/en-US/docs/Web/Manifest/icons"
                target="_blank"
                rel="noopener"
              >
                <ion-icon name="information-circle-outline"></ion-icon>
                <p class="toolTip">
                  Click for more info on icons your manifest.
                </p>
              </a>
            </div>
          </div>
        </div>
      </form>
    </div>
    <script>
      const vscode = acquireVsCodeApi();

      let file = undefined;
      document.querySelector("#file_input").addEventListener("change", (ev) => {
        file = ev.target.files[0];
      });

      async function generateIcons() {
        return new Promise(async (resolve, reject) => {

          const url =
            "https://appimagegenerator-prod.azurewebsites.net/api/image/base64";

          const form = new FormData();
          form.append("baseImage", file);
          form.append("platform", "windows10");
          form.append("platform", "android");
          form.append("platform", "ios");
          form.append("colorChanged", "false");
          form.append("padding", "0");
          // send formdata with http node module
          try {
            const response = await fetch(url, {
              method: "POST",
              body: form,
            });

            const data = await response.json();

            resolve(data);
          } catch (err) {
            console.error("error", err);
            reject(err);
          }
        });
      }

      async function handleSubmit(event) {
        event.preventDefault();
        // update button text
        document.querySelector("#submit").innerText = "Generating...";

        const icons = await generateIcons();
        
        document.querySelector("#submit").innerText = "Generate Icons";

        let maniObj = {
          icons: icons,
        };

        vscode.postMessage({
          command: "prompt",
          text: "Your icons have been generated!",
          iconsObject: maniObj,
        });

        event.preventDefault();
      }
    </script>
  </body>
  <style>
    body.vscode-light {
      color: black;
    }

    body.vscode-dark label {
      color: white;
    }

    #file_input {
      display: block;
      height: 2em;
      width: 14em;
    }

    #central {
      padding: 1em;
      font-family: sans-serif;
    }

    #manifest-options {
      display: flex;
      flex-direction: column;
    }

    .input-area {
      display: flex;
      justify-content: flex-start;
      align-items: center;
    }

    #first-six {
      display: grid;
      grid-template-columns: auto auto;
      grid-gap: 20px;
      margin: 20px 0;
    }

    .six {
      display: flex;
      flex-direction: column;
    }

    .toolTip {
      visibility: hidden;
      width: 160px;
      background-color: #f8f8f8;
      color: black;
      text-align: center;
      border-radius: 6px;
      padding: 5px;
      /* Position the tooltip */
      position: absolute;
      top: 0px;
      left: 70%;
      z-index: 1;
    }

    .input-area a {
      position: relative;
    }

    a:hover .toolTip {
      visibility: visible;
    }

    label {
      margin-bottom: 6px;
      font-size: 16px;
      color: black;

      font-weight: bold;
    }

    input {
      border-radius: 4px;
      box-sizing: border-box;
      border: 1px solid #a8a8a8;
      height: 38px;
      width: 95%;
      font-size: 14px;
      text-indent: 10px;
      color: black;
    }

    #file_input {
      border: none;
      color: currentColor;
    }

    select {
      border-radius: 4px;
      box-sizing: border-box;
      border: 1px solid #a8a8a8;
      height: 38px;
      width: 95%;
      font-size: 14px;
      text-indent: 10px;
    }

    textarea {
      margin-top: 6px;
      margin-bottom: 20px;
      border-radius: 4px;
      box-sizing: border-box;
      border: 1px solid #a8a8a8;
      height: 38px;
      width: 100%;
      font-size: 14px;
      text-indent: 10px;
      color: black;
      width: 45%;
    }

    #icon {
      padding: 1px;
    }

    #bottom-four {
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-gap: 20px;
    }

    .color {
      display: flex;
      flex-direction: column;
    }

    #icon {
      border: none;
      text-indent: 0;
      margin-top: 6px;
      height: max-content;
    }

    #bottom-four button {
      font-size: 16px;
      font-weight: bolder;
      padding: 20px 10px;

      border-radius: 30px;
      border: none;

      height: 75%;

      display: flex;
      align-items: center;
      justify-content: center;
    }

    #bottom-four button:hover {
      cursor: pointer;
    }

    #submit-block {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 2em;

      position: sticky;
      top: 0;
      z-index: 9;
      height: 100%;
      padding-top: 10px;

      border-bottom: solid 1px darkgrey;
      padding-bottom: 10px;
    }

    #submit-block h1 {
      font-size: 16px;
      margin-top: 0;
      margin-bottom: 0;
    }

    #submit-block button {
      background: #487cf1;
      color: white;
      border: none;
      padding: 12px;
      font-size: 1.1em;
      border-radius: 4px;
      cursor: pointer;
    }

    ion-icon {
      margin-left: 10px;
      font-size: 24px;
    }

    ion-icon:hover {
      cursor: pointer;
    }

    a:visited {
      color: black;
    }
  </style>
</html>

    `;
  }

  public static render(extensionUri: vscode.Uri) {
    if (IconGenerationPanel.currentPanel) {
      IconGenerationPanel.currentPanel._panel.reveal(vscode.ViewColumn.One);
    } else {
      const panel = vscode.window.createWebviewPanel(
        "iconsview",
        "Generate Icons",
        vscode.ViewColumn.Beside,
        {
          enableScripts: true,
        }
      );

      IconGenerationPanel.currentPanel = new IconGenerationPanel(
        panel,
        extensionUri
      );
    }
  }

  public dispose() {
    IconGenerationPanel.currentPanel = undefined;

    this._panel.dispose();

    while (this._disposables.length) {
      const disposable = this._disposables.pop();
      if (disposable) {
        disposable.dispose();
      }
    }
  }
}
