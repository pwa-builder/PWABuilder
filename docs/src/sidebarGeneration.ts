var fs = require('fs');
import {Article, ChildMenu, ParentMenu} from './menuInterfaces';
import { topLevelNavEntries, headerHTMLString, quickMenuListenerScriptString } from './menuData';

var mainMenu: ParentMenu = {
  childMenus: []
}

export function writeMenusFromParentMenu(parentMenu: ParentMenu) {

  for(var childMenu of parentMenu.childMenus) {
    var condensedChildMenu: ChildMenu = writeChildMenu(childMenu);
    mainMenu.childMenus = mainMenu.childMenus.concat(condensedChildMenu);
  }

  writeMainMenu();
}

function writeChildMenu(child: ChildMenu): ChildMenu {

  const path: string = process.cwd() + child.path + "_sidebar.md";
  var writeString = headerHTMLString + constructTopLevelNavString(child.header);
  var condensedChildMenu: ChildMenu = {
    header: child.header,
    path: child.path,
    articles: []
  }

  if(doesFileExist(path)) {
    removeFile(path);
  }

  writeString = writeString + constructHeaderLineString(child);
  for(var article of child.articles) {
    writeString = writeString + constructMenuItemLineString(article);
    if (article.includeOnHomePage) {
      condensedChildMenu.articles = condensedChildMenu.articles.concat(article);
    }
  }
  writeString = writeString + constructSectionCloseString();

  // Add the navigation script at the end
  writeString = writeString + quickMenuListenerScriptString;

  fs.writeFileSync(path, writeString);

  return condensedChildMenu;
}

function writeMainMenu() {
  const path: string = process.cwd() + "/_sidebar.md";
  var writeString = headerHTMLString + constructTopLevelNavString("Home");

  for(var childMenu of mainMenu.childMenus) {
    if(childMenu.articles.length > 0) {
      writeString = writeString + constructHeaderLineString(childMenu);
      for(var article of childMenu.articles) {
        writeString = writeString + constructMenuItemLineString(article);
      }
      writeString = writeString + constructSectionCloseString();
    }  
  }

  // Add the navigation script at the end
  writeString = writeString + quickMenuListenerScriptString;

  fs.writeFileSync(path, writeString);
}

function constructMenuItemLineString(article: Article): string {
  return `\n    <sl-tree-item data-href="${article.path}">${article.menuTitle}</sl-tree-item>`;
}

function constructHeaderLineString(childMenu: ChildMenu): string {
  return `\n\n<sl-tree>
  <sl-tree-item expanded>
    ${childMenu.header}`;
}

function constructTopLevelNavString(activeHeader: string): string {
  var topLevelNavHTMLString: string = `\n<sl-tree>`;

  for(var entry of topLevelNavEntries) {
    topLevelNavHTMLString = topLevelNavHTMLString + constructTopLevelNavEntryString(entry, activeHeader);
  }

  topLevelNavHTMLString = topLevelNavHTMLString + `\n</sl-tree>`;

  return topLevelNavHTMLString;
}

function constructTopLevelNavEntryString(entry: string[], header: string): string {
  const isSelected = entry[0] === header;
  return `
  <sl-tree-item ${isSelected ? 'selected' : ''} data-href="${entry[1]}">
    ${entry[0]}
  </sl-tree-item>`;
}

function constructSectionCloseString(): string {
  return `\n  </sl-tree-item>
</sl-tree>`;
}

function removeFile(path: string): void {
  fs.rmSync(path, { recursive: true, force: true });
}

export function doesFileExist(filepath: string): boolean {
  return fs.existsSync(filepath);
}