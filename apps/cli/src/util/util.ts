import { doesStringExistInFile, doesFileExist } from "./fileUtil";
import { promisify } from 'node:util';

export type HandlerSignature = (...args: any[]) => void;

const exec = promisify(require('node:child_process').exec);
const execSync = require('node:child_process').execSync;

const path = require('path');
const defaultErrorMessage: string = "Command failed due to unknown error.";

export async function promisifiedExecWrapper(command: string, suppressOutput: boolean, directory?: string | undefined) {
  try{
    await exec(command, {
      stdio: suppressOutput ? 'pipe' : [0, 1, 2],
      cwd: path.resolve(process.cwd(), directory ? directory : '')
    });
  } catch (err) {
    console.log("Process exited.")
  }
}

export async function execSyncWrapper(command: string, suppressOutput: boolean, directory?: string | undefined) {
  try{
    execSync(command, {
      stdio: suppressOutput ? 'pipe' : [0, 1, 2],
      cwd: path.resolve(process.cwd(), directory ? directory : '')
    });
  } catch (err) {
    console.log("Process exited.")
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

export async function timeFunction(functionToTime: HandlerSignature): Promise<number> {
  const startTime: number = performance.now();
  await functionToTime();
  const endTime: number = performance.now();

  return Math.round(endTime - startTime);
}

export function replaceProcessEventListeners(eventNames: string[], handler: HandlerSignature) {
  removeProcessEventListeners(eventNames);
  addProcessEventListeners(eventNames, handler);
}

export function removeProcessEventListeners(eventNames: string[]) {
  for(let eventName of eventNames) {
    process.removeAllListeners(eventName);
  }
}

function addProcessEventListeners(eventNames: string[], handler: HandlerSignature ) {
  for(var eventName of eventNames) {
    process.on(eventName, handler);
  }
}