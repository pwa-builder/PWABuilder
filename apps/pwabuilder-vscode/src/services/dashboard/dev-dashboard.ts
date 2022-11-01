import * as vscode from "vscode";

let scriptsObject: any = {};

export async function initDashboard() {
    const packageJson: vscode.Uri = await findPackageJSON();

    if (packageJson) {
        const packageScripts = await findScripts(packageJson);
        console.log("packageScripts: ", packageScripts);
        if (packageScripts) {
            scriptsObject = packageScripts;
        }
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