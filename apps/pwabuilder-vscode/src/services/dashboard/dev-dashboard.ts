import * as vscode from "vscode";

export let scriptsObject: any = {};
export let goodProdBuildScript: string | undefined;
export let goodDevBuildScript: string | undefined;
export let goodTestScript: string | undefined;

let terminal: vscode.Terminal | undefined;

export async function initDashboard(): Promise<void> {
    const packageJson: vscode.Uri = await findPackageJSON();

    if (packageJson) {
        const packageScripts: any = await findScripts(packageJson);
        if (packageScripts) {
            const keys = Object.keys(packageScripts);

            keys.map((key) => {
                if (!scriptsObject[key]) {
                    if (key === "start" || key === "dev") {
                        goodDevBuildScript = packageScripts[key];
                        scriptsObject["dev"] = goodDevBuildScript;
                    }
                    else if (key === "build" || key === "prod" || key === "build-prod") {
                        goodProdBuildScript = packageScripts[key];
                        scriptsObject["build"] = goodProdBuildScript;
                    }
                    else if (key === "test") {
                        goodTestScript = packageScripts[key];
                        scriptsObject["test"] = goodTestScript;
                    }
                }
            });
        }
    }
}

export async function stopRunningScript() {
    terminal?.sendText("Ctrl+C");
    terminal?.dispose();
}

export async function runScript(script: string) {
    console.log("running", script,)
    terminal = vscode.window.createTerminal(`${script}`);
    terminal.show();

    if (script.includes("npm run")) {
        terminal.sendText(script)
    }
    else {
        terminal.sendText(`npm run ${script}`)
    }
    // terminal?.dispose();
}

export async function runTests() {
    const testScript = scriptsObject["test"];

    if (testScript) {
        terminal = vscode.window.createTerminal("Test");
        terminal.sendText(testScript);
        terminal.show();
    }
}

export async function setupProdBuild() {
    const prodBuildScript = scriptsObject["build"];

    const prompt = await vscode.window.showInformationMessage(
        `Is this the production build script?: ${prodBuildScript}`,
        "Yes",
        "No"
    );

    if (prompt === "No") {
        const prodBuildScriptInput = await vscode.window.showInputBox({
            placeHolder: "Enter production build script",
        });

        if (prodBuildScriptInput) {
            goodProdBuildScript = prodBuildScriptInput;
        }
    }
    else if (prompt === "Yes") {
        goodProdBuildScript = prodBuildScript;
    }
    else {
        goodProdBuildScript = undefined;
    }

    if (prodBuildScript) {
        const terminal = vscode.window.createTerminal("Build");
        terminal.sendText(prodBuildScript);
        terminal.show();
    }
}

export async function setupDevBuild() {
    // get dev build script from scriptsObject
    const devBuildScript = scriptsObject["start"] || scriptsObject["dev"];

    const prompt = await vscode.window.showInformationMessage(
        `Is this the development build script?: ${devBuildScript}`,
        "Yes",
        "No"
    );

    if (prompt === "No") {
        const devBuildScriptInput = await vscode.window.showInputBox({
            placeHolder: "Enter development build script",
        });

        if (devBuildScriptInput) {
            goodDevBuildScript = devBuildScriptInput;
        }
    }
    else if (prompt === "Yes") {
        goodDevBuildScript = devBuildScript;
    }
    else {
        goodDevBuildScript = undefined;
    }

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
        } catch (err) {
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
        } catch (err) {
            reject(`Error finding scripts in package.json: ${err}`);
        }
    });
}

export function getScriptsObject() {
    return scriptsObject;
}