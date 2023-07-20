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
let analyticsLoadTask;
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
export function recordPageView(uri, name, properties) {
    const pageViewOptions = {
        name: name,
        uri: uri,
        properties: properties
    };
    lazyLoadAnalytics()
        .then(oneDS => oneDS.trackPageView(pageViewOptions))
        .catch(err => console.warn('OneDS record page view error', err));
}
// See https://martech.azurewebsites.net/website-tools/oneds/guided-learning/scenario-process
export function recordProcessStep(processName, processStep, stepType, additionalInfo) {
    lazyLoadAnalytics()
        .then(oneDS => oneDS.capturePageAction(null, {
        actionType: "O" /* Other */,
        behavior: stepType,
        contentTags: {
            scn: processName,
            scnstp: processStep
        },
        content: additionalInfo
    }))
        .catch(err => console.warn('Process step was not recorded', err));
}
export function recordPageAction(actionName, type, behavior, properties) {
    const action = {
        name: actionName,
        actionType: type,
        behavior: behavior,
        properties: properties
    };
    lazyLoadAnalytics()
        .then(oneDS => oneDS.trackPageAction(action))
        .catch(err => console.warn('OneDS record page action error', err));
}
export function lazyLoadAnalytics() {
    if (!analyticsLoadTask) {
        analyticsLoadTask = new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.onerror = () => reject('Analytics script failed to load');
            script.onload = () => {
                const packagesOrError = tryInitAnalytics();
                if (packagesOrError instanceof Error) {
                    reject(packagesOrError);
                }
                else {
                    resolve(packagesOrError);
                }
            };
            script.src = "https://az416426.vo.msecnd.net/scripts/c/ms.analytics-web-2.min.js";
            document.head.appendChild(script);
        });
    }
    return analyticsLoadTask;
}
export function tryInitAnalytics() {
    try {
        const analytics = new window["oneDS"].ApplicationInsights();
        const config = {
            instrumentationKey: "f72753e593724c6183de8c8a3a5f419d-5e71f893-09c1-41d8-abf0-667e691c28a9-6593",
            webAnalyticsConfiguration: {
                manageCv: true,
                urlCollectHash: false,
                syncPageActionNavClick: false,
                autoCapture: {
                    click: true,
                    scroll: false,
                    pageView: false,
                    jsError: false,
                    msTags: false,
                    onUnload: true
                }
            }
        };
        analytics.initialize(config, []);
        return analytics;
    }
    catch (error) {
        if (error instanceof Error) {
            return error;
        }
        return new Error(`Error initializing analytics: ${error}`);
    }
}
// See https://martech.azurewebsites.net/website-tools/oneds/references/behavior-dictionary
export var AnalyticsBehavior;
(function (AnalyticsBehavior) {
    AnalyticsBehavior[AnalyticsBehavior["ContentUpdate"] = 0] = "ContentUpdate";
    AnalyticsBehavior[AnalyticsBehavior["NavigationBack"] = 1] = "NavigationBack";
    AnalyticsBehavior[AnalyticsBehavior["NavigationSelectionJump"] = 2] = "NavigationSelectionJump";
    AnalyticsBehavior[AnalyticsBehavior["NavigationForward"] = 3] = "NavigationForward";
    AnalyticsBehavior[AnalyticsBehavior["Apply"] = 4] = "Apply";
    AnalyticsBehavior[AnalyticsBehavior["Remove"] = 5] = "Remove";
    AnalyticsBehavior[AnalyticsBehavior["Sort"] = 6] = "Sort";
    AnalyticsBehavior[AnalyticsBehavior["Expand"] = 7] = "Expand";
    AnalyticsBehavior[AnalyticsBehavior["Reduce"] = 8] = "Reduce";
    AnalyticsBehavior[AnalyticsBehavior["OpenContextMenu"] = 9] = "OpenContextMenu";
    AnalyticsBehavior[AnalyticsBehavior["Tab"] = 10] = "Tab";
    AnalyticsBehavior[AnalyticsBehavior["Copy"] = 11] = "Copy";
    AnalyticsBehavior[AnalyticsBehavior["Experimentation"] = 12] = "Experimentation";
    AnalyticsBehavior[AnalyticsBehavior["Print"] = 13] = "Print";
    AnalyticsBehavior[AnalyticsBehavior["Show"] = 14] = "Show";
    AnalyticsBehavior[AnalyticsBehavior["Hide"] = 15] = "Hide";
    AnalyticsBehavior[AnalyticsBehavior["Maximize"] = 16] = "Maximize";
    AnalyticsBehavior[AnalyticsBehavior["Minimize"] = 17] = "Minimize";
    AnalyticsBehavior[AnalyticsBehavior["Backbutton"] = 18] = "Backbutton";
    AnalyticsBehavior[AnalyticsBehavior["StartProcess"] = 20] = "StartProcess";
    AnalyticsBehavior[AnalyticsBehavior["ProcessCheckpoint"] = 21] = "ProcessCheckpoint";
    AnalyticsBehavior[AnalyticsBehavior["CompleteProcess"] = 22] = "CompleteProcess";
    AnalyticsBehavior[AnalyticsBehavior["CancelProcess"] = 23] = "CancelProcess";
    AnalyticsBehavior[AnalyticsBehavior["DownloadCommit"] = 40] = "DownloadCommit";
    AnalyticsBehavior[AnalyticsBehavior["Download"] = 41] = "Download";
    AnalyticsBehavior[AnalyticsBehavior["SearchAutoComplete"] = 60] = "SearchAutoComplete";
    AnalyticsBehavior[AnalyticsBehavior["Search"] = 61] = "Search";
    AnalyticsBehavior[AnalyticsBehavior["SearchInitiate"] = 62] = "SearchInitiate";
    AnalyticsBehavior[AnalyticsBehavior["TextBoxInput"] = 63] = "TextBoxInput";
    AnalyticsBehavior[AnalyticsBehavior["Purchase"] = 80] = "Purchase";
    AnalyticsBehavior[AnalyticsBehavior["AddToCart"] = 81] = "AddToCart";
    AnalyticsBehavior[AnalyticsBehavior["ViewCart"] = 82] = "ViewCart";
    AnalyticsBehavior[AnalyticsBehavior["AddToWishlist"] = 83] = "AddToWishlist";
    AnalyticsBehavior[AnalyticsBehavior["FindStore"] = 84] = "FindStore";
    AnalyticsBehavior[AnalyticsBehavior["Checkout"] = 85] = "Checkout";
    AnalyticsBehavior[AnalyticsBehavior["RemoveFromCart"] = 86] = "RemoveFromCart";
    AnalyticsBehavior[AnalyticsBehavior["PurchaseComplete"] = 87] = "PurchaseComplete";
    AnalyticsBehavior[AnalyticsBehavior["ViewCheckoutPage"] = 88] = "ViewCheckoutPage";
    AnalyticsBehavior[AnalyticsBehavior["ViewCartPage"] = 89] = "ViewCartPage";
    AnalyticsBehavior[AnalyticsBehavior["ViewPDP"] = 90] = "ViewPDP";
    AnalyticsBehavior[AnalyticsBehavior["UpdateItemQuantity"] = 91] = "UpdateItemQuantity";
    AnalyticsBehavior[AnalyticsBehavior["IntentToBuy"] = 92] = "IntentToBuy";
    AnalyticsBehavior[AnalyticsBehavior["PushToInstall"] = 93] = "PushToInstall";
    AnalyticsBehavior[AnalyticsBehavior["SignIn"] = 100] = "SignIn";
    AnalyticsBehavior[AnalyticsBehavior["SignOut"] = 101] = "SignOut";
    AnalyticsBehavior[AnalyticsBehavior["SocialShare"] = 120] = "SocialShare";
    AnalyticsBehavior[AnalyticsBehavior["SocialLike"] = 121] = "SocialLike";
    AnalyticsBehavior[AnalyticsBehavior["SocialReply"] = 122] = "SocialReply";
    AnalyticsBehavior[AnalyticsBehavior["Call"] = 123] = "Call";
    AnalyticsBehavior[AnalyticsBehavior["Email"] = 124] = "Email";
    AnalyticsBehavior[AnalyticsBehavior["Community"] = 125] = "Community";
    AnalyticsBehavior[AnalyticsBehavior["SocialFollow"] = 126] = "SocialFollow";
    AnalyticsBehavior[AnalyticsBehavior["Vote"] = 140] = "Vote";
    AnalyticsBehavior[AnalyticsBehavior["SurveyInitiate"] = 141] = "SurveyInitiate";
    AnalyticsBehavior[AnalyticsBehavior["SurveyComplete"] = 142] = "SurveyComplete";
    AnalyticsBehavior[AnalyticsBehavior["ReportApplication"] = 143] = "ReportApplication";
    AnalyticsBehavior[AnalyticsBehavior["ReportReview"] = 144] = "ReportReview";
    AnalyticsBehavior[AnalyticsBehavior["SurveyCheckpoint"] = 145] = "SurveyCheckpoint";
    AnalyticsBehavior[AnalyticsBehavior["Contact"] = 145] = "Contact";
    AnalyticsBehavior[AnalyticsBehavior["InitiateRegistration"] = 161] = "InitiateRegistration";
    AnalyticsBehavior[AnalyticsBehavior["RegistrationComplete"] = 162] = "RegistrationComplete";
    AnalyticsBehavior[AnalyticsBehavior["CancelSubscription"] = 163] = "CancelSubscription";
    AnalyticsBehavior[AnalyticsBehavior["RenewSubscription"] = 164] = "RenewSubscription";
    AnalyticsBehavior[AnalyticsBehavior["ChangeSubscription"] = 165] = "ChangeSubscription";
    AnalyticsBehavior[AnalyticsBehavior["RegistrationCheckpoint"] = 166] = "RegistrationCheckpoint";
    AnalyticsBehavior[AnalyticsBehavior["ChatInitiate"] = 180] = "ChatInitiate";
    AnalyticsBehavior[AnalyticsBehavior["ChatEnd"] = 181] = "ChatEnd";
    AnalyticsBehavior[AnalyticsBehavior["TrialSignup"] = 200] = "TrialSignup";
    AnalyticsBehavior[AnalyticsBehavior["TrialInitiate"] = 201] = "TrialInitiate";
    AnalyticsBehavior[AnalyticsBehavior["SignUp"] = 210] = "SignUp";
    AnalyticsBehavior[AnalyticsBehavior["FreeSignUp"] = 211] = "FreeSignUp";
    AnalyticsBehavior[AnalyticsBehavior["PartnerReferral"] = 220] = "PartnerReferral";
    AnalyticsBehavior[AnalyticsBehavior["LearnLowerFunnel"] = 230] = "LearnLowerFunnel";
    AnalyticsBehavior[AnalyticsBehavior["LearnHigherFunnel"] = 231] = "LearnHigherFunnel";
    AnalyticsBehavior[AnalyticsBehavior["ShoppingIntent"] = 232] = "ShoppingIntent";
    AnalyticsBehavior[AnalyticsBehavior["VideoStart"] = 240] = "VideoStart";
    AnalyticsBehavior[AnalyticsBehavior["VideoPause"] = 241] = "VideoPause";
    AnalyticsBehavior[AnalyticsBehavior["VideoContinue"] = 242] = "VideoContinue";
    AnalyticsBehavior[AnalyticsBehavior["VideoCheckpoint"] = 243] = "VideoCheckpoint";
    AnalyticsBehavior[AnalyticsBehavior["VideoJump"] = 244] = "VideoJump";
    AnalyticsBehavior[AnalyticsBehavior["VideoComplete"] = 245] = "VideoComplete";
    AnalyticsBehavior[AnalyticsBehavior["VideoBuffering"] = 246] = "VideoBuffering";
    AnalyticsBehavior[AnalyticsBehavior["VideoError"] = 247] = "VideoError";
    AnalyticsBehavior[AnalyticsBehavior["VideoMute"] = 248] = "VideoMute";
    AnalyticsBehavior[AnalyticsBehavior["VideoUnmute"] = 249] = "VideoUnmute";
    AnalyticsBehavior[AnalyticsBehavior["VideoFullScreen"] = 250] = "VideoFullScreen";
    AnalyticsBehavior[AnalyticsBehavior["VideoUnfullscreen"] = 251] = "VideoUnfullscreen";
    AnalyticsBehavior[AnalyticsBehavior["VideoReplay"] = 252] = "VideoReplay";
    AnalyticsBehavior[AnalyticsBehavior["VideoPlayerLoad"] = 253] = "VideoPlayerLoad";
    AnalyticsBehavior[AnalyticsBehavior["VideoPlayerClick"] = 254] = "VideoPlayerClick";
    AnalyticsBehavior[AnalyticsBehavior["VideoVolumeControl"] = 255] = "VideoVolumeControl";
    AnalyticsBehavior[AnalyticsBehavior["VideoAudioTrackControl"] = 256] = "VideoAudioTrackControl";
    AnalyticsBehavior[AnalyticsBehavior["VideoClosedCaptionControl"] = 257] = "VideoClosedCaptionControl";
    AnalyticsBehavior[AnalyticsBehavior["VideoClosedCaptionStyle"] = 258] = "VideoClosedCaptionStyle";
    AnalyticsBehavior[AnalyticsBehavior["VideoResolutionControl"] = 259] = "VideoResolutionControl";
    AnalyticsBehavior[AnalyticsBehavior["VirtualEventJoin"] = 260] = "VirtualEventJoin";
    AnalyticsBehavior[AnalyticsBehavior["VirtualEventEnd"] = 261] = "VirtualEventEnd";
    AnalyticsBehavior[AnalyticsBehavior["Impression"] = 280] = "Impression";
    AnalyticsBehavior[AnalyticsBehavior["Click"] = 281] = "Click";
    AnalyticsBehavior[AnalyticsBehavior["RichMediaComplete"] = 282] = "RichMediaComplete";
    AnalyticsBehavior[AnalyticsBehavior["AdBuffering"] = 283] = "AdBuffering";
    AnalyticsBehavior[AnalyticsBehavior["AdError"] = 284] = "AdError";
    AnalyticsBehavior[AnalyticsBehavior["AdStart"] = 285] = "AdStart";
    AnalyticsBehavior[AnalyticsBehavior["AdComplete"] = 286] = "AdComplete";
    AnalyticsBehavior[AnalyticsBehavior["AdSkip"] = 287] = "AdSkip";
    AnalyticsBehavior[AnalyticsBehavior["AdTimeout"] = 288] = "AdTimeout";
    AnalyticsBehavior[AnalyticsBehavior["Other"] = 300] = "Other";
})(AnalyticsBehavior || (AnalyticsBehavior = {}));
//# sourceMappingURL=index.js.map