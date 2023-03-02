import { doesStringExistInFile, doesFileExist } from "./fileUtil";

const{ execSync } = require('child_process');
const path = require('path');

const defaultErrorMessage: string = "Command failed due to unknown error.";

export function execSyncWrapper(command: string, directory?: string | undefined) {
  try{
    execSync(command, {
      stdio: [0, 1, 2],
      cwd: path.resolve(process.cwd(), directory ? directory : '')
    });
  } catch (err) {
    throw err;
  }
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

export function isDirectoryTemplate(directory?: string | undefined): boolean {
  const indexPath: string = directory ? path.resolve(directory, 'index.html') : path.resolve(process.cwd(), 'index.html');
  const testString: string = "<meta name=\"pwa-starter-template-identity\"";

  return doesFileExist(indexPath) && doesStringExistInFile(indexPath, testString);
}