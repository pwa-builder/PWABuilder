import { setup, defaultClient } from 'applicationinsights';
import { getFlag } from '../flags';
import * as crypto from 'crypto';
import * as os from 'os';
import * as fs from 'fs';
import { doesFileExist } from '../util/fileUtil';
import { spawn } from 'child_process';

export interface CreateEventData {
  template: string
}

export interface PWABuilderData {
  user: {
    id: string
  }
}

export function initAnalytics(): void {
  try {
    if (getFlag("analytics") === true) {
      setup("#{ANALYTICS_CODE}#")
      .setAutoDependencyCorrelation(false)
      .setAutoCollectRequests(false)
      .setAutoCollectPerformance(false, false)
      .setAutoCollectDependencies(false)
      .setAutoCollectConsole(false)
      .setUseDiskRetryCaching(false)
      .start();

      addUserIDtoTelemetry(getUserID());
    } 
    
  }
  catch (err) {
    console.error("Error initializing analytics", err);
  }
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

function getUserID(): string {
  const pwabuilderDataFilePath: string = os.homedir() + "/.pwabuilder";
  var userId: string = "";

  if(doesFileExist(pwabuilderDataFilePath)) {
    const userData: PWABuilderData = JSON.parse(fs.readFileSync(pwabuilderDataFilePath, {encoding: 'utf-8'}));
    userId = userData.user.id;
  } else {
    userId = crypto.randomUUID();
    const newUserData: PWABuilderData = {
      user: {
        id: userId
      }
    }
    fs.writeFileSync(pwabuilderDataFilePath, JSON.stringify(newUserData), {encoding: 'utf-8'});
  }

  return userId;
}

function addUserIDtoTelemetry(id: string): void {
  defaultClient.addTelemetryProcessor((envelope, context) => {
    envelope["tags"]['ai.user.id'] = id;
    return true;
  });
}

function spawnAnalyticsProcess(event: string, properties?: any) {
  const child = spawn('node', resolveNodeSpawnArgs(event, properties), {
    detached: true,
    stdio: 'ignore'
  });

  child.on('error', (err: Error) => {
    trackException(err);
  })
  
  child.unref();
}

function resolveNodeSpawnArgs(event: string, properties?: any): string [] {
  return properties ? ['tack-event.js', event] : ['tack-event.js', event, JSON.stringify(properties)];
}

export function trackErrorWrapper(_error: Error): void {
  spawnAnalyticsProcess('error', {error: _error});
}

export function trackCreateEventWrapper(createEventData: CreateEventData): void {
  spawnAnalyticsProcess('create', createEventData);
}

export function trackBuildEventWrapper(): void {
  spawnAnalyticsProcess('build');
}

export function trackStartEventWrapper(): void {
  spawnAnalyticsProcess('start');
}