import { setup, defaultClient } from 'applicationinsights';
import { getFlag } from '../flags';

// urls packaged during this session
const packagedURLs: Array<string> = [];

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

export function getAnalyticsClient() {
  return defaultClient;
}

// function to trackEvent
export function trackEvent(name: string, properties: any) {
  try {
    if (getFlag("analytics") === true) {
      dedupePackagingTries(name, properties);

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

function dedupePackagingTries(name: string, properties: any) {
  if (name === "package" && properties.url) {
    // if not already in packagedURLs, add it
    if (packagedURLs.indexOf(properties.url) === -1) {
      packagedURLs.push(properties.url);
      properties.tries = 1;
    }
    else {
      // increment tries
      properties.tries = packagedURLs.filter(url => url === properties.url).length + 1;
    }
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