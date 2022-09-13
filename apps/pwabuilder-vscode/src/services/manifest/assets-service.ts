import * as vscode from 'vscode';
const fetch = require('node-fetch');
import { writeFile } from 'fs/promises';
import { Manifest } from '../../interfaces';
import { trackEvent } from "../usage-analytics";
import { findManifest } from './manifest-service';

const pwaAssetGenerator = require('pwa-asset-generator');

export async function generateScreenshots(skipPrompts?: boolean) {
    return new Promise(async (resolve, reject) => {

        let urlToScreenshot: string | undefined;

        if (!skipPrompts) {
            // ask user for the url they would like to have a screenshot of
            urlToScreenshot = await vscode.window.showInputBox({
                prompt: 'Enter the URL you would like to screenshot',
            });
        }
        else {
            urlToScreenshot = "https://webboard.app";
        }

        if (!urlToScreenshot) {
            reject('No URL was provided');
        }

        const url =
            "https://pwa-screenshots.azurewebsites.net/screenshotsAsBase64Strings";

        // send formdata with http node module
        vscode.window.withProgress(
            {
                location: vscode.ProgressLocation.Notification,
            },
            async (progress) => {
                progress.report({ message: "Generating Screenshots..." });

                try {
                    const response = await fetch(url, {
                        method: 'POST',
                        headers: {
                            'content-type': 'application/json',
                        },
                        body: JSON.stringify({
                            url: [urlToScreenshot]
                        }),
                    });

                    const data = await response.json();

                    const screenshots = await handleScreenshots(data, skipPrompts ? true : false);

                    const manifest: vscode.Uri = await findManifest();

                    // read manifest file
                    const manifestFile = await vscode.workspace.openTextDocument(
                        manifest
                    );

                    const manifestObject: Manifest = JSON.parse(
                        manifestFile.getText()
                    );

                    // add icons to manifest
                    manifestObject.screenshots = screenshots.screenshots;

                    // write manifest file
                    await writeFile(
                        manifest.fsPath,
                        JSON.stringify(manifestObject, null, 2)
                    );

                    // show manifest with vscode
                    await vscode.window.showTextDocument(manifestFile);

                    progress.report({ message: "Screenshots generated successfully!" });

                    resolve(manifestFile);

                } catch (err) {
                    console.error("error", err);
                    progress.report({ message: `Screenshots could not be generated: ${err}` });
                    reject(err);
                }
            })
    });
}

export async function generateIcons(skipPrompts?: boolean) {
    return new Promise(async (resolve, reject) => {
        try {
            trackEvent("generate", { type: "icons" });

            let screenshotFile: vscode.Uri[] | undefined;

            if (!skipPrompts) {
                // ask user for icon file
                screenshotFile = await vscode.window.showOpenDialog({
                    canSelectFiles: true,
                    canSelectMany: false,
                    filters: {
                        'Images': ['png', 'jpg', 'jpeg'],
                    },
                    openLabel: 'Select your Icon file, 512x512 is preferred',
                });
            }
            else {
                screenshotFile = [vscode.Uri.file(
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
                    screenshotFile ? screenshotFile[0].fsPath : null,
                    outputDir ? outputDir[0].fsPath : null,
                    {
                        scrape: false,
                        log: false,
                        iconOnly: true
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

async function handleScreenshots(data: any, skipPrompts?: boolean): Promise<{ path: string; screenshots: Array<any> }> {
    return new Promise(async (resolve, reject) => {
        if (data.images) {
            // ask user to choose a directory to save files to
            let uri: vscode.Uri | undefined;

            if (!skipPrompts) {
                uri = await vscode.window.showSaveDialog({
                    defaultUri: vscode.Uri.file(
                        `${vscode.workspace.workspaceFolders?.[0].uri.fsPath}/screenshots`
                    ),
                    saveLabel: "Save Screenshots",
                    title: "Choose a directory to save generated Screenshots to",
                });
            }
            else {
                uri = vscode.Uri.file(
                    `${vscode.workspace.workspaceFolders?.[0].uri.fsPath}/screenshots`
                );
            }

            if (uri) {
                // create directory based on uri
                await vscode.workspace.fs.createDirectory(uri);
            }

            let newScreenshotsList: Array<any> | undefined;

            if (uri) {
                newScreenshotsList = data.images.map((screenshot: any) => {
                    return new Promise(async (resolve) => {
                        // create file path to write file to
                        if (uri) {
                            const screenshotFile = vscode.Uri.file(
                                `${uri.fsPath}/${screenshot.sizes}-screenshot.${screenshot.type.substring(
                                    screenshot.type.indexOf("/") + 1
                                )}`
                            );
    
                            // create buffer from icon base64 data
                            const buff: Buffer = Buffer.from(screenshot.src, "base64");
    
                            // write file to disk
                            await vscode.workspace.fs.writeFile(screenshotFile, buff);
    
                            screenshot.src = vscode.workspace.asRelativePath(screenshotFile.fsPath);
    
                            resolve(screenshot);
                        }
                    });
                });

                vscode.window.showInformationMessage(`Screenshots saved to ${uri.fsPath}`);
                if (newScreenshotsList) {
                    resolve({ path: uri.fsPath, screenshots: (await Promise.all(newScreenshotsList)) || [] });
                }
            }
        }
        else {
            reject("No Screenshots were generated");
        }
    })
}
