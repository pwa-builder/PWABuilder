import type { Arguments, CommandBuilder} from "yargs";
import * as prompts from "@clack/prompts";
import { replaceInFileList, doesFileExist, fetchZipAndDecompress, removeDirectory, renameDirectory, removeAll, FETCHED_ZIP_NAME_STRING, DECOMPRESSED_NAME_STRING } from "../util/fileUtil";
import { promisifiedExecWrapper, timeFunction } from "../util/util";
import { initAnalytics, trackEvent, CreateEventData } from "../analytics/usage-analytics";
import { promptsCancel, runSpinnerGroup, spinnerItem } from "../util/promptUtil";
import { formatCodeSnippet, formatEmphasis, formatErrorEmphasisStrong, formatErrorEmphasisWeak, formatSuccessEmphasis } from "../util/textUtil";

// Types for command arguments
type CreateOptions = {
  name: string | undefined;
  template: string | undefined;
}

type ResolvedCreateOptions = {
  resolvedName: string;
  resolvedTemplate: string;
}

// Yargs string constants
const COMMAND_DESCRIPTION_STRING: string = 'Create a new progressive web app from a template.';
const NAME_DESCRIPTION_STRING: string =  'The name of your new PWA project.';
const TEMPLATE_DESCRIPTION_STRING: string =  'The template to start your project from.';

export const command: string = 'create [name]';
export const desc: string = COMMAND_DESCRIPTION_STRING;

// Implementation constants
const DEFAULT_NAME: string = 'pwa-starter';
const DEFAULT_TEMPLATE: string = 'default';
const DEFAULT_TITLE: string = 'PWA Starter';

const ARTIFACT_NAMES: (string) => string[] = (name: string) => {
  return [ FETCHED_ZIP_NAME_STRING, DECOMPRESSED_NAME_STRING, name ]
}

// Output strings
const USAGE_STRING: string = '$0 create [name] [-t|--template]';

const NAME_PROMPT_STRING: string = 'Enter a name for your new PWA: ';
const NAME_PLACEHOLDER_STRING: string = 'example-pwa-name';

const FETCH_TASK_START_STRING: (string) => string = ( template: string ) => { return `Fetching ${template} PWA Starter template` };
const FETCH_TASK_END_STRING: string = formatSuccessEmphasis('Template fetched.');
const FETCH_TASK_STOP_STRING: string = formatErrorEmphasisWeak('Template fetch cancelled.');

const INSTALL_TASK_START_STRING: string = 'Installing dependencies';
const INSTALL_TASK_END_STRING: string = formatSuccessEmphasis('Dependencies installed.');
const INSTALL_TASK_STOP_STRING: (string) => string = ( name: string ) => { 
  return `${formatErrorEmphasisWeak('Dependency install cancelled.')} You can still access your PWA in the ${formatCodeSnippet(name)} directory.`
}

const TASK_GROUP_EXIT_STRING: string = 'PWA create process exited.';

const FINAL_OUTPUT_STRING: (string) => string = (name: string) => {
  return `${formatSuccessEmphasis('All set!')} 
   To preview your PWA in the browser:
  
   1. Navigate to your project's directory with: ${formatCodeSnippet("cd " + name)}
   2. Start your PWA with: ${formatCodeSnippet("pwa start")}

   Make sure to visit ${formatEmphasis("docs.pwabuilder.com")} for further guidance on developing with the PWA Starter.`
};

// Error strings
const INVALID_NAME_ERROR_STRING: string = 'Invalid name. A valid project name must not already exist and may only contain alphanumeric characters, dashes, and underscores.';
const INVALID_TEMPLATE_ERROR_STRING: string = `Invalid template provided. Cancelling create operation.
    
Valid template names:
1. ${formatErrorEmphasisStrong("default")} - Original PWA Starter template
2. ${formatErrorEmphasisStrong("basic")} - Simplified PWA Starter with fewer dependencies`;

// Template to Repo Map
const TEMPLATE_TO_URL_MAP = {
  'default': ["https://github.com/pwa-builder/pwa-starter/archive/refs/heads/main.zip", "pwa-starter-main"],
  'basic': ["https://github.com/pwa-builder/pwa-starter-basic/archive/refs/heads/main.zip", "pwa-starter-basic-main"]
};

// Replace Lists. These specify which files need to be updated with the user specified project name.
const DEFAULT_DEVOPS_REPLACE_LIST: string[] = [
  "swa-cli.config.json",
  "package-lock.json",
  "package.json"
];

const DEFAULT_CONTENT_REPLACE_LIST: string[] = [
  "index.html",
  "public/manifest.json",
  "src/components/header.ts"
]

export const builder: CommandBuilder<CreateOptions, CreateOptions> = (yargs) =>
  yargs
    .options({
      template: { type: 'string', alias: 't', description: TEMPLATE_DESCRIPTION_STRING}
    })
    .positional('name', {type: "string", demandOption: false, description: NAME_DESCRIPTION_STRING})
    .usage(USAGE_STRING);
    

