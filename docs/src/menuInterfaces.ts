export interface Article {
  pageTitle: string,
  menuTitle: string,
  path: string,
  includeOnHomePage: boolean
}

export interface Menu {
  subMenus: SubMenu[]
}

export interface SubMenu {
  header: string,
  articles: Article[]
}