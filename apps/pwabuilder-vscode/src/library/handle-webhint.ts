import * as vscode from "vscode";

export async function handleWebhint(): Promise<void> {
  // Hint library does not work in multiple different environments
  // because of puppeteer.
  // So we recommend the extension
  await vscode.window.showInformationMessage(
    "Grab the Webhint extension from here https://marketplace.visualstudio.com/items?itemName=webhint.vscode-webhint to start testing your app!",
    {},
    {
      title: "Open",
      action: async () => {
        await vscode.env.openExternal(
          vscode.Uri.parse(
            "https://marketplace.visualstudio.com/items?itemName=webhint.vscode-webhint"
          )
        );
      },
    }
  );
}
