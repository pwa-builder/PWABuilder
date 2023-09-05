import type { Arguments, CommandBuilder } from "yargs";
import { isDirectoryTemplate, outputError, execSyncWrapper } from "../util/util";
import { initAnalytics, trackEvent, BuildEventData } from "../analytics/usage-analytics";

const COMMAND_DESCRIPTION_STRING: string = 'Build the PWA Starter using Vite.';
const VITEARGS_DESCRIPTION_STRING: string = 'Arguments to pass directly to the Vite build process.';

export const command: string = 'build';
export const desc: string = COMMAND_DESCRIPTION_STRING;

const USAGE_STRING: string = '$0 build [viteArgs]';
const EXEC_BUILD_NO_ARGS_STRING: string = 'npm run build';
const EXEC_BUILD_ARGS_STRING: (string) => string = (viteArgs: string) => { return 'npm run build -- ' + viteArgs; }

const INVALID_DIRECTORY_ERROR_STRING: string = `Cannot execute build because the current working directory is not a valid PWA Starter template. 
Make sure you are executing the build command from a PWA Starter template directory.`;

type BuildOptions = {
  viteArgs: string | undefined;
}

export const builder: CommandBuilder = (yargs) =>
  yargs
    .options({
      viteArgs: { type: 'string', description: VITEARGS_DESCRIPTION_STRING}
    })
    .usage(USAGE_STRING);

export const handler = async (argv: Arguments<BuildOptions>): Promise<void> => {
  const startTime: number = performance.now();
  const { viteArgs } = argv;
  if(isDirectoryTemplate()) {
    await handleBuildCommand(viteArgs);
  } else {
    outputError(INVALID_DIRECTORY_ERROR_STRING);
  }
  const endTime: number = performance.now();

  trackBuildEvent(endTime - startTime);  
};

async function handleBuildCommand(viteArgs: string | undefined) {
  if(viteArgs) {
    execSyncWrapper(EXEC_BUILD_ARGS_STRING(viteArgs), false); 
  } else {
    execSyncWrapper(EXEC_BUILD_NO_ARGS_STRING, false);
  }
}

async function trackBuildEvent(timeMS: number): Promise<void> {
  if(await initAnalytics()) {
    const buildEventData: BuildEventData = {
      timeMS: timeMS
    }
    trackEvent("build", buildEventData);
  } 
}