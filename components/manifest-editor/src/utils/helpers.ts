export function errorInTab(areThereErrors: boolean, panel: string){
  let errorInTab = new CustomEvent('errorInTab', {
    detail: {areThereErrors: areThereErrors, panel: panel},
    bubbles: true,
    composed: true
  });
  return errorInTab;
}

export function insertAfter(newNode: any, existingNode: any) {
  existingNode.parentNode.insertBefore(newNode, existingNode.nextSibling);
}