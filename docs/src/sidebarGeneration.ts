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
  let articleIndex = 0;
  for(var article of child.articles) {
    writeString = writeString + constructMenuItemLineString(article, articleIndex, child.articles.length);
    articleIndex++;
    if (article.includeOnHomePage) {
      condensedChildMenu.articles = condensedChildMenu.articles.concat(article);
    }
  }
  writeString = writeString + constructSectionCloseString();

  // Add the accessibility script at the end
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
      let articleIndex = 0;
      for(var article of childMenu.articles) {
        writeString = writeString + constructMenuItemLineString(article, articleIndex, childMenu.articles.length);
        articleIndex++;
      }
      writeString = writeString + constructSectionCloseString();
    }  
  }

  // Add the accessibility script at the end
  writeString = writeString + quickMenuListenerScriptString;

  fs.writeFileSync(path, writeString);
}

function constructMenuItemLineString(article: Article, index: number, total: number): string {
  return `\n<li role="treeitem" 
         aria-setsize="${total}" 
         aria-posinset="${index + 1}"
         tabindex="-1"
         class="article-item">
    <a href="${article.path}" title="${article.pageTitle}" class="article-link">${article.menuTitle}</a>
  </li>`;
}

function constructHeaderLineString(childMenu: ChildMenu): string {
  return `\n\n<section role="group" aria-label="${childMenu.header} section">
<h2 role="treeitem" aria-expanded="true" class="section-header" tabindex="0">${childMenu.header}</h2>
<ul role="group" aria-label="${childMenu.header} articles" class="section-articles">`;
}

function constructSectionCloseString(): string {
  return `\n</ul>\n</section>`;
}

function constructTopLevelNavString(activeHeader: string): string {
  var topLevelNavHTMLString: string = `\n<nav role="navigation" aria-label="Main navigation">
<ul role="tree" aria-label="Documentation sections" class="nav-tree">`;

  let index = 0;
  for(var entry of topLevelNavEntries) {
    topLevelNavHTMLString = topLevelNavHTMLString + constructTopLevelNavEntryString(entry, activeHeader, index, topLevelNavEntries.length);
    index++;
  }

  topLevelNavHTMLString = topLevelNavHTMLString + `\n</ul>
</nav>`;

  return topLevelNavHTMLString;
}

function constructTopLevelNavEntryString(entry: string[], header: string, index: number, total: number): string {
  const isSelected = entry[0] === header;
  return `
  <li role="treeitem" 
      aria-expanded="false" 
      aria-selected="${isSelected}" 
      aria-setsize="${total}" 
      aria-posinset="${index + 1}"
      tabindex="${isSelected ? '0' : '-1'}"
      data-href="${entry[1]}"
      class="nav-item${isSelected ? ' selected' : ''}">
    <span class="nav-label">${entry[0]}</span>
  </li>`;
}

function removeFile(path: string): void {
  fs.rmSync(path, { recursive: true, force: true });
}

export function doesFileExist(filepath: string): boolean {
  return fs.existsSync(filepath);
}