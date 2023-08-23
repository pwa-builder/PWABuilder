import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { getManifestContext, setManifestContext } from '../services/app-info';
import { validateManifest, Validation, Manifest, reportMissing, required_fields, recommended_fields, optional_fields } from '@pwabuilder/manifest-validation';
import {
  BreakpointValues,
  mediumBreakPoint,
  smallBreakPoint,
} from '../utils/css/breakpoints';
import {classMap} from 'lit/directives/class-map.js';
import { styleMap } from 'lit/directives/style-map.js';

import '../components/app-header';
import '../components/todo-list-item';
import '../components/manifest-editor-frame';
import '../components/publish-pane';
import '../components/test-publish-pane';
import '../components/sw-selector';
import '../components/share-card';

import {
  Icon,
  ManifestContext,
  RawTestResult,
  TestResult
} from '../utils/interfaces';

// import { fetchOrCreateManifest, createManifestContextFromEmpty } from '../services/manifest';
import { resolveUrl } from '../utils/url';

import { AnalyticsBehavior, recordPWABuilderProcessStep } from '../utils/analytics';

//@ts-ignore
import Color from "../../../node_modules/colorjs.io/dist/color";
import { manifest_fields } from '@pwabuilder/manifest-information';
import { SlDropdown } from '@shoelace-style/shoelace';
import { processManifest, processSecurity, processServiceWorker } from './app-report.helper';
import { Report, ReportAudit, FindWebManifest, FindServiceWorker, AuditServiceWorker } from './app-report.api';
import { GetTokenCampaignStatus } from './qualification/app-token.helper';
import { env } from '../utils/environment';

const valid_src = "/assets/new/valid.svg";
const yield_src = "/assets/new/yield.svg";
const stop_src = "/assets/new/stop.svg";

@customElement('app-report')
export class AppReport extends LitElement {
  @property({ type: Object }) resultOfTest: RawTestResult | undefined;
  @property({ type: Object }) reportAudit: ReportAudit | undefined;
  @property({ type: Object }) appCard = {
    siteName: 'Site Name',
    description: "Your site's description",
    siteUrl: 'Site URL',
    iconURL: '/assets/new/icon_placeholder.png',
    iconAlt: 'Your sites logo'
  };
  @property({ type: Object }) CardStyles = { backgroundColor: '#ffffff', color: '#292c3a'};
  @property({ type: Object }) BorderStyles = { borderTop: '1px solid #00000033'};
  @property({ type: Object }) LastEditedStyles = { color: '#000000b3'};
  @property() manifestCard = {};
  @property() serviceWorkerCard = {};
  @property() securityCard = {};
  @property() siteURL = '';
  @state() swScore = 0;
  @state() maniScore = 0;
  @state() securityScore = 0;

  @state() errored: boolean = false;
  @state() errorMessage: string | undefined = undefined;
  @state() errorLink: string | undefined = undefined;

  @state() mql = window.matchMedia(
    `(min-width: ${BreakpointValues.largeUpper}px)`
  );

  @state() isAppCardInfoLoading: boolean = false;
  @state() isDeskTopView = this.mql.matches;

  // will be used to control the state of the "Package for store" button.
  @state() runningTests: boolean = false;
  @state() canPackageList: boolean[] = [false, false, false];
  @state() canPackage: boolean = false;
  @state() manifestEditorOpened: boolean = false;
  @state() retestPath: string = "/assets/new/retest-black.svg";

  @state() swSelectorOpen: boolean = false;

  // Controls the last tested section
  @state() lastTested: string = "Last tested seconds ago";

  @state() todoWindow: any[] = [];
  private pageNumber: number = 1;
  private pageSize: number = 5;

  // validation
  @state() validationResults: Validation[] = [];
  @state() manifestTotalScore: number = 0;
  @state() manifestValidCounter: number = 0;
  @state() manifestRequiredCounter: number = 0;
  @state() manifestRecCounter: number = 0;
  @state() manifestDataLoading: boolean = true;
  @state() manifestMessage: string = "";
  @state() startingManifestEditorTab: string = "info";
  @state() focusOnME: string = "";
  @state() proxyLoadingImage: boolean = false;

  @state() serviceWorkerResults: any[] = [];
  @state() swTotalScore: number = 0;
  @state() swValidCounter: number = 0;
  @state() swRequiredCounter: number = 0;
  @state() swRecCounter: number = 0;
  @state() swDataLoading: boolean = true;
  @state() swMessage: string = "";

  @state() securityResults: any[] = [];
  @state() secTotalScore: number = 0;
  @state() secValidCounter: number = 0;
  @state() secRequiredCounter: number = 0;
  @state() secRecCounter: number = 0;
  @state() secDataLoading: boolean = true;
  @state() secMessage: string = "";

  @state() requiredMissingFields: any[] = [];
  @state() recMissingFields: any[] = [];
  @state() optMissingFields: any[] = [];

  // Confirm Retest stuff
  @state() showConfirmationModal: boolean = false;
  @state() thingToAdd: string = "";
  @state() retestConfirmed: boolean = false;

  @state() createdManifest: boolean = false;
  @state() manifestContext: ManifestContext | undefined;

  @state() todoItems: any[] = [];
  @state() openTooltips: SlDropdown[] = [];

  @state() tokensCampaign: boolean = false;

  private possible_messages = [
    {"messages": {
                  "green": "PWABuilder has analyzed your Web Manifest and your manifest is ready for packaging! Great job you have a perfect score!",
                  "yellow": "PWABuilder has analyzed your Web Manifest and your manifest is ready for packaging! We have identified recommended and optional fields that you can include to make your PWA better. Use our Manifest Editor to edit and update those fields.",
                  "blocked": "PWABuilder has analyzed your Web Manifest. You have one or more fields that need to be updated before you can package. Use our Manifest Editor to edit and update those fields. You can package for the store once you have a valid manifest.",
                  "none": "PWABuilder has analyzed your site and did not find a Web Manifest. Use our Manifest Editor to generate one. You can package for the store once you have a valid manifest.",
                  }
    },
    {"messages": {
                      "green": "PWABuilder has analyzed your Service Worker and your Service Worker is ready for packaging! Great job you have a perfect score!",
                      "yellow": "PWABuilder has analyzed your Service Worker, and has identified additional features you can add, like offline support, to make your app feel more robust.",
                      "blocked": "",
                      "none": "PWABuilder has analyzed your site and did not find a Service Worker. Having a Service Worker is highly recomeneded by PWABuilder as it enables an array of features that can enhance your PWA. You can generate a Service Worker below or use our documentation to make your own.",
                  },
     },
      {"messages": {
                    "green": "PWABuilder has done a basic analysis of your HTTPS setup and found no issues! Great job you have a perfect score!",
                    "yellow": "",
                    "blocked": "",
                    "none": "PWABuilder has done a basic analysis of your HTTPS setup and has identified required actions before you can package. Check out the documentation linked below to learn more.",
                  }
      }
    ];

