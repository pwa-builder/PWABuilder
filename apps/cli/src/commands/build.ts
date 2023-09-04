import type { CommandBuilder } from "yargs";
import { isDirectoryTemplate, outputError, execSyncWrapper } from "../util/util";
import { initAnalytics, trackEvent } from "../analytics/usage-analytics";
import { BuildEventData } from "../analytics/analytics-interfaces";

const COMMAND_DESCRIPTION_STRING: string = 'Build the PWA Starter using Vite.';

export const command: string = 'build';
export const desc: string = COMMAND_DESCRIPTION_STRING;

const USAGE_STRING: string = '$0 build';
const EXEC_BUILD_STRING: string = 'npm run build';

const INVALID_DIRECTORY_ERROR_STRING: string = `Cannot execute build because the current working directory is not a valid PWA Starter template. 
Make sure you are executing the build command from a PWA Starter template directory.`;

export const builder: CommandBuilder = (yargs) =>
  yargs
    .usage(USAGE_STRING);

export const handler = async (): Promise<void> => {
  const startTime: number = performance.now();
  if(isDirectoryTemplate()) {
    await execSyncWrapper(EXEC_BUILD_STRING, false);
  } else {
    outputError(INVALID_DIRECTORY_ERROR_STRING);
  }
  const endTime: number = performance.now();

  trackBuildEvent(endTime - startTime);  
};

async function trackBuildEvent(timeMS: number): Promise<void> {
  if(await initAnalytics()) {
    const buildEventData: BuildEventData = {
      timeMS: timeMS
    }
    trackEvent("build", buildEventData);
  } 
}