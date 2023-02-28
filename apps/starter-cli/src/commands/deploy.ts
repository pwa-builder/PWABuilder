import type { CommandBuilder } from "yargs";
import { execSyncWrapper } from "../util/util";
import { deployDescriptions } from "../strings/deployStrings";

export const command: string = 'deploy';
export const desc: string = deployDescriptions.commandDescription;

export const builder: CommandBuilder = (yargs) =>
  yargs.usage("$0 deploy");

export const handler = (): void => {
  execSyncWrapper('npm run deploy');
};