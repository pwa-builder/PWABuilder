import * as vscode from "vscode";
import { storageManager } from "../extension";
import { validateUrl } from "./package/package-android-app";

let url: string | undefined = undefined;

export function getURL(): string | undefined {
  const urlData = storageManager?.getValue<any>("urlData");
  return urlData?.url;
}

export async function setURL(url: string | undefined): Promise<void> {
  if (url && url.length > 0) {
    const isValidURL = validateUrl(url);
    if (isValidURL) {
      storageManager?.setValue<any>("urlData", {
        url: url,
      });
    }
    else {
      vscode.window.showErrorMessage(
        "Invalid URL. Please enter a valid URL."
      );
    }

    await vscode.commands.executeCommand("pwa-studio.refreshPackageView");
  }
}

export async function askForUrl(): Promise<void> {
  // ask if user has a url
  const pwaUrlQuestion = await vscode.window.showQuickPick(["Yes", "No"], {
    placeHolder: "Have you published your PWA to the web?",
  });

  if (pwaUrlQuestion !== undefined && pwaUrlQuestion === "Yes") {
    // ask for url
    url = await vscode.window.showInputBox({
      prompt: "What is the URL to your PWA?",
      placeHolder: "https://webboard.app",
    });

    await setURL(url);
  } else {
    // let user know they need to publish their PWA
    // and open docs
    const answer = await vscode.window.showInformationMessage(
      "You need to publish your PWA to the web. Would you like to get a tutorial of how to do this with the Azure Static Web Apps VSCode extension?",
      {
        title: "Learn How",
      },
      {
        title: "OK",
      }
    );

    if (answer && answer.title === "Learn How") {
      azureCommandWalkthrough();
    }
  }
}

// Opens the Azure Command Walkthrough
async function azureCommandWalkthrough(): Promise<void> {
  // ask if they have an azure account
  const azureAccountQuestion = await vscode.window.showQuickPick(
    ["Yes", "No"],
    {
      placeHolder: "Do you have an Azure account?",
    }
  );

  if (azureAccountQuestion !== undefined && azureAccountQuestion === "Yes") {
    // ask if they have the azure command line tool
    const azureCommandQuestion = await vscode.window.showQuickPick(
      ["Yes", "No"],
      {
        placeHolder:
          "Want to learn how to deploy your PWA To Azure Static Web Apps? You get HTTPS by default and optional automated deployment with Github Actions!",
      }
    );

    if (azureCommandQuestion !== undefined && azureCommandQuestion === "Yes") {
      // first you need to create a new azure static web app
      const azureSWAQuestion = await vscode.window.showQuickPick(
        ["Open Documentation", "Cancel"],
        {
          placeHolder:
            "Learn how to using the Azure Static Web Apps VSCode Extension!",
        }
      );

      if (
        azureSWAQuestion !== undefined &&
        azureSWAQuestion === "Open Documentation"
      ) {
        // remind about build directory for pwa-starter
        vscode.window.showInformationMessage(
          "Using the PWABuilder pwa-starter? Set the build directory to /dist when asked"
        );

        // open the walkthrough
        await vscode.commands.executeCommand(
          "vscode.open",
          vscode.Uri.parse(
            "https://docs.microsoft.com/en-us/azure/static-web-apps/getting-started?tabs=vanilla-javascript#install-azure-static-web-apps-extension"
          )
        );
      }
    }
  } else {
    // let user know they need to create an azure account
    // and open docs
    const answer = await vscode.window.showInformationMessage(
      "First, you need to create an Azure account. Would you like to open the documentation on how to do this? You can get started for free using the free tier.",
      {
        title: "Learn How",
      },
      {
        title: "OK",
      }
    );

    if (answer && answer.title === "Learn How") {
      // open link
      await vscode.commands.executeCommand(
        "vscode.open",
        vscode.Uri.parse("https://azure.microsoft.com/free/")
      );
    }
  }
}
