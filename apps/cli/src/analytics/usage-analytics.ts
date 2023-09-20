import { setup, defaultClient } from 'applicationinsights';
import { getFlag } from '../flags';
import * as crypto from 'crypto';
import * as os from 'os';
import * as fs from 'fs';
import { doesFileExist } from '../util/fileUtil';
import { spawn } from 'child_process';
const path = require('node:path'); 

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
export function trackEvent(name: string, properties?: any) {
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
  const logPath: string = path.resolve(__dirname, 'out.log');
  const out = fs.openSync(logPath, 'a');
  const err = fs.openSync(logPath, 'a');
  const child = spawn('node', resolveNodeSpawnArgs(event, properties), {
    detached: true,
    stdio: ['ignore', out, err]
  });
  child.on('error', (err: Error) => {
    trackException(err);
  })
  child.unref();
}

function resolveNodeSpawnArgs(event: string, properties?: any): string [] {
  const scriptPath: string = path.resolve(__dirname, 'track-events.js')
  return properties ? [scriptPath, event, JSON.stringify(properties)] : [scriptPath, event];
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