import * as vscode from "vscode";
import * as path from "path";
import { getWorker } from "../service-worker";
import { getManifest } from "../manifest/manifest-service";
import { getURL } from "../web-publish";

export class PackageViewProvider implements vscode.TreeDataProvider<any> {
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

    const sw = getWorker();
    const manifest = getManifest();
    const pwaUrl = getURL();

    if (element) {
      let items: any[] = [];
      items.push(
        new ValidationItem(
          "Service Worker",
          "",
          sw ? "true" : "false",
          vscode.TreeItemCollapsibleState.None
        )
      );

      items.push(
        new ValidationItem(
          "Web Manifest",
          "",
          manifest ? "true" : "false",
          vscode.TreeItemCollapsibleState.None
        )
      );

      if (pwaUrl) {
        items.push(
          new ValidationItem(
            "Published to Web",
            pwaUrl,
            "true",
            vscode.TreeItemCollapsibleState.None
          )
        );
      } else {
        items.push(
          new ValidationItem(
            "Published to Web",
            "",
            "false",
            vscode.TreeItemCollapsibleState.None
          )
        );
      }

      return Promise.resolve(items);
    } else {
      let items: any[] = [];

      items.push(
        new ValidationItem(
          "Store Ready",
          "",
          sw && manifest && pwaUrl ? "true" : "false",
          vscode.TreeItemCollapsibleState.Expanded
        )
      );

      return Promise.resolve(items);
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
