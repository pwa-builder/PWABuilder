import { HandlerSignature, removeProcessEventListeners, replaceProcessEventListeners } from "./util";

export interface spinnerItem {
  startText: string,
  functionToRun: HandlerSignature,
  endText: string,
  stopMessage: string,
  onCancel?: HandlerSignature
}

const SPINNER_EVENT_NAME_LIST: string[] = ['SIGINT', 'SIGTERM', 'exit'];
const DEFAULT_CANCEL_MESSAGE: string = `Command failed due to error.`;

export async function runSpinnerGroup(spinnerItems: spinnerItem[], cancelMessage: string) {
  const prompts = await import("@clack/prompts");
  const promptSpinner = prompts.spinner();

  for(const spinnerItem of spinnerItems) {
    promptSpinner.start(spinnerItem.startText);

    replaceProcessEventListeners(SPINNER_EVENT_NAME_LIST, () => {
      if (spinnerItem.onCancel) {
        spinnerItem.onCancel();
      }
      promptSpinner.stop(spinnerItem.stopMessage);
      void promptsCancel(cancelMessage);
    });

    await spinnerItem.functionToRun();
    promptSpinner.stop(spinnerItem.endText);
  }

  removeProcessEventListeners(SPINNER_EVENT_NAME_LIST);
}

export async function promptsCancel(message?: string): Promise<never> {
  const prompts = await import("@clack/prompts");
  const _message = message ?? DEFAULT_CANCEL_MESSAGE;
  prompts.cancel(_message);
  process.exit(0);
}