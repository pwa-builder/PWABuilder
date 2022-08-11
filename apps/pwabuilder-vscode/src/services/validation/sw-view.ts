import * as vscode from "vscode";
import * as path from "path";
import { readFile } from "fs/promises";
import { findWorker } from "../service-worker";
import { pathExists } from "../../library/file-utils";

/**
 * This is the Service Worker Panel
 */

export class ServiceWorkerProvider implements vscode.TreeDataProvider<any> {
  constructor(private workspaceRoot: string) {}

  getTreeItem(element: ValidationItem): vscode.TreeItem {
    return element;
  }

  async getChildren(
    element?: ValidationItem
  ): Promise<ValidationItem[] | undefined> {
    if (!this.workspaceRoot) {
      vscode.window.showInformationMessage("No Validations in empty workspace");
      return Promise.resolve([]);
    }

    const serviceWorkerId: vscode.Uri = await findWorker();
    const serviceWorkerExists = await pathExists(serviceWorkerId);

    if (element && serviceWorkerId && serviceWorkerExists) {
      const items = [];

      const swContents = await readFile(serviceWorkerId.fsPath, "utf8");

      if (
        swContents.includes("preacache") ||
        swContents.includes("cache") ||
        swContents.includes("caches")
      ) {
        items.push(
          new ValidationItem(
            "Handles Caching",
            "https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Offline_Service_workers",
            "true",
            vscode.TreeItemCollapsibleState.None
          )
        );
      } else {
        items.push(
          new ValidationItem(
            "Handles Caching",
            "https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Offline_Service_workers",
            "false",
            vscode.TreeItemCollapsibleState.None
          )
        );
      }

      let indexFile: undefined | vscode.Uri;
      const indexFileData = await vscode.workspace.findFiles(
        "**/index.html",
        "**/node_modules/**"
      );

      if (indexFileData && indexFileData.length > 0) {
        indexFile = indexFileData[0];
      }

      if (indexFile) {
        const indexFileExists = await pathExists(indexFile);
        if (indexFileExists) {
          const indexContents = await readFile(indexFile.fsPath, "utf8");

          if (
            indexContents &&
            indexContents.includes("serviceWorker.register")
          ) {
            items.push(
              new ValidationItem(
                "Registered",
                "https://developers.google.com/web/fundamentals/primers/service-workers/registration",
                "true",
                vscode.TreeItemCollapsibleState.None
              )
            );
          } else {
            items.push(
              new ValidationItem(
                "Registered",
                "https://developers.google.com/web/fundamentals/primers/service-workers/registration",
                "false",
                vscode.TreeItemCollapsibleState.None
              )
            );
          }
        }
      }

      return Promise.resolve(items);
    } else if (
      serviceWorkerId &&
      serviceWorkerId.fsPath &&
      serviceWorkerExists
    ) {
      return Promise.resolve([
        new ValidationItem(
          "Service Worker",
          "https://docs.microsoft.com/en-us/microsoft-edge/progressive-web-apps-chromium/how-to/service-workers",
          "true",
          vscode.TreeItemCollapsibleState.Expanded,
          {
            command: "vscode.open",
            title: "Open Service Worker",
            arguments: [serviceWorkerId],
          }
        ),
      ]);
    } else {
      return Promise.resolve([]);
    }
  }

  private _onDidChangeTreeData: vscode.EventEmitter<
    any | undefined | null | void
  > = new vscode.EventEmitter<any | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<any | undefined | null | void> =
    this._onDidChangeTreeData.event;

  refresh(ev: any): void {
    this._onDidChangeTreeData.fire(ev);
  }
}

class ValidationItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly docsLink: string,
    public readonly desc: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly command?: vscode.Command
  ) {
    super(label, collapsibleState);
    this.tooltip = `${this.label}`;
    this.description = this.desc;
    this.command = command;
  }

  iconPath =
    this.desc.toString() === "true"
      ? new vscode.ThemeIcon("check")
      : new vscode.ThemeIcon("warning");
}
