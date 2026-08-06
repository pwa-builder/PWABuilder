var fs = require('fs');
import { Article, ChildMenu, ParentMenu } from './menuInterfaces';
import { topLevelNavEntries, headerHTMLString } from './menuData';

var mainMenu: ParentMenu = {
    childMenus: []
}

export function writeMenusFromParentMenu(parentMenu: ParentMenu) {

    for (var childMenu of parentMenu.childMenus) {
        var condensedChildMenu: ChildMenu = writeChildMenu(childMenu, parentMenu.childMenus);
        mainMenu.childMenus = mainMenu.childMenus.concat(condensedChildMenu);
    }

    writeMainMenu(parentMenu.childMenus);
}

function writeChildMenu(child: ChildMenu, childMenus: ChildMenu[]): ChildMenu {

    const path: string = process.cwd() + child.path + "_sidebar.md";
    const isTopLevel = isTopLevelMenu(child);
    var writeString = headerHTMLString + constructTreeStart(child.header, childMenus);
    var condensedChildMenu: ChildMenu = {
        header: child.header,
        path: child.path,
        articles: []
    }

    if (doesFileExist(path)) {
        removeFile(path);
    }

    if (!isTopLevel) {
        writeString = writeString + constructChildMenuStart(child);
    }

    for (var article of child.articles) {
        if (!isTopLevel) {
            writeString = writeString + constructArticleTreeItem(article);
        }
        if (article.includeOnHomePage) {
            condensedChildMenu.articles = condensedChildMenu.articles.concat(article);
        }
    }

    if (!isTopLevel) {
        writeString = writeString + constructChildMenuEnd();
    }

    writeString = writeString + constructTreeEnd();

    fs.writeFileSync(path, writeString);

    return condensedChildMenu;
}

function writeMainMenu(childMenus: ChildMenu[]) {
    const path: string = process.cwd() + "/_sidebar.md";
    var writeString = headerHTMLString + constructTreeStart("Home", childMenus);

    for (var childMenu of mainMenu.childMenus) {
        if (!isTopLevelMenu(childMenu) && childMenu.articles.length > 0) {
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
      <a href="${constructDocsifyPath(article.path)}" title="${article.pageTitle}">${article.menuTitle}</a>
    </wa-tree-item>`;
}

function constructDocsifyPath(path: string): string {
    return `/#${path.trim()}`;
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

function constructTreeStart(activeHeader: string, childMenus: ChildMenu[]): string {
    var treeHTMLString: string = `\n<wa-tree class="sidebar-tree" aria-label="PWABuilder documentation">`;

    for (var entry of topLevelNavEntries) {
        const childMenu = childMenus.find(menu => menu.header === entry[0]);
        treeHTMLString = treeHTMLString + constructTopLevelNavEntryString(entry, activeHeader, childMenu);
    }

    return treeHTMLString;
}

function constructTopLevelNavEntryString(entry: string[], header: string, childMenu?: ChildMenu): string {
    const isActive = entry[0] === header;
    const articles = childMenu?.articles ?? [];
    var entryString = `
  <wa-tree-item${isActive && articles.length > 0 ? " expanded" : ""}>
    <a href="${entry[1]}">${entry[0]}</a>`;

    for (var article of articles) {
        entryString = entryString + constructArticleTreeItem(article);
    }

    return entryString + `
  </wa-tree-item>`;
}

function isTopLevelMenu(childMenu: ChildMenu): boolean {
    return topLevelNavEntries.some(entry => entry[0] === childMenu.header);
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