  static get styles() {
    return [
      css`

        /* Page wide */
        * {
          box-sizing: border-box;
          font-family: inherit;
        }

        app-header::part(header) {
          position: sticky;
          top: 0;
        }

        #report-wrapper {
          width: 100%;
          display: flex;
          flex-direction: column;
          row-gap: 1.5em;
          align-items: center;
          background-color: #f2f3fb;
          padding: 20px;
        }

        #content-holder {
          max-width: 1300px;
          width: 100%;
          display: flex;
          flex-flow: row wrap;
          gap: 1em;
        }

        sl-details {
          width: 100%;
        }

        sl-details::part(summary-icon){
          display: none;
        }

        sl-details::part(content) {
          padding-top: .75em;
          padding-bottom: 1.5em;
        }

        sl-details:disabled{
          cursor: no-drop;
        }

        @keyframes bounce {
          0%,
          20%,
          50%,
          80%,
          100% {
            transform: translateY(0);
          }
          40% {
            transform: translateX(-5px);
          }
          60% {
            transform: translateX(5px);
          }
        }

        button:hover {
          cursor: pointer;
        }

        sl-progress-ring {
          height: fit-content;
          --track-width: 4px;
          --indicator-width: 8px;
          --size: 100px;
          font-size: var(--subheader-font-size);
        }

        sl-progress-ring::part(label){
          color: var(--primary-color);
          font-weight: bold;
        }

        .red {
          --indicator-color: var(--error-color);
        }

        .yellow {
          --indicator-color: var(--warning-color);
        }

        .green {
          --indicator-color: var(--success-color);
        }

        .macro_error {
          width: 3em;
          height: auto;
        }

        /* App Card and Packaging */
        #header-row {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          column-gap: 1em;
        }

        /* App Card */

        #app-card {
          width: 60%;
          height: 100%;
          border-radius: var(--card-border-radius);
          background-color: #ffffff;
          justify-content: space-between;
          box-shadow: 0px 4px 30px 0px #00000014;

          container: card / inline-size;
        }

        #app-card-header {
          display: grid;
          grid-template-rows: auto;
          gap: 10px;
          align-items: center;
          padding: 2em 2em 0;
          width: 100%;
        }

        #app-card-header.skeleton{
          grid-template-columns: 0fr 1fr;
          grid-template-rows: 1fr 0fr;
        }

        #app-card-header, #app-card-footer{
          font-size: 14px;
        }

        #app-card-header-col {
          display: grid;
          grid-template-columns: 1fr 4fr 1fr;
          gap: 15px;
        }

        #pwa-image-holder {
          height: fit-content;
          width: fit-content;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #ffffff;
          box-shadow: rgb(0 0 0 / 20%) 0px 4px 10px 0px;
          border-radius: 4px;
        }

        /* #app-image-skeleton {
          height: 85px;
          width: 85px;
          padding: 10px;
        } */

        #pwa-image-holder img{
          height: 115.05px;
          width: 115.05px;
          left: 113px;
          top: 118.951171875px;
          border-radius: 4px;
        }

        #app-card-share-cta {
          display: flex;
          height: 100%;
          flex-direction: column;
          justify-content: start;
        }

        #app-card-share-cta #share-button-desktop {
          height: 32px;
          width: 117.5439453125px;
          left: 509.4560546875px;
          top: 116.7421875px;
          border-radius: 20px;
          text-align: center;
          font-size: 12px;
        }

        #share-icon {
          height: 14px;
          width: 14.78px;
          left: 526.8994140625px;
          top: 125.322265625px;
          border-radius: 0px;

        }

        .proxy-loader {
          width: 48px;
          height: 48px;
          border: 5px solid var(--primary-color);
          border-bottom-color: transparent;
          border-radius: 50%;
          display: inline-block;
          box-sizing: border-box;
          animation: rotation 1s linear infinite;
        }

        @keyframes rotation {
          0% {
              transform: rotate(0deg);
          }
          100% {
              transform: rotate(360deg);
          }
        }

        #site-name {
          margin: 0;
          font-weight: bold;
          font-size: calc(var(--subheader-font-size) + 4px);

          text-overflow: ellipsis;
          overflow: hidden;

        }

        #site-name, #site-url{
          /* 115 is app icon size, 117 is share button, 4em is padding, 30px is gap */
          max-width: calc(((100cqi - 115px) - 117px) - 4em - 30px);
        }

        #card-info {
          //overflow: hidden;
          white-space: nowrap;
          height: 100%;
          display: flex;
          flex-direction: column;
          width: 100%;
          gap: 5px;
        }

        #card-info p {
          margin: 0;
        }

        #site-url {
          text-overflow: ellipsis;
          overflow: hidden;
          white-space: nowrap;
          /* max-width: 200px; */
          font-weight: bold;
          font-size: 16px;
        }

        #app-card-desc {
          overflow-y:hidden;
          text-overflow:ellipsis;
          font-size: 14px;
          font-weight: 500;
          line-height: 18px;
          white-space: break-spaces;
        }
        #app-card-desc-mobile {
          display: none;
        }

        #app-card-footer {
          padding: 0em 2em;
          min-height: 41px;
          display: flex;
          width: 100%;
          align-items: center;
          justify-content: flex-end;
          border-bottom-left-radius: 10px;
          border-bottom-right-radius: 10px;
          border-top: 1px solid rgb(242 243 251 / 20%);
        }

        #last-edited {
          white-space: nowrap;
          margin: 0;
        }

        #test, #last-edited {
          font-size: 12px;
          line-height: 18px;
        }


        #test.in-progress{
          color: #767676;

          align-items: center;
          display: flex;
          gap: 10px;
          line-height: 10px;
        }

        #test img {
          height: 18px;
        }

        #retest {
          display: flex;
          align-items: center;
          column-gap: 10px;
          border: none;
          background-color: transparent;
        }

        #retest:disabled{
          cursor: no-drop;
        }

        #app-image-skeleton {
          height: 115px;
          width: 115px;
          --border-radius: 4px;
        }

        .app-info-skeleton {
          width: 100%;
          margin-bottom: 10px;
        }

        .app-info-skeleton-half {
          width: 25%;
          height: 20px;
          margin: 10px 0;
        }

        /* Packaging Box */
        #app-actions {
          width: 40%;
          height: 100%;
          border-radius: var(--card-border-radius);
          background-color: #ffffff;
          align-items: center;
          justify-content: space-between;
          box-shadow: 0px 4px 30px 0px #00000014;
        }

        #package {
          row-gap: .5em;
          width: 100%;
          padding: 2em;
        }

        #app-actions button:not(#test-download) { // pfs + disabled
          white-space: nowrap;
          padding: var(--button-padding);
          border-radius: var(--button-border-radius);
          font-size: var(--button-font-size);
          font-weight: var(--font-bold);
          border: none;
          color: #ffffff;
          white-space: nowrap;
        }

        #test-download:disabled {
          cursor: no-drop;
          color: #757575;
        }

        #test-download:disabled .arrow_link {
          border-color: #757575;
        }

        #pfs {
          background-color: var(--font-color);
        }

        #pfs-disabled{
          background-color: #C3C3C3;
        }

        #pfs-disabled:hover{
          cursor: no-drop;
        }

        #pfs:focus, #pfs:hover {
          box-shadow: var(--button-box-shadow);
        }

        #share-card {
          width: 100%;
          background: #ffffff;
          border-radius: 10px;

          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 22px;
          position: relative;
        }

        #share-card-mani{
          position: absolute;
          left: 10px;
          bottom: 0;
          height: 85px;
        }

        #share-card-content{
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        #share-card-text {
          font-size: var(--subheader-font-size);
          color: var(--primary-color);
          font-weight: bold;
          margin-left: 115px;
        }

        #share-card-actions {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 15px;
        }

        .share-banner-buttons {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 5px;
          padding: 10px 20px;
          background: transparent;
          color: var(--primary-color);
          font-size: var(--button-font-size);
          font-weight: bold;
          border: 1px solid var(--primary-color);
          border-radius: var(--button-border-radius);
          white-space: nowrap;
        }
        .share-banner-buttons:hover {
          box-shadow: var(--button-box-shadow)
        }

        #share-button:disabled {
          color: #C3C3C3;
          border-color: #C3C3C3;
        }

        #share-button:disabled:hover {
          cursor: no-drop;
          box-shadow: none;
        }

        .banner-button-icons {
          width: 20px;
          height: auto;
        }
        #share-card-text {
          font-size: var(--subheader-font-size);
          color: var(--primary-color);
          font-weight: bold;
          margin-left: 115px;
        }

        #share-card-actions {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 15px;
        }

        .share-banner-buttons {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 5px;
          padding: 10px 20px;
          background: transparent;
          color: var(--primary-color);
          font-size: var(--button-font-size);
          font-weight: bold;
          border: 1px solid var(--primary-color);
          border-radius: var(--button-border-radius);
          white-space: nowrap;
        }
        .share-banner-buttons:hover {
          box-shadow: var(--button-box-shadow)
        }

        #share-button-desktop:disabled, #share-button-mobile:disabled {
          color: #C3C3C3;
          border-color: #C3C3C3;
        }

        #share-button-desktop:disabled:hover, #share-button-mobile:disabled:hover {
          cursor: no-drop;
          box-shadow: none;
        }

        .banner-button-icons {
          width: 20px;
          height: auto;
        }



        .mani-tooltip {
          --sl-tooltip-padding: 0;
        }

        .mani-tooltip::part(body){
          background-color: #ffffff;
        }

        .mani-tooltip::part(base__arrow){
          background-color: #ffffff;
          z-index: 10;
        }

        .mani-tooltip-content {
          padding: 0;
          display: flex;
          max-width: 325px;
          align-items: center;
          justify-content: center;
          border-radius: var(--card-border-radius);
          gap: .5em;
          background-color: #ffffff;
          color: var(--font-color);
          box-shadow: rgb(0 0 0 / 15%) 0px 0px 40px;
        }

        .mani-tooltip-content img {
          align-self: flex-end;
          justify-self: flex-end;
          height: 50px;
          width: auto;
        }

        .mani-tooltip-content p {
          margin: 0;
          padding: .5em;
        }

        #cl-mani-tooltip-content {
          padding: 5px 10px;
          font-size: 10px;
        }

        #test-download {
          background-color: transparent;
          color: var(--primary-color);
          border: none;
          width: fit-content;
          display: flex;
          column-gap: 0.5em;
          align-items: center;

          font-weight: bold;
          white-space: nowrap;
          font-size: var(--arrow-link-font-size);
        }

        #test-download:hover img {
          animation: bounce 1s;
        }

        #actions-footer {
          background-color: #f2f3fb;
          width: 100%;
          column-gap: 0.75em;
          border-bottom-left-radius: 10px;
          border-bottom-right-radius: 10px;
          padding: .5em 1em;
          border-top: 1px solid #E5E5E5;
        }

        #actions-footer img {
          height: 15px;
          width: auto;
        }

        #actions-footer p {
          margin: 0;
          font-size: 12px;
          font-weight: bold;
        }

        /* Action Items Card */
        #todo {
          width: 100%;
          box-shadow: 0px 4px 30px 0px #00000014;
          border-radius: var(--card-border-radius);
        }

        #todo-detail::part(base) {
          border-radius: var(--card-border-radius);
          border: none;
        }

        #todo-detail::part(header) {
          height: 60px;
        }

        #todo-detail::part(summary) {
          color: var(--primary-color);
          font-size: 20px;
          font-weight: bold;
        }

        #todo-summary-left {
          display: flex;
          align-items: center;
          gap: .5em;
        }

        #todo-summary-left p {
          font-size: var(--subheader-font-size);
        }

        .todo-items-holder {
        }

        #pagination-actions {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          justify-self: center;
          gap: .25em;
        }

        .pageToggles {
          height: 15px;
          color: var(--primary-color);
        }

        #dots {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: .25em;
        }

        #dots img {
          height: 10px;
          width: auto;
        }

        #pagination-actions > sl-icon:hover{
          cursor:pointer
        }

        .pagination-buttons{
          background-color: transparent;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          height: fit-content;
        }

        #indicators-holder {
          display: flex;
          gap: .5em;
          align-items: center;
        }

        .indicator {
          display: flex;
          gap: .5em;
          align-items: center;
          background-color: #F1F2FA;
          padding: .25em .5em;
          border-radius: var(--card-border-radius);
        }

        .indicator p {
          line-height: 20px;
          margin: 0;
          font-size: 15px;
        }

        /* Manifest Card */
        #manifest {
          box-shadow: 0px 4px 30px 0px #00000014;
          background-color: #ffffff;
          border-radius: var(--card-border-radius);
          width: 100%;
        }

        #manifest-header {
          display: flex;
          justify-content: space-between;
          gap: 1em;
          border-bottom: 1px solid #c4c4c4;
          padding: 1em;
        }

        #mh-content{
          display: flex;
          gap: 1em;
          justify-content: space-between;
          width: 100%;
        }

        #mh-text {
          width: 50%;
          row-gap: 0.5em;
        }

        #mh-right {
          display: flex;
          column-gap: 2.5em;
        }

        #mh-actions {
          row-gap: 1em;
          align-items: center;
        }

        #manifest-detail-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1em;
        }

        .missing {
          font-size: 14px;
          margin: 0;
          font-weight: bold;
          white-space: no-wrap;
        }

        /* S cards */
        #two-cell-row {
          display: flex;
          flex-flow: row wrap;
          align-items: flex-start;
          justify-content: space-between;
          width: 100%;
        }

        #two-cell-row > * {
          width: 49%;
          background: #ffffff;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          align-self: flex-start;
          border-radius: var(--card-border-radius);
        }

        /* SW Card */
        #sw-header {
          row-gap: 0.5em;
          border-bottom: 1px solid #c4c4c4;
          padding: 1em;
          min-height: 318px;
          justify-content: space-between;
        }

        #swh-top {
          display: flex;
          justify-content: space-between;
          column-gap: 1em;
        }

        #swh-text {
          width: 100%;
          row-gap: 0.5em;
        }

        #sw-actions {
          row-gap: 1em;
          width: fit-content;
          align-items: center;
        }

        /* Sec Card */

        /* Classes used widely */
        .flex-col {
          display: flex;
          flex-direction: column;
          position: relative;
        }

        .flex-col-center {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .flex-center {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .details-summary {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
        }

        .details-summary p {
          font-size: var(--card-body-font-size);
        }

        .dropdown_icon {
          transform: rotate(0deg);
          transition: transform .5s;
        }

        .card-header {
          font-size: calc(var(--subheader-font-size) + 4px);
          font-weight: bold;
          margin: 0;
          white-space: nowrap;
        }

        .card-desc {
          margin: 0;
          font-size: var(--card-body-font-size);
        }

        #test-download p {
          line-height: 1em;
        }

        .arrow_link {
          margin: 0;
          border-bottom: 1px solid var(--primary-color);
          white-space: nowrap;
        }

        .arrow_anchor {
          text-decoration: none;
          font-size: var(--arrow-link-font-size);
          font-weight: bold;
          margin: 0px 0.5em 0px 0px;
          line-height: 1em;
          color: var(--primary-color);
          display: flex;
          column-gap: 10px;
          width: fit-content;
        }

        .arrow_anchor:visited {
          color: var(--primary-color);
        }

        .arrow_anchor:hover {
          cursor: pointer;
        }

        .arrow_anchor:hover img {
          animation: bounce 1s;
        }

        #report-wrapper .alternate {
          background: var(--secondary-color);
          color: var(--primary-color);
          border: 1px solid var(--primary-color);
          font-size: var(--button-font-size);
          font-weight: bold;
          padding: var(--button-padding);
          border-radius: var(--button-border-radius);
          white-space: nowrap;
        }
        #report-wrapper .alternate:hover {
          box-shadow: var(--button-box-shadow)
        }

        #report-wrapper .alternate:disabled {
          color: #C3C3C3;
          border-color: #C3C3C3;
        }

        #report-wrapper .alternate:disabled:hover {
          cursor: no-drop;
          box-shadow: none;
        }

        .detail-list {
          display: flex;
          flex-direction: column;
          row-gap: 18px;
        }

        .detail-list-header {
          font-size: 18px;
          margin: 0;
          font-weight: bold;
        }

        .detail-list p:not(.detail-list-header){
          margin: 0;
        }

        .details::part(base) {
          border-radius: 0;
          border-bottom-left-radius: 10px;
          border-bottom-right-radius: 10px;
          border: none;
        }
        .details::part(summary) {
          font-weight: bold;
          font-size: var(--card-body-font-size);
        }
        .details::part(header) {
          height: 40px;
          padding: 1em .75em;
        }

        .detail-grid {
          display: flex;
          flex-direction: column;
          row-gap: 0.5em;
        }

        #sec-header {
          justify-content: space-between;
          row-gap: .5em;
          padding: 1em;
          border-bottom: 1px solid #c4c4c4;
          min-height: 318px;
        }
        #sec-top {
          display: flex;
          column-gap: 1em;
          justify-content: space-between;
        }
        #sec-text {
          width: 100%;
          row-gap: 0.5em;
        }
        #sec-actions {
          row-gap: 1em;
          width: 66%;
        }
        .progressRingSkeleton::part(base) {
          height: 100px;
          width: 100px;
          border-radius: 50%;
        }

        .test-result {
          display: flex;
          gap: .5em;
          align-items: center;
        }
        .test-result p {
          font-weight: normal;
          font-size: 14px;
        }
        .test-result img {
          height: 17px;
        }
        .summary-skeleton {
          width: 200px;
          --color: #d0d0d3
        }
        .desc-skeleton {
          --color: #d0d0d3
        }
        .desc-skeleton::part(base), .summary-skeleton::part(base), .app-info-skeleton::part(base){
          min-height: .8rem;
        }
        .app-info-skeleton-half::part(base){
          min-height: .8rem;
          max-height: .8rem;
        }
        .gap {
          gap: .5em;
        }
        sl-tooltip::part(base){
          --sl-tooltip-font-size: 14px;
        }

        .animate{
          animation-delay: 1s;
          animation: shake 1s cubic-bezier(.36,.07,.19,.97) both;
          transform: translate3d(0, 0, 0);
          backface-visibility: hidden;
          perspective: 1000px;
        }

        @keyframes shake {
          10%, 90% {
            transform: translate3d(-1px, 0, 0);
          }

          20%, 80% {
            transform: translate3d(2px, 0, 0);
          }

          30%, 50%, 70% {
            transform: translate3d(-4px, 0, 0);
          }

          40%, 60% {
            transform: translate3d(4px, 0, 0);
          }
        }

        .dialog::part(body){
          padding-top: 0;
          padding-bottom: 0;
        }
        .dialog::part(title){
          display: none;
        }
        .dialog::part(panel) {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 65%;
          position: relative;
        }
        .dialog::part(overlay){
          backdrop-filter: blur(10px);
        }
        .dialog::part(close-button__base){
          position: absolute;
          top: 5px;
          right: 5px;
        }

        /* Retest modal */
        #confirmationButtons {
          display: flex;
          justify-content: space-evenly;
          margin-bottom: 1em;
        }

        #confirmationButtons > *{
         width: 45%;
        }

        .loader {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          display: block;
          margin:15px auto;
          position: relative;
          color: var(--primary-color);
          box-sizing: border-box;
          animation: animloader 2s linear infinite;
          grid-row: 3;
        }

        @keyframes animloader {
          0% {
            box-shadow: 14px 0 0 -2px,  38px 0 0 -2px,  -14px 0 0 -2px,  -38px 0 0 -2px;
          }
          25% {
            box-shadow: 14px 0 0 -2px,  38px 0 0 -2px,  -14px 0 0 -2px,  -38px 0 0 2px;
          }
          50% {
            box-shadow: 14px 0 0 -2px,  38px 0 0 -2px,  -14px 0 0 2px,  -38px 0 0 -2px;
          }
          75% {
            box-shadow: 14px 0 0 2px,  38px 0 0 -2px,  -14px 0 0 -2px,  -38px 0 0 -2px;
          }
          100% {
            box-shadow: 14px 0 0 -2px,  38px 0 0 2px,  -14px 0 0 -2px,  -38px 0 0 -2px;
          }
        }

        .loader-round {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          position: relative;
          flex-shrink: 0;
          animation: rotate 1s linear infinite
        }
        .loader-round::before {
          content: "";
          box-sizing: border-box;
          position: absolute;
          inset: 0px;
          border-radius: 50%;
          border: 2px solid #D6D6D6;
          /* animation: prixClipFix 2s linear infinite, 2s ease-in-out 0.5s infinite normal none running pulse; */
          clip-path:polygon(50% 50%,0 0,100% 0,100% 100%,0 100%,0 50%)
        }

        .loader-round.large{
          width: 96px;
          height: 96px;
          margin: 2px;
        }
        .loader-round.large::before{
          border-width: 4px;
          animation: 2s ease-in-out 0.5s infinite normal none running pulse;
        }

        .loader-round.skeleton{
          animation: none;
          /* clip-path: none; */
        }
        .loader-round.skeleton::before{
          /* animation: 2s ease-in-out 0.5s infinite normal none running pulse; */
          clip-path: none;
        }

        @keyframes rotate {
          100%   {transform: rotate(360deg)}
        }

        @keyframes pulse {
          0% {
            opacity: 1;
          }
          50% {
            opacity: 0.4;
          }
          100% {
            opacity: 1;
          }
        }

        /* @keyframes prixClipFix {
            0%   {clip-path:polygon(50% 50%,0 0,0 0,0 0,0 0,15% 0)}
            25%  {clip-path:polygon(50% 50%,0 0,100% 0,100% 0,100% 0,100% 0)}
            50%  {clip-path:polygon(50% 50%,0 0,100% 0,100% 100%,100% 100%,100% 100%)}
            75%  {clip-path:polygon(50% 50%,0 0,100% 0,100% 100%,0 100%,0 100%)}
            100% {clip-path:polygon(50% 50%,0 0,100% 0,100% 100%,0 100%,0 25%)}
        } */

        @media(max-width: 900px){
          #header-row {
            flex-direction: column-reverse;
            row-gap: 1em;
          }

          #app-card{
            width: 100%;
          }
          #app-actions {
            width: 100%;
          }

          #two-cell-row {
            flex-direction: column;
            row-gap: 1em;
          }
          #two-cell-row > * {
            width: 100%;
          }
          #sw-header {
            min-height: unset;
          }
          #sec-header {
            min-height: unset;
          }
        }

        /* @media(max-width: 700px){
          --button-padding
        } */
        @media(max-width: 376px){
          #pwa-image-holder {
            width: 61px !important;
          }
          #pwa-image-holder img {
            width: 55px !important;
          }
        }


        @media(max-width: 600px){
          #app-card-header-col {
            gap: 10px;
          }
          #pwa-image-holder {
            width: 90px;
            height: auto;
          }
          #pwa-image-holder img {
            width: 84px;
            height: auto;
          }
          #card-info {
            display: flex;
            flex-direction: column;
            justify-content: center;
          }
          #app-card-desc {
            max-width: 100%;
          }
          #share-button-desktop {
            display: none;
          }
          #share-button-mobile {
            display: flex;
          }
          #app-card-desc-mobile {
            display: flex;
            flex-direction: column;
          }
          .app-card-desc-desktop {
            display: none;
          }
          #site-name {
            font-size: 20px;
          }
          #site-url {
            margin-bottom: 8px !important;
          }

          #site-name, #site-url{
          /* 84 is app icon size, 4em is padding, 20px is gap */
          max-width: calc((100cqi - 84px) - 4em - 20px);
        }

          #app-card-share-cta {
            justify-content: start;
          }
          #app-card-share-cta #share-button-mobile {
            width: 100px;
          }
          #app-card-desc, .skeleton-desc {
            grid-column: 1 / 3;
          }
        }

        ${mediumBreakPoint(css`
          #mh-content {
            flex-direction: column;
          }

          #mh-actions, #sw-actions {
            align-items: flex-start;
            width: 50%;
          }

