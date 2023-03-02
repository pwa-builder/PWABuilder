import type { Arguments, CommandBuilder } from "yargs";
import { execSyncWrapper, outputError, isDirectoryTemplate } from "../util/util";
import { StartOptions } from "../types/startTypes";
import { startDescriptions, startErrors } from "../strings/startStrings";

export const command: string = 'start [viteArgs]';
export const desc: string = startDescriptions.commandDescription;

export const builder: CommandBuilder<StartOptions, StartOptions> = (yargs) =>
  yargs
    .positional('viteArgs', {type: "string", demandOption: false, description: startDescriptions.viteArgsDescription})
    .usage("$0 start [viteArgs]");

export const handler = (argv: Arguments<StartOptions>): void => {
  const { viteArgs } = argv;
  if(isDirectoryTemplate()) {
    handleStartCommand(viteArgs);
  } else {
    outputError(startErrors.invalidDirectory);
  }  
};

function handleStartCommand(viteArgs: string | undefined) {
  if(viteArgs) {
    execSyncWrapper('npm run dev-task -- ' + viteArgs); 
  } else {
    execSyncWrapper('npm run dev-server');
  }
}