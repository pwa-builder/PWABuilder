import type { Arguments, CommandBuilder } from "yargs";
import { execSyncWrapper, outputError } from "../util/util";
import { StartOptions } from "../types/startTypes";
import { startDescriptions } from "../strings/startStrings";

export const command: string = 'start [viteArgs]';
export const desc: string = startDescriptions.commandDescription;

export const builder: CommandBuilder<StartOptions, StartOptions> = (yargs) =>
  yargs
    .positional('viteArgs', {type: "string", demandOption: false, description: startDescriptions.viteArgsDescription})
    .usage("$0 start [viteArgs]");

export const handler = (argv: Arguments<StartOptions>): void => {
  const { viteArgs } = argv;
  if(viteArgs) {
    execSyncWrapper('npm run dev-task -- ' + viteArgs); 
  } else {
    execSyncWrapper('npm run dev-server');
  }
};