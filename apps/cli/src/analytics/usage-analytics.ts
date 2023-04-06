import { setup, defaultClient } from 'applicationinsights';
import { getFlag } from '../flags';
import * as crypto from 'crypto';
import * as os from 'os';
import * as fs from 'fs';
import { doesFileExist } from '../util/fileUtil';

export function initAnalytics() {
  try {
    // check flag first
    if (getFlag("analytics") === true) {
      setup("")
      .setAutoDependencyCorrelation(false)
      .setAutoCollectRequests(false)
      .setAutoCollectPerformance(false, false)
      .setAutoCollectDependencies(false)
      .setAutoCollectConsole(false)
      .setUseDiskRetryCaching(false)
      .start();
    }

    // os.homedir() ".pwabuilder"

    var id: string = "";

    if(doesFileExist(os.homedir() + "/.pwabuilder")) {
      id = fs.readFileSync(os.homedir() + "/.pwabuilder", {encoding: 'utf-8'});
    } else {
      id = crypto.randomUUID();
      fs.writeFileSync(os.homedir() + "/.pwabuilder", id, {encoding: 'utf-8'});
    }
    
    defaultClient.addTelemetryProcessor((envelope, context) => {
      console.log(context);
      envelope["tags"]['ai.user.id'] = id;
      console.log(envelope);
      return true;
    });
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