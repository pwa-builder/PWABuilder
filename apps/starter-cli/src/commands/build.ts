import type { CommandBuilder } from "yargs";
import { execSyncWrapper, isDirectoryTemplate, outputError } from "../util/util";
import { buildDescriptions, buildErrors } from "../strings/buildStrings";

export const command: string = 'build';
export const desc: string = buildDescriptions.commandDescription;

export const builder: CommandBuilder = (yargs) =>
  yargs
    .usage("$0 build");

export const handler = (): void => {
  if(isDirectoryTemplate()) {
    execSyncWrapper('npm run build', false);
  } else {
    outputError(buildErrors.invalidDirectory);
  }
};