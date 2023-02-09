import * as vscode from "vscode";
import { getScriptsObject, initDashboard } from "./dev-dashboard";

export class DashboardViewProvider implements vscode.TreeDataProvider<any> {
    scripts: any = {};

    constructor(private workspaceRoot: string) {
    }

    getTreeItem(element: DashboardItem): vscode.TreeItem {
        return element;
    }

    async getChildren(
        element?: DashboardItem
    ): Promise<DashboardItem[] | undefined> {
        if (!this.workspaceRoot) {
            vscode.window.showInformationMessage("You can't have a dashboard open in an empty workspace.");
            return Promise.resolve([]);
        }
        else if (element) {
            return Promise.resolve(this.getDashboardItems(element));
        }
        else {
            const items: DashboardItem[] = [];

            items.push(
                new DashboardItem(
                    "Dev Actions",
                    "https://pwabuilder.com",
                    "Your actions, such as starting a dev server, are listed here.",
                    vscode.TreeItemCollapsibleState.Expanded
                )
            );

            items.push(
                new DashboardItem(
                    "Add Native Features",
                    "https://pwabuilder.com",
                    "Easily add native features such as shortcuts to your app",
                    vscode.TreeItemCollapsibleState.Expanded
                )
            );

            items.push(
                new DashboardItem(
                    "Assets",
                    "https://pwabuilder.com",
                    "Manage your app's assets",
                    vscode.TreeItemCollapsibleState.Expanded
                )
            );

            items.push(
                new DashboardItem(
                    "Packaging",
                    "https://pwabuilder.com",
                    "Package your PWA for the app stores",
                    vscode.TreeItemCollapsibleState.Expanded
                )
            );

            return Promise.resolve(items);
        }
    }

    private async getDashboardItems(element: DashboardItem): Promise<DashboardItem[]> {
        return new Promise(async (resolve) => {
            await initDashboard();

            if (element && element.label === "Dev Actions") {
                const items: DashboardItem[] = [];
                const scripts = await getScriptsObject();

                for (const script in scripts) {
                    // check and see if the script is already in items
                    if (!items.find(item => item.docsLink === scripts[script])) {
                        // create vscode command for each script
                        items.push(new DashboardItem(`Run ${script}`, scripts[script], `Run ${scripts[script]}`, vscode.TreeItemCollapsibleState.None,
                            new vscode.ThemeIcon("play"),
                            {
                                command: "pwa-studio.runScript",
                                title: `Run ${script}`,
                                arguments: [script]
                            }));
                    }
                }
                resolve(items);
            }
            else if (element && element.label === "Add Native Features") {
                const items: DashboardItem[] = [];

                items.push(new DashboardItem("Add Shortcuts", "https://pwabuilder.com", "Add Shortcuts", vscode.TreeItemCollapsibleState.None,
                    new vscode.ThemeIcon("add"), {
                    command: "pwa-studio.addShortcuts",
                    title: "Add a shortcut",
                    arguments: []
                }));

                items.push(
                    new DashboardItem(
                        "Receive Shared Content",
                        "https://pwabuilder.com",
                        "Use Share Target to receive shared content to your app",
                        vscode.TreeItemCollapsibleState.None,
                        new vscode.ThemeIcon("add"),
                        {
                            command: "pwa-studio.addShareTarget",
                            title: "Add a share target",
                            arguments: []
                        }
                    )
                );

                items.push(
                    new DashboardItem(
                        "Handle a custom protocol",
                        "https://pwabuilder.com",
                        "Use a protocol handler to handle a custom protocol",
                        vscode.TreeItemCollapsibleState.None,
                        new vscode.ThemeIcon("add"),
                        {
                            command: "pwa-studio.addProtocolHandler",
                            title: "Add a protocol handler",
                            arguments: []
                        }
                    )
                );

                items.push(
                    new DashboardItem(
                        "Handle files directly",
                        "https://pwabuiler.com",
                        "Use a file handler to allow your app to handle files directly",
                        vscode.TreeItemCollapsibleState.None,
                        new vscode.ThemeIcon("add"),
                        {
                            command: "pwa-studio.addFileHandler",
                            title: "Add a file handler",
                            arguments: []
                        }
                    )
                )

                resolve(items);
            }
            else if (element && element.label === "Packaging") {
                const items: DashboardItem[] = [];

                items.push(
                    new DashboardItem(
                        "Microsoft Store",
                        "https://pwabuilder.com",
                        "Package for the Microsoft Store",
                        vscode.TreeItemCollapsibleState.None,
                        new vscode.ThemeIcon("play"),
                        {
                            command: "pwa-studio.packageApp",
                            title: "Package your app",
                            arguments: []
                        }
                    )
                );

                items.push(
                    new DashboardItem(
                        "Google Play",
                        "https://pwabuilder.com",
                        "Package for Google Play",
                        vscode.TreeItemCollapsibleState.None,
                        new vscode.ThemeIcon("play"),
                        {
                            command: "pwa-studio.packageApp",
                            title: "Package your app",
                            arguments: []
                        }
                    )
                );

                items.push(
                    new DashboardItem(
                        "Apple App Store",
                        "https://pwabuilder.com",
                        "Package for the Apple App Store",
                        vscode.TreeItemCollapsibleState.None,
                        new vscode.ThemeIcon("play"),
                        {
                            command: "pwa-studio.packageApp",
                            title: "Package your app",
                            arguments: []
                        }
                    )
                );

                items.push(
                    new DashboardItem(
                        "Meta Quest",
                        "https://pwabuilder.com",
                        "Package for Meta Quest",
                        vscode.TreeItemCollapsibleState.None,
                        new vscode.ThemeIcon("play"),
                        {
                            command: "pwa-studio.packageApp",
                            title: "Package your app",
                            arguments: []
                        }
                    )
                );

                resolve(items);
            }
            else if (element && element.label === "Assets") {
                const items: DashboardItem[] = [];

                items.push(new DashboardItem('Generate Icons', 'https://pwabuilder.com', 'Generate icons for your app', vscode.TreeItemCollapsibleState.None,
                    new vscode.ThemeIcon("file-media"),
                    {
                        command: "pwa-studio.generateIcons",
                        title: "Generate icons",
                        arguments: []
                    }));

                items.push(new DashboardItem('Generate Screenshots', 'https://pwabuilder.com', 'Generate splash screens for your app', vscode.TreeItemCollapsibleState.None,
                    new vscode.ThemeIcon("file-media"),
                    {
                        command: "pwa-studio.generateScreenshots",
                        title: "Generate screenshots",
                        arguments: []
                    }));

                resolve(items);

            }
            else {
                resolve([]);
            }
        });
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

class DashboardItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly docsLink: string,
        public readonly desc: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly iconPath?: vscode.ThemeIcon,
        public readonly command?: vscode.Command
    ) {
        super(label, collapsibleState);
        this.tooltip = `${desc}`;
        this.description = desc;
        this.command = command;
        this.collapsibleState = collapsibleState;
        this.label = label;
        this.iconPath = iconPath;
    }

}