import * as vscode from "vscode";
import { trackEvent } from "./usage-analytics";

var fs = require('fs');
const decompress = require('decompress');
import fetch from 'node-fetch';
import {pipeline} from 'node:stream';
import {promisify} from 'node:util';

const shell = require("shelljs");
const FETCHED_ZIP_NAME_STRING: string = 'fetchedZip.zip';

const repositoryInputPrompt: string =
  "Enter the name you would like to use for your PWA's repository.";
const directoryInputPrompt: string = "Where would you like your PWA to live?";
const repositoryInputPlaceholder: string = "Enter your repository name here.";
const noNameSelectedWarning: string =
  "No repository name provided. New PWA Starter process cancelled.";
const noNpmWarning: string =
  "This command requires npm. Install npm at https://www.npmjs.com/";
const starterRepositoryURI: string =
"https://github.com/pwa-builder/pwa-starter/archive/refs/heads/main.zip";

let repositoryName: string | undefined = undefined;
let repositoryParentURI: vscode.Uri | undefined = undefined;

const terminal = vscode.window.createTerminal();

export async function setUpLocalPwaStarterRepository(): Promise<void> {
  trackEvent("generate", { "type": "starter"});

  return new Promise(async (resolve, reject) => {
    await getRepositoryInfoFromInput();

    if (repositoryName && repositoryParentURI) {
      try {
        await initStarterRepository();
        offerDocumentation();
        openRepositoryWithCode();
        resolve();
      } catch (err) {
        reject(err);
      }
    }
  });
}

async function offerDocumentation() {
  const documentationLink = "https://aka.ms/starter-docs";
  const documentationLinkButton = "Open Documentation";
  const documentationLinkResponse = await vscode.window.showInformationMessage(
    "Your app is ready to go, would you like to view the documentation?",
    documentationLinkButton
  );

  if (documentationLinkResponse === documentationLinkButton) {
    vscode.commands.executeCommand("vscode.open", documentationLink);
  }
}

async function getRepositoryInfoFromInput(): Promise<void> {
  await getRepositoryNameFromInputBox()
    .then(getRepositoryDirectoryFromDialog)
    .catch(inputCancelledWarning);
}

async function getRepositoryNameFromInputBox(): Promise<void> {
  return new Promise<void>(async (resolve, reject) => {
    repositoryName = await vscode.window.showInputBox({
      prompt: repositoryInputPrompt,
      placeHolder: repositoryInputPlaceholder,
    });

    repositoryName ? resolve() : reject();
  });
}

async function getRepositoryDirectoryFromDialog(): Promise<void> {
  return new Promise<void>(async (resolve, reject) => {
    let directories: vscode.Uri[] | undefined =
      await vscode.window.showOpenDialog({
        canSelectFolders: true,
        canSelectFiles: false,
        canSelectMany: false,
        title: directoryInputPrompt,
      });

    if (directories) {
      repositoryParentURI = directories[0];
      resolve();
    } else {
      reject();
    }
  });
}

async function initStarterRepository(): Promise<void> {
  terminal.show();
  const repoPath: string = await fetchFromGithub();
  if (fs.existsSync(repoPath)) {
    changeDirectory(`${repositoryParentURI?.path.slice(1)}/${repositoryName}`);
    tryNpmInstall();
  }
}

function openRepositoryWithCode(): void {
  terminal.sendText(`code ${repositoryName}`);
}


function tryNpmInstall(): boolean {
  let didNpmInstall: boolean = true;
  if (isNpmInstalled()) {
    npmInstall();
  } else {
    noNpmInstalledWarning();
    didNpmInstall = false;
  }
  return didNpmInstall;
}

function npmInstall(): void {
  terminal.sendText("npm install");
  changeDirectory('..');
}

function changeDirectory(pathToDirectory: string | undefined): void {
  terminal.sendText(`cd ${pathToDirectory}`);
}

export function isNpmInstalled(): boolean {
  let isNpmInstalled: boolean = true;

  if (!shell.which("npm")) {
    isNpmInstalled = false;
  }

  return isNpmInstalled;
}

async function fetchFromGithub(): Promise<string> {
  const streamPipeline = promisify(pipeline);

  const fetchedZipPath: string = `${repositoryParentURI?.fsPath}/fetchedTemplate.zip`;
  const decompressedZipPath: string = `${repositoryParentURI?.fsPath}/decompressedTemplate`;
  const decompressedRepoPath: string = `${decompressedZipPath}/pwa-starter-main`;
  const finalLocationPath: string = `${repositoryParentURI?.fsPath}/${repositoryName}`;

  const res = await fetch(starterRepositoryURI);
  if(res.body) {
    await streamPipeline(res.body, fs.createWriteStream(fetchedZipPath));
    await decompress(fetchedZipPath, decompressedZipPath);
    fs.renameSync(decompressedRepoPath, finalLocationPath);
    fs.rmSync(fetchedZipPath, { recursive: true, force: true });
    fs.rmSync(decompressedZipPath, { recursive: true, force: true });
  }

  return finalLocationPath
}

function inputCancelledWarning(): void {
  vscode.window.showWarningMessage(noNameSelectedWarning);
}

export function noNpmInstalledWarning(): void {
  vscode.window.showWarningMessage(noNpmWarning);
}
