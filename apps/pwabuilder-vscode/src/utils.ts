import * as vscode from "vscode";

export function getUri(
  webview: vscode.Webview,
  extensionUri: vscode.Uri,
  pathList: string[]
) {
  return webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, ...pathList));
}

export function validateURL(url: string): boolean {
  const validity = /^(ftp|http|https):\/\/[^ "]+$/.test(url);
  return validity;
}