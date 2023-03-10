import * as vscode from "vscode";
import { getManifest } from "./manifest/manifest-service";
import { Manifest } from "../interfaces";

// const shortcutString = new vscode.SnippetString('\,"\"shortcuts\": [,\t{,\t\t\"name\":\"${15:The name you would like to be displayed for your shortcut}\",\t\t\"url\":\"${16:The url you would like to open when the user chooses this shortcut. This must be a URL local to your PWA. For example: If my start_url is /, this URL must be something like /shortcut}\",\t\t\"description\":\"${17:A description of the functionality of this shortcut}\",\t\t\"icons\": [\t\t\t{,\t\t\t\t\"src\": \"${1:icon-96x96.png}\",\t\t\t\t\"type\": \"image/png\",\t\t\t\t\"sizes\": \"${2:96x96}\",\t\t\t},\t\t],\t},],\n');
const protocolHandlerString = new vscode.SnippetString('\,\n\t\"protocol_handlers\": [\n\t\t\{\n\t\t\t\"protocol\":\"${15:The protocol you would like to handle. For example: web+myapp}\",\n\t\t\t\"url\":\"${16:The url you would like to open when the user chooses this shortcut. This must be a URL local to your PWA. For example: If my start_url is /, this URL must be something like /shortcut}\"\n\t\t\}\n\t\]\n');
const shareTargetString = new vscode.SnippetString('\,\n\t\"share_target\": \{\n\t\t\"action\": \"${15:The action you would like to perform when the user chooses to share content to your app. For example: share}\",\n\t\t\"method\": \"${16:The method you would like to use to share content to your app. For example: GET}\",\n\t\t\"enctype\": \"${17:The encoding type you would like to use to share content to your app. For example: application/x-www-form-urlencoded}\",\n\t\t\"params\": \{\n\t\t\t\"title\": \"${18:The title of the content you would like to share}\",\n\t\t\t\"text\": \"${19:The text of the content you would like to share}\",\n\t\t\t\"url\": \"${20:The url of the content you would like to share}\"\n\t\t\}\n\t\}\n');
const fileHandlerString = new vscode.SnippetString('\,\n\t\"file_handlers\": [\n\t\t\{\n\t\t\t\"action\": \"${15:The url you would like to open when the user chooses to share content to your app. This URL must have code to do something with the returned file.}\",\n\t\t\t\"accept\": \{\n\t\t\t\t\"text/*\": \[\"${18:.txt}\"\]\n\t\t\t\}\n\t\t\}\n\t\]\n');

// for shortcuts we build a snippetString below from this array
// This gets around frustrating syntax issues with the icons array
const shortcutTemplate = [
    ",\"shortcuts\": [",
    "\t{",
    "\t\t\"name\":\"${15:The name you would like to be displayed for your shortcut}\",",
    "\t\t\"url\":\"${16:The url you would like to open when the user chooses this shortcut. This must be a URL local to your PWA. For example: If my start_url is /, this URL must be something like /shortcut}\",",
    "\t\t\"description\":\"${17:A description of the functionality of this shortcut}\",",
    "\t\t\"icons\": [",
    "\t\t\t{",
    "\t\t\t\t\"src\": \"${1:icon-96x96.png}\",",
    "\t\t\t\t\"type\": \"image/png\",",
    "\t\t\t\t\"sizes\": \"${2:96x96}\"",
    "\t\t\t},",
    "\t\t]",
    "\t}",
    "]",
];

async function handleInsertSnippet(manifestFile: vscode.TextDocument, snippet: vscode.SnippetString) {
    const edit = new vscode.WorkspaceEdit();
    const goodLine = manifestFile.lineCount - 2;

    const textEditor = await vscode.window.showTextDocument(manifestFile);

    await textEditor.insertSnippet(snippet, new vscode.Position(goodLine, 0));

    await vscode.workspace.applyEdit(edit);
}

export async function addFileHandlers() {
    const manifest = await getManifest();

    if (manifest) {
        const manifestFile = await vscode.workspace.openTextDocument(manifest);

        const manifestObject: Manifest = JSON.parse(
            manifestFile.getText()
        );

        if (manifestObject.file_handlers) {
            const option = await vscode.window.showInformationMessage(
                "Your Web Manifest seems to already have file handlers! Want to learn more about them? ",
                "Learn More"
            );
            if (option === "Learn More") {
                vscode.commands.executeCommand(
                    "vscode.open",
                    vscode.Uri.parse(
                        "https://docs.pwabuilder.com/#/builder/manifest?id=file-handlers-array"
                    )
                );
            }
        } else {
            await handleInsertSnippet(manifestFile, fileHandlerString);
            const option = await vscode.window.showInformationMessage(
                "Your Web Manifest has been updated with file handlers! Want to learn more about them? ",
                "Learn More"
            );

            if (option === "Learn More") {
                vscode.commands.executeCommand(
                    "vscode.open",
                    vscode.Uri.parse(
                        "https://docs.pwabuilder.com/#/builder/manifest?id=file-handlers-array"
                    )
                );
            }
        }
    }
}

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
            let shortcutString = '';

            // build shortcut string from shortcutTemplate array
            for (let i = 0; i < shortcutTemplate.length; i++) {
                shortcutString += shortcutTemplate[i] 
            }

            await handleInsertSnippet(manifestFile, new vscode.SnippetString(shortcutString));

            const option = await vscode.window.showInformationMessage(
                "Your Web Manifest has been updated with shortcuts! Want to learn more about them? ",
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
            await handleInsertSnippet(manifestFile, protocolHandlerString);


            const option = await vscode.window.showInformationMessage(
                "Your Web Manifest has been updated with protocol handlers! Want to learn more about them? ",
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
                await handleInsertSnippet(manifestFile, shareTargetString);;

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