import appInsights, {
  DistributedTracingModes
} from 'applicationinsights';

enum AppInsightsStatus {
  ENABLED = 1,
  DISABLED = 0,
  DEFAULT = -1,
}

var appInsightsStatus: AppInsightsStatus = AppInsightsStatus.DEFAULT;
export function setupAnalytics() {
  try {
    appInsights.setup()
      .setDistributedTracingMode(DistributedTracingModes.AI_AND_W3C)
      .setAutoDependencyCorrelation(true)
      .setAutoCollectRequests(false)
      .setAutoCollectPerformance(false, false)
      .setAutoCollectExceptions(false)
      .setAutoCollectDependencies(false)
      .setAutoCollectConsole(false)
      .setUseDiskRetryCaching(false)
      .setSendLiveMetrics(false)
      .start();
    appInsightsStatus = AppInsightsStatus.ENABLED;
    console.log('App insights enabled successfully');
  } catch (e) {
    appInsightsStatus = AppInsightsStatus.DISABLED;
    console.warn("App insights couldn't be enabled", e);
  }
}

export function trackEvent(
  analyticsInfo: AnalyticsInfo,
  error: string | null,
  success: boolean
) {
  if (appInsightsStatus == AppInsightsStatus.DEFAULT) {
    setupAnalytics();
  }
  if (
    appInsights.defaultClient == null ||
    appInsights.defaultClient == undefined ||
    appInsightsStatus == AppInsightsStatus.DISABLED
  ) {
    console.error("App insights no defaultClient");
    return;
  }
  
  var properties: any = {
    name: analyticsInfo.name,
    url: analyticsInfo.url,
    platformId: analyticsInfo.platformId,
    platformIdVersion: analyticsInfo.platformIdVersion,
    referrer: analyticsInfo.referrer,
  };

  try {
    if (
      analyticsInfo.correlationId != null &&
      analyticsInfo.correlationId != undefined &&
      typeof analyticsInfo.correlationId == 'string'
    ) {
      appInsights.defaultClient.context.tags[appInsights.defaultClient.context.keys.operationId] =
        analyticsInfo.correlationId;
    }
    if (success) {
      appInsights.defaultClient.trackEvent({
        name: 'AndroidPackageEvent',
        properties: properties,
      });
    } else {
      properties.error = error;
      appInsights.defaultClient.trackEvent({
        name: 'AndroidPackageFailureEvent',
        properties: properties,
      });
    }
  } catch (e) {
    console.error(e);
  }
}

export type AnalyticsInfo = {
  url: string;
  name: string;
  packageId: string;
  platformId: string | null;
  platformIdVersion: string | null;
  correlationId: string | null;
  referrer: string | null;
};
