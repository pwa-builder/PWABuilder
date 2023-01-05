import * as vscode from "vscode";
import { getManifest } from "./manifest/manifest-service";
import { Manifest } from "../interfaces";

export async function addShortcuts() {
    // get manifest.json
    const manifest = await getManifest();

    // if manifest.json exists
    if (manifest) {
        // open manifest.json
        const manifestUri = vscode.Uri.file(manifest);
        const manifestFile = await vscode.workspace.openTextDocument(manifestUri);

        const manifestObject: Manifest = JSON.parse(
            manifestFile.getText()
        );

        // if shortcuts array exists
        if (manifestObject.shortcuts) {
            // show information message notification
            const option = await vscode.window.showInformationMessage(
                "Your Web Manifest seems to already have shortcuts! Want to learn more about them? ",
                "Learn More"
            );
            if (option === "Learn More") {
                vscode.commands.executeCommand(
                    "vscode.open",
                    vscode.Uri.parse(
                        "https://docs.pwabuilder.com/#/builder/manifest?id=shortcuts-array"
                    )
                );
            }
        }
        else {
            const option = await vscode.window.showInformationMessage(
                "Did you know PWAs support Shortcuts? This feature can be enabled through the Web Manifest",
                "Add Shortcuts",
            );

            if (option === "Add Shortcuts") {
                manifestObject.shortcuts = [
                    {
                        "name": "PWA Builder",
                        "short_name": "PWA Builder",
                        "description": "PWA Builder is a free tool that helps you build a PWA for your site.",
                        "url": "https://www.pwabuilder.com/",
                        "icons": [
                            {
                                "src": "https://www.pwabuilder.com/assets/img/pwabuilder-logo.png",
                                "sizes": "192x192",
                                "type": "image/png"
                            }
                        ]
                    }
                ];

                const edit = new vscode.WorkspaceEdit();
                edit.replace(
                    manifestUri,
                    new vscode.Range(
                        new vscode.Position(0, 0),
                        new vscode.Position(manifestFile.lineCount, 0)
                    ),
                    JSON.stringify(manifestObject, null, 2)
                );
                await vscode.workspace.applyEdit(edit);

                const option = await vscode.window.showInformationMessage(
                    "Shortcuts added! Want to learn more about them? ",
                    "Learn More"
                );

                if (option === "Learn More") {
                    vscode.commands.executeCommand(
                        "vscode.open",
                        vscode.Uri.parse(
                            "https://docs.pwabuilder.com/#/builder/manifest?id=shortcuts-array"
                        )
                    );
                }
            }
        }
    }
}

export async function addShareTarget() {
    // get manifest.json
    const manifest = await getManifest();

    // if manifest.json exists
    if (manifest) {
        // open manifest.json
        const manifestUri = vscode.Uri.file(manifest);
        const manifestFile = await vscode.workspace.openTextDocument(manifestUri);

        const manifestObject: Manifest = JSON.parse(
            manifestFile.getText()
        );

        // if share_target array exists
        if (manifestObject.share_target) {
            // show information message notification
            const option = await vscode.window.showInformationMessage(
                "Your Web Manifest seems to already have a share target! Want to learn more about them? ",
                "Learn More"
            );
            if (option === "Learn More") {
                vscode.commands.executeCommand(
                    "vscode.open",
                    vscode.Uri.parse(
                        "https://docs.pwabuilder.com/#/builder/manifest?id=share_target-object"
                    )
                );
            }
        }
        else {
            const option = await vscode.window.showInformationMessage(
                "Did you know PWAs support Share Targets? This feature can be enabled through the Web Manifest",
                "Add Share Target",
            );

            if (option === "Add Share Target") {
                manifestObject.share_target = {
                    "action": "share",
                    "method": "GET",
                    "params": {
                        "title": "title",
                        "text": "text",
                        "url": "url"
                    }
                };

                const edit = new vscode.WorkspaceEdit();
                edit.replace(
                    manifestUri,
                    new vscode.Range(
                        new vscode.Position(0, 0),
                        new vscode.Position(manifestFile.lineCount, 0)
                    ),
                    JSON.stringify(manifestObject, null, 2)
                );
                await vscode.workspace.applyEdit(edit);

                const option = await vscode.window.showInformationMessage(
                    "Share Target added! Want to learn more about them? ",
                    "Learn More"
                );

                if (option === "Learn More") {
                    vscode.commands.executeCommand(
                        "vscode.open",
                        vscode.Uri.parse(
                            "https://docs.pwabuilder.com/#/builder/manifest?id=share_target-object"
                        )
                    );
                }
            }
        }
    }
}