import type { Arguments, CommandBuilder} from "yargs";
import { createDescriptions, createErrors } from "../strings/createStrings";
import { defaultDevOpsReplaceList, defaultContentReplaceList } from "../util/replaceLists";
import { replaceInFileList, doesFileExist, fetchZipAndDecompress, removeDirectory, renameDirectory } from "../util/fileUtil";
import * as prompts from "@clack/prompts";
import { execSyncWrapper } from "../util/util";
import { initAnalytics, trackEvent, ableToUseAnalytics } from "../analytics/usage-analytics";
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
  const useAnalytics: boolean = await ableToUseAnalytics();
  const startTime: number = performance.now();
  const { resolvedName, resolvedTemplate} = await resolveCreateArguments(argv);
  const promptSpinner = prompts.spinner();
  
  promptSpinner.start(`Fetching ${resolvedTemplate} PWA Starter template... `);
  const tempDirectoryName = await fetchZipAndDecompress(templateToRepoURLMap[resolvedTemplate][0]);
  promptSpinner.stop('Done.');

  promptSpinner.start("Preparing your PWA for development... ");
  await prepDirectoryForDevelopment(resolvedName, tempDirectoryName, templateToRepoURLMap[resolvedTemplate][1]);

  const finalOutputString: string = `All set! To preview your PWA in the browser:
  
    1. Navigate to your project's directory with: "cd ${resolvedName}"
    2. Start your PWA with: "pwa start"

  Make sure to visit docs.pwabuilder.com for further guidance on developing with the PWA Starter.`;
  
  promptSpinner.stop(finalOutputString);
  const endTime: number = performance.now();

  if(useAnalytics) {
    trackCreateEvent(resolvedTemplate, endTime - startTime, resolvedName);
  } 
};

async function resolveCreateArguments(argv: Arguments<CreateOptions>): Promise<ResolvedCreateOptions> {
  const {name, template} = argv;
  const resolvedTemplate= await resolveTemplateArgument(template, ('template' in argv));
  const resolvedName = await resolveNameArgument(name);
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

async function resolveTemplateArgument(templateArg: string | undefined, templateProvided: boolean): Promise<string> {
  let template: string = 'default';

  if(templateArg && validateTemplate(templateArg)) {
    template = templateArg;
  } else if (templateProvided) {
    emitInvalidTemplateError();
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

async function trackCreateEvent(template: string, timeMS: number, name: string): Promise<void> {
    if(await initAnalytics()){
    
    const createEventData: CreateEventData = {
      template: template,
      name: name,
      timeMS: timeMS
    }

    trackEvent("create", createEventData);
  }
}

function emitInvalidTemplateError() {
  prompts.cancel(`ERROR: Invalid template provided. Cancelling create operation.
    
    Valid template names:
    1. default - Original PWA Starter template
    2. basic - Simplified PWA Starter with fewer dependencies`);
    process.exit(0);
}