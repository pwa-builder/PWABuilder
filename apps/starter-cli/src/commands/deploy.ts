import type { Arguments, CommandBuilder } from "yargs";
const path = require('path');
const{ execSync } = require('child_process');

export const command: string = 'deploy';
export const desc: string = '';

type Options = {
  name: string;
  upper: boolean | undefined;
}
export const builder: CommandBuilder<Options, Options> = (yargs) =>
  yargs;

export const handler = (argv: Arguments<Options>): void => {
  execSync('npm run deploy', {
    stdio: [0, 1, 2], // we need this so node will print the command output
    cwd: path.resolve(process.cwd(), ''), // path to where you want to save the file
  })
};