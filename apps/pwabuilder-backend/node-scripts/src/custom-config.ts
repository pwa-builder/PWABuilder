/**
 * @license Copyright 2018 The Lighthouse Authors. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */

/* eslint-disable max-len */

import * as constants from 'lighthouse/core/config/constants.js';
import * as i18n from 'lighthouse/core/lib/i18n/i18n.js';
import * as settings from './custom-settings.js';

const UIStrings = {
  /** Title of the Performance category of audits. Equivalent to 'Web performance', this term is inclusive of all web page speed and loading optimization topics. Also used as a label of a score gauge; try to limit to 20 characters. */
  performanceCategoryTitle: 'Performance',
  /** Title of the Budgets section of the Performance Category. 'Budgets' refers to a budget (like a financial budget), but applied to the amount of resources on a page, rather than money. */
  budgetsGroupTitle: 'Budgets',
  /** Description of the Budgets section of the Performance category. Within this section the budget results are displayed. */
  budgetsGroupDescription: 'Performance budgets set standards for the performance of your site.',
  /** Title of the speed metrics section of the Performance category. Within this section are various speed metrics which quantify the pageload performance into values presented in seconds and milliseconds. */
  metricGroupTitle: 'Metrics',
  /** Title of the opportunity section of the Performance category. Within this section are audits with imperative titles that suggest actions the user can take to improve the loading performance of their web page. 'Suggestion'/'Optimization'/'Recommendation' are reasonable synonyms for 'opportunity' in this case. */
  loadOpportunitiesGroupTitle: 'Opportunities',
  /** Description of the opportunity section of the Performance category. 'Suggestions' could also be 'recommendations'. Within this section are audits with imperative titles that suggest actions the user can take to improve the loading performance of their web page. */
  loadOpportunitiesGroupDescription:
    "These suggestions can help your page load faster. They don't [directly affect](https://developer.chrome.com/docs/lighthouse/performance/performance-scoring/) the Performance score.",
  /** Title of an opportunity sub-section of the Performance category. Within this section are audits with imperative titles that suggest actions the user can take to improve the time of the first initial render of the webpage. */
  firstPaintImprovementsGroupTitle: 'First Paint Improvements',
  /** Description of an opportunity sub-section of the Performance category. Within this section are audits with imperative titles that suggest actions the user can take to improve the time of the first initial render of the webpage. */
  firstPaintImprovementsGroupDescription:
    'The most critical aspect of performance is how quickly pixels are rendered onscreen. Key metrics: First Contentful Paint, First Meaningful Paint',
  /** Title of an opportunity sub-section of the Performance category. Within this section are audits with imperative titles that suggest actions the user can take to improve the overall loading performance of their web page. */
  overallImprovementsGroupTitle: 'Overall Improvements',
  /** Description of an opportunity sub-section of the Performance category. Within this section are audits with imperative titles that suggest actions the user can take to improve the overall loading performance of their web page. */
  overallImprovementsGroupDescription:
    'Enhance the overall loading experience, so the page is responsive and ready to use as soon as possible. Key metrics: Time to Interactive, Speed Index',
  /** Title of the diagnostics section of the Performance category. Within this section are audits with non-imperative titles that provide more detail on the page's page load performance characteristics. Whereas the 'Opportunities' suggest an action along with expected time savings, diagnostics do not. Within this section, the user may read the details and deduce additional actions they could take. */
  diagnosticsGroupTitle: 'Diagnostics',
  /** Description of the diagnostics section of the Performance category. Within this section are audits with non-imperative titles that provide more detail on a web page's load performance characteristics. Within this section, the user may read the details and deduce additional actions they could take to improve performance. */
  diagnosticsGroupDescription:
    "More information about the performance of your application. These numbers don't [directly affect](https://developer.chrome.com/docs/lighthouse/performance/performance-scoring/) the Performance score.",
  /** Title of the Accessibility category of audits. This section contains audits focused on making web content accessible to all users. Also used as a label of a score gauge; try to limit to 20 characters. */
  a11yCategoryTitle: 'Accessibility',
  /** Description of the Accessibility category. This is displayed at the top of a list of audits focused on making web content accessible to all users. No character length limits. 'improve the accessibility of your web app' and 'manual testing' become link texts to additional documentation. */
  a11yCategoryDescription:
    'These checks highlight opportunities to [improve the accessibility of your web app](https://developer.chrome.com/docs/lighthouse/accessibility/). Automatic detection can only detect a subset of issues and does not guarantee the accessibility of your web app, so [manual testing](https://web.dev/how-to-review/) is also encouraged.',
  /** Description of the Accessibility manual checks category. This description is displayed above a list of accessibility audits that currently have no automated test and so must be verified manually by the user. No character length limits. 'conducting an accessibility review' becomes link text to additional documentation. */
  a11yCategoryManualDescription:
    'These items address areas which an automated testing tool cannot cover. Learn more in our guide on [conducting an accessibility review](https://web.dev/how-to-review/).',
  /** Title of the best practices section of the Accessibility category. Within this section are audits with descriptive titles that highlight common accessibility best practices. */
  a11yBestPracticesGroupTitle: 'Best practices',
  /** Description of the best practices section within the Accessibility category. Within this section are audits with descriptive titles that highlight common accessibility best practices. */
  a11yBestPracticesGroupDescription: 'These items highlight common accessibility best practices.',
  /** Title of the color contrast section within the Accessibility category. Within this section are audits with descriptive titles that highlight the color and vision aspects of the page's accessibility that are passing or failing. */
  a11yColorContrastGroupTitle: 'Contrast',
  /** Description of the color contrast section within the Accessibility category. Within this section are audits with descriptive titles that highlight the color and vision aspects of the page's accessibility that are passing or failing. */
  a11yColorContrastGroupDescription: 'These are opportunities to improve the legibility of your content.',
  /** Title of the HTML element naming section within the Accessibility category. Within this section are audits with descriptive titles that highlight if the non-textual HTML elements on the page have names discernible by a screen reader. */
  a11yNamesLabelsGroupTitle: 'Names and labels',
  /** Description of the HTML element naming section within the Accessibility category. Within this section are audits with descriptive titles that highlight if the non-textual HTML elements on the page have names discernible by a screen reader. */
  a11yNamesLabelsGroupDescription:
    'These are opportunities to improve the semantics of the controls in your application. This may enhance the experience for users of assistive technology, like a screen reader.',
  /** Title of the navigation section within the Accessibility category. Within this section are audits with descriptive titles that highlight opportunities to improve keyboard navigation. */
  a11yNavigationGroupTitle: 'Navigation',
  /** Description of the navigation section within the Accessibility category. Within this section are audits with descriptive titles that highlight opportunities to improve keyboard navigation. */
  a11yNavigationGroupDescription: 'These are opportunities to improve keyboard navigation in your application.',
  /** Title of the ARIA validity section within the Accessibility category. Within this section are audits with descriptive titles that highlight if whether all the aria-* HTML attributes have been used properly. */
  a11yAriaGroupTitle: 'ARIA',
  /** Description of the ARIA validity section within the Accessibility category. Within this section are audits with descriptive titles that highlight if whether all the aria-* HTML attributes have been used properly. */
  a11yAriaGroupDescription:
    'These are opportunities to improve the usage of ARIA in your application which may enhance the experience for users of assistive technology, like a screen reader.',
  /** Title of the language section within the Accessibility category. Within this section are audits with descriptive titles that highlight if the language has been annotated in the correct HTML attributes on the page. */
  a11yLanguageGroupTitle: 'Internationalization and localization',
  /** Description of the language section within the Accessibility category. Within this section are audits with descriptive titles that highlight if the language has been annotated in the correct HTML attributes on the page. */
  a11yLanguageGroupDescription:
    'These are opportunities to improve the interpretation of your content by users in different locales.',
  /** Title of the navigation section within the Accessibility category. Within this section are audits with descriptive titles that highlight opportunities to provide alternative content for audio and video. */
  a11yAudioVideoGroupTitle: 'Audio and video',
  /** Description of the navigation section within the Accessibility category. Within this section are audits with descriptive titles that highlight opportunities to provide alternative content for audio and video. */
  a11yAudioVideoGroupDescription:
    'These are opportunities to provide alternative content for audio and video. This may improve the experience for users with hearing or vision impairments.',
  /** Title of the navigation section within the Accessibility category. Within this section are audits with descriptive titles that highlight opportunities to improve the experience of reading tabular or list data using assistive technology. */
  a11yTablesListsVideoGroupTitle: 'Tables and lists',
  /** Description of the navigation section within the Accessibility category. Within this section are audits with descriptive titles that highlight opportunities to improve the experience of reading tabular or list data using assistive technology. */
  a11yTablesListsVideoGroupDescription:
    'These are opportunities to improve the experience of reading tabular or list data using assistive technology, like a screen reader.',
  /** Title of the Search Engine Optimization (SEO) category of audits. This is displayed at the top of a list of audits focused on topics related to optimizing a website for indexing by search engines. Also used as a label of a score gauge; try to limit to 20 characters. */
  seoCategoryTitle: 'SEO',
  /** Description of the Search Engine Optimization (SEO) category. This is displayed at the top of a list of audits focused on optimizing a website for indexing by search engines. No character length limits. The last sentence starting with 'Learn' becomes link text to additional documentation. */
  seoCategoryDescription:
    'These checks ensure that your page is following basic search engine optimization advice. ' +
    'There are many additional factors Lighthouse does not score here that may affect your search ranking, ' +
    'including performance on [Core Web Vitals](https://web.dev/learn-core-web-vitals/). [Learn more about Google Search Essentials](https://support.google.com/webmasters/answer/35769).',
  /** Description of the Search Engine Optimization (SEO) manual checks category, the additional validators must be run by hand in order to check all SEO best practices. This is displayed at the top of a list of manually run audits focused on optimizing a website for indexing by search engines. No character length limits. */
  seoCategoryManualDescription: 'Run these additional validators on your site to check additional SEO best practices.',
  /** Title of the navigation section within the Search Engine Optimization (SEO) category. Within this section are audits with descriptive titles that highlight opportunities to make a page more usable on mobile devices. */
  seoMobileGroupTitle: 'Mobile Friendly',
  /** Description of the navigation section within the Search Engine Optimization (SEO) category. Within this section are audits with descriptive titles that highlight opportunities to make a page more usable on mobile devices. */
  seoMobileGroupDescription:
    'Make sure your pages are mobile friendly so users don’t have to pinch or zoom ' +
    'in order to read the content pages. [Learn how to make pages mobile-friendly](https://developers.google.com/search/mobile-sites/).',
  /** Title of the navigation section within the Search Engine Optimization (SEO) category. Within this section are audits with descriptive titles that highlight ways to make a website content more easily understood by search engine crawler bots. */
  seoContentGroupTitle: 'Content Best Practices',
  /** Description of the navigation section within the Search Engine Optimization (SEO) category. Within this section are audits with descriptive titles that highlight ways to make a website content more easily understood by search engine crawler bots. */
  seoContentGroupDescription:
    'Format your HTML in a way that enables crawlers to better understand your app’s content.',
  /** Title of the navigation section within the Search Engine Optimization (SEO) category. Within this section are audits with descriptive titles that highlight ways to make a website accessible to search engine crawlers. */
  seoCrawlingGroupTitle: 'Crawling and Indexing',
  /** Description of the navigation section within the Search Engine Optimization (SEO) category. Within this section are audits with descriptive titles that highlight ways to make a website accessible to search engine crawlers. */
  seoCrawlingGroupDescription: 'To appear in search results, crawlers need access to your app.',
  /** Title of the Progressive Web Application (PWA) category of audits. This is displayed at the top of a list of audits focused on topics related to whether or not a site is a progressive web app, e.g. responds offline, uses a service worker, is on https, etc. Also used as a label of a score gauge. */
  pwaCategoryTitle: 'PWA',
  /** Description of the Progressive Web Application (PWA) category. This is displayed at the top of a list of audits focused on topics related to whether or not a site is a progressive web app, e.g. responds offline, uses a service worker, is on https, etc. No character length limits. The last sentence starting with 'Learn' becomes link text to additional documentation. */
  pwaCategoryDescription:
    'These checks validate the aspects of a Progressive Web App. ' +
    '[Learn what makes a good Progressive Web App](https://web.dev/pwa-checklist/).',
  /** Description of the Progressive Web Application (PWA) manual checks category, containing a list of additional validators must be run by hand in order to check all PWA best practices. This is displayed at the top of a list of manually run audits focused on topics related to whether or not a site is a progressive web app, e.g. responds offline, uses a service worker, is on https, etc.. No character length limits. */
  pwaCategoryManualDescription:
    'These checks are required by the baseline ' +
    '[PWA Checklist](https://web.dev/pwa-checklist/) but are ' +
    "not automatically checked by Lighthouse. They do not affect your score but it's important that you verify them manually.",
  /** Title of the Best Practices category of audits. This is displayed at the top of a list of audits focused on topics related to following web development best practices and accepted guidelines. Also used as a label of a score gauge; try to limit to 20 characters. */
  bestPracticesCategoryTitle: 'Best Practices',
  /** Title of the Trust & Safety group of audits. This is displayed at the top of a list of audits focused on maintaining user trust and protecting security in web development. */
  bestPracticesTrustSafetyGroupTitle: 'Trust and Safety',
  /** Title of the User Experience group of the Best Practices category. Within this section are the audits related to the end user's experience of the webpage. */
  bestPracticesUXGroupTitle: 'User Experience',
  /** Title of the Browser Compatibility group of the Best Practices category. Within this section are the audits related to whether the page is interpreted consistently by browsers. */
  bestPracticesBrowserCompatGroupTitle: 'Browser Compatibility',
  /** Title of the General group of the Best Practices category. Within this section are the audits that don't belong to a specific group but are of general interest. */
  bestPracticesGeneralGroupTitle: 'General',
  /** Title of the Installable section of the web app category. Within this section are audits that check if Chrome supports installing the web site as an app on their device. */
  pwaInstallableGroupTitle: 'Installable',
  /** Title of the "PWA Optimized" section of the web app category. Within this section are audits that check if the developer has taken advantage of features to make their web page more enjoyable and engaging for the user. */
  pwaOptimizedGroupTitle: 'PWA Optimized',
};

