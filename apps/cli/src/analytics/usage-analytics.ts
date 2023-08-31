import { setup, defaultClient } from 'applicationinsights';
import { getFlag } from '../flags';
import * as crypto from 'crypto';
import * as os from 'os';
import * as fs from 'fs';
import * as prompts from "@clack/prompts";
import { doesFileExist } from '../util/fileUtil';
import { PWABuilderData } from '../interfaces/pwabuilder-data';

export async function initAnalytics(): Promise<boolean> {
  var dataCollectionPermission: boolean = false;
  try {
    if (getFlag("analytics") === true && dataCollectionPermission) {
      setup("#{ANALYTICS_CODE}#")
      .setAutoDependencyCorrelation(false)
      .setAutoCollectRequests(false)
      .setAutoCollectPerformance(false, false)
      .setAutoCollectDependencies(false)
      .setAutoCollectConsole(false)
      .setUseDiskRetryCaching(false)
      .start();
    } 
    
  }
  catch (err) {
    console.error("Error initializing analytics", err);
  }

  return dataCollectionPermission;
}

export function getAnalyticsClient() {
  return defaultClient;
}

// function to trackEvent
export function trackEvent(name: string, properties: any) {
  try {
    if (getFlag("analytics") === true) {

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
        exception: err
      });
    }
  }
  catch (err) {
    console.error("Error tracking exception", err);
    throw new Error(`Error tracking exception: ${err}`);
  }
}

// Functions for if we do user correlation later on.

/* async function createUserID(): Promise<void> {
  const pwabuilderDataFilePath: string = os.homedir() + "/.pwabuilder";
  if(!doesFileExist(pwabuilderDataFilePath)) {
    const dataPermission: boolean = await promptForPermission();
    const userId = dataPermission ? crypto.randomUUID() : undefined;
    const newUserData: PWABuilderData = {
      user: {
        id: userId
      }
    }
    fs.writeFileSync(pwabuilderDataFilePath, JSON.stringify(newUserData), {encoding: 'utf-8'});
  }
}
*/

/*
function addUserIDtoTelemetry(id: string): void {
  defaultClient.addTelemetryProcessor((envelope, context) => {
    envelope["tags"]['ai.user.id'] = id;
    return true;
  });
}
*/