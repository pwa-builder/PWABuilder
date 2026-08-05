var fs = require('fs');
import { Article, ChildMenu, ParentMenu } from './menuInterfaces';
import { topLevelNavEntries, headerHTMLString } from './menuData';

var mainMenu: ParentMenu = {
    childMenus: []
}

export function writeMenusFromParentMenu(parentMenu: ParentMenu) {

    for (var childMenu of parentMenu.childMenus) {
        var condensedChildMenu: ChildMenu = writeChildMenu(childMenu);
        mainMenu.childMenus = mainMenu.childMenus.concat(condensedChildMenu);
    }

    writeMainMenu();
}

function writeChildMenu(child: ChildMenu): ChildMenu {

    const path: string = process.cwd() + child.path + "_sidebar.md";
    var writeString = headerHTMLString + constructTreeStart(child.header);
    var condensedChildMenu: ChildMenu = {
        header: child.header,
        path: child.path,
        articles: []
    }

    if (doesFileExist(path)) {
        removeFile(path);
    }

    writeString = writeString + constructChildMenuStart(child);
    for (var article of child.articles) {
        writeString = writeString + constructArticleTreeItem(article);
        if (article.includeOnHomePage) {
            condensedChildMenu.articles = condensedChildMenu.articles.concat(article);
        }
    }
    writeString = writeString + constructChildMenuEnd() + constructTreeEnd();

    fs.writeFileSync(path, writeString);

    return condensedChildMenu;
}

function writeMainMenu() {
    const path: string = process.cwd() + "/_sidebar.md";
    var writeString = headerHTMLString + constructTreeStart("Home");

    for (var childMenu of mainMenu.childMenus) {
        if (childMenu.articles.length > 0) {
            writeString = writeString + constructChildMenuStart(childMenu);
            for (var article of childMenu.articles) {
                writeString = writeString + constructArticleTreeItem(article);
            }
            writeString = writeString + constructChildMenuEnd();
        }
    }
    writeString = writeString + constructTreeEnd();

    fs.writeFileSync(path, writeString);
}

function constructArticleTreeItem(article: Article): string {
    return `
    <wa-tree-item>
      <a href="${article.path}" title="${article.pageTitle}">${article.menuTitle}</a>
    </wa-tree-item>`;
}

function constructChildMenuStart(childMenu: ChildMenu): string {
    return `
  <wa-tree-item expanded>
    ${childMenu.header}`;
}

function constructChildMenuEnd(): string {
    return `
  </wa-tree-item>`;
}

function constructTreeStart(activeHeader: string): string {
    var treeHTMLString: string = `\n<wa-tree class="sidebar-tree" aria-label="PWABuilder documentation">`;

    for (var entry of topLevelNavEntries) {
        treeHTMLString = treeHTMLString + constructTopLevelNavEntryString(entry, activeHeader);
    }

    return treeHTMLString;
}

function constructTopLevelNavEntryString(entry: string[], header: string): string {
    return `
  <wa-tree-item${entry[0] == header ? " selected" : ""}>
    <a href="${entry[1]}">${entry[0]}</a>
  </wa-tree-item>`;
}

function constructTreeEnd(): string {
    return `
</wa-tree>`;
}

function removeFile(path: string): void {
    fs.rmSync(path, { recursive: true, force: true });
}

export function doesFileExist(filepath: string): boolean {
    return fs.existsSync(filepath);
}