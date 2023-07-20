export interface Article {
  pageTitle: string,
  menuTitle: string,
  path: string,
  includeOnHomePage: boolean
}

export interface ParentMenu {
  childMenus: ChildMenu[]
}

export interface ChildMenu {
  header: string,
  path: string,
  articles: Article[]
}