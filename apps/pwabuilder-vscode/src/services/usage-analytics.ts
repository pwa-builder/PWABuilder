// import { setup, defaultClient } from 'applicationinsights';
import TelemetryReporter from '@vscode/extension-telemetry';
import { getFlag } from '../flags';

import * as vscode from 'vscode';
import { Headers } from 'node-fetch';

export let reporter: TelemetryReporter | undefined;
const key = "#{ANALYTICS_KEY}#";

const sessionID = getSessionID();
export const standard_headers = new Headers(
  {
    "content-type": "application/json",
    "Platform-Identifier": "PWAStudio",
    "Correlation-Id": sessionID,
  }
)

export function initAnalytics() {
  try {
    reporter = new TelemetryReporter(key);
  }
  catch (err) {
    console.error("Error initializing analytics", err);
  }
}

export function getSessionID() {
  return vscode.env.sessionId;
}

// function to trackEvent
export function trackEvent(name: string, properties: any) {
  try {
    if (getFlag("analytics") === true) {

      // add session id to properties
      properties.sessionId = getSessionID();

      reporter?.sendTelemetryEvent(name, properties);
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
      reporter?.sendTelemetryException(err, { sessionId: getSessionID() });
    }
  }
  catch (err) {
    console.error("Error tracking exception", err);
    throw new Error(`Error tracking exception: ${err}`);
  }
}