const{ execSync } = require('child_process');
const path = require('path');

const defaultErrorMessage: string = "Add command failed due to unknown error.";

export function execSyncWrapper(command: string, directory?: string | undefined) {
  execSync(command, {
    stdio: [0, 1, 2], // we need this so node will print the command output
    cwd: path.resolve(process.cwd(), directory ? directory : '')
  });
}

export function outputMessage(message: string) {
  process.stdout.write(message + '\n');
}

export function outputError(message?: string) {
  if(message) {
    process.stderr.write(message + '\n');
  } else {
    process.stderr.write(defaultErrorMessage + '\n');
  }
}