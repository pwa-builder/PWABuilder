import { setup, defaultClient } from 'applicationinsights';
import { getFlag } from '../flags';


import * as vscode from 'vscode';
import { Headers } from 'node-fetch';

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
    // check flag first
    if (getFlag("analytics") === true) {
      setup("#{ANALYTICS_CODE}#")
      .setAutoDependencyCorrelation(false)
      .setAutoCollectRequests(false)
      .setAutoCollectPerformance(false, false)
      .setAutoCollectExceptions(true)
      .setAutoCollectDependencies(false)
      .setAutoCollectConsole(false)
      .setUseDiskRetryCaching(false)
      .setSendLiveMetrics(false)
      .start();
    }
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

      defaultClient.trackEvent({ 
        name,
        properties
      });
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
      defaultClient.trackException({ 
        exception: err,
        properties: {
          sessionId: getSessionID()
        }
      });
    }
  }
  catch (err) {
    console.error("Error tracking exception", err);
    throw new Error(`Error tracking exception: ${err}`);
  }
}