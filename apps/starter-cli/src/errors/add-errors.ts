type AddCommandErrors = {
  invalidLocation: string,
  invalidHTMLElementName: string,
  failedToFindIndex: string
}

export const addCommandErrors: AddCommandErrors = {

  invalidLocation: "Could not locate 'src/pages/', make sure to run the add command from the root of your PWA directory.",

  invalidHTMLElementName:`Inputted element name was invalid.
    Please make sure your element name:
    1) Contains only letters, numbers, and "-".
    2) Begins and ends with a letter.`,

  failedToFindIndex: "Could not find 'src/app-index.ts'. This file must exist in order to generate pages."
}