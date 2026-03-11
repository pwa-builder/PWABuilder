import * as analytics from "@pwabuilder/site-analytics";
export { AnalyticsBehavior } from '@pwabuilder/site-analytics';
export declare function recordPageView(uri: string, name?: string, properties?: any): void;
export declare function recordPWABuilderProcessStep(processStep: string, stepType: analytics.AnalyticsBehavior.ProcessCheckpoint | analytics.AnalyticsBehavior.StartProcess | analytics.AnalyticsBehavior.ProcessCheckpoint | analytics.AnalyticsBehavior.CancelProcess | analytics.AnalyticsBehavior.CompleteProcess, additionalInfo?: {}): void;
export declare function recordProcessStep(processName: string, processStep: string, stepType: analytics.AnalyticsBehavior.ProcessCheckpoint | analytics.AnalyticsBehavior.StartProcess | analytics.AnalyticsBehavior.ProcessCheckpoint | analytics.AnalyticsBehavior.CancelProcess | analytics.AnalyticsBehavior.CompleteProcess, additionalInfo?: {}): void;
export declare function recordPageAction(actionName: string, type: analytics.AnalyticsActionType, behavior: analytics.AnalyticsBehavior, properties?: {
    [key: string]: string | number | boolean | string[] | number[] | boolean[] | object;
}): void;
export declare function storeQueryParam(key: string): void;