const str_ = i18n.createIcuMessageFn(import.meta.url, UIStrings);

const CUSTOM = 'node-scripts/dist/src/custom-audits';

/** @type {LH.Config} */
const defaultConfig = {
  settings,
  artifacts: [
    // Artifacts which can be depended on come first.
    { id: 'DevtoolsLog', gatherer: 'devtools-log' }, //x
    { id: 'InstallabilityErrors', gatherer: 'installability-errors' }, //x
    { id: 'InspectorIssues', gatherer: 'inspector-issues' }, //x
    // {id: 'LinkElements', gatherer: 'link-elements'},
    // {id: 'MainDocumentContent', gatherer: 'main-document-content'},
    // {id: 'MetaElements', gatherer: 'meta-elements'},
    // {id: 'NetworkUserAgent', gatherer: 'network-user-agent'},
    // {id: 'OptimizedImages', gatherer: 'dobetterweb/optimized-images'},
    // {id: 'ResponseCompression', gatherer: 'dobetterweb/response-compression'},
    { id: 'ServiceWorkerGatherer', gatherer: `${CUSTOM}/service-worker/service-worker-gatherer` },
    { id: 'WebAppManifest', gatherer: 'web-app-manifest' },

    { id: 'OfflineGatherer', gatherer: `${CUSTOM}/offline/offline-gatherer` },

    { id: 'devtoolsLogs', gatherer: 'devtools-log-compat' },
  ],
  audits: [
    'is-on-https',
    `${CUSTOM}/service-worker/service-worker-audit`,
    `${CUSTOM}/offline/offline-audit`,
    `${CUSTOM}/https/https-audit`,
    'viewport',
    'metrics/first-contentful-paint',
    'metrics/largest-contentful-paint',
    'metrics/first-meaningful-paint',
    'metrics/speed-index',
    'screenshot-thumbnails',
    'final-screenshot',
    'metrics/total-blocking-time',
    'metrics/max-potential-fid',
    'metrics/cumulative-layout-shift',
    'metrics/interaction-to-next-paint',
    'errors-in-console',
    'server-response-time',
    'metrics/interactive',
    'user-timings',
    'critical-request-chains',
    'redirects',
    'installable-manifest',
    'splash-screen',
    'themed-omnibox',
    'maskable-icon',
    'content-width',
    'image-aspect-ratio',
    'image-size-responsive',
    'preload-fonts',
    'deprecations',
    'mainthread-work-breakdown',
    'bootup-time',
    'uses-rel-preload',
    'uses-rel-preconnect',
    'font-display',
    'diagnostics',
    'network-requests',
    'network-rtt',
    'network-server-latency',
    'main-thread-tasks',
    'metrics',
    'performance-budget',
    'timing-budget',
    'third-party-summary',
    'third-party-facades',
    'largest-contentful-paint-element',
    'lcp-lazy-loaded',
    'layout-shift-elements',
    'long-tasks',
    'no-unload-listeners',
    'non-composited-animations',
    'unsized-images',
    'valid-source-maps',
    'prioritize-lcp-image',
    'csp-xss',
    'script-treemap-data',
    'manual/pwa-cross-browser',
    'manual/pwa-page-transitions',
    'manual/pwa-each-page-has-url',
    'work-during-interaction',
    'bf-cache',
  ],
  groups: {
    'pwa-installable': {
      title: str_(UIStrings.pwaInstallableGroupTitle),
    },
    'pwa-optimized': {
      title: str_(UIStrings.pwaOptimizedGroupTitle),
    },
    'best-practices-trust-safety': {
      title: str_(UIStrings.bestPracticesTrustSafetyGroupTitle),
    },

    // Group for audits that should not be displayed.
    hidden: { title: '' },
  },
  categories: {
    'best-practices': {
      title: str_(UIStrings.bestPracticesCategoryTitle),
      supportedModes: ['navigation', 'timespan', 'snapshot'],
      auditRefs: [
        // Trust & Safety
        { id: 'is-on-https', weight: 5, group: 'best-practices-trust-safety' },
        // {id: 'geolocation-on-start', weight: 1, group: 'best-practices-trust-safety'},
        // {id: 'notification-on-start', weight: 1, group: 'best-practices-trust-safety'}
      ],
    },
    pwa: {
      title: str_(UIStrings.pwaCategoryTitle),
      description: str_(UIStrings.pwaCategoryDescription),
      manualDescription: str_(UIStrings.pwaCategoryManualDescription),
      supportedModes: ['navigation'],
      auditRefs: [
        // Installable
        { id: 'installable-manifest', weight: 2, group: 'pwa-installable' },
        { id: 'service-worker-audit', weight: 2, group: 'pwa-installable' },
        { id: 'offline-audit', weight: 1, group: 'pwa-installable' },
        { id: 'https-audit', weight: 1, group: 'pwa-installable' },
        // PWA Optimized
        // {id: 'splash-screen', weight: 1, group: 'pwa-optimized'},
        // // {id: 'themed-omnibox', weight: 1, group: 'pwa-optimized'},
        // {id: 'content-width', weight: 1, group: 'pwa-optimized'},
        // // {id: 'viewport', weight: 2, group: 'pwa-optimized'},
        // {id: 'maskable-icon', weight: 1, group: 'pwa-optimized'},
      ],
    },
  },
};

// Use `defineProperty` so that the strings are accesible from original but ignored when we copy it
Object.defineProperty(defaultConfig, 'UIStrings', {
  enumerable: false,
  get: () => UIStrings,
});

export default defaultConfig;
