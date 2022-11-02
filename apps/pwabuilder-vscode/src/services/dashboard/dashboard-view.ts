import * as vscode from "vscode";

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

    private getDashboardItems(): DashboardItem[] {
        const items: DashboardItem[] = [];
        items.push(new DashboardItem("Dev Build", "dev", "Build for development", vscode.TreeItemCollapsibleState.None, {
            command: "pwa-studio.devBuild",
            title: `Dev Build`
        }));

        items.push(new DashboardItem("Production Build", "build", "Build for production", vscode.TreeItemCollapsibleState.None, {
            command: "pwa-studio.prodBuild",
            title: `Production Tests`
        }));

        items.push(new DashboardItem("Run Tests", "test", "Run tests", vscode.TreeItemCollapsibleState.None, {
            command: "pwa-studio.runTests",
            title: `Run Tests`
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

    iconPath = new vscode.ThemeIcon("gear");

}