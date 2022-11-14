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
            vscode.window.showInformationMessage("No dashboard in empty workspace");
            return Promise.resolve([]);
        }
        else {
            return Promise.resolve(this.getDashboardItems());
        }
    }

    private async getDashboardItems(): Promise<DashboardItem[]> {
        await initDashboard();

        const items: DashboardItem[] = [];
        const scripts = await getScriptsObject();

        for (const script in scripts) {
            // check and see if the script is already in items
            if (!items.find(item => item.docsLink === scripts[script])) {
                // create vscode command for each script
                items.push(new DashboardItem(`Run ${script}`, scripts[script], "Run", vscode.TreeItemCollapsibleState.None, {
                    command: "pwa-studio.runScript",
                    title: `Run ${script}`,
                    arguments: [script]
                }));
            }
        }

        items.push(new DashboardItem("Validate my PWA", "https://pwabuilder.com", "Audit", vscode.TreeItemCollapsibleState.None, {
            command: "pwa-studio.validatePWA",
            title: "Audit my PWA",
            arguments: []
        }));

        return items;
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
        public readonly command?: vscode.Command
    ) {
        super(label, collapsibleState);
        this.tooltip = `${desc}`;
        this.description = desc;
        this.command = command;
        this.collapsibleState = collapsibleState;
        this.label = label;
    }

    iconPath = new vscode.ThemeIcon("play");

}