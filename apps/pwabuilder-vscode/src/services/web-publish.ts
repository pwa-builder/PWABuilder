import * as vscode from "vscode";
import { storageManager } from "../extension";
import { isNpmInstalled, noNpmInstalledWarning } from "./new-pwa-starter";

let url: string | undefined = undefined;

export function getURL(): string | undefined {
  const urlData = storageManager?.getValue<any>("urlData");
  return urlData?.url;
}

export async function setURL(url: string | undefined): Promise<void> {
  if (url && url.length > 0) {
    storageManager?.setValue<any>("urlData", {
      url: url,
    });

    // to-do: Find a better way to validate URLs

    // show information message about url being added
    vscode.window.showInformationMessage(
      "Your URL has been added"
    );

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
    azureCommandWalkthrough();
  }
}

async function doCLIDeploy(terminal: vscode.Terminal): Promise<void> {
  return new Promise(async (resolve, reject) => {
    // config file has been created, lets keep going

    try {
      // ask user if they want to deploy
      const answer = await vscode.window
        .showInformationMessage(
          "Your Azure Static Web App config has been created. Would you like to continue with deploying?",
          {
            title: "Deploy",
          },
          {
            title: "Cancel",
          }
        );

      if (answer && answer.title === "Deploy") {
        terminal.sendText("npx @azure/static-web-apps-cli deploy");

        resolve();
      }
      else {

        resolve();
      }
    }
    catch (err) {
      reject(err);
    }
  })
}

async function initPublish(terminal: vscode.Terminal): Promise<void> {
  return new Promise(async (resolve, reject) => {
    try {
      const npmCheck = isNpmInstalled();
      if (npmCheck) {
        terminal.show();

        // setup file watcher for swa-cli.config.json
        const watcher = vscode.workspace.createFileSystemWatcher(
          "**/swa-cli.config.json"
        );

        watcher.onDidCreate(async (uri) => {
          if (uri) {
            watcher.dispose();

            await doCLIDeploy(terminal);

            resolve();
          }
        });

        watcher.onDidChange(async (uri) => {
          if (uri) {
            watcher.dispose();

            await doCLIDeploy(terminal);

            resolve();
          }
        })

        terminal.sendText("npx @azure/static-web-apps-cli init --yes");
      } else {
        noNpmInstalledWarning();
      }
    } catch (err) {
      reject(err);
    }
  });
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
        ["Get Started", "Cancel"],
        {
          placeHolder:
            "Deploy with the Azure Static Web Apps CLI",
        }
      );

      if (
        azureSWAQuestion !== undefined &&
        azureSWAQuestion === "Get Started"
      ) {
        // remind about build directory for pwa-starter
        vscode.window.showInformationMessage(
          "Using the PWABuilder pwa-starter? Set the build directory to /dist when asked"
        );

        // init using the CLI
        const vsTerminal = vscode.window.createTerminal();
        await initPublish(vsTerminal);
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
        title: "Cancel",
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
