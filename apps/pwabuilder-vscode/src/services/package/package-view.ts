import * as vscode from "vscode";
import * as path from "path";
import { getWorker } from "../service-worker";
import { getManifest } from "../manifest/manifest-service";
import { getURL } from "../web-publish";

export class PackageViewProvider implements vscode.TreeDataProvider<any> {
  constructor(private workspaceRoot: string) { }

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
      if (element.label === "Is a PWA") {
        let items: ValidationItem[] = [];

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
      }
      else if (element.label === "Publish to Stores") {
        let items: ValidationItem[] = [];

        items.push(
          new ValidationItem(
            "Microsoft Store",
            "https://aka.ms/windows-from-code",
            "Checklist for publishing your app to the Microsoft Store",
            vscode.TreeItemCollapsibleState.Collapsed
          )
        );

        items.push(
          new ValidationItem(
            "Google Play Store",
            "https://aka.ms/android-from-code",
            "Checklist for publishing your app to the Google Play Store",
            vscode.TreeItemCollapsibleState.Collapsed
          )
        );

        items.push(
          new ValidationItem(
            "Apple App Store",
            "https://aka.ms/ios-from-code",
            "Checklist for publishing your app to the Apple App Store",
            vscode.TreeItemCollapsibleState.Collapsed
          )
        )

        return Promise.resolve(items);
      }
      else if (element.label === "Microsoft Store") {
        let items: ValidationItem[] = [];

        items.push(
          new ValidationItem(
            "Microsoft Developer Account",
            "https://docs.pwabuilder.com/#/builder/windows?id=prerequisites",
            "Get a Microsoft Developer Account to publish to the Microsoft Store",
            vscode.TreeItemCollapsibleState.None
          )
        );

        items.push(
          new ValidationItem(
            "Reserve Your App",
            "https://docs.pwabuilder.com/#/builder/windows?id=reserve-your-app",
            "Reserve your app in the Microsoft Store",
            vscode.TreeItemCollapsibleState.None
          )
        );

        items.push(
          new ValidationItem(
            "Generate Your Package",
            "https://docs.pwabuilder.com/#/builder/windows?id=packaging",
            "Generate your package for the Microsoft Store",
            vscode.TreeItemCollapsibleState.None
          )
        );

        items.push(
          new ValidationItem(
            "Submit Your PWA",
            "https://docs.pwabuilder.com/#/builder/windows?id=submitting-your-pwa",
            "Submit your PWA to the Microsoft Store",
            vscode.TreeItemCollapsibleState.None
          )
        );

        return Promise.resolve(items);
      }
      else if (element.label === "Google Play Store") {
        let items: ValidationItem[] = [];

        items.push(
          new ValidationItem(
            "Google Developer Account",
            "https://docs.pwabuilder.com/#/builder/android?id=prerequisites",
            "Get a Google Developer Account to publish to the Google Play Store",
            vscode.TreeItemCollapsibleState.None
          )
        );

        items.push(
          new ValidationItem(
            "Generate Your Package",
            "https://docs.pwabuilder.com/#/builder/android?id=packaging",
            "Generate your package for the Google Play Store",
            vscode.TreeItemCollapsibleState.None
          )
        );

        items.push(
          new ValidationItem(
            "Handle your assetlinks.json",
            "https://docs.pwabuilder.com/#/builder/android?id=_1-deploy-the-assetlinksjson-file",
            "Handle your assetlinks.json file",
            vscode.TreeItemCollapsibleState.None
          )
        );

        items.push(
          new ValidationItem(
            "Submit Your PWA",
            "https://docs.pwabuilder.com/#/builder/android?id=_2-upload-your-app-to-the-google-play-store",
            "Submit your PWA to the Google Play Store",
            vscode.TreeItemCollapsibleState.None
          )
        );

        return Promise.resolve(items);
      }
      else if (element.label === "Apple App Store") {
        let items: ValidationItem[] = [];

        items.push(
          new ValidationItem(
            "Apple Developer Account",
            "https://docs.pwabuilder.com/#/builder/app-store?id=prerequisites",
            "Get an Apple Developer Account to publish to the Apple App Store",
            vscode.TreeItemCollapsibleState.None
          )
        );

        items.push(
          new ValidationItem(
            "Generate Your Package",
            "https://docs.pwabuilder.com/#/builder/app-store?id=packaging",
            "Generate your package for the Apple App Store",
            vscode.TreeItemCollapsibleState.None
          )
        );

        items.push(
          new ValidationItem(
            "Build Your App",
            "https://docs.pwabuilder.com/#/builder/app-store?id=building-your-app",
            "Build your app with Xcode",
            vscode.TreeItemCollapsibleState.None
          )
        );

        items.push(
          new ValidationItem(
            "Submit Your PWA",
            "https://docs.pwabuilder.com/#/builder/app-store?id=publishing",
            "Submit your PWA to the Apple App Store",
            vscode.TreeItemCollapsibleState.None
          )
        );

        return Promise.resolve(items);
      }

    } else {
      let items: ValidationItem[] = [];

      items.push(
        new ValidationItem(
          "Is a PWA",
          "",
          sw && manifest && pwaUrl ? "true" : "false",
          vscode.TreeItemCollapsibleState.Expanded
        )
      );

      items.push(
        new ValidationItem(
          "Publish to Stores",
          "",
          "Checklist on how to publish to the app stores",
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
    this.tooltip = `${desc}`;
    this.description = desc;

    if (docsLink && docsLink.length > 0) {
      this.command = {
        command: "vscode.open",
        title: `Open ${docsLink}`,
        arguments: [
          vscode.Uri.parse(docsLink)
        ]
      };

      if (label !== "Published to Web") {
        this.iconPath = new vscode.ThemeIcon("link");
      }
      else {
        this.iconPath =
          this.desc.toString() === "true"
            ? new vscode.ThemeIcon("check")
            : new vscode.ThemeIcon("warning");
      }
    }
    else {
      if (label === "Publish to Stores") {
        this.iconPath = new vscode.ThemeIcon("explorer-view-icon");
      }
      else {
        this.iconPath =
          this.desc.toString() === "true"
            ? new vscode.ThemeIcon("check")
            : new vscode.ThemeIcon("warning");
      }
    }
  }

}
