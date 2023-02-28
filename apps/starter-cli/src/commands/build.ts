import type { CommandBuilder } from "yargs";
import { execSyncWrapper } from "../util/util";
import { buildDescriptions } from "../strings/buildStrings";

export const command: string = 'build';
export const desc: string = buildDescriptions.commandDescription;

export const builder: CommandBuilder = (yargs) =>
  yargs
    .usage("$0 build");

export const handler = (): void => {
  execSyncWrapper('npm run build');
};