/**
 * We use Adobe Analytics, specifically, the Microsoft 1DS web SDK for Adobe Analytics.
 *
 * NPM package: https://msasg.visualstudio.com/Shared%20Data/_packaging?_a=package&feed=1DS-SDK&package=%40microsoft%2F1ds-wa-js&version=3.1.5&protocolType=Npm
 * Documentation:
 *  - https://martech.azurewebsites.net/website-tools/oneds/#getstarted
 *  - API reference https://1dsdocs.azurewebsites.net/api/webSDK/ext/webanalytics/3.0/f/index.html
 *  - React sample app https://msasg.visualstudio.com/Shared%20Data/_git/1DS.JavaScript.SampleApps.React?path=%2FREADME.md&version=GBmaster&_a=preview
 *
 *
 * Having trouble installing the analytics NPM package?
 *  - Run vsts-npm-auth -config .npmrc
 *  - Then run npm i
 *  - For more info, see https://msasg.visualstudio.com/Shared%20Data/_packaging?_a=connect&feed=1DS-SDK
 */

import { AppInsightsCore, IExtendedConfiguration } from '@microsoft/1ds-core-js';
import { ApplicationInsights, IPageViewTelemetry, IWebAnalyticsConfiguration } from '@microsoft/1ds-wa-js';

const appInsightsCore: AppInsightsCore = new AppInsightsCore();
const webAnalyticsPlugin: ApplicationInsights = new ApplicationInsights();

export function initAnalytics() {
  var coreConfig: IExtendedConfiguration = {
    instrumentationKey: "f72753e593724c6183de8c8a3a5f419d-5e71f893-09c1-41d8-abf0-667e691c28a9-6593",
    endpointUrl: 'https://browser.events.data.microsoft.com/OneCollector/1.0/',
    extensions: [
      webAnalyticsPlugin
    ],
    extensionConfig: []
  };
  var webAnalyticsConfig: IWebAnalyticsConfiguration = {
    manageCv: true,
    urlCollectHash: false,
    syncPageActionNavClick: false,
    autoCapture: {
      click: false,
      scroll: false,
      pageView: false, // We'll do this manually via our SPA router
      jsError: false,
      msTags: false,
      onUnload: false
    }
  };

  if (coreConfig.extensionConfig) {
    coreConfig.extensionConfig[webAnalyticsPlugin.identifier] = webAnalyticsConfig;
  }
  //Initialize SDK
  appInsightsCore.initialize(coreConfig, []);
}

export function recordPageView(uri: string, name?: string, properties?: any) {
  const pageViewOptions: IPageViewTelemetry = {
    name: name,
    uri: uri,
    properties: properties
  };
  try {
    webAnalyticsPlugin.trackPageView(pageViewOptions);
  } catch (error) {
    console.warn("Unable to capture page view due to error", error);
  }
}

export function recordPageAction(actionName: string, data?: { [key: string]: string | number | boolean | string[] | number[] | boolean[] | object }) {
  // Should we instead use webAnalyticsPlugin.trackPageAction(...)? 
  try {
    appInsightsCore.track({
      name: actionName,
      data: data
    });
  } catch (error) {
    console.warn("Unable to capture page action due to error", error);
  }
}