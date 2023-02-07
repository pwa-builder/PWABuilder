import type { Arguments, CommandBuilder } from "yargs";
import { execSyncWrapper } from "../util/util";

export const command: string = 'build';
export const desc: string = '';

export const builder: CommandBuilder = (yargs) =>
  yargs;

export const handler = (): void => {
  execSyncWrapper('npm run build');
};