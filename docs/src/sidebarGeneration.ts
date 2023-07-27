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
    }  
  }

  fs.writeFileSync(path, writeString);
}

function constructMenuItemLineString(article: Article): string {
  return `\n\t- [${article.menuTitle}](${article.path} "${article.pageTitle}")`;
}

function constructHeaderLineString(childMenu: ChildMenu): string {
  return `\n\n\- **${childMenu.header}**`;
}

function constructTopLevelNavString(activeHeader: string): string {
  var topLevelNavHTMLString: string = `\n<sl-menu>`;

  for(var entry of topLevelNavEntries) {
    topLevelNavHTMLString = topLevelNavHTMLString + constructTopLevelNavEntryString(entry, activeHeader);
  }

  topLevelNavHTMLString = topLevelNavHTMLString + `\n</sl-menu>`;

  return topLevelNavHTMLString;
}

function constructTopLevelNavEntryString(entry: string[], header: string): string {
  return `
  <sl-menu-item onClick="(function (event) {
    location.href = '${entry[1]}';
  })();" ${entry[0] == header ? " checked" : ""}>
    ${entry[0]}
  </sl-menu-item>`;
}

function removeFile(path: string): void {
  fs.rmSync(path, { recursive: true, force: true });
}

export function doesFileExist(filepath: string): boolean {
  return fs.existsSync(filepath);
}