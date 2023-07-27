import { parentMenuData } from "./menuData";
import { writeMenusFromParentMenu } from "./sidebarGeneration";

function main() {
  writeMenusFromParentMenu(parentMenuData);
}

if (require.main === module) {
  main();
}