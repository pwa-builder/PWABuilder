/**
 * We use Adobe Analytics, specifically, the Microsoft 1DS web SDK for Adobe Analytics.
 *
 * Documentation:
 *  - Main docs: https://martech.azurewebsites.net/website-tools/oneds/#getstarted
 *  - API reference https://1dsdocs.azurewebsites.net/api/webSDK/ext/webanalytics/3.0/f/index.html
 *  - React sample app https://msasg.visualstudio.com/Shared%20Data/_git/1DS.JavaScript.SampleApps.React?path=%2FREADME.md&version=GBmaster&_a=preview
 *  - NPM package: https://msasg.visualstudio.com/Shared%20Data/_packaging?_a=package&feed=1DS-SDK&package=%40microsoft%2F1ds-wa-js&version=3.1.5&protocolType=Npm
 *    - Note: 
 *    -   We don't use the NPM package due to Github Actions having trouble connecting to the private NPM feed for OneDS.
 *    -   Instead, we append a global script and use the global 
 */

// import { AppInsightsCore, IExtendedConfiguration } from '@microsoft/1ds-core-js';
// import { ApplicationInsights, IPageViewTelemetry, IWebAnalyticsConfiguration } from '@microsoft/1ds-wa-js';

let analyticsLoadTask: Promise<AppInsights> | null;

export function recordPageView(uri: string, name?: string, properties?: any) {
  const pageViewOptions: PageViewTelemetry = {
    name: name,
    uri: uri,
    properties: properties
  };
  lazyLoadAnalytics()
    .then(oneDS => oneDS.trackPageView(pageViewOptions))
    .catch(err => console.warn('OneDS record page view error', err));
}

export function recordPageAction(actionName: string, properties?: { [key: string]: string | number | boolean | string[] | number[] | boolean[] | object }) {
  const action: PageActionTelemetry = {
    name: actionName,
    properties: properties
  };
  lazyLoadAnalytics()
    .then(oneDS => oneDS.trackPageAction(action))
    .catch(err => console.warn('OneDS record page action error', err));
}

function lazyLoadAnalytics(): Promise<AppInsights> {
  if (!analyticsLoadTask) {
    analyticsLoadTask = new Promise<AppInsights>((resolve, reject) => {
      const script = document.createElement("script");
      script.onerror = () => reject('Analytics script failed to load');
      script.onload = () => {
        const packagesOrError = tryInitAnalytics();
        if (packagesOrError instanceof Error) {
          reject(packagesOrError);
        } else {
          resolve(packagesOrError);
        }
      };
      script.src = "https://az416426.vo.msecnd.net/scripts/c/ms.analytics-web-2.min.js";
      document.head.appendChild(script);
    });
  }

  return analyticsLoadTask;
}

function tryInitAnalytics(): Error | AppInsights {
  try {
    const analytics: AppInsights = new (window as any)["oneDS"].ApplicationInsights();
    const config = { // IExtendedConfiguration
      instrumentationKey: "f72753e593724c6183de8c8a3a5f419d-5e71f893-09c1-41d8-abf0-667e691c28a9-6593",
      webAnalyticsConfiguration: { //IWebAnalyticsConfiguration
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
      }
    };

    analytics.initialize(config, []);
    return analytics;
  } catch (error) {
    if (error instanceof Error) {
      return error;
    }

    return new Error(`Error initializing analytics: ${error}`);
  }
}

interface AppInsights {
  initialize(config: unknown, plugins: unknown[]): void;
  trackPageView(pageView: PageViewTelemetry): void;
  trackPageAction(action: PageActionTelemetry): void;
}

interface PageViewTelemetry {
  uri: string;
  name?: string;
  properties?: unknown;
}

interface PageActionTelemetry {
  /**
     * Page name.
     */
  name?: string;
  /**
   * A relative or absolute URL that identifies the page or other item. Defaults to the window location.
   */
  uri?: string;
  /**
   * Represents locale of the Site user has selected
   */
  market?: string;
  /**
   * Page type
   */
  pageType?: string;
  /**
   * boolean is user logged in
   */
  isLoggedIn?: boolean;
  /**
   * property bag to contain an extension to domain properties - extension to Part B
   */
  properties?: {
    [key: string]: any;
  };
  /**
     * An identifier assigned to each distinct impression for the purposes of correlating with pageview.
     * A new id is automatically generated on each pageview. You can manually specify this field if you
     * want to use a specific value instead.
     */
  id?: string;
  /**
   * Version of the part B schema, todo: set this value in trackpageView
   */
  ver?: string;
  /**
  * Flag to report whether the event was fired manually
  */
  isManual?: boolean;
  /**
  * Target uri for PageAction events
  */
  targetUri?: string;
  /**
  *  One of the awa.actionType values
  */
  actionType?: string;
  /**
  * One of the awa.behavior values.
  */
  behavior?: number;
  /**
    * X, Y representing the absolute co-ordinates withrespect to topleft corner of the page. This should be normalized for the screen resolution to provide better heat map.
    */
  clickCoordinates?: string;
  /**
  * JSON-formatted array of content acted upon
  */
  content?: any;
  /**
  * Version indicating content version which aids in parsing the content.
  */
  contentVer?: string;
  /**
   * Defines that the event should be sent synchronously as it is expected that the event may caused a page navigation
   */
  sync?: EventSendType;
}

declare const enum EventSendType {
  /**
   * Batch and send the event asynchronously, this is the same as either setting the event `sync` flag to false or not setting at all.
   */
  Batched = 0,
  /**
   * Attempt to send the event synchronously, this is the same as setting the event `sync` flag to true
   */
  Synchronous = 1,
  /**
   * Attempt to send the event synchronously with a preference for the sendBeacon() API.
   * As per the specification, the payload of the event (when converted to JSON) must not be larger than 64kb,
   * the sendHook is also not supported or used when sendBeacon.
   */
  SendBeacon = 2,
  /**
   * Attempt to send the event synchronously with a preference for the fetch() API with the keepalive flag,
   * the SDK checks to ensure that the fetch() implementation supports the 'keepalive' flag and if not it
   * will fallback to either sendBeacon() or a synchronous XHR request.
   * As per the specification, the payload of the event (when converted to JSON) must not be larger than 64kb.
   * Note: Not all browsers support the keepalive flag so for those environments the events may still fail
   */
  SyncFetch = 3
}