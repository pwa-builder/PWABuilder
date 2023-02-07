import type { Arguments, CommandBuilder } from "yargs";
import type { GenerateCommandOptions } from "../types/command-options-types";

import { litFileReplaceList } from "../util/replace-lists";
import { replaceInFileList, removeDirectory } from "../util/file-util";
import { execSyncWrapper } from "../util/util";

export const command: string = 'generate [name]';
export const desc: string = '';

const litTemplateRepoString: string = "https://github.com/pwa-builder/pwa-starter.git";
const basicLitTemplateRepoString: string = "https://github.com/pwa-builder/pwa-starter.git";
const defaultName: string = "pwa-starter";

export const builder: CommandBuilder<GenerateCommandOptions, GenerateCommandOptions> = (yargs) =>
  yargs
    .options({
      basic: { type: 'boolean'}
    })
    .positional('name', {type: "string", demandOption: false});

export const handler = (argv: Arguments<GenerateCommandOptions>): void => {
  const {name, basic} = argv;
  const repoName: string = name ? name : defaultName;

  cloneRepoBasedOnFlag(basic, repoName);
  removeGit(repoName);
  gitInit(repoName);
  npmInit(repoName);

  if(repoName != defaultName) {
    setNewName(repoName, litFileReplaceList);
  }
};

function clone(repoUrl: string, name: string) {
  const cloneCommand: string = 'git clone -b cli-dev ' + repoUrl + ' ' + name;
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

function cloneRepoBasedOnFlag(flag : boolean | undefined, name: string) {
  if ( flag ) {
    clone(basicLitTemplateRepoString, name);
  }
  else {
    clone(litTemplateRepoString, name);
  }
}

function removeGit(repoDirectoryName: string) {
  removeDirectory(repoDirectoryName + "/.git");
}

function setNewName(newName: string, fileList: string[]) {
  replaceInFileList(fileList, defaultName, newName, newName);
}