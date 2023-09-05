import type { Arguments, CommandBuilder } from "yargs";
import { outputError, isDirectoryTemplate, execSyncWrapper } from "../util/util";
import { initAnalytics, trackEvent, StartEventData } from "../analytics/usage-analytics";

const COMMAND_DESCRIPTION_STRING: string = 'Run the PWA Starter on a Vite dev server.';
const VITEARGS_DESCRIPTION_STRING: string = 'Arguments to pass directly to the Vite start process.';

export const command: string = 'start';
export const desc: string = COMMAND_DESCRIPTION_STRING;

const USAGE_STRING: string = '$0 start [viteArgs]';

const EXEC_START_NO_ARGS_STRING: string = 'npm run dev-server';
const EXEC_START_ARGS_STRING: (string) => string = (viteArgs: string) => { return 'npm run dev-task -- ' + viteArgs; }

const INVALID_DIRECTORY_ERROR_STRING: string = `Cannot execute start because the current working directory is not a valid PWA Starter template. 
Make sure you are executing the start command from a PWA Starter template directory.`;

type StartOptions = {
  viteArgs: string | undefined;
}

export const builder: CommandBuilder<StartOptions, StartOptions> = (yargs) =>
  yargs
    .options({
      viteArgs: { type: 'string', description: VITEARGS_DESCRIPTION_STRING}
    })
    .usage(USAGE_STRING);

export const handler = async (argv: Arguments<StartOptions>): Promise<void> => {
  const startTime: number = performance.now();
  const { viteArgs } = argv;
  if(isDirectoryTemplate()) {
    handleStartCommand(viteArgs);
  } else {
    outputError(INVALID_DIRECTORY_ERROR_STRING);
  }  
  const endTime: number = performance.now();
  trackStartEvent(endTime - startTime, viteArgs ? viteArgs : "");
};

async function handleStartCommand(viteArgs: string | undefined) {
  if(viteArgs) {
    execSyncWrapper(EXEC_START_ARGS_STRING(viteArgs), false); 
  } else {
    execSyncWrapper(EXEC_START_NO_ARGS_STRING, false);
  }
}

async function trackStartEvent(timeMS: number, options: string): Promise<void> {
  if(await initAnalytics()){

    const startEventData: StartEventData = {
      timeMS: timeMS,
      options: options
    }

    trackEvent("start", startEventData);
  }
}