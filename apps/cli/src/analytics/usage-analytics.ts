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

export async function ableToUseAnalytics(): Promise<boolean> {
  const pwabuilderDataFilePath: string = os.homedir() + "/.pwabuilder";
  let canUseAnalytics: boolean = false;
  if(doesFileExist(pwabuilderDataFilePath)) {
    canUseAnalytics = checkForDataPermission(pwabuilderDataFilePath);
  } else {
    const permissionInput: boolean = await promptForPermission();
    canUseAnalytics = writePermission(permissionInput, pwabuilderDataFilePath);
  }

  return canUseAnalytics;
}
async function promptForPermission(): Promise<boolean> {
  const permissionPromptString: string = "Are you okay with PWABuilder collecting anonymous data to help improve our services?"
  return await prompts.confirm({message: permissionPromptString}) as boolean;
}

function checkForDataPermission(pathToDataFile: string): boolean {
  const userData: PWABuilderData = JSON.parse(fs.readFileSync(pathToDataFile, {encoding: 'utf-8'}));
  return userData.user.trackingPermission;
}

function writePermission(permission: boolean, pathToDataFile: string): boolean {
  const pwaBuilderUserData: PWABuilderData = {
    user: {
      trackingPermission: permission
    }
  }
  let didWriteSucceed: boolean = true;
  try {
    fs.writeFileSync(pathToDataFile, JSON.stringify(pwaBuilderUserData), {encoding: 'utf-8'});
  } catch {
    didWriteSucceed = false;
  }
  

  return permission && didWriteSucceed;
}

export async function promptAndRewritePermission(): Promise<boolean> {
  const pwabuilderDataFilePath: string = os.homedir() + "/.pwabuilder";
  const dataTrackingInput: boolean = await promptForPermission();
  writePermission(dataTrackingInput, pwabuilderDataFilePath);
  return dataTrackingInput
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