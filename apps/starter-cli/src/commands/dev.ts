import type { Arguments, CommandBuilder } from "yargs";
import { execSyncWrapper } from "../util/util";

export const command: string = 'dev';
export const desc: string = '';

export const builder: CommandBuilder = (yargs) =>
  yargs;

export const handler = (): void => {
  execSyncWrapper('npm run dev-server'); 
};