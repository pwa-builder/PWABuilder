import type { Arguments, CommandBuilder} from "yargs";
import type { CreateOptions, ResolvedCreateOptions } from "../types/createTypes";
import { createDescriptions, createErrors } from "../strings/createStrings";
import { defaultDevOpsReplaceList, defaultContentReplaceList } from "../util/replaceLists";
import { replaceInFileList, doesFileExist, fetchZipAndDecompress, removeDirectory, renameDirectory } from "../util/fileUtil";
import * as prompts from "@clack/prompts";
import { execSyncWrapper } from "../util/util";

export const command: string = 'create [name]';
export const desc: string = createDescriptions.commandDescription;
const defaultName: string = "pwa-starter";

const templateToRepoURLMap = {
  'pwa-starter-main': "https://github.com/pwa-builder/pwa-starter/archive/refs/heads/main.zip",
  'pwa-starter-basic-main': "https://github.com/pwa-builder/pwa-starter-basic/archive/refs/heads/main.zip"
};

export const builder: CommandBuilder<CreateOptions, CreateOptions> = (yargs) =>
  yargs.options({
      template: { type: 'string', alias: 't', description: createDescriptions.templateDescription}
    })
    .positional('name', {type: "string", demandOption: false, description: createDescriptions.nameDescription})
    .usage("$0 create [name] [-t|--template]");
    

export const handler = async (argv: Arguments<CreateOptions>): Promise<void> => {
  const { resolvedName, resolvedTemplate} = await resolveCreateArguments(argv);

  const tempDirectoryName = await fetchZipAndDecompress(templateToRepoURLMap[resolvedTemplate]);
  fixDirectoryStructure(resolvedName, tempDirectoryName, resolvedTemplate);
  if(resolvedName != defaultName) {
    setNewName(resolvedName);
  }

  execSyncWrapper('npm i', resolvedName);
  
};

async function resolveCreateArguments(argv: Arguments<CreateOptions>): Promise<ResolvedCreateOptions> {
  const {name, template} = argv;
  const resolvedName = await resolveNameArgument(name);
  const resolvedTemplate= await resolveTemplateArgument(template);
  return {resolvedName, resolvedTemplate};
}

async function resolveNameArgument(nameArg: string | undefined): Promise<string> {
  let name: string = defaultName;

  if(!nameArg || !validateName(nameArg)) {
    name = await prompts.text({
      message: "Enter a name for your new PWA: ",
      placeholder: "example-pwa-name",
      initialValue: incrementToUnusedFilename(),
      validate(value) {
        if(!validateName(value)) {
          return createErrors.invalidName;
        }
      },
    }) as string;
  } else {
    name = nameArg;
  }

  return name;
}

async function resolveTemplateArgument(templateArg: string | undefined): Promise<string> {
  let template: string = 'default';

  if(!templateArg || !validateTemplate(templateArg)) {
    template = await prompts.select({
      message: 'Select a template for your PWA:',
      options: [
        {value: "pwa-starter-main", label: "Classic PWA Starter", hint: "Recommended"},
        {value: "pwa-starter-basic-main", label: "Simplified PWA Starter", hint: "Less dependencies and a vanilla JS service worker."}
      ]
    }) as string;
  } else {
    template = templateArg as string;
  }

  return template;

}
function validateTemplate(template: string): boolean {
  return templateToRepoURLMap.hasOwnProperty(template);
}
function validateName(name: string): boolean {
  const isValidNameRegex: RegExp = /^[a-zA-Z0-9_-]+$/;
  return !doesFileExist(name) && isValidNameRegex.test(name);
}

function setNewName(newName: string) {
  replaceInFileList(defaultDevOpsReplaceList, defaultName, newName, newName);
  replaceInFileList(defaultContentReplaceList, "PWA Starter", newName, newName);
}

function incrementToUnusedFilename(): string {
  let directoryName: string = defaultName;
  var iteration: number = 0;

  while(doesFileExist(directoryName)) {
    iteration = iteration + 1;
    directoryName = `${defaultName}-${iteration}`;
  }

  return directoryName;
}

function fixDirectoryStructure(newName: string, decompressedName: string, template: string): void {
  renameDirectory(`${decompressedName}/${template}`, `./${newName}`);
  removeDirectory(decompressedName);
  removeDirectory(`${decompressedName}.zip`);
}