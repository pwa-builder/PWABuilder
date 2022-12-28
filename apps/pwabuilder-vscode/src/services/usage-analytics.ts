import TelemetryReporter from '@vscode/extension-telemetry';
import { getFlag } from '../flags';

let reporter: TelemetryReporter;

export function initAnalytics() {
  try {
    // check flag first
    if (getFlag("analytics") === true) {
      // key is not sensitive 
      // https://www.npmjs.com/package/@vscode/extension-telemetry#:~:text=Follow%20guide%20to%20set%20up%20Application%20Insights%20in%20Azure%20and%20get%20your%20key.%20Don%27t%20worry%20about%20hardcoding%20it%2C%20it%20is%20not%20sensitive.
      reporter = new TelemetryReporter("f6d86710-4415-4bd6-a2e0-e95bbdfe51be");
      return reporter;
    }
  }
  catch (err) {
    console.error("Error initializing analytics", err);
  }
}

// function to trackEvent
export function trackEvent(name: string, properties: any) {
  try {
    if (getFlag("analytics") === true) {
      reporter.sendTelemetryEvent(name, properties);
    }
  }
  catch (err) {
    console.error("Error tracking event", err);
    throw new Error(`Error tracking event: ${err}`);
  }
}


export function trackException(err: Error) {
  try {
    if (getFlag("analytics") === true) {
      reporter.sendTelemetryException(err);
    }
  }
  catch (err) {
    console.error("Error tracking exception", err);
    throw new Error(`Error tracking exception: ${err}`);
  }
}