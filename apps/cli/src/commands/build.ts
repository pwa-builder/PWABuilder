import type { CommandBuilder } from "yargs";
import { execSyncWrapper, isDirectoryTemplate, outputError } from "../util/util";
import { buildDescriptions, buildErrors } from "../strings/buildStrings";
import { initAnalytics, trackEvent, ableToUseAnalytics } from "../analytics/usage-analytics";
import { BuildEventData } from "../analytics/analytics-interfaces";

export const command: string = 'build';
export const desc: string = buildDescriptions.commandDescription;

export const builder: CommandBuilder = (yargs) =>
  yargs
    .usage("$0 build");

export const handler = async (): Promise<void> => {
  const useAnalytics: boolean = await ableToUseAnalytics();
  const startTime: number = performance.now();
  if(isDirectoryTemplate()) {
    execSyncWrapper('npm run build', false);
  } else {
    outputError(buildErrors.invalidDirectory);
  }
  const endTime: number = performance.now();

  if(useAnalytics) {
    trackBuildEvent(endTime - startTime);
  }
  
};

async function trackBuildEvent(timeMS: number): Promise<void> {
  if(await initAnalytics()) {
    const buildEventData: BuildEventData = {
      timeMS: timeMS
    }
    trackEvent("build", buildEventData);
  } 
}