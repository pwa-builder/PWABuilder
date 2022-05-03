import * as analytics from "@pwabuilder/site-analytics"
import { env } from "./environment";

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
      analytics.recordPWABuilderProcessStep(processStep, stepType, additionalInfo);
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

export {AnalyticsBehavior} from "@pwabuilder/site-analytics";