          #mh-text {
            width: 100%;
          }

          #manifest-detail-grid{
            display: flex;
            flex-direction: column;
          }

          sl-progress-ring {
            --size: 75px;
            --track-width: 4px;
            --subheader-font-size: 14px;
          }
          .progressRingSkeleton::part(base), .loader-round.large  {
            width: 75px;
            height: 75px;
          }

          #share-card {
            flex-direction: column-reverse;
          }

          #share-card-content {
            flex-direction: column-reverse;
          }

          #share-card-text {
            margin-left: 0;
            margin-bottom: 0;
            text-align: center;
          }

          #share-card-mani {
            position: unset;
          }
        `)}

        ${smallBreakPoint(css`
          sl-progress-ring {
            --size: 75px;
            --track-width: 4px;
            --indicator-width: 6px;
            font-size: 14px;
          }

          .progressRingSkeleton::part(base), .loader-round.large {
            width: 75px;
            height: 75px;
          }

          #header-row {
            flex-direction: column-reverse;
            row-gap: 1.5em;
          }

          #app-card{
            width: 100%;
          }

          #app-actions {
            width: 100%;
          }

          #app-actions .arrow_link {
            font-size: 12px;
          }

          #retest img {
            height: 14px;
          }

          #package{
            width: 50%;
            row-gap: .75em;
          }

          #test-download {
            font-size: 10px;
          }

          #mh-content {
            flex-direction: column;
          }

          #mh-text {
            width: 100%;
          }

          #manifest-detail-grid{
            display: flex;
            flex-direction: column;
          }

          #report-wrapper .alternate {
            font-size: 16px;
          }

          .half-width-cards {
            width: 100%;
          }

          #actions-footer p {
            font-size: 14px;
          }

          #actions-footer img {
            height: 18px;
            width: auto;
          }
          #last-edited {
            font-size: 14px;
          }
          #manifest-header, #sw-header, #sec-header {
            padding-bottom: 2.5em;
          }
          #mh-actions, #sw-actions, #sec-header {
            row-gap: 1.5em;
          }

          #share-card {
            flex-direction: column-reverse;
          }

          #share-card-content {
            flex-direction: column-reverse;
          }

          #share-card-text {
            margin-left: 0;
            margin-bottom: 0;
            text-align: center;
          }

          #share-card-mani {
            position: unset;
          }
        `)}
      `,
    ];
  }

  /* Legacy code, scared to remove. IDK the application of this code */
  constructor() {
    super();
    this.mql.addEventListener('change', e => {
      this.isDeskTopView = e.matches;
    });
  }

  // Runs when the page loads.
  // Responsible for setting running the initial tests
  async connectedCallback(): Promise<void> {
    super.connectedCallback();
    this.tokensCampaign = await GetTokenCampaignStatus();
    env.tokensCampaignRunning = this.tokensCampaign;
    const search = new URLSearchParams(location.search);
    const site = search.get('site');
    if (site) {
      this.siteURL = site;
      this.runAllTests(site);
      sessionStorage.setItem('last_tested', JSON.stringify(new Date()));
    }

    setInterval(() => this.pollLastTested(), 120000);

    window.addEventListener('scroll', this.closeTooltipOnScroll.bind(this));
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('scroll', this.closeTooltipOnScroll.bind(this));
  }

  // Expands the Action items details on load
  firstUpdated() {
    this.rotateNinety("todo", undefined, true);
  }

  // Polling function that updates the time that the site was last tested
  pollLastTested(){
    let last = new Date(JSON.parse(sessionStorage.getItem('last_tested')!));
    let now = new Date();
    let diff = now.getTime() - last.getTime();

    if(diff < 60000){
      this.lastTested = "Last tested seconds ago";
    } else if (diff < 3600000) {
      let mins = Math.floor(diff / 60000);
      this.lastTested = "Last tested " + mins + " minutes ago";
    } else if (diff < 86400000) {
      let hours = Math.floor(diff / 3600000);
      this.lastTested = "Last tested " + hours + " hours ago";
    } else {
      let days = Math.floor(diff / 86400000);
      this.lastTested = "Last tested " + days + " days ago";
    }
    this.requestUpdate();
  }

  // Fetches the sites manifest from the URL
  // If it's missing it creates one and sets a flag
  // If it's there then it saves it to sessionStorage
  // async getManifest(url: string): Promise<ManifestContext> {
  //   this.isAppCardInfoLoading = true;
  //   let manifestContext: ManifestContext | undefined;

  //   manifestContext = await fetchOrCreateManifest(url);
  //   this.createdManifest = false;

  //   if(!manifestContext){
  //     this.createdManifest = true;
  //     manifestContext = await createManifestContextFromEmpty(url);
  //   }

  //   this.manifestContext = manifestContext;

  //   this.isAppCardInfoLoading = false;
  //   this.populateAppCard(manifestContext!, url);
  //   return manifestContext!;
  // }

  // Populates the "App Card" from the manifest.
  // Uses the URL for loading the image.
  async populateAppCard(manifestContext: ManifestContext, url?: string) {
    let cleanURL = url?.replace(/(^\w+:|^)\/\//, '') || '';

    if (manifestContext && !this.createdManifest) {
      const parsedManifestContext = manifestContext;

      let icons = parsedManifestContext.manifest.icons;

      let chosenIcon: any;

      if(icons){
        let maxSize = 0;
        for(let i = 0; i < icons.length; i++){
          let icon = icons[i];
          let size = icon.sizes?.split("x")[0];
          if(size === '512'){
            chosenIcon = icon;
            break;
          } else{
            if(parseInt(size!) > maxSize){
              maxSize = parseInt(size!);
              chosenIcon = icon;
            }
          }
        }
      }

      let iconUrl: string;
      if(chosenIcon){
        iconUrl = this.iconSrcListParse(chosenIcon);
      } else {
        iconUrl = "/assets/icons/icon_512.png"
      }


      this.proxyLoadingImage = true;
      await this.testImage(iconUrl).then(
        function fulfilled(_img) {
          //console.log('That image is found and loaded', img);
        },

        function rejected() {
          //console.log('That image was not found');
          iconUrl = `https://pwabuilder-safe-url.azurewebsites.net/api/getSafeUrl?url=${iconUrl}`;
        }
      );
      this.proxyLoadingImage = false;

      this.appCard = {
        siteName: parsedManifestContext.manifest.short_name
          ? parsedManifestContext.manifest.short_name
          : (parsedManifestContext.manifest.name ? parsedManifestContext.manifest.name : 'Untitled App'),
        siteUrl: cleanURL,
        iconURL: iconUrl,
        iconAlt: "Your sites logo",
        description: parsedManifestContext.manifest.description
          ? parsedManifestContext.manifest.description
          : 'Add an app description to your manifest',
      };
    } else {
        this.appCard = {
          siteName: "Missing Name",
          siteUrl: cleanURL,
          description: "Your manifest description is missing.",
          iconURL: "/assets/new/icon_placeholder.png",
          iconAlt: "A placeholder for you sites icon"
        };
    }
  }

  // Tests if an image will load
  // If it fails, we use our proxy service to fetch it
  // If it succeeds, we load it
  testImage(url: string) {

    // Define the promise
    const imgPromise = new Promise(function imgPromise(resolve, reject) {

        // Create the image
        const imgElement = new Image();

        // When image is loaded, resolve the promise
        imgElement.addEventListener('load', function imgOnLoad() {
            resolve(this);
        });

        // When there's an error during load, reject the promise
        imgElement.addEventListener('error', function imgOnError() {
            reject();
        })

        // Assign URL
        imgElement.src = url;

    });

    return imgPromise;
  }

  // Looks at the brackground color from the sites manifest
  // If its darker, returns lightColor for the background of app card
  // If its lighter, returns darkColor for the background of app card
  pickTextColorBasedOnBgColorAdvanced(bgColor: string, lightColor: string, darkColor: string): string {

    //@ts-ignore:next-line
    var colors: any = new Color(bgColor).coords;

    var c = colors.map((num: number) => {
      if (num <= 0.03928) {
        return num / 12.92;
      }
      return Math.pow((num + 0.055) / 1.055, 2.4);
    });
    var L = (0.2126 * c[0]) + (0.7152 * c[1]) + (0.0722 * c[2]);
    let chosenColor = (L > 0.3) ?  darkColor : lightColor;
    return chosenColor
  }

  private async applyManifestContext(url: string, manifestUrl?: string, manifestRaw?: string) {
    this.manifestContext = await processManifest(url, {url: manifestUrl, raw: manifestRaw});
    this.createdManifest = this.manifestContext.isGenerated || false;
    setManifestContext(this.manifestContext);
    this.isAppCardInfoLoading = false;
    await this.populateAppCard(this.manifestContext, manifestUrl);
  }

  // Runs the Manifest, SW and SEC Tests. Sets "canPackage" to true or false depending on the results of each test
  async runAllTests(url: string) {
    this.runningTests = true;
    this.isAppCardInfoLoading = true;

    let findersResults = {
      manifest: {} as {url?: string, raw?: string, json?: unknown},
      serviceWorker: {} as {url?: string, raw?: string},
      manifestTodos: [] as unknown[],
      workerTodos: [] as unknown[]
    }
    this.reportAudit = undefined;

    // Take only good results, ignore errors.
    FindWebManifest(url).then( async (result) => {
      if (result?.content?.raw && !this.reportAudit?.artifacts?.webAppManifest?.raw) {
        // TODO: can use json instead of raw
        findersResults.manifest = result.content;
        await this.applyManifestContext(url, result?.content?.url || undefined, result?.content?.raw);
        findersResults.manifestTodos = await this.testManifest();
        this.todoItems.push(...findersResults.manifestTodos);
        this.requestUpdate();
      }
    });

    FindServiceWorker(url).then( async (result) => {
        if (result?.content?.url && !this.reportAudit?.audits?.serviceWorker?.score) {
          await AuditServiceWorker(result.content.url).then( async (result) => {
            findersResults.workerTodos = await this.testServiceWorker(processServiceWorker(result.content));
            this.todoItems.push(...findersResults.workerTodos);
            this.requestUpdate();
          });
          findersResults.serviceWorker = result.content;
        }
      }
    );

    try {
      this.reportAudit = await Report(url);
    } catch (e) {
      console.error(e);
      this.todoItems.push(...await this.testSecurity(processSecurity()));
      if (!findersResults.manifest?.raw) {
        await this.applyManifestContext(url, undefined, undefined);
        this.todoItems.push(...await this.testManifest());
      }
      if (!findersResults.serviceWorker?.raw) {
        this.todoItems.push(...await this.testServiceWorker(processServiceWorker({score: false, details: {}})));
      }
      this.runningTests = false;
      this.requestUpdate();
      return;
    }

    console.log(this.reportAudit);

    // Check for previously successfull FindMani
    if (this.reportAudit?.artifacts?.webAppManifest?.raw) {
      if (!findersResults.manifest.raw || this.reportAudit?.artifacts.webAppManifest.raw != findersResults.manifest.raw) {
        await this.applyManifestContext(url, this.reportAudit?.artifacts?.webAppManifest?.url, this.reportAudit?.artifacts?.webAppManifest?.raw);
        findersResults.manifestTodos = [];
      }
    } else {
      if (!findersResults.manifest?.raw) {
        await this.applyManifestContext(url, undefined, undefined);
      }
    }

    // Reapply mani todos from FindMani
    this.todoItems = [];
    if (findersResults.manifestTodos.length){
      this.todoItems.push(...findersResults.manifestTodos)

      // adding todo for token giveaway item if theres at least a manifest
      if(!this.createdManifest && this.tokensCampaign){
        this.todoItems.push(
          {
            "card": "giveaway",
            "field": "giveaway",
            "fix": `Your PWA may qualify for a free Microsoft Store developer account.`,
            "status": "giveaway",
            "displayString": `Your PWA may qualify for a free Microsoft Store developer account`
          }
        );
      }
    }
    else {
      this.todoItems.push(...await this.testManifest());
    }

    // TODO: move installability score to different place
    this.todoItems.push(...await this.testServiceWorker(processServiceWorker(this.reportAudit?.audits?.serviceWorker))),
    this.todoItems.push(...await this.testSecurity(processSecurity(this.reportAudit?.audits)));

    this.canPackage = this.canPackageList[0] && this.canPackageList[1] && this.canPackageList[2];

    this.runningTests = false;
    this.requestUpdate();
  }

  // Tests the Manifest and populates the manifest card detail dropdown
  async testManifest() {
    //add manifest validation logic
    // note: wrap in try catch (can fail if invalid json)
    this.manifestDataLoading = true;
    let manifest;
    let todos: unknown[] = [];

    if(!this.createdManifest){
      manifest = JSON.parse(sessionStorage.getItem("PWABuilderManifest")!).manifest;
      this.validationResults = await validateManifest(manifest, true);

      //  This just makes it so that the valid things are first
      // and the invalid things show after.
      this.validationResults.sort((a, b) => {
        if(a.valid && !b.valid){
          return 1;
        } else if(b.valid && !a.valid){
          return -1;
        } else {
          return a.member.localeCompare(b.member);
        }
      });
      this.manifestTotalScore = this.validationResults.length;
      this.manifestValidCounter = 0;
      this.manifestRequiredCounter = 0;

      this.validationResults.forEach((test: Validation) => {
        if(test.valid){
          this.manifestValidCounter++;
        } else {
          let status ="";
          if(test.category === "required" || test.testRequired){
            status = "required";
            this.manifestRequiredCounter++;
          } else if(test.category === "recommended"){
            status = "recommended";
            this.manifestRecCounter++;
          } else {
            status = "optional";
          }
          todos.push({"card": "mani-details", "field": test.member, "displayString": test.displayString ?? "", "fix": test.errorString, "status": status});
        }
      });
    } else {
      manifest = {};
      todos.push({"card": "mani-details", "field": "Open Manifest Modal", "fix": "Edit and download your created manifest (Manifest not found before detection tests timed out)", "status": "required"});
    }

    // adding todo for token giveaway item if theres at least a manifest
    if(!this.createdManifest && this.tokensCampaign){
      this.todoItems.push(
        {
          "card": "giveaway",
          "field": "giveaway",
          "fix": `Your PWA may qualify for a free Microsoft Store developer account.`,
          "status": "giveaway",
          "displayString": `Your PWA may qualify for a free Microsoft Store developer account`
        }
      );
    }

    if(this.manifestRequiredCounter > 0){
      this.canPackageList[0] = false;
    } else {
      this.canPackageList[0] = true;
    }

    this.manifestDataLoading = false;
    // details?.disabled && (details.disabled = false);

    sessionStorage.setItem(
      'manifest_tests',
      JSON.stringify(this.validationResults)
    );
    //TODO: Fire event when ready
    // this.requestUpdate();
    return todos;
  }

  // Tests the SW and populates the SW card detail dropdown
  async testServiceWorker(serviceWorkerResults: TestResult[]) {
    //call service worker tests

    let todos: unknown[] = [];

    const serviceWorkerTestResult = serviceWorkerResults;
    this.serviceWorkerResults = serviceWorkerTestResult;

    this.swValidCounter = 0;
    this.swRequiredCounter = 0;
    this.serviceWorkerResults.forEach((result: any) => {
      if(result.result){
        this.swValidCounter++;
      } else {
        let status = "";
        let card = "sw-details";
        let missing = false;
        switch(result.category){
          case "highly recommended":
            missing = true;
            status = "highly recommended";
            this.swRecCounter++;
            todos.push({"card": card, "field": "Open SW Modal", "fix": "Add Service Worker to Base Package (SW not found before detection tests timed out)", "status": status});
            break;
          case "recommended":
            status = "recommended";
            this.swRecCounter++;
            break;
          case "required":
            status = "required";
            this.swRequiredCounter++;
            break;
          default:
            status = "optional";
        }

        if(!missing){
          todos.push({"card": card, "field": result.infoString, "fix": result.infoString, "status": status});
        }
      }
    })

    if(this.swRequiredCounter > 0){
      this.canPackageList[1] = false;
    } else {
      this.canPackageList[1] = true;
    }

    this.swTotalScore = this.serviceWorkerResults.length;

    this.swDataLoading = false;

    //save serviceworker tests in session storage
    sessionStorage.setItem(
      'service_worker_tests',
      JSON.stringify(serviceWorkerTestResult)
    );
    // this.requestUpdate();
    return todos;
  }

  // Tests the Security and populates the Security card detail dropdown
  async testSecurity(securityAudit: TestResult[]) {
    //Call security tests
    let todos: unknown[] = [];

    const securityTests = securityAudit;
    this.securityResults = securityTests;

    this.secRequiredCounter = 0;
    this.securityResults.forEach((result: any) => {
      if(result.result){
        this.secValidCounter++;
      } else {
        let status ="";
        if(result.category === "required"){
          status = result.category;
          this.secRequiredCounter++;
        } else if(result.category === "recommended"){
          status = result.category;
          this.manifestRecCounter++;
        } else {
          status = result.category;
        }

        todos.push({"card": "sec-details", "field": result.infoString, "fix": result.infoString, "status": status});
      }
    })

    if(this.secRequiredCounter > 0){
      this.canPackageList[2] = false;
    } else {
      this.canPackageList[2] = true;
    }

    this.secTotalScore = this.securityResults.length;

    this.secDataLoading = false;

    //save security tests in session storage
    sessionStorage.setItem('security_tests', JSON.stringify(securityTests));
    this.requestUpdate();
    return todos;
  }

  // If some manifest fields are missing it adds it to the drop down and returns the number that were missing
  async handleMissingFields(manifest: Manifest){
    let missing = await reportMissing(manifest);
    let todos: unknown[] = [];
    this.requiredMissingFields, this.recMissingFields, this.optMissingFields = [];

    missing.forEach((field: string) => {

      let isRecommended = false;

      if(required_fields.includes(field)){
        this.requiredMissingFields.push(field);
        this.manifestRequiredCounter++;
        todos.push({"card": "mani-details", "field": field, "fix": `Add ${field} to your manifest`, status: "required"})
      } else if(recommended_fields.includes(field)){
        this.recMissingFields.push(field);
        this.manifestRecCounter++;
        isRecommended = true;
      } else if(optional_fields.includes(field)){
        this.optMissingFields.push(field)
      }
      if(!this.createdManifest && !required_fields.includes(field)){
        todos.push({"card": "mani-details", "field": field, "fix": `Add ${field} to your manifest`, "status": isRecommended ? "recommended" : "optional"})
      }
    });
    let num_missing = missing.length;
    return {
      details: todos,
      num_missing
    }
  }

  /**
  * Triggers all tests to retest
  * If coming from confirmation is true, we have to delay a bit so a special message can show
  * @param {boolean} comingFromConfirmation
  * @return {void}
  */
  async retest(comingFromConfirmation: boolean) {
    recordPWABuilderProcessStep("retest_clicked", AnalyticsBehavior.ProcessCheckpoint);
    this.retestConfirmed = true;
    if(comingFromConfirmation){
      await this.delay(3000)
    }
    (this.shadowRoot!.querySelector(".dialog") as any)!.hide();
    if (this.siteURL) {
      this.resetData();
      this.runAllTests(this.siteURL);
      sessionStorage.setItem('last_tested', JSON.stringify(new Date()));
    }
  }

  // Delay function. Delays a given amt of ms
  delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Resets all data btwn tests
  resetData(){
    // reset scores
    this.manifestValidCounter = 0;
    this.manifestTotalScore = 0;
    this.manifestRequiredCounter = 0;
    this.swValidCounter = 0;
    this.swTotalScore = 0;
    this.swRequiredCounter = 0;
    this.secValidCounter = 0;
    this.secTotalScore = 0;
    this.secRequiredCounter = 0;


    // reset todo lsit
    this.todoItems = [];

    // reset missing lists
    this.requiredMissingFields = [];
    this.recMissingFields = [];
    this.optMissingFields = [];

    // activate loaders
    this.manifestDataLoading = true;
    this.swDataLoading = true;
    this.secDataLoading = true;
    this.canPackage = false;

    // last tested
    this.lastTested = "Last tested seconds ago"

    // hide the detail lists
    let details = this.shadowRoot!.querySelectorAll('sl-details');

    details.forEach((detail: any) => {
      if(detail.id != "todo-detail"){
        detail.hide();
      } else {
        detail.show()
      }
    });

    // reset retest data
    this.retestConfirmed = false;

    // reset action items page;
    this.pageNumber = 1;
  }

  // Opens share card modal and tracks analytics
  async openShareCardModal() {
    let dialog: any = this.shadowRoot!.querySelector("share-card")!.shadowRoot!.querySelector(".dialog");

    await dialog!.show();
    recordPWABuilderProcessStep("share_card_opened", AnalyticsBehavior.ProcessCheckpoint);
  }

  // Opens manifest editor and tracks analytics
  async openManifestEditorModal(focusOn = "", tab: string = "info"): Promise<void | undefined> {
    this.startingManifestEditorTab = tab;
    this.focusOnME = focusOn;
    let dialog: any = this.shadowRoot!.querySelector("manifest-editor-frame")!.shadowRoot!.querySelector(".dialog");

    await dialog!.show();
    recordPWABuilderProcessStep("manifest_editor_opened", AnalyticsBehavior.ProcessCheckpoint);
  }

   // Opens SW Selector and tracks analytics
  async openSWSelectorModal() {
    let dialog: any = this.shadowRoot!.querySelector("sw-selector")!.shadowRoot!.querySelector(".dialog");

    await dialog.show()
    recordPWABuilderProcessStep("sw_selector_opened", AnalyticsBehavior.ProcessCheckpoint);
  }

   // Opens publish pane and tracks analytics
  async openPublishModal() {
    let dialog: any = this.shadowRoot!.querySelector("publish-pane")!.shadowRoot!.querySelector(".dialog");

    await dialog.show()
    recordPWABuilderProcessStep("publish_modal_opened", AnalyticsBehavior.ProcessCheckpoint);
  }

   // Opens test publish modal and tracks analytics
  async openTestPublishModal() {
    let dialog: any = this.shadowRoot!.querySelector("test-publish-pane")!.shadowRoot!.querySelector(".dialog");

    await dialog.show()
    recordPWABuilderProcessStep("test_publish_modal_opened", AnalyticsBehavior.ProcessCheckpoint);
  }

  // Gets full icon URL from manifest given a manifest icon object
  iconSrcListParse(icon: any) {
    let manifest = getManifestContext().manifest;
    let manifestURL = getManifestContext().manifestUrl;
    let iconURL: string = this.handleImageUrl(icon, manifest, manifestURL) || '';

    return iconURL;
  }

  // Makes sure the icon URL is valid
  handleImageUrl(icon: Icon, manifest: Manifest, manifestURL: string) {
    if (icon.src.indexOf('data:') === 0 && icon.src.indexOf('base64') !== -1) {
      return icon.src;
    }

    let url = resolveUrl(manifestURL, manifest?.startUrl);
    url = resolveUrl(url?.href, icon.src);

    if (url) {
      return url.href;
    }

    return undefined;
  }

  // Decides color of Progress rings depending on required and recommended fields
  decideColor(card: string){

    let instantRed = false;
    if(card === "manifest"){
      instantRed = this.manifestRequiredCounter > 0;
    } else if(card === "sw"){
      instantRed = this.swRequiredCounter > 0;
    } else {
      instantRed = this.secRequiredCounter > 0;
    }

    let instantYellow = false;
    if(card === "manifest"){
      instantYellow = this.manifestRecCounter > 0;
    } else if(card === "sw"){
      instantYellow = this.swRecCounter > 0;
    } else {
      instantYellow = this.secRecCounter > 0;
    }

    if(instantRed){
      return {"green": false, "red": true, "yellow": false};
    } else if(instantYellow){
      return {"green": false, "red": false, "yellow": true};
    } else {
      return {"green": true, "red": false, "yellow": false};
    }
  }

  getRingColor(card: string) {
    let ring = this.shadowRoot!.getElementById(`${card}ProgressRing`);
    if(ring){
      return ring.classList[0];
    }
    return;
  }

  // Swaps messages for each card depending on state of each card
  decideMessage(valid: number, total: number, card: string){

    let instantRed = false;
    let index = 0;
    if(card === "manifest"){
      instantRed = this.manifestRequiredCounter > 0;
    } else if(card === "sw"){
      index = 1;
      instantRed = this.swRequiredCounter > 0;
    } else {
      index = 2;
      instantRed = this.secRequiredCounter > 0;
    }

    let ratio = parseFloat(JSON.stringify(valid)) / total;

    let messages = this.possible_messages[index].messages;

    if(this.createdManifest || ratio == 0 || (card ==="sec" && ratio != 1)){
      return messages["none"];
    } else if(instantRed){
      return messages["blocked"];
    } else if(ratio != 1){
      return messages["yellow"];
    } else {
      return messages["green"];
    }
  }

  // Scrolls and Shakes the respective item from a click of an action item
  async animateItem(e: CustomEvent){
    e.preventDefault;
    recordPWABuilderProcessStep("todo_item_clicked", AnalyticsBehavior.ProcessCheckpoint);

    // if its not a manifest field
    if(!manifest_fields[e.detail.field]){
      let frame;
      switch(e.detail.field){
        case "Manifest":
        case "Service Worker":
          this.thingToAdd = e.detail.displayString;
          this.showConfirmationModal = true;
          return;

        case "Open Manifest Modal":
          frame = this.shadowRoot!.querySelector("manifest-editor-frame");
          (frame?.shadowRoot!.querySelector(".dialog")! as any).show();
          return;

        case "Open SW Modal":
          frame = this.shadowRoot!.querySelector("sw-selector");
          (frame?.shadowRoot!.querySelector(".dialog")! as any).show();
          return;
      }
    }
    return;
  }

  // Function to add a special to do to the action items list that tells the user to retest their site.
  addRetestTodo(toAdd: string){
    if(!this.hasItemBeenAdded(toAdd)) {
      this.todoItems.push({"card": "retest", "field": toAdd, "fix": `We've noticed you've updated your ${toAdd}. Make sure to add your new ${toAdd} to your server and retest your site!`, "status": "retest", "displayString": toAdd});
      this.requestUpdate();
    }
  }

  // function to validate whether or not an retest item has already been added to the ToDo list
  hasItemBeenAdded(toAdd: string): boolean {
    var isItemPresent = false;
    for(var toDoItem of this.todoItems) {
      if(toDoItem.field == toAdd) {
        isItemPresent = true;
        break;
      }
    }
    return isItemPresent;
  }

  // Rotates the icon on each details drop down to 0 degrees
  rotateZero(card: string, e?: Event){
    recordPWABuilderProcessStep(card + "_details_expanded", AnalyticsBehavior.ProcessCheckpoint);

    let icon: HTMLImageElement = this.shadowRoot!.querySelector('[data-card="' + card + '"]')!;
    let target: Node = (e!.target as unknown as Node);
    let collapsable: NodeList = this.shadowRoot!.querySelectorAll("sl-details");
    let allowed: boolean = false;

    // added this code because the tooltips that exist on the action items emit the sl-show and
    // sl-hide events. This causes this function to trigger since its nested and the event bubbles.
    // so this ensures that the target for rotating is a detail card and not a tooltip.
    for (let i = 0; i < collapsable.length; i++) {
      if (collapsable[i].isEqualNode(target!)) {
        allowed = true;
        break
      }
    }

    if(icon && allowed){
      icon!.style.transform = "rotate(0deg)";
    }
  }

  // Rotates the icon on each details drop down to 90 degrees
  rotateNinety(card: string, e?: Event, init?: boolean){
    recordPWABuilderProcessStep(card + "_details_closed", AnalyticsBehavior.ProcessCheckpoint);

    let icon: HTMLImageElement = this.shadowRoot!.querySelector('[data-card="' + card + '"]')!;

    if(icon && init) {
      icon!.style.transform = "rotate(90deg)";
      return;
    }

    let target: Node = (e!.target as unknown as Node);
    let collapsable: NodeList = this.shadowRoot!.querySelectorAll("sl-details");
    let allowed: boolean = false;

    // added this code because the tooltips that exist on the action items emit the sl-show and
    // sl-hide events. This causes this function to trigger since its nested and the event bubbles.
    // so this ensures that the target for rotating is a detail card and not a tooltip.
    for (let i = 0; i < collapsable.length; i++) {
      if (collapsable[i].isEqualNode(target!)) {
        allowed = true;
        break
      }
    }

    if(icon && allowed){
      icon!.style.transform = "rotate(90deg)";
    }
  }

  // Sorts the action items list with the required stuff first
  // -1 = a wins
  // 1 = b wins
  sortTodos(){
    const rank: { [key: string]: number } = {
      "retest": 0,
      "required": 1,
      "giveaway": 2,
      "highly recommended": 3,
      "recommended": 4,
      "optional": 5
    };
    this.todoItems.sort((a, b) => {
      if (rank[a.status] < rank[b.status]) {
        return -1;
      } else if (rank[a.status] > rank[b.status]) {
        return 1;
      } else {
        return a.field.localeCompare(b.field);
      }
    }
    );

    return this.todoItems;
  }

  // Pages the action items
  paginate() {
    let array = this.sortTodos();
    let itemsOnPage = array.slice((this.pageNumber - 1) * this.pageSize, this.pageNumber * this.pageSize);

    let holder = (this.shadowRoot?.querySelector(".todo-items-holder") as HTMLElement);
    if(itemsOnPage.length < this.pageSize && this.pageNumber == 1){
      holder.style.display = 'flex';
      holder.style.flexDirection = 'column';
      holder.style.gridTemplateRows = 'unset';
    } else {
      holder.style.height = '280px;'
      holder.style.display = 'grid';
      holder.style.gridTemplateRows = 'repeat(5, 1fr)';
      holder.style.flexDirection = 'unset';
    }
    return itemsOnPage;
  }

  // Moves to the next window in the action items list
  switchPage(up: boolean){
    if(up && this.pageNumber * this.pageSize < this.todoItems.length){
      this.pageNumber++;
    } else if(!up && this.pageNumber != 1){
      this.pageNumber--;
    }
    this.requestUpdate();
  }

  // Returns a list that represents the number of dots need for pagination
  getDots(){
    let dots: any[] = [];

    let totalPages = Math.ceil(this.todoItems.length / this.pageSize);

    for(let i = 0; i < totalPages; i++){
      dots.push("dot");
    }
    return dots;
  }

  // Renders the indicators for each action item
  renderIndicators(){
    let yellow = 0;
    let red = 0;

    this.todoItems.forEach((todo: any) => {
      if(todo.status == "required"){
        red++;
      } else {
        yellow++;
      }
    })

    if(yellow + red != 0){
      return html`
      <div id="indicators-holder">
        ${red != 0 ? html`<div class="indicator"><img src=${stop_src} alt="invalid result icon"/><p>${red}</p></div>` : html``}
        ${yellow != 0 ? html`<div class="indicator"><img src=${yield_src} alt="yield result icon"/><p>${yellow}</p></div>` : html``}
      </div>`
    }
    return html``

  }

//truncate app card discription
  truncateString(str: String) {
    if (str.length > 125) {
      return str.substring(0, 125) + "...";
    } else {
      return str;
    }
  }

  handleShowingTooltip(e: CustomEvent){
    if(e.detail.entering){
      if(this.openTooltips.length > 0){
        this.openTooltips[0].hide();
        this.openTooltips = [];
      }

      e.detail.tooltip.show();
      this.openTooltips.push(e.detail.tooltip)
    } else {
      e.detail.tooltip.hide();
      this.openTooltips = [];
    }

  }

  goToGiveawayPage(){
    recordPWABuilderProcessStep("free_token_check_now_clicked", AnalyticsBehavior.ProcessCheckpoint);
    let a: HTMLAnchorElement = document.createElement("a");
    a.target = "_blank";
    a.href = `${window.location.protocol}//${window.location.host}/freeToken?site=${this.siteURL}`;
    a.rel = "noopener";

    a.click();
  }

  closeTooltipOnScroll() {
    if(this.openTooltips.length > 0){
      this.openTooltips[0].hide();
      this.openTooltips = [];
    }
  }

  render() {
    return html`
      <app-header></app-header>
      <div id="report-wrapper">
        <div id="content-holder">
          <div id="header-row">
          ${this.isAppCardInfoLoading ?
          html`
            <div id="app-card" class="flex-col skeleton-effects">
              <div id="app-card-header" class="skeleton">
                <sl-skeleton id="app-image-skeleton" effect="pulse"></sl-skeleton>
                <div id="card-info" class="flex-col">
                  <sl-skeleton class="app-info-skeleton" effect="pulse"></sl-skeleton>
                  <sl-skeleton class="app-info-skeleton" effect="pulse"></sl-skeleton>
                </div>
                <!-- <sl-skeleton class="app-info-skeleton skeleton-desc" effect="pulse"></sl-skeleton> -->
              </div>
              <div id="app-card-footer">
                <sl-skeleton class="app-info-skeleton-half" effect="pulse"></sl-skeleton>
              </div>
            </div>`
            :
            html`
            <div id="app-card" class="flex-col" style=${this.createdManifest ? styleMap({ backgroundColor: '#ffffff', color: '#757575' }) : styleMap(this.CardStyles)}>
              <div id="app-card-header">
                <div id="app-card-header-col">
                  <div id="pwa-image-holder">
                    ${this.proxyLoadingImage || this.appCard.iconURL.length === 0 ? html`<span class="proxy-loader"></span>` : html`<img src=${this.appCard.iconURL} alt=${this.appCard.iconAlt} />`}
                  </div>
                  <div id="card-info" class="flex-row">
                    <p id="site-name">${this.appCard.siteName}</p>
                    <p id="site-url">${this.appCard.siteUrl}</p>
                    <p id="app-card-desc" class="app-card-desc-desktop">${this.truncateString(this.appCard.description)}</p>
                  </div>
                  <div id="app-card-share-cta">
                    <button type="button" id="share-button-desktop" class="share-banner-buttons" @click=${() => this.openShareCardModal()} ?disabled=${this.runningTests}>
                    ${this.runningTests ?
                      html`<img id="share-icon" class="banner-button-icons" src="/assets/share_icon_disabled.svg" role="presentation"/>` :
                      html`<img id="share-icon" class="banner-button-icons" src="/assets/share_icon.svg" role="presentation"/>`
                    } Share score
                    </button>
                  </div>
                </div>
                <div id="app-card-desc-mobile">
                  <p id="app-card-desc">${this.truncateString(this.appCard.description)}</p>
                  <button type="button" id="share-button-mobile" class="share-banner-buttons" @click=${() => this.openShareCardModal()} ?disabled=${this.runningTests}>
                    ${this.runningTests ?
                      html`<img id="share-icon" class="banner-button-icons" src="/assets/share_icon_disabled.svg" role="presentation"/>` :
                      html`<img id="share-icon" class="banner-button-icons" src="/assets/share_icon.svg" role="presentation"/>`
                    } Share score
                    </button>

                </div>
              </div>
              <div id="app-card-footer">
                ${this.runningTests ? html`
                    <div id="test" class="in-progress">
                      <span>testing in progress</span>
                      <div class="loader-round"></div>
                    </div>
                `:
                  html`
                  <div id="test" style=${styleMap(this.CardStyles)}>
                    <button
                      type="button"
                      id="retest"
                      @click=${() => {
                        this.retest(false);
                      }}>
                      <p id="last-edited" style=${styleMap(this.LastEditedStyles)}>${this.lastTested}</p>

                      <img
                        src=${this.retestPath}
                        alt="retest site"
                        role="presentation"
                      />
                    </button>
                  </div>`
                }
              </div>

            </div>`}
            <div id="app-actions" class="flex-col">
              <div id="package" class="flex-col-center">
                  ${this.canPackage ?
                    html`
                    <button
                      type="button"
                      id="pfs"
                      @click=${() => this.openPublishModal()}
                    >
                      Package For Stores
                    </button>
                    ` :
                    html`
                    <sl-tooltip class="mani-tooltip">
                    ${this.runningTests ?
                      html`<div slot="content" class="mani-tooltip-content"><img src="/assets/new/waivingMani.svg" alt="Waiving Mani" /> <p>Running tests...</p></div>` :
                      html`<div slot="content" class="mani-tooltip-content"><img src="/assets/new/waivingMani.svg" alt="Waiving Mani" /><p>Your PWA is not store ready! Check your To-do-list and handle all required items!</p></div>`}
                        <button
                          type="button"
                          id="pfs-disabled"
                          aria-disabled="true"
                        >
                          Package For Stores
                        </button>
                    </sl-tooltip>
                    `}
                <button type="button" id="test-download" @click=${() => this.openTestPublishModal()} ?disabled=${!this.canPackage || this.createdManifest}>
                  <p class="arrow_link">Download Test Package</p>
                </button>
              </div>
              <div id="actions-footer" class="flex-center">
                <p>Available stores:</p>
                <img
                  title="Windows"
                  src="/assets/windows_icon.svg"
                  alt="Windows"
                />
                <img title="iOS" src="/assets/apple_icon.svg" alt="iOS" />
                <img
                  title="Android"
                  src="/assets/android_icon_full.svg"
                  alt="Android"
                />
                <img
                  title="Meta Quest"
                  src="/assets/meta_icon.svg"
                  alt="Meta Quest"
                />
              </div>
            </div>
          </div>

          <div id="todo">
            <sl-details
              id="todo-detail"
              @sl-show=${(e: Event) => this.rotateNinety("todo", e)}
              @sl-hide=${(e: Event) => this.rotateZero("todo", e)}
              open
              >
              <div class="details-summary" slot="summary">
                <div id="todo-summary-left">
                  <p>Action Items</p>
                  ${this.todoItems.length > 0 ? this.renderIndicators() : html``}
                </div>
                  <img class="dropdown_icon" data-card="todo" src="/assets/new/dropdownIcon.svg" alt="dropdown toggler"/>

              </div>
              <div class="todo-items-holder">
                ${this.todoItems.length > 0 ? this.paginate().map((todo: any) =>
                    html`
                      <todo-item
                        .status=${todo.status}
                        .field=${todo.field}
                        .fix=${todo.fix}
                        .card=${todo.card}
                        .displayString=${todo.displayString}
                        @todo-clicked=${(e: CustomEvent) => this.animateItem(e)}
                        @open-manifest-editor=${(e: CustomEvent) => this.openManifestEditorModal(e.detail.field, e.detail.tab)}
                        @trigger-hover=${(e: CustomEvent) => this.handleShowingTooltip(e)}
                        @giveawayEvent=${() => this.goToGiveawayPage()}>

                      </todo-item>`
                  ) : html`<span class="loader"></span>`}
              </div>
            ${(this.todoItems.length > this.pageSize) ?
              html`
              <div id="pagination-actions">
                <button class="pagination-buttons" type="button"  @click=${() => this.switchPage(false)}><sl-icon class="pageToggles" name="chevron-left"></sl-icon></button>
                <div id="dots">
                  ${this.getDots().map((_dot: any, index: number) =>
                    this.pageNumber == index + 1 ?
                      html`
                        <img src="/assets/new/active_dot.svg" alt="active dot" />
                      ` :
                      html`
                        <img src="/assets/new/inactive_dot.svg" alt="inactive dot" />
                      `)}
                </div>
                <button class="pagination-buttons" type="button"  @click=${() => this.switchPage(true)}><sl-icon class="pageToggles" name="chevron-right"></sl-icon></button>
              </div>` : html``}
            </sl-details>
          </div>

          <div id="manifest" class="flex-col">
            <div id="manifest-header">
              <div id="mh-content">
                <div id="mh-text" class="flex-col">
                  <p class="card-header">Manifest</p>
                  ${this.manifestDataLoading ?
                    html`
                      <div class="flex-col gap">
                        <sl-skeleton class="desc-skeleton" effect="pulse"></sl-skeleton>
                        <sl-skeleton class="desc-skeleton" effect="pulse"></sl-skeleton>
                      </div>
                    ` :
                    html`
                    <p class="card-desc">
                      ${this.decideMessage(this.manifestValidCounter, this.manifestTotalScore, "manifest")}
                    </p>
                  `}
                </div>

                <div id="mh-actions" class="flex-col">
                  ${this.manifestDataLoading ?
                    html`
                      <div class="flex-col gap">
                        <sl-skeleton class="desc-skeleton" effect="pulse"></sl-skeleton>
                        <sl-skeleton class="desc-skeleton" effect="pulse"></sl-skeleton>
                      </div>
                    ` :
                    html`
                      ${this.createdManifest ?
                      html`
                          <sl-tooltip class="mani-tooltip" open>
                            <div slot="content" class="mani-tooltip-content"><img src="/assets/new/waivingMani.svg" alt="Waiving Mani" /> <p>We did not find a manifest on your site before our tests timed out so we have created a manifest for you! <br> Click here to customize it!</p></div>
                            <button type="button" class="alternate" @click=${() => this.openManifestEditorModal()}>Edit Your Manifest</button>
                          </sl-tooltip>` :
                      html`<button type="button" class="alternate" @click=${() => this.openManifestEditorModal()}>Edit Your Manifest</button>`
                      }

                      <a
                        class="arrow_anchor"
                        href="https://docs.pwabuilder.com/#/home/pwa-intro?id=web-app-manifests"
                        rel="noopener"
                        target="_blank"
                        @click=${() => recordPWABuilderProcessStep("manifest_documentation_clicked", AnalyticsBehavior.ProcessCheckpoint)}
                      >
                        <p class="arrow_link">Manifest Documentation</p>
                        <img
                          src="/assets/new/arrow.svg"
                          alt="arrow"
                        />
                      </a>
                  `}

                </div>
              </div>

              <div id="mh-right">
                ${this.manifestDataLoading ?
                    html`<div class="loader-round large"></div>` :
                    html`<sl-progress-ring
                            id="manifestProgressRing"
                            class=${classMap(this.decideColor("manifest"))}
                            value="${this.createdManifest ? 0 : (parseFloat(JSON.stringify(this.manifestValidCounter)) / this.manifestTotalScore) * 100}"
                          >${this.createdManifest ? html`<img src="assets/new/macro_error.svg" class="macro_error" alt="missing manifest requirements" />` : html`<div class="${classMap(this.decideColor("manifest"))}">${this.manifestValidCounter} / ${this.manifestTotalScore}</div>`}</sl-progress-ring>`
                }
              </div>
            </div>
            <sl-details
              id="mani-details"
              class="details"
              ?disabled=${this.manifestDataLoading}
              @sl-show=${(e: Event) => this.rotateNinety("mani-details", e)}
              @sl-hide=${(e: Event) => this.rotateZero("mani-details", e)}
              >
              ${this.manifestDataLoading ? html`
              <div slot="summary"><sl-skeleton class="summary-skeleton" effect="pulse"></sl-skeleton></div>` :
              html`<div class="details-summary" slot="summary"><p>View Details</p><img class="dropdown_icon" data-card="mani-details" src="/assets/new/dropdownIcon.svg" alt="dropdown toggler"/></div>
              <div id="manifest-detail-grid">
                <div class="detail-list">
                  <p class="detail-list-header">Required</p>

                  ${this.requiredMissingFields.length > 0 ?
                  html`
                    ${this.requiredMissingFields.map((field: string) =>
                    html`<div class="test-result" data-field=${field}>
                          <sl-tooltip content=${field + " is missing from your manifest."} placement="right">
                            <img src=${stop_src} alt="invalid result icon"/>
                          </sl-tooltip>
                      <p>Manifest includes ${field} field</p>
                    </div>`
                    )}
                  ` :
                  html``}

                  ${this.validationResults.map((result: Validation) => result.category === "required" || (result.testRequired && !result.valid) ?
                  html`
                    <div class="test-result" data-field=${result.member}>
                      ${result.valid ?
                        html`<img src=${valid_src} alt="passing result icon"/>` :
                        html`<sl-tooltip content=${result.errorString ? result.errorString : ""} placement="right">
                                <img src=${stop_src} alt="invalid result icon"/>
                              </sl-tooltip>`
                      }
                      <p>${result.displayString}</p>
                    </div>
                  ` :
                  html``)}
                </div>
                <div class="detail-list">
                  <p class="detail-list-header">Recommended</p>
                  ${this.recMissingFields.length > 0 ?
                  html`
                    ${this.recMissingFields.map((field: string) =>
                    html`<div class="test-result" data-field=${field}>
                          <sl-tooltip content=${field + " is missing from your manifest."} placement="right">
                            <img src=${yield_src} alt="yield result icon"/>
                          </sl-tooltip>
                      <p>Manifest includes ${field} field</p>
                    </div>`
                    )}
                  ` :
                  html``}
                  ${this.validationResults.map((result: Validation) => result.category === "recommended"  && ((result.testRequired && result.valid) || !result.testRequired) ?
                  html`
                    <div class="test-result" data-field=${result.member}>
                      ${result.valid ?
                        html`<img src=${valid_src} alt="passing result icon"/>` :
                        html`<sl-tooltip content=${result.errorString ? result.errorString : ""} placement="right">
                                <img src=${yield_src} alt="yield result icon"/>
                              </sl-tooltip>
                        `}
                      <p>${result.displayString}</p>
                    </div>
                  ` : html``)}
                </div>
                <div class="detail-list">
                  <p class="detail-list-header">Optional</p>
                  ${this.optMissingFields.length > 0 ?
                  html`
                    ${this.optMissingFields.map((field: string) =>
                    html`
                        <div class="test-result" data-field=${field}>
                          <sl-tooltip content=${field + " is missing from your manifest."} placement="right">
                            <img src=${yield_src} alt="yield result icon"/>
                          </sl-tooltip>
                          <p>Manifest includes ${field} field</p>
                        </div>`
                    )}
                  ` :
                  html``}

                  ${this.validationResults.map((result: Validation) => result.category === "optional" && ((result.testRequired && result.valid) || !result.testRequired) ?
                  html`
                    <div class="test-result" data-field=${result.member}>
                      ${result.valid ?
                        html`<img src=${valid_src} alt="passing result icon"/>` :
                        html`
                          <sl-tooltip content=${result.errorString ? result.errorString : ""} placement="right">
                            <img src=${yield_src} alt="yield result icon"/>
                          </sl-tooltip>
                        `}
                      <p>${result.displayString}</p>
                    </div>
                  ` : html``)}
                </div>
              </div>`}
            </sl-details>
          </div>

          <div id="two-cell-row">
            <div id="sw" class="half-width-cards">
              <div id="sw-header" class="flex-col">
                <div id="swh-top">
                  <div id="swh-text" class="flex-col">
                    <p class="card-header">Service Worker</p>
                    ${this.swDataLoading ?
                      html`
                        <div class="flex-col gap">
                          <sl-skeleton class="desc-skeleton" effect="pulse"></sl-skeleton>
                          <sl-skeleton class="desc-skeleton" effect="pulse"></sl-skeleton>
                        </div>
                      ` :
                      html`
                        <p class="card-desc">
                          ${this.decideMessage(this.swValidCounter, this.swTotalScore, "sw")}
                        </p>
                      `
                        }
                  </div>
                  ${this.swDataLoading ?
                    html`<div class="loader-round large"></div>` :
                    html`<sl-progress-ring
                    id="swProgressRing"
                    class=${classMap(this.decideColor("sw"))}
                    value="${(parseFloat(JSON.stringify(this.swValidCounter)) / this.swTotalScore) * 100}"
                    >${this.swValidCounter == 0 ? html`<img src="assets/new/macro_error.svg" class="macro_error" alt="missing service worker requirements" />` : html`<div class="${classMap(this.decideColor("sw"))}"> ${this.swValidCounter} / ${this.swTotalScore} </div>`} </sl-progress-ring>
                    `
                  }
                </div>
                <div id="sw-actions" class="flex-col">
                  ${this.swDataLoading ?
                  html`
                    <sl-skeleton class="desc-skeleton" effect="pulse"></sl-skeleton>
                  ` :
                  html`
                    <button type="button" class="alternate" @click=${() => this.openSWSelectorModal()}>
                      Generate Service Worker
                    </button>
                  `}

                  ${this.swDataLoading ?
                    html`
                      <sl-skeleton class="desc-skeleton" effect="pulse"></sl-skeleton>
                    ` :
                    html`
                      <a
                        class="arrow_anchor"
                        rel="noopener"
                        target="_blank"
                        href="https://docs.pwabuilder.com/#/home/sw-intro"
                        @click=${() => recordPWABuilderProcessStep("sw_documentation_clicked", AnalyticsBehavior.ProcessCheckpoint)}>
                        <p class="arrow_link">Service Worker Documentation</p>
                        <img
                          src="/assets/new/arrow.svg"
                          alt="arrow"
                        />
                      </a>
                    `
                  }

                </div>
              </div>
              <sl-details
                id="sw-details"
                class="details"
                ?disabled=${this.swDataLoading}
                @sl-show=${(e: Event) => this.rotateNinety("sw-details", e)}
                @sl-hide=${(e: Event) => this.rotateZero("sw-details", e)}
              >
                ${this.swDataLoading ? html`<div slot="summary"><sl-skeleton class="summary-skeleton" effect="pulse"></sl-skeleton></div>`
                : html`<div class="details-summary" slot="summary"><p>View Details</p><img class="dropdown_icon" data-card="sw-details" src="/assets/new/dropdownIcon.svg" alt="dropdown toggler"/></div>
                <div class="detail-grid">
                <div class="detail-list">
                    ${this.serviceWorkerResults.map((result: TestResult) => result.category === "required" ?
                    html`
                      <p class="detail-list-header">Required</p>
                      <div class="test-result" data-field=${result.infoString}>
                        ${result.result ? html`<img src=${valid_src} alt="passing result icon"/>` : html`<img src=${stop_src} alt="invalid result icon"/>`}
                        <p>${result.infoString}</p>
                      </div>
                    ` :
                    html``)}
                  </div>
                  <div class="detail-list">
                    <p class="detail-list-header">Highly Recommended</p>
                    ${this.serviceWorkerResults.map((result: TestResult) => result.category === "highly recommended" ?
                    html`
                      <div class="test-result" data-field=${result.infoString}>
                        ${result.result ? html`<img src=${valid_src} alt="passing result icon"/>` : html`<img src=${yield_src} alt="invalid result icon"/>`}
                        <p>${result.infoString}</p>
                      </div>
                    ` :
                    html``)}
                  </div>
                  <!-- <div class="detail-list">
                    <p class="detail-list-header">Recommended</p>
                    ${this.serviceWorkerResults.map((result: TestResult) => result.category === "recommended" ?
                    html`
                    <div class="test-result" data-field=${result.infoString}>
                        ${result.result ? html`<img src=${valid_src} alt="passing result icon"/>` : html`<img src=${yield_src} alt="yield result icon"/>`}
                        <p>${result.infoString}</p>
                      </div>
                    ` :
                    html``)}
                  </div> -->
                  <div class="detail-list">
                    <p class="detail-list-header">Optional</p>
                    ${this.serviceWorkerResults.map((result: TestResult) => result.category === "optional" ?
                    html`
                      <div class="test-result" data-field=${result.infoString}>
                        ${result.result ? html`<img src=${valid_src} alt="passing result icon"/>` : html`<img src=${yield_src} alt="yield result icon"/>`}
                        <p>${result.infoString}</p>
                      </div>
                    ` :
                    html``)}
                  </div>
                </div>`}
              </sl-details>
            </div>
            <div id="security" class="half-width-cards">
              <div id="sec-header" class="flex-col">
                <div id="sec-top">
                  <div id="sec-text" class="flex-col">
                    <p class="card-header">Security</p>
                    ${this.secDataLoading ?
                      html`
                        <div class="flex-col gap">
                          <sl-skeleton class="desc-skeleton" effect="pulse"></sl-skeleton>
                          <sl-skeleton class="desc-skeleton" effect="pulse"></sl-skeleton>
                        </div>
                      ` :
                      html`
                        <p class="card-desc">
                          ${this.decideMessage(this.secValidCounter, this.secTotalScore, "sec")}
                        </p>
                      `
                        }
                  </div>
                  ${this.secDataLoading ?
                    html`<div class="loader-round large"></div>` :
                    html`<sl-progress-ring
                    id="secProgressRing"
                    class=${classMap(this.decideColor("sec"))}
                    value="${(parseFloat(JSON.stringify(this.secValidCounter)) / this.secTotalScore) * 100}"
                    >${this.secValidCounter == 0 ? html`<img src="assets/new/macro_error.svg" class="macro_error" alt="missing requirements"/>` : html`<div class="${classMap(this.decideColor("sec"))}"> ${this.secValidCounter} / ${this.secTotalScore}</div>`}</sl-progress-ring>
                    `
                  }

                </div>
                <div id="sec-actions" class="flex-col">
                  ${this.secDataLoading ?
                    html`
                      <sl-skeleton class="desc-skeleton" effect="pulse"></sl-skeleton>
                    ` :
                    html`
                      <a
                        class="arrow_anchor"
                        href="https://microsoft.github.io/win-student-devs/#/30DaysOfPWA/core-concepts/04"
                        rel="noopener"
                        target="_blank"
                        @click=${() => recordPWABuilderProcessStep("security_documentation_clicked", AnalyticsBehavior.ProcessCheckpoint)}>
                        <p class="arrow_link">Security Documentation</p>
                        <img
                          src="/assets/new/arrow.svg"
                          alt="arrow"
                        />
                      </a>
                    `
                  }
                </div>
              </div>
              <sl-details
                id="sec-details"
                class="details"
                ?disabled=${this.runningTests || this.secDataLoading}
                @sl-show=${(e: Event) => this.rotateNinety("sec-details", e)}
                @sl-hide=${(e: Event) => this.rotateZero("sec-details", e)}
                >
              ${this.secDataLoading ? html`<div slot="summary"><sl-skeleton class="summary-skeleton" effect="pulse"></sl-skeleton></div>` : html`<div class="details-summary" slot="summary"><p>View Details</p><img class="dropdown_icon" data-card="sec-details" src="/assets/new/dropdownIcon.svg" alt="dropdown toggler"/></div>`}
                <div class="detail-grid">
                  <div class="detail-list">
                    <p class="detail-list-header">Required</p>
                    ${this.securityResults.map((result: TestResult) => result.category === "required" ?
                      html`
                        <div class="test-result" data-field=${result.infoString}>
                          ${result.result ? html`<img src=${valid_src} alt="passing result icon"/>` : html`<img src=${stop_src} alt="invalid result icon"/>`}
                          <p>${result.infoString}</p>
                        </div>
                      ` :
                      html``)}
                  </div>
                </div>
              </sl-details>
            </div>
          </div>
        </div>
      </div>


      <sl-dialog class="dialog" ?open=${this.showConfirmationModal} @sl-hide=${() => this.showConfirmationModal = false} noHeader>
        ${this.retestConfirmed ?
          html`
          <p>Retesting your site now!</p>
          ` :
          html`
            <p>Have you added your new ${this.thingToAdd} to your site?</p>
            <div id="confirmationButtons">
              <sl-button>No</sl-button>
              <sl-button @click=${() => this.retest(true)}>Yes</sl-button>
            </div>
          `
        }

      </sl-dialog>

      <share-card
        .manifestData=${`${this.manifestValidCounter}/${this.manifestTotalScore}/${this.getRingColor("manifest")}/Manifest`}
        .swData=${`${this.swValidCounter}/${this.swTotalScore}/${this.getRingColor("sw")}/Service Worker`}
        .securityData=${`${this.secValidCounter}/${this.secTotalScore}/${this.getRingColor("sec")}/Security`}
        .siteName=${this.appCard.siteName}
      > </share-card>

      <publish-pane .tokensCampaign=${this.tokensCampaign}></publish-pane>
      <test-publish-pane></test-publish-pane>
      ${this.manifestDataLoading ? html`` : html`<manifest-editor-frame .isGenerated=${this.createdManifest} .startingTab=${this.startingManifestEditorTab} .focusOn=${this.focusOnME} @readyForRetest=${() => this.addRetestTodo("Manifest")}></manifest-editor-frame>`}
      <sw-selector @readyForRetest=${() => this.addRetestTodo("Service Worker")}></sw-selector>

    `;
  }
}

