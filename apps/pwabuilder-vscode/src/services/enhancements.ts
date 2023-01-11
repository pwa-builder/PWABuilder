import * as vscode from "vscode";
import { getManifest } from "./manifest/manifest-service";
import { Manifest } from "../interfaces";

export async function addShortcuts() {
    // get manifest.json
    const manifest = await getManifest();

    // if manifest.json exists
    if (manifest) {
        // open manifest.json
        const manifestFile = await vscode.workspace.openTextDocument(manifest);
        console.log("ManifestFile", manifestFile)

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

                // create a snippet with the vscode api
                const snippet = new vscode.SnippetString('\,\n\t\"shortcuts\": [\n\t\t\{\n\t\t\t\"name\":\"${15:The name you would like to be displayed for your shortcut}\",\n\t\t\t\"url\":\"${16:The url you would like to open when the user chooses this shortcut. This must be a URL local to your PWA. For example: If my start_url is /, this URL must be something like /shortcut}\",\n\t\t\t\"description\":\"${17:A description of the functionality of this shortcut}\"\n\t\t\}\n\t\]\n');

                const edit = new vscode.WorkspaceEdit();
                const goodLine = manifestFile.lineCount - 2;

                const textEditor = await vscode.window.showTextDocument(manifestFile);

                await textEditor.insertSnippet(snippet, new vscode.Position(goodLine, 0));

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

export async function addProtocolHandler() {
    // get manifest.json
    const manifest = await getManifest();

    // if manifest.json exists
    if (manifest) {
        // open manifest.json
        const manifestFile = await vscode.workspace.openTextDocument(manifest);
        console.log("ManifestFile", manifestFile)

        const manifestObject: Manifest = JSON.parse(
            manifestFile.getText()
        );

        // if protocol_handlers array exists
        if (manifestObject.protocol_handlers) {
            // show information message notification
            const option = await vscode.window.showInformationMessage(
                "Your Web Manifest seems to already have a protocol handler! Want to learn more about them? ",
                "Learn More"
            );
            if (option === "Learn More") {
                vscode.commands.executeCommand(
                    "vscode.open",
                    vscode.Uri.parse(
                        "https://docs.pwabuilder.com/#/builder/manifest?id=protocol_handlers-array"
                    )
                );
            }
        }
        else {
            const option = await vscode.window.showInformationMessage(
                "Did you know PWAs support Protocol Handlers? This feature can be enabled through the Web Manifest",
                "Add Protocol Handler",
            );

            if (option === "Add Protocol Handler") {
                const snippet = new vscode.SnippetString('\"protocol_handlers\": [""\t{""\t\t\"protocol\":\"${15:web+tea}\",""\t\t\"url\":\"${16:/tea?type=%s}\"""\t}","]');

                const edit = new vscode.WorkspaceEdit();
                const goodLine = manifestFile.lineCount - 2;

                const textEditor = await vscode.window.showTextDocument(manifestFile);

                await textEditor.insertSnippet(snippet, new vscode.Position(goodLine, 0));

                await vscode.workspace.applyEdit(edit);


                const option = await vscode.window.showInformationMessage(
                    "Protocol handler added! Want to learn more about them? ",
                    "Learn More"
                );

                if (option === "Learn More") {
                    vscode.commands.executeCommand(
                        "vscode.open",
                        vscode.Uri.parse(
                            "https://docs.pwabuilder.com/#/builder/manifest?id=protocol_handlers-array"
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
        const manifestFile = await vscode.workspace.openTextDocument(manifest);
        console.log("ManifestFile", manifestFile)

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
                    manifest,
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