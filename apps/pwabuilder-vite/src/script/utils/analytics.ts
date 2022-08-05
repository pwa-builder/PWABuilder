import * as analytics from "@pwabuilder/site-analytics"
import { env } from "./environment";
export { AnalyticsBehavior } from '@pwabuilder/site-analytics';

export function recordPageView(uri: string, name?: string, properties?: any) {
  if (env.isProduction) {
    analytics.recordPageView(uri, name, properties);
  }
}

export function recordPWABuilderProcessStep(
  processStep: string,
  stepType: analytics.AnalyticsBehavior.ProcessCheckpoint | analytics.AnalyticsBehavior.StartProcess | analytics.AnalyticsBehavior.ProcessCheckpoint | analytics.AnalyticsBehavior.CancelProcess | analytics.AnalyticsBehavior.CompleteProcess,
  additionalInfo?: {}) {
    if (env.isProduction) {
      const demo_used = JSON.parse(sessionStorage.getItem('demoURL')!);
      let scn = 'pwa-builder';

      if(demo_used){
        scn = 'demo-process';
      }

      let pageName = window.location.pathname.slice(1);
      if(pageName.length == 0) {
        pageName = "home";
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
      analytics.recordProcessStep(processName, processStep, stepType, additionalInfo);
    }
}

export function recordPageAction(actionName: string, type: analytics.AnalyticsActionType, behavior: analytics.AnalyticsBehavior, properties?: { [key: string]: string | number | boolean | string[] | number[] | boolean[] | object }) {
  if (env.isProduction) {
    analytics.recordPageAction(actionName, type, behavior, properties);
  }
}