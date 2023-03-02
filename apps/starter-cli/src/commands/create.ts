import type { Arguments, CommandBuilder} from "yargs";
import type { CreateOptions, ResolvedCreateOptions } from "../types/createTypes";
import { createDescriptions, createErrors } from "../strings/createStrings";
import * as prompts from "@clack/prompts";

import { litFileReplaceList } from "../util/replaceLists";
import { replaceInFileList, removeDirectory, doesFileExist } from "../util/fileUtil";
import { execSyncWrapper } from "../util/util";

export const command: string = 'create [name]';
export const desc: string = createDescriptions.commandDescription;
const defaultName: string = "pwa-starter";

const templateToRepoURLMap = {
  'default': "https://github.com/pwa-builder/pwa-starter.git",
  'basic': "https://github.com/pwa-builder/pwa-starter-basic.git"
};

export const builder: CommandBuilder<CreateOptions, CreateOptions> = (yargs) =>
  yargs.options({
      template: { type: 'string', alias: 't', description: createDescriptions.templateDescription}
    })
    .positional('name', {type: "string", demandOption: false, description: createDescriptions.nameDescription})
    .usage("$0 create [name] [-t|--template]");
    

export const handler = async (argv: Arguments<CreateOptions>): Promise<void> => {
  const { resolvedName, resolvedTemplate} = await resolveCreateArguments(argv);

  cloneRepoBasedOnTemplate(resolvedTemplate, resolvedName);
  removeGit(resolvedName);
  gitInit(resolvedName);
  npmInit(resolvedName);

  if(resolvedName != defaultName) {
    setNewName(resolvedName, litFileReplaceList);
  }
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
      placeholder: defaultName,
      initialValue: defaultName,
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
        {value: "default", label: "Classic PWA Starter", hint: "Recommended"},
        {value: "basic", label: "Simplified PWA Starter", hint: "Less dependencies and a vanilla JS service worker."}
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

function clone(repoUrl: string, name: string) {
  const cloneCommand: string = 'git clone ' + repoUrl + ' ' + name;
  execSyncWrapper(cloneCommand);
}

function gitInit(directory: string) {
  const gitInitCommand: string = 'git init';
  execSyncWrapper(gitInitCommand, directory);
}

function npmInit(directory: string) {
  const npmInitCommand: string = 'npm i';
  execSyncWrapper(npmInitCommand, directory);
}

function cloneRepoBasedOnTemplate(template : string | undefined, name: string) {
  if(template) {
    clone(templateToRepoURLMap[template], name);
  } else {
    clone(templateToRepoURLMap['default'], name);
  }
}

function removeGit(repoDirectoryName: string) {
  removeDirectory(repoDirectoryName + "/.git");
}

function setNewName(newName: string, fileList: string[]) {
  replaceInFileList(fileList, defaultName, newName, newName);
}