import { initAnalytics, trackEvent, trackException } from "./usage-analytics";

type TrackEventParameters = {
  name: string,
  properties: any
}

function main() {
  const {name, properties} = parseTrackEventParameters();
  initAnalyticsAndTrack(name, properties);
}

function initAnalyticsAndTrack(name: string, properties: any) {
  initAnalytics();
  if(name === 'error') {
    trackException(properties.error);
  } else {
    trackEvent(name, properties);
  }
}

function parseTrackEventParameters(): TrackEventParameters {
  return {
    name: process.argv[2],
    properties: process.argv[3] ? JSON.parse(process.argv[3]) : {}
  };
}

// MAIN
main();