import * as vscode from "vscode";
import { getUri } from "../utils";

export class PublishChecklistPanel {
    public static currentPanel: PublishChecklistPanel | undefined;
    private readonly _panel: vscode.WebviewPanel;
    private _disposables: vscode.Disposable[] = [];

    private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
        this._panel = panel;

        this._panel.onDidDispose(this.dispose, null, this._disposables);

        this._panel.webview.html = this._getWebviewContent(
            this._panel.webview,
            extensionUri
        );

        // Handle messages from the webview
        /*this._panel.webview.onDidReceiveMessage(
          async (message) => {
            if (message.command === "generate-manifest") {
              vscode.commands.executeCommand("pwa-studio.manifest");
            } else if (message.command === "generate-worker") {
              vscode.commands.executeCommand("pwa-studio.serviceWorker");
            } else if (message.command === "generate-icons") {
              vscode.commands.executeCommand("pwa-studio.generateIcons");
            }
          },
          undefined,
          this._disposables
        );*/
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

        /*const imageUri = getUri(webview, extensionUri, [
          "src",
          "views",
          "icons-everywhere.png",
        ]);*/

        // Tip: Install the es6-string-html VS Code extension to enable code highlighting below
        return /*html*/ `
    <!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="icon" href="https://glitch.com/favicon.ico" />

    <title>PWA Studio Help</title>

    <script type="module" src="${toolkitUri}"></script>

    <!-- Ionicons Import -->
    <script src="https://unpkg.com/ionicons@4.5.10-0/dist/ionicons.js"></script>
  </head>
  <body>
    <div id="central">
      <div id="submit-block">
        <h1>Help</h1>
        <vscode-button id="submit">Open Full Documentation</vscode-button>
      </div>

      <main>

      <vscode-panels>
            <vscode-panel-tab id="tab-1">
              Publish Checklist
            </vscode-panel-tab>
            <vscode-panel-tab id="tab-2">
                Help with Publishing
            </vscode-panel-tab>

            <!-- general panel -->
         <vscode-panel-view id="view-1">
         <section class="container">
            <h2>Publish Checklist</h2>
            <p>
                Publishing your PWA to the ap stores, such as the Microsoft Store and Google Play, require a few things
                beyond things like Web Manifests, Service Workers and Icons.
            
                For example, for the Microsoft Store, you need a Partner Center account and a product registered on that account 
                before you can publish your app.
            </p>

            <div id="microsoft-list">
              <h3>Microsoft Store</h3>

              <form>
                <fieldset>
                    <legend>Prequisites</legend>
                    <vscode-checkbox>My PWA is published at a public URL (such as https://webboard.app)</vscode-checkbox>
                    <vscode-checkbox>I have a Microsoft Developer account <vscode-link href="https://docs.microsoft.com/en-us/windows/apps/get-started/sign-up">Documentation</vscode-link></vscode-checkbox>
                    <vscode-checkbox>I have registered a product <vscode-link href="https://docs.pwabuilder.com/#/builder/windows?id=reserve-your-app">Documentation</vscode-link></vscode-checkbox>
                    <vscode-checkbox>I have packaged my PWA <vscode-link href="https://docs.pwabuilder.com/#/studio/package?id=package-for-stores">Documentation</vscode-link></vscode-checkbox>
                </fieldset>
                <vscode-link href="https://docs.pwabuilder.com/#/builder/windows?id=submitting-your-pwa">Visit "Publish My PWA to the Microsoft Store documentation"</vscode-link>
              </form>

            </div>

            <div id="google-list">
              <h3>Google Play</h3>
            </div>

            
           </section>

         </vscode-panel-view>

         <!-- Help with Publishing -->
         <vscode-panel-view id="view-2">
         
         </vscode-panel-view>

       </vscode-panels>
      </main>

    </div>
    <script>
      const vscode = acquireVsCodeApi();

      document.querySelector(".generate").addEventListener("click", () => {
        vscode.postMessage({
          command: 'generate-manifest'
        });
      });

      document.querySelector(".generate-worker").addEventListener("click", () => {
        vscode.postMessage({
          command: 'generate-worker'
        })
      });

      document.querySelector(".generate-icons").addEventListener("click", () => {
        vscode.postMessage({
          command: 'generate-icons'
        })
      });
    </script>
  </body>
  <style>
    body.vscode-light {
      color: black;
    }

    body.vscode-dark label {
      color: white;
    }

    .side-by-side {
        display: flex;
    align-items: baseline;
    justify-content: left;
    column-gap: 11em;
    }

    .generate, .generate-worker {
      width: 14em;
      margin-bottom: 2em;
    }

    .example-side {
        display: flex;
    flex-direction: column;
    margin-top: 1em;
    }

    .container {
        display: flex;
        flex-direction: column;
        width: 100%;
    }

    .container ul {
        margin-left: 0;
        margin-block-start: 0;
        padding-left: 0;
    }

    .container p {
        max-width: 29em;
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
      width: 200px;
      background-color: #f8f8f8;
      color: black;
      text-align: center;
      border-radius: 6px;
      padding: 5px;
      /* Position the tooltip */
      position: absolute;
      top: 0px;
      right: 65%;
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
      background: #1e1e1e;
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
        if (PublishChecklistPanel.currentPanel) {
            PublishChecklistPanel.currentPanel._panel.reveal(vscode.ViewColumn.One);
        } else {
            const panel = vscode.window.createWebviewPanel(
                "helpview",
                "Help and More Info",
                vscode.ViewColumn.One,
                {
                    enableScripts: true,
                }
            );

            PublishChecklistPanel.currentPanel = new PublishChecklistPanel(panel, extensionUri);
        }
    }

    public dispose() {
        PublishChecklistPanel.currentPanel = undefined;

        this._panel.dispose();

        while (this._disposables.length) {
            const disposable = this._disposables.pop();
            if (disposable) {
                disposable.dispose();
            }
        }
    }
}
