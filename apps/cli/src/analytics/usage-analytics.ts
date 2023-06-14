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
    await setUpLocalData();
    dataCollectionPermission = checkForDataPermission();
    if (getFlag("analytics") === true && dataCollectionPermission) {
      setup("#{ANALYTICS_CODE}#")
      .setAutoDependencyCorrelation(false)
      .setAutoCollectRequests(false)
      .setAutoCollectPerformance(false, false)
      .setAutoCollectDependencies(false)
      .setAutoCollectConsole(false)
      .setUseDiskRetryCaching(false)
      .start();

      const userId: string | undefined = await getUserID();

      if(userId) {
        addUserIDtoTelemetry(userId);
      }
      
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

async function getUserID(): Promise<string | undefined> {
  const pwabuilderDataFilePath: string = os.homedir() + "/.pwabuilder";
  var userId: string | undefined = undefined;

  if(!doesFileExist(pwabuilderDataFilePath)) {
    await setUpLocalData();
  } 

  const userData: PWABuilderData = JSON.parse(fs.readFileSync(pwabuilderDataFilePath, {encoding: 'utf-8'}));
  userId = userData.user.id;

  return userId;
}

function addUserIDtoTelemetry(id: string): void {
  defaultClient.addTelemetryProcessor((envelope, context) => {
    envelope["tags"]['ai.user.id'] = id;
    return true;
  });
}

async function setUpLocalData(): Promise<void> {
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
async function promptForPermission(): Promise<boolean> {
  const permissionPromptString: string = "Are you okay with PWABuilder collecting anonymous data to help improve our services?"
  return await prompts.confirm({message: permissionPromptString}) as boolean;
}

export function checkForDataPermission(): boolean {
  const pwabuilderDataFilePath: string = os.homedir() + "/.pwabuilder";
  const userData: PWABuilderData = JSON.parse(fs.readFileSync(pwabuilderDataFilePath, {encoding: 'utf-8'}));
  return userData.user.id != undefined;
}