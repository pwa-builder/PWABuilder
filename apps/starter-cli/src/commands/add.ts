import type { Arguments, CommandBuilder } from "yargs";
import type { PageNameVariations } from "../types/PageNameVariations.type";
import type { AddCommandOptions } from "../types/command-options-types";

import { pageCode, pageRouteCodeSnippet } from "../generate-assets/new-page-lit";
import { createFileAndWrite, replaceAllInFile, doesFileExist } from "../util/file-util";
import { outputError } from "../util/util";
import { addCommandErrors } from "../errors/add-errors";

export const command: string = 'add <type> [name]';
export const desc: string = '';

const defaultPageName: string = "new-page";
const defaultPagesDirectoryPathFromRoot: string = "./src/pages/";
const defaultIndexPath: string = './src/app-index.ts';

export const builder: CommandBuilder<AddCommandOptions, AddCommandOptions> = (yargs) =>
  yargs
    .positional('type', {type: "string", demandOption: true})
    .positional('name', {type: "string", demandOption: false});

export const handler = (argv: Arguments<AddCommandOptions>): void => {
  const {type, name} = argv;
  selectAddHandler(type, name);
}

function addPageHandler(pageName?: string | undefined) {
  if(validatePageCommandCall(pageName)) {
    const nameVariations: PageNameVariations = getPageNameVariations(pageName);
    generatePageSourceFile(nameVariations, pageCode);
    addPageToRouter(nameVariations);
  } 
}

function selectAddHandler(type: string, name?: string | undefined) {
  switch(type) {
    case "page":
      addPageHandler(name);
      break;
    default: 
      const invalidTypeErrorMessage: string = 'Could not add content of type \'' + type + '\'. Try adding a \'page\' or a \'component\'.';
      outputError(invalidTypeErrorMessage);
  }
}

function getPageNameVariations(inputName? : string | undefined): PageNameVariations {
  const initialName = inputName ? inputName: defaultPageName;
  const filename = generateUniqueFilenameRecursive(initialName.toLowerCase(), 0);
  const name = filename.slice(0, -3);
  const className = createClassName(name);

  return {default: name, file: filename, class: className};
}

function generateUniqueFilenameRecursive(filename: string,  count: number): string {
  const tsFilename: string = createTypescriptFileName(filename, count);
  if(!doesFileExist(defaultPagesDirectoryPathFromRoot + tsFilename)) {
    return tsFilename;
  } else {
    return generateUniqueFilenameRecursive(filename, count + 1);
  }
}

function createTypescriptFileName(filename: string, count: number): string {
  return (count == 0 ? filename : filename + "-" + String.fromCharCode(96 + count)) + '.ts';
}

function createClassName(inputName: string) {
  let splitStringArray: string[] = inputName.split('-');

  for (let i = 0; i < splitStringArray.length; i++) {
    splitStringArray[i] = splitStringArray[i].slice(0, 1).toUpperCase() + splitStringArray[i].slice(1);
  }

  return splitStringArray.join('');
}

function validateHTMLElementName(name?: string): boolean {
  const checkForSpecialCharactersRegex: RegExp = /^[a-zA-Z0-9-]+$/;
  const checkForAlphaChar: RegExp = /[a-zA-Z]/;
  return !name|| (checkForSpecialCharactersRegex.test(name) && checkForAlphaChar.test(name[0]) && checkForAlphaChar.test(name[name.length - 1]));
}

function validatePageCommandCall(name: string | undefined): boolean {
  const isValidLocation: boolean = doesFileExist(defaultPagesDirectoryPathFromRoot);
  const isValidHTMLElementName: boolean = validateHTMLElementName(name);
  
  if(!isValidLocation) {
    outputError(addCommandErrors.invalidLocation);
  }

  if(!isValidHTMLElementName) {
    outputError(addCommandErrors.invalidHTMLElementName);
  }
  
  return isValidLocation && isValidHTMLElementName;
}

function replaceNameTokens(originalString: string, nameVariations: PageNameVariations): string {
  let updatedString = originalString.replaceAll("#DEFAULT#", nameVariations.default);
  updatedString = updatedString.replaceAll("#CLASS_NAME#", nameVariations.class);

  return updatedString;
}

function generatePageSourceFile(nameVariations: PageNameVariations, source: string) {
  const sourceWithTokensReplaced: string = replaceNameTokens(source, nameVariations);
  createFileAndWrite(defaultPagesDirectoryPathFromRoot + nameVariations.file, sourceWithTokensReplaced);
}

function addPageToRouter(nameVariations: PageNameVariations) {
  if(doesFileExist(defaultIndexPath)) {
    const newRouteSnippet: string = replaceNameTokens(pageRouteCodeSnippet, nameVariations);
    replaceAllInFile(defaultIndexPath, "/* ROUTE GENERATION MARKER */", newRouteSnippet);
  } else {
    outputError(addCommandErrors.failedToFindIndex);
  }
}