export const handler = async (argv: Arguments<CreateOptions>): Promise<void> => {
  await handleCreateCommand(argv);
};

async function handleCreateCommand(argv: Arguments<CreateOptions>) { 
  const { resolvedName, resolvedTemplate} = await resolveCreateArguments(argv);
  const duration: number = await timeFunction(() => fetchAndPrepareTemplate(resolvedName, resolvedTemplate));
  finalOutput(resolvedName);
  trackCreateEvent(resolvedTemplate, duration, resolvedName);
}

async function resolveCreateArguments(argv: Arguments<CreateOptions>): Promise<ResolvedCreateOptions> {
  const {name, template} = argv;
  const resolvedTemplate= await resolveTemplateArgument(template, ('template' in argv));
  const resolvedName = await resolveNameArgument(name);
  return {resolvedName, resolvedTemplate};
}

async function fetchAndPrepareTemplate(resolvedName: string, resolvedTemplate: string) {

  const spinnerItems: spinnerItem[] = [
    {
      startText: FETCH_TASK_START_STRING(resolvedTemplate),
      functionToRun: async () => await fetchTask(resolvedName, resolvedTemplate),
      endText: FETCH_TASK_END_STRING,
      stopMessage: FETCH_TASK_STOP_STRING,
      onCancel: () => {
        removeAll(ARTIFACT_NAMES(resolvedName));
      }
    },
    {
      startText: INSTALL_TASK_START_STRING,
      functionToRun: async () => await installTask(resolvedName),
      endText: INSTALL_TASK_END_STRING,
      stopMessage: INSTALL_TASK_STOP_STRING(resolvedName)
    }
  ]

  await runSpinnerGroup(spinnerItems, TASK_GROUP_EXIT_STRING);
}

async function fetchTask(resolvedName: string, resolvedTemplate: string): Promise<void> {
  await fetchZipAndDecompress(TEMPLATE_TO_URL_MAP[resolvedTemplate][0]);
  await fixDirectoryStructure(resolvedName, DECOMPRESSED_NAME_STRING, resolvedTemplate);
}

async function installTask(resolvedName: string): Promise<void> {
  await prepDirectoryForDevelopment(resolvedName);
}

function finalOutput(resolvedName: string) {
  prompts.outro(FINAL_OUTPUT_STRING(resolvedName));
}

async function resolveNameArgument(nameArg: string | undefined): Promise<string> {
  let name: string = DEFAULT_NAME;

  if(!nameArg || !validateName(nameArg)) {
    name = await prompts.text({
      message: NAME_PROMPT_STRING,
      placeholder: NAME_PLACEHOLDER_STRING,
      initialValue: incrementToUnusedFilename(),
      validate(value) {
        if(!validateName(value)) {
          return INVALID_NAME_ERROR_STRING;
        }
      },
    }) as string;

    if(prompts.isCancel(name)) {
      promptsCancel();
    }
  } else {
    name = nameArg;
  }

  return name;
}

async function resolveTemplateArgument(templateArg: string | undefined, templateProvided: boolean): Promise<string> {
  let template: string = DEFAULT_TEMPLATE;

  if(templateArg && validateTemplate(templateArg)) {
    template = templateArg;
  } else if (templateProvided) {
    promptsCancel(INVALID_TEMPLATE_ERROR_STRING);
  }

  return template;

}
function validateTemplate(template: string): boolean {
  return TEMPLATE_TO_URL_MAP.hasOwnProperty(template);
}
function validateName(name: string): boolean {
  const isValidNameRegex: RegExp = /^[a-zA-Z0-9_-]+$/;
  return !doesFileExist(name) && isValidNameRegex.test(name);
}

function setNewName(newName: string) {
  replaceInFileList(DEFAULT_DEVOPS_REPLACE_LIST, DEFAULT_NAME, newName, newName);
  replaceInFileList(DEFAULT_CONTENT_REPLACE_LIST, DEFAULT_TITLE, newName, newName);
}

function incrementToUnusedFilename(): string {
  let directoryName: string = DEFAULT_NAME;
  var iteration: number = 0;

  while(doesFileExist(directoryName)) {
    iteration = iteration + 1;
    directoryName = `${DEFAULT_NAME}-${iteration}`;
  }

  return directoryName;
}

function fixDirectoryStructure(newName: string, decompressedName: string, template: string): void {
  renameDirectory(`${decompressedName}/${TEMPLATE_TO_URL_MAP[template][1]}`, `./${newName}`);
  removeDirectory(decompressedName);
}

async function prepDirectoryForDevelopment(newName: string): Promise<void> {
  try {
    if(newName != DEFAULT_NAME) {
      setNewName(newName);
    }

    await promisifiedExecWrapper('npm i', true, newName);
  } catch (err) {
    promptsCancel();
  }
  
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