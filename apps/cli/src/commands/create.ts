import type { Arguments, CommandBuilder} from "yargs";
import { createDescriptions, createErrors } from "../strings/createStrings";
import { defaultDevOpsReplaceList, defaultContentReplaceList } from "../util/replaceLists";
import { replaceInFileList, doesFileExist, fetchZipAndDecompress, removeDirectory, renameDirectory } from "../util/fileUtil";
import * as prompts from "@clack/prompts";
import { execSyncWrapper } from "../util/util";
import { initAnalytics, trackEvent } from "../analytics/usage-analytics";
import { CreateEventData } from "../analytics/analytics-interfaces";

export const command: string = 'create [name]';
export const desc: string = createDescriptions.commandDescription;
const defaultName: string = "pwa-starter";

type CreateOptions = {
  name: string | undefined;
  template: string | undefined;
}

type ResolvedCreateOptions = {
  resolvedName: string;
  resolvedTemplate: string;
}

const templateToRepoURLMap = {
  'default': ["https://github.com/pwa-builder/pwa-starter/archive/refs/heads/main.zip", "pwa-starter-main"],
  'basic': ["https://github.com/pwa-builder/pwa-starter-basic/archive/refs/heads/main.zip", "pwa-starter-basic-main"]
};

export const builder: CommandBuilder<CreateOptions, CreateOptions> = (yargs) =>
  yargs.options({
      template: { type: 'string', alias: 't', description: createDescriptions.templateDescription}
    })
    .positional('name', {type: "string", demandOption: false, description: createDescriptions.nameDescription})
    .usage("$0 create [name] [-t|--template]");
    

export const handler = async (argv: Arguments<CreateOptions>): Promise<void> => {
  const startTime: number = performance.now();
  const { resolvedName, resolvedTemplate} = await resolveCreateArguments(argv);
  const promptSpinner = prompts.spinner();
  
  promptSpinner.start(`Fetching ${resolvedTemplate} PWA Starter template... `);
  const tempDirectoryName = await fetchZipAndDecompress(templateToRepoURLMap[resolvedTemplate][0]);
  promptSpinner.stop('Done.');

  promptSpinner.start("Preparing your PWA for development... ");
  await prepDirectoryForDevelopment(resolvedName, tempDirectoryName, templateToRepoURLMap[resolvedTemplate][1]);

  const finalOutputString: string = `All set! To preview your PWA in the browser:
  
    1. Run "cd ${resolvedName}" from your command line.
    2. Run this command to start your PWA: "pwa start".
    3. Your PWA will open in a new browser window!
    
  Make sure to visit docs.pwabuilder.com for further guidance on developing with the PWA Starter.`;
  
  promptSpinner.stop(finalOutputString);
  const endTime: number = performance.now();

  trackCreateEvent(resolvedTemplate, endTime - startTime, resolvedName);
};

async function resolveCreateArguments(argv: Arguments<CreateOptions>): Promise<ResolvedCreateOptions> {
  const {name, template} = argv;
  const resolvedName = await resolveNameArgument(name);
  const resolvedTemplate= await resolveTemplateArgument(template);
  return {resolvedName, resolvedTemplate};
}

async function resolveNameArgument(nameArg: string | undefined): Promise<string> {
  let name: string = defaultName;

  if(!nameArg || !validateName(nameArg)) {
    name = await prompts.text({
      message: "Enter a name for your new PWA: ",
      placeholder: "example-pwa-name",
      initialValue: incrementToUnusedFilename(),
      validate(value) {
        if(!validateName(value)) {
          return createErrors.invalidName;
        }
      },
    }) as string;

    if(prompts.isCancel(name)) {
      prompts.cancel('Operation cancelled.');
      process.exit(0);
    }
  } else {
    name = nameArg;
  }

  return name;
}

async function resolveTemplateArgument(templateArg: string | undefined): Promise<string> {
  let template: string = 'default';

  if(templateArg && validateTemplate(templateArg)) {
    template = templateArg;
  }

  return template;

}
function validateTemplate(template: string): boolean {
  return templateToRepoURLMap.hasOwnProperty(template);
}
function validateName(name: string): boolean {
  const isValidNameRegex: RegExp = /^[a-zA-Z0-9_-]+$/;
  return !doesFileExist(name) && isValidNameRegex.test(name);
}

function setNewName(newName: string) {
  replaceInFileList(defaultDevOpsReplaceList, defaultName, newName, newName);
  replaceInFileList(defaultContentReplaceList, "PWA Starter", newName, newName);
}

function incrementToUnusedFilename(): string {
  let directoryName: string = defaultName;
  var iteration: number = 0;

  while(doesFileExist(directoryName)) {
    iteration = iteration + 1;
    directoryName = `${defaultName}-${iteration}`;
  }

  return directoryName;
}

function fixDirectoryStructure(newName: string, decompressedName: string, template: string): void {
  renameDirectory(`${decompressedName}/${template}`, `./${newName}`);
  removeDirectory(decompressedName);
  removeDirectory('fetchedZip.zip');
}

async function prepDirectoryForDevelopment(newName: string, decompressedName: string, template: string): Promise<void> {
  fixDirectoryStructure(newName, decompressedName, template);
  if(newName != defaultName) {
    setNewName(newName);
  }

  execSyncWrapper('npm i', true, newName);
}

function trackCreateEvent(template: string, timeMS: number, name: string): void {
  initAnalytics();
  
  const createEventData: CreateEventData = {
    template: template,
    name: name,
    timeMS: timeMS
  }

  trackEvent("create", createEventData);
}