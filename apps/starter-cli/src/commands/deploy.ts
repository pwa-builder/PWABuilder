import type { CommandBuilder } from "yargs";
import { execSyncWrapper } from "../util/util";
import { deployDescriptions, deployErrors } from "../strings/deployStrings";
import { isDirectoryTemplate, outputError } from "../util/util";

export const command: string = 'deploy';
export const desc: string = deployDescriptions.commandDescription;

export const builder: CommandBuilder = (yargs) =>
  yargs.usage("$0 deploy");

export const handler = (): void => {

  if(isDirectoryTemplate()) {
    execSyncWrapper('npm run deploy');
  } else {
    outputError(deployErrors.invalidDirectory);
  }  
};