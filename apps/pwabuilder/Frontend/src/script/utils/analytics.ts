import * as analytics from "@pwabuilder/site-analytics"
export { AnalyticsBehavior } from '@pwabuilder/site-analytics';

import { env } from "./environment";

export function recordPageView(uri: string, name?: string, properties?: any) {
  if (env.isProduction) {
    analytics.recordPageView(uri, name, appendReferrerProperty(properties));
  }
}

export function recordPWABuilderProcessStep(
  processStep: string,
  stepType: analytics.AnalyticsBehavior.ProcessCheckpoint | analytics.AnalyticsBehavior.StartProcess | analytics.AnalyticsBehavior.ProcessCheckpoint | analytics.AnalyticsBehavior.CancelProcess | analytics.AnalyticsBehavior.CompleteProcess,
  additionalInfo?: {}) {
    if (true) {
      const demo_used = JSON.parse(sessionStorage.getItem('demoURL')!);
      let scn = 'pwa-builder-v4';

      if(demo_used){
        scn = 'demo-process';
      }

      let pageName = window.location.pathname.slice(1);
      if(pageName.length == 0) {
        pageName = "home";
      }

      if(pageName === "freeToken"){
        scn = "free-tokens-flow"
      }

      let processLabel = pageName + "." + processStep

      recordProcessStep(scn, processLabel, stepType, additionalInfo);
    }
}

export function recordProcessStep(
  processName: string,
  processStep: string,
  stepType: analytics.AnalyticsBehavior.ProcessCheckpoint | analytics.AnalyticsBehavior.StartProcess | analytics.AnalyticsBehavior.ProcessCheckpoint | analytics.AnalyticsBehavior.CancelProcess | analytics.AnalyticsBehavior.CompleteProcess,
  additionalInfo?: {}) {
    if (env.isProduction) {
      analytics.recordProcessStep(processName, processStep, stepType, appendReferrerProperty(additionalInfo));
    }
}

export function recordPageAction(actionName: string, type: analytics.AnalyticsActionType, behavior: analytics.AnalyticsBehavior, properties?: { [key: string]: string | number | boolean | string[] | number[] | boolean[] | object }) {
  if (env.isProduction) {
    analytics.recordPageAction(actionName, type, behavior, appendReferrerProperty(properties));
  }
}

export function storeQueryParam(key: string): void {
  const value = (new URLSearchParams(window.location.search)).get(key);
  if(value) {
    sessionStorage.setItem(key, value);
  }
}

function appendReferrerProperty(properties: any): any {
  const referrer = sessionStorage.getItem('ref');
  if (referrer) {
    properties.referrer = referrer;
  }
  return properties;
}