import type { Arguments, CommandBuilder, string } from "yargs";
import type { GenerateCommandOptions } from "../types/command-options-types";
import * as prompts from "@clack/prompts";

import { litFileReplaceList } from "../util/replace-lists";
import { replaceInFileList, removeDirectory } from "../util/file-util";
import { execSyncWrapper } from "../util/util";

export const command: string = 'create [name]';
export const desc: string = '';
const defaultName: string = "pwa-starter";

const templateToRepoURLMap = {
  'default': "https://github.com/pwa-builder/pwa-starter.git",
  'basic': "https://github.com/pwa-builder/pwa-starter-basic.git"
};

export const builder: CommandBuilder<GenerateCommandOptions, GenerateCommandOptions> = (yargs) =>
  yargs.options({
      template: { type: 'string', alias: 't'}
    })
    .positional('name', {type: "string", demandOption: false});
    

export const handler = async (argv: Arguments<GenerateCommandOptions>): Promise<void> => {
  const {name, template} = await promptForMissingArgs(argv);

  cloneRepoBasedOnTemplate(template, name);
  removeGit(name);
  gitInit(name);
  npmInit(name);

  if(name != defaultName) {
    setNewName(name, litFileReplaceList);
  }
};

async function promptForMissingArgs(argv: Arguments<GenerateCommandOptions>): Promise<{name: string, template: string}> {
  const {name, template} = argv;
  let finalOptions = {name: defaultName, template: 'default'};
  if(!name) {
    finalOptions.name = await prompts.text({
      message: "Enter a name for your new PWA: ",
      placeholder: defaultName,
      initialValue: defaultName
    }) as string;
  }
  if(!template) {
    finalOptions.template = await prompts.select({
      message: 'Select a template for your PWA:',
      options: [
        {value: "default", label: "Classic PWA Starter", hint: "Recommended"},
        {value: "basic", label: "Simplified PWA Starter", hint: "Less dependencies and a vanilla JS service worker."}
      ]
    }) as string
  }

  return finalOptions;
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