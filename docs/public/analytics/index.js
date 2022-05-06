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
export function recordPWABuilderProcessStep(processStep, stepType, additionalInfo) {
    let pageName = window.location.pathname.slice(1);
    if (pageName.length == 0) {
        pageName = "home";
    }
    let processLabel = pageName + "." + processStep;
    lazyLoadAnalytics()
        .then(oneDS => oneDS.capturePageAction(null, {
        actionType: "O" /* Other */,
        behavior: stepType,
        contentTags: {
            scn: "pwa-builder",
            scnstp: processLabel
        },
        content: additionalInfo
    }));
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
    }));
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
//# sourceMappingURL=index.js.map