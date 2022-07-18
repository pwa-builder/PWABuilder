import * as vscode from "vscode";

// Suggest additions to the developers manifest to improve their PWA

let currentManifest: vscode.Uri | undefined;

export const initSuggestions = async () => {
  const watcher = vscode.workspace.createFileSystemWatcher("**/manifest.json");

  watcher.onDidChange(async (manifestFile) => {
    if (manifestFile) {
      currentManifest = manifestFile;

      // get current content of manifestFile
      const manifestContent = await vscode.workspace.fs.readFile(manifestFile);
      const manifest = JSON.parse(manifestContent.toString());

      // check manifest
      if (!manifest.shortcuts) {
        // show information message notification
        const option = await vscode.window.showInformationMessage(
          "Did you know PWAs support Shortcuts? This feature can be enabled through the Web Manifest",
          "Learn More"
        );
        if (option === "Learn More") {
          vscode.commands.executeCommand(
            "vscode.open",
            vscode.Uri.parse(
              "https://developer.mozilla.org/en-US/docs/Web/Manifest/shortcuts"
            )
          );
        }
      }

      if (!manifest.display_override) {
        // show information message notification
        const option = await vscode.window.showInformationMessage(
          "Looking for a way to make your PWA look more like a native app? Try the Window Controls Overlay API to add custom HTML content to your apps title bar on desktop",
          "Learn More"
        );
        if (option === "Learn More") {
          vscode.commands.executeCommand(
            "vscode.open",
            vscode.Uri.parse(
              "https://docs.microsoft.com/en-us/microsoft-edge/progressive-web-apps-chromium/how-to/window-controls-overlay"
            )
          );
        }
      }
    }
  });
};
