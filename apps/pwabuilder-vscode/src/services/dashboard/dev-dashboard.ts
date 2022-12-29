import * as vscode from "vscode";
import { trackException } from "../usage-analytics";

export let scriptsObject: any = {};

export async function initDashboard(): Promise<void> {
    const packageJson: vscode.Uri = await findPackageJSON();

    if (packageJson) {
        const packageScripts: any = await findScripts(packageJson);
        if (packageScripts) {
            // get keys from packageScripts
            const keys = Object.keys(packageScripts);
            keys.map((key) => {
                if (!scriptsObject[key]) {
                    scriptsObject[key] = packageScripts[key];
                }
            });
        }
    }
}

export async function runScript(script: string) {
    const terminal = vscode.window.createTerminal("PWABuilder Studio");
    terminal.show();
    terminal.sendText(`npm run ${script}`);
}

export async function runTests() {
    const testScript = scriptsObject["test"];

    if (testScript) {
        const terminal = vscode.window.createTerminal("Test");
        terminal.sendText(testScript);
        terminal.show();
    }
}

export async function prodBuild() {
    const prodBuildScript = scriptsObject["build"];
    console.log("prodBuildScript: ", prodBuildScript);

    if (prodBuildScript) {
        const terminal = vscode.window.createTerminal("Build");
        terminal.sendText(prodBuildScript);
        terminal.show();
    }
}

export async function devBuild() {
    // get dev build script from scriptsObject
    const devBuildScript = scriptsObject["start"] || scriptsObject["dev"];

    if (devBuildScript) {
        const terminal = vscode.window.createTerminal("Dev");
        terminal.sendText(devBuildScript);
        terminal.show();
    }
}

// find package.json in project if package.json exists
export function findPackageJSON(): Promise<vscode.Uri> {
    return new Promise(async (resolve, reject) => {
        try {
            const packageJSON = await vscode.workspace.findFiles(
                "**/package.json",
                "**/node_modules/**"
            );

            if (packageJSON && packageJSON.length > 0) {
                resolve(packageJSON[0]);
            } else {
                reject("No package.json found");
            }
        } catch (err: any) {
            trackException(err);
            reject(`Error finding package.json: ${err}`);
        }
    });
}

// find scripts in package.json
export function findScripts(packageJSON: vscode.Uri) {
    return new Promise(async (resolve, reject) => {
        try {
            const packageJSONData = await vscode.workspace.fs.readFile(
                packageJSON
            );
            const packageJSONString = packageJSONData.toString();
            const packageJSONObj = JSON.parse(packageJSONString);

            if (packageJSONObj.scripts) {
                resolve(packageJSONObj.scripts);
            } else {
                reject("No scripts found in package.json");
            }
        } catch (err: any) {
            trackException(err);
            reject(`Error finding scripts in package.json: ${err}`);
        }
    });
}

export function getScriptsObject() {
    return scriptsObject;
}