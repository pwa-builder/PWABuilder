import { Buffer } from "buffer";
import { writeFile } from "fs/promises";
import * as vscode from "vscode";
import { MsixInfo, Question } from "../../interfaces";
import {
  buildAndroidOptions,
  buildIOSOptions,
  getPublisherMsixFromArray,
  getSimpleMsixFromArray,
  iosDocsURL,
  packageForIOS,
  packageForWindows,
  validateIOSOptions,
  WindowsDocsURL,
} from "../../library/package-utils";
import {
  packageQuestion,
  windowsDevQuestions,
  windowsProdQuestions,
} from "../../questions";
import { getManifest } from "../manifest/manifest-service";
import { getWorker } from "../service-worker";
import { getURL } from "../web-publish";
import {
  AndroidDocsURL,
  packageForAndroid,
  validateAndroidOptions,
} from "./package-android-app";
import { AndroidPackageOptions } from "../../android-interfaces";
import { getAnalyticsClient } from "../usage-analytics";
/*
 * To-do Justin: More re-use
 */

const inputCancelledMessage: string =
  "Input process cancelled. Try again if you wish to package your PWA";

let packagePlatform: string | undefined;
let packageInfo: MsixInfo;
let msixAnswers: string[];
let didInputFail: boolean;

export async function packageApp(): Promise<void> {
  const url = getURL();
  const sw = getWorker();
  const manifest = getManifest();

  if (!url || !sw || !manifest) {
    if (!url) {
      const answer = await vscode.window.showErrorMessage(
        "Please publish your app before packaging it.",
        {
          title: "Publish",
        },
        {
          title: "Cancel",
        }
      );

      if (answer && answer.title === "Publish") {
        await vscode.commands.executeCommand("pwa-studio.setWebURL");
      }

      return;
    }

    if (!sw) {
      const answer = await vscode.window.showErrorMessage(
        "You must have a Service Worker to package your PWA.",
        {
          title: "Generate Service Worker",
        },
        {
          title: "Cancel",
        }
      );

      if (answer && answer.title === "Generate Service Worker") {
        await vscode.commands.executeCommand("pwa-studio.serviceWorker");
      }

      return;
    }

    if (!manifest) {
      const answer = await vscode.window.showErrorMessage(
        "You must have a Manifest to package your PWA.",
        {
          title: "Generate Manifest",
        },
        {
          title: "Cancel",
        }
      );

      if (answer && answer.title === "Generate Manifest") {
        await vscode.commands.executeCommand("pwa-studio.manifest");
      }

      return;
    }
  }

  didInputFail = false;
  const packageType = await getPackageInputFromUser();

  const analyticsClient = getAnalyticsClient();
  analyticsClient.trackEvent({ 
    name: "package",  
    properties: { packageType: packageType, url: url,  stage: "init" } 
  });
  
  if (packageType === "iOS") {
    try {
      vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
        },
        async (progress) => {
          progress.report({
            message: "Packaging iOS app...",
          });

          // Setting up iOS platform
          // Next step is to generate the correct options for iOS
          const options = await getIOSPackageOptions();
          if (options) {
            const optionsValidation = await validateIOSOptions(options);

            if (optionsValidation.length === 0) {
              // no validation errors
              // package app
              const responseData = await packageForIOS(options);
              progress.report({ message: "Converting to zip..." });
              await convertPackageToZip(responseData, options.bundleId);

              // open iOS docs
              await vscode.env.openExternal(vscode.Uri.parse(iosDocsURL));
            } else {
              // validation errors
              await vscode.window.showErrorMessage(
                `There are some problems with your manifest that have prevented us from packaging: ${optionsValidation.join(
                  "\n"
                )}`
              );
              return;
            }
          }
        }
      );
    } catch (err: any) {
      vscode.window.showErrorMessage(
        `There was an error packaging your app: ${err && err.message ? err.message : err
        }`
      );
    }
  } else if (packageType === "Android") {
    try {
      vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
        },
        async (progress) => {
          progress.report({ message: "Packaging your app..." });
          const options = await getAndroidPackageOptions();
          if (options) {
            const optionsValidation = await validateAndroidOptions(options);

            if (optionsValidation.length === 0) {
              // no validation errors
              const responseData = await packageForAndroid(options);
              progress.report({ message: "Converting to zip..." });
              await convertPackageToZip(responseData, options.packageId);

              // open android docs
              await vscode.env.openExternal(vscode.Uri.parse(AndroidDocsURL));
            } else {
              // validation errors
              await vscode.window.showErrorMessage(
                `There are some problems with your manifest that have prevented us from packaging: ${optionsValidation.join(
                  "\n"
                )}`
              );
              return;
            }
          }
        }
      );
    } catch (err: any) {
      vscode.window.showErrorMessage(
        `There was an error packaging your app: ${err && err.message ? err.message : err
        }`
      );
    }
  } else {
    await getMsixInputs();
    if (!didInputFail) {
      vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
        },
        async (progress) => {
          progress.report({ message: "Packaging your app..." });
          const responseData: any = await packageWithPwaBuilder();
          progress.report({ message: "Converting to zip..." });
          await convertPackageToZip(responseData);

          // open windows docs
          await vscode.env.openExternal(vscode.Uri.parse(WindowsDocsURL));
        }
      );
    }
  }
}

