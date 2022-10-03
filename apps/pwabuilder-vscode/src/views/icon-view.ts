import * as vscode from "vscode";
import { Manifest } from "../interfaces";
import { findManifest } from "../services/manifest/manifest-service";
import { trackEvent } from "../services/usage-analytics";
import { getUri } from "../utils";
import { writeFile } from 'fs/promises';

const pwaAssetGenerator = require('pwa-asset-generator');

export class IconViewPanel {
    public static currentPanel: IconViewPanel | undefined;
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
                if (message.command === "generate-icons") {
                    await this.generateIcons(message.options)
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
    
        <title>Icon Generation</title>
    
        <script type="module" src="${toolkitUri}"></script>
    
        <!-- Ionicons Import -->
        <script src="https://unpkg.com/ionicons@4.5.10-0/dist/ionicons.js"></script>
      </head>
      <body>
        <div id="central">
          <div id="submit-block">
            <h1>Icon Generation Options</h1>

            <vscode-button id="generate">Generate</vscode-button>
          </div>
    
          <main>
            <form>
              <div class="form-group">
                <p>Choose an icon file to use as a base. 512x512 is preferred.</p>
                <label for="icon">Base Icon</label>
                <vscode-button id="chooseBase">Choose Base Icon</vscode-button>
              </div>

              <div class="form-group">
                
                <div class="form-item">
                 <label for="background_color">Background Color</label>
                    <input class="form-control" id="background_color" value="transparent" type="color">
                </div>

                <div class="form-item">
                 <label for="padding">Icon Padding</label>
                 <vscode-text-field id="padding" placeholder="Enter padding" value="10" type="number"></vscode-text-field>
                </div>

                <div class="form-item">
                 <label for="generateMaskable">Generate Maskable Icon</label>
                    <vscode-checkbox id="generateMaskable" checked="true"></vscode-checkbox>
                </div>
              </div>
            </form>
          </main>
    
        </div>
        <script>
          const vscode = acquireVsCodeApi();

          // get options
          const background_color = document.getElementById("background_color");
          const padding = document.getElementById("padding");
          const generateMaskable = document.getElementById("generateMaskable");
    
          document.querySelector("#generate").addEventListener("click", () => {
            vscode.postMessage({
              command: 'generate-icons',
              options: {
                background_color: background_color.value,
                padding: padding.value,
                generateMaskable: generateMaskable.checked
              }
            })
          });

          document.querySelector("#chooseBase").addEventListener("click", () => {
            vscode.postMessage({
                command: 'choose-base',
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

        .form-group {
            display: flex;
            flex-direction: column;
            gap: 10px;
            margin-top: 10px;
            max-width: 250px;
        }

        .form-item {
            display: flex;
            flex-direction: column;
            gap: 5px;
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
      </style>
    </html>
    
        `;
    }

    public static render(extensionUri: vscode.Uri) {
        if (IconViewPanel.currentPanel) {
            IconViewPanel.currentPanel._panel.reveal(vscode.ViewColumn.Three);
        } else {
            const panel = vscode.window.createWebviewPanel(
                "iconview",
                "Icon Generation",
                vscode.ViewColumn.Three,
                {
                    enableScripts: true,
                }
            );

            IconViewPanel.currentPanel = new IconViewPanel(panel, extensionUri);
        }
    }

    public dispose() {
        IconViewPanel.currentPanel = undefined;

        this._panel.dispose();

        while (this._disposables.length) {
            const disposable = this._disposables.pop();
            if (disposable) {
                disposable.dispose();
            }
        }
    }

    async generateIcons(options: any = {}, skipPrompts?: boolean) {
        return new Promise(async (resolve, reject) => {
            try {
                trackEvent("generate", { type: "icons" });

                let iconFile: vscode.Uri[] | undefined;

                if (!skipPrompts) {
                    // ask user for icon file
                    iconFile = await this.getBaseIcon(iconFile);
                }
                else {
                    iconFile = [vscode.Uri.file(
                        `${vscode.workspace.workspaceFolders?.[0].uri.fsPath}/icon-512.png`
                    )];
                }

                let outputDir: vscode.Uri[] | undefined;
                // ask user for output directory
                if (!skipPrompts) {
                    outputDir = await vscode.window.showOpenDialog({
                        canSelectFiles: false,
                        canSelectMany: false,
                        canSelectFolders: true,
                        openLabel: 'Select output directory',
                        defaultUri: vscode.Uri.file(
                            `${vscode.workspace.workspaceFolders?.[0].uri.fsPath}/icons`
                        ),
                    });
                }
                else {
                    outputDir = [vscode.Uri.file(
                        `${vscode.workspace.workspaceFolders?.[0].uri.fsPath}/icons`
                    )]
                }

                // show progress with vscode 
                vscode.window.withProgress({
                    location: vscode.ProgressLocation.Notification,
                    title: 'Generating Icons',
                    cancellable: false,
                }, async (progress) => {
                    progress.report({ message: "Generating Icons..." });

                    const { savedImages, htmlMeta, manifestJsonContent } = await pwaAssetGenerator.generateImages(
                        iconFile ? iconFile[0].fsPath : null,
                        outputDir ? outputDir[0].fsPath : null,
                        {
                            scrape: false,
                            log: false,
                            iconOnly: true,
                            background: options.background_color || "transparent",
                            padding: options.padding || "10%",
                            maskable: options.generateMaskable || true,
                        });

                    console.log(savedImages, htmlMeta, manifestJsonContent);

                    const manifest: vscode.Uri = await findManifest();
                    if (manifest) {
                        const manifestFile = await vscode.workspace.openTextDocument(
                            manifest
                        );

                        const manifestObject: Manifest = JSON.parse(
                            manifestFile.getText()
                        );

                        manifestObject.icons = manifestJsonContent;

                        // transform icons to relative paths
                        manifestObject.icons?.forEach((icon: any) => {
                            icon.src = vscode.workspace.asRelativePath(icon.src);
                        })

                        // write manifest file
                        await writeFile(
                            manifest.fsPath,
                            JSON.stringify(manifestObject, null, 2)
                        );

                        // show manifest with vscode
                        await vscode.window.showTextDocument(manifestFile);

                        progress.report({ message: "Icons generated successfully!" });

                        resolve(manifestFile);
                    }
                    else {
                        vscode.window.showErrorMessage(
                            "You first need a Web Manifest. Tap the Generate Manifest button at the bottom to get started."
                        );

                        progress.report({ message: "Generate a Web Manifest first" });
                    }


                });

            }
            catch (err) {
                vscode.window.showErrorMessage(
                    `There was an error generaring icons: ${err}`
                );

                reject(err);
            }
        })
    }

    async getBaseIcon(iconFile: vscode.Uri[] | undefined) {
        iconFile = await vscode.window.showOpenDialog({
            canSelectFiles: true,
            canSelectMany: false,
            filters: {
                'Images': ['png', 'jpg', 'jpeg'],
            },
            openLabel: 'Select your Icon file, 512x512 is preferred',
        });
        return iconFile;
    }
}