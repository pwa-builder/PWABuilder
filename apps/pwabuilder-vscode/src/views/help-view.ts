import * as vscode from "vscode";
import { getUri } from "../utils";

export class HelpViewPanel {
  public static currentPanel: HelpViewPanel | undefined;
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
    this._panel.webview.onDidReceiveMessage(
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

    const imageUri = getUri(webview, extensionUri, [
      "src",
      "views",
      "icons-everywhere.png",
    ]);

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
                General
            </vscode-panel-tab>
            <vscode-panel-tab id="tab-2">
                Web Manifest
            </vscode-panel-tab>
            <vscode-panel-tab id="tab-3">
                Service Workers
            </vscode-panel-tab>
            <vscode-panel-tab id="tab-4">
                PWA Studio
            </vscode-panel-tab>

            <!-- general panel -->
         <vscode-panel-view id="view-1">
         <section class="container">
            <h2>What is a Progressive Web App?</h2>
            <p>
                A Progressive Web App, or PWA for short, is a high quality web application that makes use of web technologies like Web Manifests and Service Worker
                to provide an app-like experience delivered over the web. Because PWAs are Apps, they can be installed from the browser AND app stores such as the Microsoft Store and Google Play Store!
            </p>

            <h2>Useful Links</h2>
            <ul>
                <li>
                <vscode-link href="https://docs.microsoft.com/microsoft-edge/progressive-web-apps-chromium/">Visit the Edge PWA Documentation</vscode-link>
                </li>

                <li>
                <vscode-link href="https://aka.ms/pwa-studio-docs">Visit the PWA Studio Documentation</vscode-link>
                </li>

                <li>
                <vscode-link href="https://docs.pwabuilder.com">Visit the PWABuilder Documentation</vscode-link>
                </li>
            </ul>

            <vscode-link href="https://github.com/pwa-builder/PWABuilder/issues/new/choose">Found an issue with PWA Studio? Open an issue on Github</vscode-link>
           </section>

         </vscode-panel-view>

         <!-- manifest panel -->
         <vscode-panel-view id="view-2">
         <section class="container">

         <div class="side-by-side">
           <div class="example-side">
             <h2>What is a Web Manifest?</h2>

             <p>
               A Web Manifest governs how your Progressive Web App (PWA) looks and behaves when installed on a device. 
               The Web App Manifest provides information such as the name of your app, your app's icons, 
               and the theme colors that the operating system uses in the title bar. <vscode-link href="https://docs.microsoft.com/en-us/microsoft-edge/progressive-web-apps-chromium/how-to/web-app-manifests">Learn More</vscode-link>
             </p>

             <vscode-button class="generate">Generate a Web Manifest</vscode-button>


             <vscode-tag style="width: 36em;">All the places in Windows that your Web Manifest assets are used</vscode-tag>
             <img style="width: 30.5em;" src="${imageUri}" alt="Showing all the different places your icons are used in Windows">
           </div>

           <div>
             <h2>Web Manifest FAQ</h2>
             <ul>
               <li>
                 <h3>What size icons do I need?</h3>

                 <p>
                   While there is not a standard list, you need at'least a 512x512 PNG icon for your PWA to be installable.
                   For your app to have specific icon sizes for other places in the operating system, such as the start menu on Windows or app drawer in Android,
                   you can generate the right sized icons from your 512x512 icon by tapping the button below.
                 </p>

                 <vscode-button class="generate-icons">Generate Icons</vscode-button>

                 <vscode-link href="https://developer.mozilla.org/en-US/docs/Web/Manifest/icons">More Documentation</vscode-link>
               </li>

               <li>
                 <h3>My browser or PWABuilder does not see my Web Manifest?</h3>

                 <ul>
                   <li>
                     <p>
                       Check your Web Manifest is registered on your index.html. You should see the below code, or something similar
                       in your index.html. If you dont, copy and paste the below code into your index.html.
                     </p>

                     <code><link rel="manifest" href="/manifest.json"></code>

                     <vscode-link href="https://docs.microsoft.com/en-us/microsoft-edge/progressive-web-apps-chromium/how-to/web-app-manifests">More Documentation</vscode-link>
                   </li>

                   <li>
                     <p>
                       Check that your Web Manifest is being served correctly. 
                       The manifest file's content must be valid JSON, but the file can also be named like app_name.webmanifest. 
                       If you choose to use the webmanifest extension, verify that your HTTP server serves it with the application/manifest+json MIME type.
                     </p>
                   </li>
                 </ul>
               </li>

               <li>
                 <h3>Common Web Manifest features</h3>

                 <ul>
                   <li>
                     <vscode-link href="https://docs.microsoft.com/en-us/microsoft-edge/progressive-web-apps-chromium/how-to/web-app-manifests#use-shortcuts-to-provide-quick-access-to-features">Shortcuts</vscode-link>
                   </li>

                   <li>
                     <vscode-link href="https://docs.microsoft.com/en-us/microsoft-edge/progressive-web-apps-chromium/how-to/web-app-manifests#identify-your-app-as-a-share-target">Receive shared content from other apps</vscode-link>
                   </li>

                   <li>
                     <vscode-link href="https://docs.microsoft.com/en-us/microsoft-edge/progressive-web-apps-chromium/how-to/handle-protocols">Protocol Handlers</vscode-link>
                   </li>

                   <li>
                     <vscode-link href="https://docs.microsoft.com/en-us/microsoft-edge/progressive-web-apps-chromium/how-to/window-controls-overlay">Customize the title-bar</vscode-link>
                   </li>
                 </ul>
               </li>
             </ul>
           </div>
         </div>
      </section>
         </vscode-panel-view>

         <!-- service worker -->
         <vscode-panel-view id="view-3">
         <section class="container">
         <div class="side-by-side">
          <div class="example-side">
            <h2>What is a Service Worker?</h2>

            <p>
              Service Workers are a worker with the ability to intercept and respond to all network requests. 
              Service Workers can be thought of as a proxy between your app and the network. <vscode-link href="https://docs.microsoft.com/en-us/microsoft-edge/progressive-web-apps-chromium/how-to/service-workers">Learn More</vscode-link>
            </p>

            <vscode-button class="generate-worker">Generate a Service Worker</vscode-button>
          </div>

          <div>
            <h2>Service Worker FAQ</h2>

            <ul>
              <li>
                <h3>My browser or PWABuilder does not see my Service Worker?</h3>

                <p>
                  Check your Service Worker is registered. You should see the below code, or something similar. If you dont, copy and paste the below code into your index.html,
                  ensuring that the path to your Service Worker file is correct.
                </p>

                <code>
                  if ( "serviceWorker" in navigator ) {
                    navigator.serviceWorker.register( "/serviceworker.js" );
                  } 
                </code>
              </li>

              <li>
                <h3>My Service Worker fails to register</h3>

                <p>
                  This can happen for multiple reasons. The most common
                  is that you have a syntax error in your Service Worker code.
                  If you are sure your syntax is correct, check the link below for troubleshooting tips.
                </p>

                <vscode-link href="https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers#:~:text=Why%20is%20my%20service%20worker%20failing%20to%20register%3F">Troubleshooting Tips</vscode-link>
              </li>

              <li>
                <h3>Do I need a Service Worker?</h3>

                <p>
                  For your PWA to be installable in the browser you will need a Service Worker. Also,
                  to make use of features such as Push Notifications, your app working offline, background sync,
                  background downloads etc, you will need a service worker.
                </p>
              </li>

              <li>
                <h3>Common Service Worker features</h3>
                
                <ul>
                  <li>
                    <vscode-link href="https://docs.microsoft.com/en-us/microsoft-edge/progressive-web-apps-chromium/how-to/notifications-badges">Badges and Push Notifications</vscode-link>
                  </li>

                  <li>
                    <vscode-link href="https://docs.microsoft.com/en-us/microsoft-edge/progressive-web-apps-chromium/how-to/background-syncs#use-the-background-sync-api-to-synchronize-data-with-the-server">Replay requests when back online</vscode-link>
                  </li>

                  <li>
                    <vscode-link href="https://docs.microsoft.com/en-us/microsoft-edge/progressive-web-apps-chromium/how-to/background-syncs#use-the-periodic-background-sync-api-to-regularly-get-fresh-content">Regularly sync data in the background</vscode-link>
                  </li>

                  <li>
                    <vscode-link href="https://docs.microsoft.com/en-us/microsoft-edge/progressive-web-apps-chromium/how-to/background-syncs#use-the-background-fetch-api-to-fetch-large-files-when-the-app-or-service-worker-isnt-running">Background Downloads</vscode-link>
                  </li>
                </ul>
              </li>
            </ul>
            </div>
          </div>
       </section>
         </vscode-panel-view>


         <vscode-panel-view id="view-4">
            <section class="container">
              <div class="side-by-side">
                <div class="example-side">
                  <h2>PWA Studio</h2>

                  <vscode-link href="https://marketplace.visualstudio.com/items?itemName=PWABuilder.pwa-studio&ssr=false#review-details">Rate and Review</vscode-link>
                </div>

                <div>
                  <h2>PWA Studio FAQ</h2>

                  <ul>
                    <li>
                      <h3>Workbox is not working</h3>

                      <p>
                         Do you have Node.js installed? Do you have NPM installed? If not, you will need to install these first.
                         <vscode-link href="https://nodejs.org/">Install Node and NPM</vscode-link>. We also recommend checking the <vscode-link href="https://developers.google.com/web/tools/workbox/">Workbox Docs</vscode-link>directly.
                      </p>

                      <p>
                        Still not working? <vscode-link href="https://github.com/pwa-builder/PWABuilder/issues/new?assignees=jgw96&labels=bug+%3Abug%3A%2Cneeds+triage+%3Amag%3A%2Cvscode&template=bug_vscode.yaml&title=%5BVSCODE%5D+">Open an Issue</vscode-link>
                      </p>

                    </li>
                  </ul>
                </div>
              </div>
            </section>
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
    if (HelpViewPanel.currentPanel) {
      HelpViewPanel.currentPanel._panel.reveal(vscode.ViewColumn.One);
    } else {
      const panel = vscode.window.createWebviewPanel(
        "helpview",
        "Help and More Info",
        vscode.ViewColumn.One,
        {
          enableScripts: true,
        }
      );

      HelpViewPanel.currentPanel = new HelpViewPanel(panel, extensionUri);
    }
  }

  public dispose() {
    HelpViewPanel.currentPanel = undefined;

    this._panel.dispose();

    while (this._disposables.length) {
      const disposable = this._disposables.pop();
      if (disposable) {
        disposable.dispose();
      }
    }
  }
}