async function getAndroidPackageOptions(): Promise<
  AndroidPackageOptions | undefined
> {
  const options = await buildAndroidOptions();
  return options;
}

async function getIOSPackageOptions(): Promise<any> {
  const options = await buildIOSOptions();
  return options;
}

async function getPackageInputFromUser(): Promise<string> {
  const platform = await platformQuestionQuickPick();

  return platform;
}

async function platformQuestionQuickPick(): Promise<string> {
  const choices: string[] = resolveChoices(packageQuestion.choices);
  packagePlatform = await vscode.window.showQuickPick(choices, {
    placeHolder: packageQuestion.message,
  });
  validateInput(packagePlatform, packageQuestion);

  return packagePlatform || "Windows Production";
}

async function packageWithPwaBuilder(): Promise<any> {
  const packageData = await packageForWindows(packageInfo);

  const url = getURL();
  const analyticsClient = getAnalyticsClient();
  analyticsClient.trackEvent({ 
    name: "package",  
    properties: { packageType: "Windows", url: url, stage: "complete" } 
  });

  if (packageData) {
    return packageData.blob();
  }
}

async function convertPackageToZip(
  responseData: any,
  packageID?: string
): Promise<void> {
  await writeMSIXToFile(responseData, packageID || packageInfo.packageId);
}

async function getMsixInputs(): Promise<void> {
  switch (packagePlatform) {
    default:
      await getSimpleMsixInput();
      break;
    case "Windows Production":
      await getPublisherMsixInput();
      break;
  }
}

async function getSimpleMsixInput(): Promise<void> {
  await getEachQuestionInput(windowsDevQuestions);
  packageInfo = getSimpleMsixFromArray(...msixAnswers);
}

async function getPublisherMsixInput(): Promise<void> {
  await getEachQuestionInput(windowsProdQuestions);
  packageInfo = getPublisherMsixFromArray(...msixAnswers);
}

async function getEachQuestionInput(questions: Question[]): Promise<void> {
  msixAnswers = new Array();
  for (let i = 0; i < questions.length; i++) {
    await showQuestionInput(questions[i]);
  }
  // Check failed input
}

function resolveChoices(choices: string[] | undefined): string[] {
  return choices === undefined ? [] : choices;
}

async function showQuestionInput(question: Question): Promise<void> {
  if (!didInputFail) {
    var answer: string | undefined = await vscode.window.showInputBox({
      prompt: question.message,
    });
    msixAnswers.push(validateInput(answer, question));
  }
}

function updateDidInputFail(input: string | undefined): void {
  didInputFail = input === undefined;
  if (didInputFail) {
    inputCancelledWarning();
  }
}

function validateInput(input: string | undefined, question: Question): string {
  var validatedInput: string | undefined;

  if (input === "" && question.default === undefined) {
    validatedInput = undefined;
    skippedRequiredFieldError(question.name);
  } else if (input === "") {
    validatedInput = question.default;
    usedDefaultFieldWarning(question.name);
  } else {
    validatedInput = input;
  }

  updateDidInputFail(validatedInput);
  return validatedInput === undefined ? "" : validatedInput;
}

async function writeMSIXToFile(responseData: any, name: string): Promise<void> {
  try {
    const test = await vscode.window.showSaveDialog({
      title: "Save your package",
      defaultUri: vscode.workspace.workspaceFolders
        ? vscode.Uri.file(
          `${vscode.workspace.workspaceFolders[0].uri.fsPath}/${name}.zip`
        )
        : undefined,
    });

    if (test) {
      // write file to current workspace directory with vscode api
      await writeFile(
        test.fsPath,
        Buffer.from(await responseData.arrayBuffer())
      );
    }
  } catch (err) {
    console.error(`There was an error packaging your app: ${err}`);
  }
}

function usedDefaultFieldWarning(fieldName: string): void {
  vscode.window.showWarningMessage(getDefaultFieldWarningMessage(fieldName));
}

function getDefaultFieldWarningMessage(fieldName: string): string {
  return (
    'No field provided for package field "' +
    fieldName +
    '." Using default value instead.'
  );
}

function skippedRequiredFieldError(fieldName: string): void {
  vscode.window.showErrorMessage(getRequiredFieldErrorMessage(fieldName));
}

function getRequiredFieldErrorMessage(fieldName: string): string {
  return (
    'Skipped input for required field "' +
    fieldName +
    '." Packaging process was cancelled.'
  );
}

function inputCancelledWarning(): void {
  vscode.window.showWarningMessage(inputCancelledMessage);
}
