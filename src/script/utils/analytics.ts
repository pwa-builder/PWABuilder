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

import { env } from "./environment";

// import { AppInsightsCore, IExtendedConfiguration } from '@microsoft/1ds-core-js';
// import { ApplicationInsights, IPageViewTelemetry, IWebAnalyticsConfiguration } from '@microsoft/1ds-wa-js';

let analyticsLoadTask: Promise<AppInsights> | null;

/*
Per CELA all cookies related to Analytics are considered non-essential
unless the data is aggregated. So if the user decides to accept cookies,
the below three functions will all being firing. However, if the user
chooses to deny or ignore the cookies banner, only recordPageView will
record data as it is the only aggregated analytics tracker (The other two 
track individual user pathing).

In order to check if the cookies have been accepted check: 
const acceptedCookies = localStorage.getItem('PWABuilderGDPR'); 
and add acceptedCookies to the if(env.isProduction && acceptedCookies) 
*/

export function recordPageView(uri: string, name?: string, properties?: any) {
  const pageViewOptions: PageViewTelemetry = {
    name: name,
    uri: uri,
    properties: properties
  };
  if (env.isProduction) {
    lazyLoadAnalytics()
      .then(oneDS => oneDS.trackPageView(pageViewOptions))
      .catch(err => console.warn('OneDS record page view error', err));
  }
}

// See https://martech.azurewebsites.net/website-tools/oneds/guided-learning/scenario-process
export function recordProcessStep(
  processName: string,
  processStep: string,
  stepType: AnalyticsBehavior.ProcessCheckpoint | AnalyticsBehavior.StartProcess | AnalyticsBehavior.ProcessCheckpoint | AnalyticsBehavior.CancelProcess | AnalyticsBehavior.CompleteProcess,
  additionalInfo?: {}) {

  if (env.isProduction) {
    lazyLoadAnalytics()
      .then(oneDS => oneDS.capturePageAction(null, {
        actionType: AnalyticsActionType.Other,
        behavior: stepType,
        contentTags: {
          scn: processName,
          scnstp: processStep
        },
        content: additionalInfo
      }));
  }
}

export function recordPageAction(actionName: string, type: AnalyticsActionType, behavior: AnalyticsBehavior, properties?: { [key: string]: string | number | boolean | string[] | number[] | boolean[] | object }) {
  const action: PageActionTelemetry = {
    name: actionName,
    actionType: type,
    behavior: behavior,
    properties: properties
  };
  
  if (env.isProduction) {
    lazyLoadAnalytics()
      .then(oneDS => oneDS.trackPageAction(action))
      .catch(err => console.warn('OneDS record page action error', err));
  }
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
          click: true,
          scroll: false,
          pageView: false, // We'll do this manually via our SPA router
          jsError: false,
          msTags: false,
          onUnload: true
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
  capturePageAction(element: Element | null, overrideValues: IPageActionOverrideValues, customProperties?: {}, isRightClick?: boolean): void;
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

// See https://1dsdocs.azurewebsites.net/api/webSDK/ext/webanalytics/3.0/f/interfaces/ipageactionoverridevalues.html
interface IPageActionOverrideValues {
  actionType?: AnalyticsActionType,
  behavior?: AnalyticsBehavior,
  clickCoordinateX?: number;
  clickCoordinateY?: number;
  content?: any;
  contentTags?: any;
  isAuto?: boolean;
  pageName?: string;
  pageType?: string;
  refUri?: string;
  targetUri?: string;
}

// See https://martech.azurewebsites.net/website-tools/oneds/references/action-type-dictionary/
export const enum AnalyticsActionType {
  LeftClick = "CL",
  MiddleClick = "CM",
  RightClick = "CR",
  Scroll = "S",
  Zoom = "Z",
  Resize = "R",
  PointerMovementEnter = "PE",
  PointerMovementHover = "PH",
  PointerMovementLeave = "PL",
  Automatic = "A",
  AutomaticTimer = "AT",
  Other = "O"
}

// See https://martech.azurewebsites.net/website-tools/oneds/references/behavior-dictionary
export const enum AnalyticsBehavior {
  ContentUpdate = 0,
  NavigationBack = 1,
  NavigationSelectionJump = 2,
  NavigationForward = 3,
  Apply = 4,
  Remove = 5,
  Sort = 6,
  Expand = 7,
  Reduce = 8,
  OpenContextMenu = 9,
  Tab = 10,
  Copy = 11,
  Experimentation = 12,
  Print = 13,
  Show = 14,
  Hide = 15,
  Maximize = 16,
  Minimize = 17,
  Backbutton = 18,
  StartProcess = 20,
  ProcessCheckpoint = 21,
  CompleteProcess = 22,
  CancelProcess = 23,
  DownloadCommit = 40,
  Download = 41,
  SearchAutoComplete = 60,
  Search = 61,
  SearchInitiate = 62,
  TextBoxInput = 63,
  Purchase = 80,
  AddToCart = 81,
  ViewCart = 82,
  AddToWishlist = 83,
  FindStore = 84,
  Checkout = 85,
  RemoveFromCart = 86,
  PurchaseComplete = 87,
  ViewCheckoutPage = 88,
  ViewCartPage = 89,
  ViewPDP = 90,
  UpdateItemQuantity = 91,
  IntentToBuy = 92,
  PushToInstall = 93,
  SignIn = 100,
  SignOut = 101,
  SocialShare = 120,
  SocialLike = 121,
  SocialReply = 122,
  Call = 123,
  Email = 124,
  Community = 125,
  SocialFollow = 126,
  Vote = 140,
  SurveyInitiate = 141,
  SurveyComplete = 142,
  ReportApplication = 143,
  ReportReview = 144,
  SurveyCheckpoint = 145,
  Contact = 145,
  InitiateRegistration = 161,
  RegistrationComplete = 162,
  CancelSubscription = 163,
  RenewSubscription = 164,
  ChangeSubscription = 165,
  RegistrationCheckpoint = 166,
  ChatInitiate = 180,
  ChatEnd = 181,
  TrialSignup = 200,
  TrialInitiate = 201,
  SignUp = 210,
  FreeSignUp = 211,
  PartnerReferral = 220,
  LearnLowerFunnel = 230,
  LearnHigherFunnel = 231,
  ShoppingIntent = 232,
  VideoStart = 240,
  VideoPause = 241,
  VideoContinue = 242,
  VideoCheckpoint = 243,
  VideoJump = 244,
  VideoComplete = 245,
  VideoBuffering = 246,
  VideoError = 247,
  VideoMute = 248,
  VideoUnmute = 249,
  VideoFullScreen = 250,
  VideoUnfullscreen = 251,
  VideoReplay = 252,
  VideoPlayerLoad = 253,
  VideoPlayerClick = 254,
  VideoVolumeControl = 255,
  VideoAudioTrackControl = 256,
  VideoClosedCaptionControl = 257,
  VideoClosedCaptionStyle = 258,
  VideoResolutionControl = 259,
  VirtualEventJoin = 260,
  VirtualEventEnd = 261,
  Impression = 280,
  Click = 281,
  RichMediaComplete = 282,
  AdBuffering = 283,
  AdError = 284,
  AdStart = 285,
  AdComplete = 286,
  AdSkip = 287,
  AdTimeout = 288,
  Other = 300
}