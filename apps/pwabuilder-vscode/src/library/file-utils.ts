import * as vscode from "vscode";

export async function pathExists(path: vscode.Uri): Promise<boolean> {
  try {
    const test = await vscode.workspace.fs.stat(path);
    if (test) {
      return true;
    } else {
      return false;
    }
  } catch (err: any) {
    console.error(
      `Error checking manifest path: ${err && err.message ? err.message : err}`
    );
  }

  return false;
}
