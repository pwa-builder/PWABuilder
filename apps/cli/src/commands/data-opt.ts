import type { CommandBuilder } from "yargs";
import { dataOptDescriptions, dataOptMessages } from "../strings/dataOptStrings";
import { promptAndRewritePermission } from "../analytics/usage-analytics";
import * as prompts from "@clack/prompts";

export const command: string = 'data-opt';
export const desc: string = dataOptDescriptions.commandDescription;

export const builder: CommandBuilder = (yargs) =>
  yargs
    .usage("$0 data-opt");

export const handler = async (): Promise<void> => {
  const permissionGranted: boolean = await promptAndRewritePermission();
  displayProperPermissionMessage(permissionGranted);
};

function displayProperPermissionMessage(permissionGranted: boolean): void {
  if(permissionGranted) {
    prompts.note(dataOptMessages.optInMessage);
  } else {
    prompts.note(dataOptMessages.optOutMessage);
  } 
}