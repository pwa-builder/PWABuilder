import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { getManifestContext } from '../services/app-info';
import { validateManifest, Validation, Manifest, reportMissing, required_fields, reccommended_fields, optional_fields } from '@pwabuilder/manifest-validation';
import {
  BreakpointValues,
  mediumBreakPoint,
  largeBreakPoint,
  xxxLargeBreakPoint,
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

import { testSecurity } from '../services/tests/security';
import { testServiceWorker } from '../services/tests/service-worker';

import {
  Icon,
  ManifestContext,
  RawTestResult,
  TestResult
} from '../utils/interfaces';

import { fetchOrCreateManifest, createManifestContextFromEmpty } from '../services/manifest';
import { resolveUrl } from '../utils/url';

import { AnalyticsBehavior, recordPWABuilderProcessStep } from '../utils/analytics';

//@ts-ignore
import Color from "../../../node_modules/colorjs.io/dist/color";

const valid_src = "/assets/new/valid.svg";
const yield_src = "/assets/new/yield.svg";
const stop_src = "/assets/new/stop.svg";

@customElement('app-report')
export class AppReport extends LitElement {
  @property({ type: Object }) resultOfTest: RawTestResult | undefined;
  @property({ type: Object }) appCard = {
    siteName: 'Site Name',
    description: "Your site's description",
    siteUrl: 'Site URL',
    iconURL: '',
    iconAlt: 'Your sites logo'
  };
  @property({ type: Object }) CardStyles = { backgroundColor: 'white', color: 'black'};
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
  @state() manifestReccCounter: number = 0;
  @state() manifestDataLoading: boolean = true;
  @state() manifestMessage: string = "";
  @state() proxyLoadingImage: boolean = false;

  @state() serviceWorkerResults: any[] = [];
  @state() swTotalScore: number = 0;
  @state() swValidCounter: number = 0;
  @state() swRequiredCounter: number = 0;
  @state() swReccCounter: number = 0;
  @state() swDataLoading: boolean = true;
  @state() swMessage: string = "";

  @state() securityResults: any[] = [];
  @state() secTotalScore: number = 0;
  @state() secValidCounter: number = 0;
  @state() secRequiredCounter: number = 0;
  @state() secReccCounter: number = 0;
  @state() secDataLoading: boolean = true;
  @state() secMessage: string = "";

  @state() requiredMissingFields: any[] = [];
  @state() reccMissingFields: any[] = [];
  @state() optMissingFields: any[] = [];

  // Confirm Retest stuff
  @state() showConfirmationModal: boolean = false;
  @state() thingToAdd: string = "";
  @state() retestConfirmed: boolean = false;

  @state() createdManifest: boolean = false;  
  @state() manifestContext: ManifestContext | undefined;

  @state() todoItems: any[] = [];

  private possible_messages = [
    {"messages": {
                  "green": "PWABuilder has analyzed your Web Manifest and your manifest is ready for packaging! Great job you have a perfect score!",
                  "yellow": "PWABuilder has analyzed your Web Manifest and your manifest is ready for packaging! We have identified recommeneded and optional fields that you can include to make your PWA better. Use our Manifest Editor to edit and update those fields.",
                  "blocked": "PWABuilder has analyzed your Web Manifest. You have a one or more fields that need to be updated before you can pacakge. Use our Manifest Editor to edit and update those fields. You can package for the store once you have a valid manifest.",
                  "none": "PWABuilder has analyzed your site and did not find a Web Manifest. Use our Manifest Editor to generate one. You can package for the store once you have a valid manifest.",
                  }
    },
    {"messages": {
                      "green": "PWABuilder has analyzed your Service Worker and your Service Worker is ready for packaging! Great job you have a perfect score!",
                      "yellow": "PWABuilder has analyzed your Service Worker, and has identified additonal features you can add, like offline support, to make your app feel more robust.",
                      "blocked": "",
                      "none": "PWABuilder has analyzed your site and did not find a Service Worker. Having a Service Worker is required to package for the stores. You can genereate a Service Worker below or use our documentation to make your own.",
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
        #header-row {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          column-gap: 1em;
        }
        #app-card {
          width: 60%;
          height: 100%;
          border-radius: 10px;
          background-color: white;
          justify-content: space-between;
          box-shadow: 0px 4px 30px 0px #00000014;
        }
        .flex-col {
          display: flex;
          flex-direction: column;
        }
        #app-card-header {
          display: grid;
          grid-template-columns: 1fr 2fr 4fr;
          gap: 10px;
          align-items: center;
          font-size: 14px;
          padding: 2em;
          width: 100%;
        }
        #pwa-image-holder {
          height: fit-content;
          width: fit-content;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: white;
          border-radius: 10px;
          box-shadow: rgb(0 0 0 / 20%) 0px 4px 10px 0px;
        }
        #app-card-header img {
          height: 85px;
          width: auto;
          padding: 10px;
        }
        .proxy-loader {
          width: 48px;
          height: 48px;
          border: 5px solid #4f3fb6;
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
          font-size: 24px;
        }
        #card-info {
          overflow: hidden;
          white-space: nowrap;
        }
        #card-info p {
          margin: 0;
          font-weight: bold;
        }
        #app-card-desc {
          margin: 0;
          font-size: 14px;
          width: 100%;
          white-space: normal;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box !important;
          -webkit-line-clamp: 6;
          -webkit-box-orient: vertical;
        }
        #app-card-footer {
          padding: .432em 1em;
          display: flex;
          width: 100%;
          align-items: center;
          justify-content: flex-end;
          border-bottom-left-radius: 10px;
          border-bottom-right-radius: 10px;
          border-top: 1px solid rgb(242 243 251 / 20%);
        }
        #last-edited {
          font-size: 12px;
          white-space: nowrap;
          margin: 0;
        }
        #app-actions {
          width: 40%;
          height: 100%;
          border-radius: 10px;
          background-color: white;
          align-items: center;
          justify-content: space-between;
          box-shadow: 0px 4px 30px 0px #00000014;
        }
        #app-actions button:not(#test-download) {
          font-weight: bold;
          white-space: nowrap;
          padding: .75em 2em;
          border-radius: 50px;
          font-size: 16px;
        }
        #app-image-skeleton {
          height: 85px;
          width: 130px;
          --border-radius: 0;
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
        #test {
          font-size: 10px;
        }
        #test img {
          height: 18px;
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
        #package {
          row-gap: .5em;
          width: 100%;
          padding: 2em;
        }
        #pfs {
          background-color: black;
          color: white;
          border: none;
        }
        #pfs-disabled{
          background-color: #C3C3C3;
          border: none;
          color: white;
        }
        #pfs-disabled:hover{
          cursor: no-drop;
        }
        #pfs:focus, #pfs:hover {
          outline: rgb(79 63 182 / 70%) solid 2px;
        }
        .mani-tooltip {
          --sl-tooltip-padding: 0;
        }
        .mani-tooltip::part(base){
            border-radius: 10px;
            box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
        }
        .mani-tooltip-content {
          padding: 0;
          display: flex;
          max-width: 325px;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          gap: .5em;
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
        sl-details:disabled{
          cursor: no-drop;
        }

        sl-details::part(summary-icon){
          display: none;
        }

        #hover {
          background-color: rgba(0, 0, 0, 0.75);
        }
        #test-download {
          background-color: transparent;
          color: #4f3fb6;
          border: none;
          width: fit-content;
          display: flex;
          column-gap: 0.5em;
          align-items: center;

          font-weight: bold;
          white-space: nowrap;
          font-size: 12px;
        }
        #test-download:hover img {
          animation: bounce 1s;
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
        .arrow_link {
          margin: 0;
          border-bottom: 1px solid #4f3fb6;
          white-space: nowrap;
        }
        button:hover {
          cursor: pointer;
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
        #todo {
          width: 100%;
          box-shadow: 0px 4px 30px 0px #00000014;
          border-radius: 10px;
        }
        sl-details {
          width: 100%;
        }
        sl-details::part(content) {
          padding-top: .75em;
          padding-bottom: 1.5em;
        }
        .details-summary {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
        }
        .dropdown_icon {
          transform: rotate(0deg);
          transition: transform .5s;
        }
        #todo-detail::part(base) {
          border-radius: 10px;
        }
        #todo-detail::part(header) {
          height: 60px;
        }
        #todo-detail::part(summary) {
          color: #4f3fb6;
          font-size: 20px;
          font-weight: bold;
        }
        #todo-summary-left {
          display: flex;
          align-items: center;
          gap: .5em;
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
          color: #4f3fb6;
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
          border-radius: 10px;
        }
        .indicator p {
          line-height: 20px;
          margin: 0;
          font-size: 15px;
        }

        #manifest {
          box-shadow: 0px 4px 30px 0px #00000014;
          background-color: white;
          border-radius: 10px;
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
        .card-header {
          font-size: 24px;
          font-weight: bold;
          margin: 0;
          white-space: nowrap;
        }
        .card-desc {
          margin: 0;
          font-size: 14px;
        }
        #mh-right {
          display: flex;
          column-gap: 2.5em;
        }
        #mh-actions {
          row-gap: 1em;
          align-items: center;
        }
        .arrow_anchor {
          text-decoration: none;
          font-size: 14px;
          font-weight: bold;
          margin: 0px 0.5em 0px 0px;
          line-height: 1em;
          color: rgb(79, 63, 182);
          display: flex;
          column-gap: 10px;
        }
        .arrow_anchor:visited {
          color: #4f3fb6;
        }
        .arrow_anchor:hover {
          cursor: pointer;
        }
        .arrow_anchor:hover img {
          animation: bounce 1s;
        }
        #report-wrapper .alternate {
          background: var(--secondary-color);
          color: #4f3fb6;
          border: 1px solid #4f3fb6;
          font-size: 16px;
          font-weight: bold;
          border-radius: 50px;
          padding: 0.75em 2em;
        }
        #report-wrapper .alternate:hover {
          box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.3);
        }
        #manifest-detail-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1em;
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
        .missing {
          font-size: 14px;
          margin: 0;
          font-weight: bold;
          white-space: no-wrap;
        }
        .details::part(base) {
          border-radius: 0;
          border-bottom-left-radius: 10px;
          border-bottom-right-radius: 10px;
          border: none;
        }
        .details::part(summary) {
          font-weight: bold;
          font-size: 14px;
        }
        .details::part(header) {
          height: 40px;
          padding: 1em .75em;
        }

        #two-cell-row {
          display: flex;
          flex-flow: row wrap;
          align-items: flex-start;
          justify-content: space-between;
          width: 100%;
        }

        #two-cell-row > * {
          width: 49%;
          background: white;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          align-self: flex-start;
          border-radius: 10px;
        }

        #sw-header {
          row-gap: 0.5em;
          border-bottom: 1px solid #c4c4c4;
          padding: 1em;
          min-height: 280px;
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
        .detail-grid {
          display: flex;
          flex-direction: column;
          row-gap: 0.5em;
        }

        sl-progress-ring {
          height: fit-content;
          --track-width: 4px;
          --indicator-width: 8px;
          --size: 100px;
          font-size: 18px;
        }

        sl-progress-ring::part(label){
          color: #4F3FB6;
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

        #sec-header {
          justify-content: space-between;
          row-gap: .5em;
          padding: 1em;
          border-bottom: 1px solid #c4c4c4;
          min-height: 280px;
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
        }
        .dialog::part(overlay){
          backdrop-filter: blur(10px);
        }
        .dialog::part(close-button__base){
          position: absolute;
          top: 5px;
          right: 5px;
        }

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
          color: #4F3FB6;
          box-sizing: border-box;
          animation: animloader 2s linear infinite;
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

        @media(max-width: 600px){
          #app-card-header{
            grid-template-columns: 1fr 5fr;
            grid-template-rows: 1fr 1fr;
          }
          #app-card-desc, .skeleton-desc {
            grid-column: 1 / 3;
          }
        }





        ${xxxLargeBreakPoint(css``)}
        ${largeBreakPoint(css``)}
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
            font-size: 14px;
          }
          .progressRingSkeleton::part(base) {
            width: 75px;
            height: 75px;
          }

        `)}
        ${smallBreakPoint(css`

          sl-progress-ring {
            --size: 75px;
            --track-width: 4px;
            font-size: 14px;
          }
          .progressRingSkeleton::part(base) {
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
          #app-actions button:not(#test-download) {
            font-size: 12px;
          }
          #retest img {
            height: 14px;
          }
          #package{
            width: 50%;
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
          #actions-footer img {
            height: 16px;
            width: auto;
          }
        `)}
      `,
    ];
  }

  constructor() {
    super();
    this.mql.addEventListener('change', e => {
      this.isDeskTopView = e.matches;
    });
  }

  async connectedCallback(): Promise<void> {
    super.connectedCallback();
    const search = new URLSearchParams(location.search);
    const site = search.get('site');
    if (site) {
      this.siteURL = site;
      this.runAllTests(site);
      sessionStorage.setItem('last_tested', JSON.stringify(new Date()));
    }

    setInterval(() => this.pollLastTested(), 120000);
  }

  firstUpdated() {
    this.rotateNinety("todo");
  }

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

  async getManifest(url: string): Promise<ManifestContext> {
    this.isAppCardInfoLoading = true;
    let manifestContext: ManifestContext | undefined;

    manifestContext = await fetchOrCreateManifest(url);
    this.createdManifest = false;

    if(!manifestContext){
      this.createdManifest = true;
      manifestContext = await createManifestContextFromEmpty(url);
    }

    this.manifestContext = manifestContext;

    this.isAppCardInfoLoading = false;
    this.populateAppCard(manifestContext!, url);
    return manifestContext!;
  }

  async populateAppCard(manifestContext: ManifestContext, url: string) {
    let cleanURL = url.replace(/(^\w+:|^)\/\//, '')

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
      if(manifestContext.manifest.theme_color && manifestContext.manifest.theme_color !== 'none'){
        this.CardStyles.backgroundColor = manifestContext.manifest.theme_color;
        // calculate whether is best to use white or black
        let color = this.pickTextColorBasedOnBgColorAdvanced(manifestContext.manifest.theme_color, '#ffffff', '#000000');
        this.CardStyles.color = color;
        this.BorderStyles.borderTop = `1px solid ${color + '33'}`
        this.LastEditedStyles.color = color + 'b3';
        color === "#ffffff" ? this.retestPath = "/assets/new/retest-white.svg" : "/assets/new/retest-black.svg"

      }
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

  pickTextColorBasedOnBgColorAdvanced(bgColor: string, lightColor: string, darkColor: string) {

    //@ts-ignore:next-line
    var colors: any = new Color(bgColor).coords;

    var c = colors.map((num: number) => {
      if (num <= 0.03928) {
        return num / 12.92;
      }
      return Math.pow((num + 0.055) / 1.055, 2.4);
    });
    var L = (0.2126 * c[0]) + (0.7152 * c[1]) + (0.0722 * c[2]);
    return (L > 0.3) ?  darkColor : lightColor;
  }

  async runAllTests(url: string) {
    this.runningTests = true;
    await this.getManifest(url);
    await Promise.all([ this.testManifest(), this.testServiceWorker(url), this.testSecurity(url)]).then(() =>
    {
      this.canPackage = this.canPackageList.every((can: boolean) => can);
    });

    this.runningTests = false;
  }

  async testManifest() {
    //add manifest validation logic
    // note: wrap in try catch (can fail if invalid json)
    this.manifestDataLoading = true;
    let details = (this.shadowRoot!.getElementById("mani-details") as any);
    details!.disabled = true;
    let manifest;

    if(!this.createdManifest){
      manifest = JSON.parse(sessionStorage.getItem("PWABuilderManifest")!).manifest;
      this.validationResults = await validateManifest(manifest);

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

      this.validationResults.forEach((test: Validation) => {
        if(test.valid){
          this.manifestValidCounter++;
        } else {
          let status ="";
          if(test.category === "required" || test.testRequired){
            status = "red";
            this.manifestRequiredCounter++;
          } else if(test.category === "recommended"){
            status = "yellow";
            this.manifestReccCounter++;
          } else {
            status = "yellow";
          }

          this.todoItems.push({"card": "mani-details", "field": test.member, "displayString": test.displayString ?? "", "fix": test.errorString, "status": status});
          
        }
      });
    } else {
      manifest = {};
      this.todoItems.push({"card": "mani-details", "field": "Open Manifest Modal", "fix": "Edit and download your created manifest (Manifest not found before detection tests timed out)", "status": "red"});
    }

    if(this.manifestRequiredCounter > 0){
      this.canPackageList[0] = false;
    } else {
      this.canPackageList[0] = true;
    }

    let amt_missing = await this.handleMissingFields(manifest);

    this.manifestTotalScore += amt_missing;

    this.manifestDataLoading = false;
    details!.disabled = false;

    sessionStorage.setItem(
      'manifest_tests',
      JSON.stringify(this.validationResults)
    );
    //TODO: Fire event when ready
    this.requestUpdate();
  }

  async testServiceWorker(url: string) {
    //call service worker tests
    let details = (this.shadowRoot!.getElementById("sw-details") as any);
    details!.disabled = true;

    let missing = false;

    const serviceWorkerTestResult = await testServiceWorker(url);
    this.serviceWorkerResults = serviceWorkerTestResult;

    this.serviceWorkerResults.forEach((result: any) => {
      if(result.result){
        this.swValidCounter++;
      } else {
        let status ="";
        if(result.category === "required"){
          status = "red";
          missing = true;
          this.swRequiredCounter++;
          this.todoItems.push({"card": "sw-details", "field": "Open SW Modal", "fix": "Add Service Worker to Base Package (SW not found before detection tests timed out)", "status": status});
        } else if(result.category === "recommended"){
          status = "yellow";
          this.swReccCounter++;
        } else {
          status = "yellow";
        }

        if(!missing){
          this.todoItems.push({"card": "sw-details", "field": result.infoString, "fix": result.infoString, "status": status});
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
    details!.disabled = false;

    //save serviceworker tests in session storage
    sessionStorage.setItem(
      'service_worker_tests',
      JSON.stringify(serviceWorkerTestResult)
    );
    this.requestUpdate();
  }

  async testSecurity(url: string) {
    //Call security tests
    let details = (this.shadowRoot!.getElementById("sec-details") as any);
    details!.disabled = true;

    const securityTests = await testSecurity(url);
    this.securityResults = securityTests;

    this.securityResults.forEach((result: any) => {
      if(result.result){
        this.secValidCounter++;
      } else {
        let status ="";
        if(result.category === "required"){
          status = "red";
          this.secRequiredCounter++;
        } else if(result.category === "recommended"){
          status = "yellow";
          this.manifestReccCounter++;
        } else {
          status = "yellow";
        }

        this.todoItems.push({"card": "sec-details", "field": result.infoString, "fix": result.infoString, "status": status});
      }
    })

    if(this.secRequiredCounter > 0){
      this.canPackageList[2] = false;
    } else {
      this.canPackageList[2] = true;
    }

    this.secTotalScore = this.securityResults.length;

    this.secDataLoading = false;
    details!.disabled = false;

    //save security tests in session storage
    sessionStorage.setItem('security_tests', JSON.stringify(securityTests));
    this.requestUpdate();
  }

  async handleMissingFields(manifest: Manifest){
    let missing = await reportMissing(manifest);

    missing.forEach((field: string) => {
      if(required_fields.includes(field)){
        this.requiredMissingFields.push(field);
        this.manifestRequiredCounter++;
      } else if(reccommended_fields.includes(field)){
        this.reccMissingFields.push(field);
        this.manifestReccCounter++;
      } if(optional_fields.includes(field)){
        this.optMissingFields.push(field)
      }
      if(!this.createdManifest){
        this.todoItems.push({"card": "mani-details", "field": field, "fix": "Add~to your manifest"})
      }
    });
    return missing.length;
  }

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

  delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

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
    this.reccMissingFields = [];
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
  }

  async openManifestEditorModal() {
    let dialog: any = this.shadowRoot!.querySelector("manifest-editor-frame")!.shadowRoot!.querySelector(".dialog");

    await dialog!.show();
    recordPWABuilderProcessStep("manifest_editor_opened", AnalyticsBehavior.ProcessCheckpoint);
  }

  async openSWSelectorModal() {
    let dialog: any = this.shadowRoot!.querySelector("sw-selector")!.shadowRoot!.querySelector(".dialog");

    await dialog.show()
    recordPWABuilderProcessStep("sw_selector_opened", AnalyticsBehavior.ProcessCheckpoint);
  }

  async openPublishModal() {
    let dialog: any = this.shadowRoot!.querySelector("publish-pane")!.shadowRoot!.querySelector(".dialog");

    await dialog.show()
    recordPWABuilderProcessStep("publish_modal_opened", AnalyticsBehavior.ProcessCheckpoint);
  }

  async openTestPublishModal() {
    let dialog: any = this.shadowRoot!.querySelector("test-publish-pane")!.shadowRoot!.querySelector(".dialog");

    await dialog.show()
    recordPWABuilderProcessStep("test_publish_modal_opened", AnalyticsBehavior.ProcessCheckpoint);
  }

  iconSrcListParse(icon: any) {
    let manifest = getManifestContext().manifest;
    let manifestURL = getManifestContext().manifestUrl;
    let iconURL: string = this.handleImageUrl(icon, manifest, manifestURL) || '';

    return iconURL;
  }

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
      instantYellow = this.manifestReccCounter > 0;
    } else if(card === "sw"){
      instantYellow = this.swReccCounter > 0;
    } else {
      instantYellow = this.secReccCounter > 0;
    }

    if(instantRed){
      return {"green": false, "red": true, "yellow": false};
    } else if(instantYellow){
      return {"green": false, "red": false, "yellow": true};
    } else {
      return {"green": true, "red": false, "yellow": false};
    }

  }

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

  async animateItem(e: CustomEvent){
    e.preventDefault;
    recordPWABuilderProcessStep("todo_item_clicked", AnalyticsBehavior.ProcessCheckpoint);

    if(e.detail.card === "retest"){
      this.thingToAdd = e.detail.displayString;
      this.showConfirmationModal = true;
      return;
    } else if(e.detail.field === "Open Manifest Modal"){
      let frame = this.shadowRoot!.querySelector("manifest-editor-frame");
      (frame?.shadowRoot!.querySelector(".dialog")! as any).show();
      return;
    } else if(e.detail.field === "Open SW Modal"){
      let frame = this.shadowRoot!.querySelector("sw-selector");
      (frame?.shadowRoot!.querySelector(".dialog")! as any).show();
      return;
    }

    let details = this.shadowRoot!.getElementById(e.detail.card);

    await (details as any)!.show();

    details!.scrollIntoView({behavior: "smooth"});
    
    let itemList = this.shadowRoot!.querySelectorAll('[data-field="' + e.detail.field + '"]');

    // The below block is just to get the specific item to animate if a field has more than 1 test.
    let item: any;
    if(itemList!.length === 1){
      item = itemList![0]
    } else {
      itemList.forEach((temp: any) => {
        let textSplit = temp.querySelector('p').innerHTML.split("-->");
        let text = textSplit[textSplit.length - 1]
        if(text === e.detail.displayString){
          item = temp;
        }
      })
    }

    item!.classList.toggle("animate");
    setTimeout(() => {
      item!.classList.toggle("animate");
    }, 1000)
  }

  addRetestTodo(toAdd: string){
    this.todoItems.push({"card": "retest", "field": "Manifest", "fix": "Add " + toAdd + " to your server and retest your site!", "status": "retest", "displayString": toAdd});
    this.requestUpdate();
  }

  rotateZero(card: string){
    recordPWABuilderProcessStep(card + "_details_expanded", AnalyticsBehavior.ProcessCheckpoint);
    let icon: any = this.shadowRoot!.querySelector('[data-card="' + card + '"]');
    if(icon){
      icon!.style.transform = "rotate(0deg)";
    }
  }

  rotateNinety(card: string){
    recordPWABuilderProcessStep(card + "_details_closed", AnalyticsBehavior.ProcessCheckpoint);
    let icon: any = this.shadowRoot!.querySelector('[data-card="' + card + '"]');
    if(icon){
      icon!.style.transform = "rotate(90deg)";
    }
  }

  sortTodos(){
    this.todoItems.sort((a, b) => {
      if(a.status === "red" && b.status !== "red"){
        return -1;
      } else if(b.status === "red" && a.status !== "red"){
        return 1;
      } else {
        return a.field.localeCompare(b.field);
      }
    });

    return this.todoItems;
  }

  paginate() {
    let array = this.sortTodos();
    return array.slice((this.pageNumber - 1) * this.pageSize, this.pageNumber * this.pageSize);
  }

  switchPage(up: boolean){
    if(up && this.pageNumber * this.pageSize < this.todoItems.length){
      this.pageNumber++;
    } else if(!up && this.pageNumber != 1){
      this.pageNumber--;
    }
    this.requestUpdate();
  }

  getDots(){
    let dots: any[] = [];

    let totalPages = Math.ceil(this.todoItems.length / this.pageSize);

    for(let i = 0; i < totalPages; i++){
      dots.push("dot");
    }
    return dots;
  }

  renderIndicators(){
    let yellow = 0;
    let red = 0;

    this.todoItems.forEach((todo: any) => {
      if(todo.status == "red"){
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


  render() {
    return html`
      <app-header></app-header>
      <div id="report-wrapper">
        <div id="content-holder">
          <div id="header-row">
          ${this.isAppCardInfoLoading ?
          html`
            <div id="app-card" class="flex-col skeleton-effects">
              <div id="app-card-header">
                <sl-skeleton id="app-image-skeleton" effect="pulse"></sl-skeleton>
                <div id="card-info" class="flex-col">
                  <sl-skeleton class="app-info-skeleton" effect="pulse"></sl-skeleton>
                  <sl-skeleton class="app-info-skeleton" effect="pulse"></sl-skeleton>
                </div>
                <sl-skeleton class="app-info-skeleton skeleton-desc" effect="pulse"></sl-skeleton>
              </div>
              <div id="app-card-footer">
                <sl-skeleton class="app-info-skeleton-half" effect="pulse"></sl-skeleton>
              </div>
            </div>`
            :
            html`
            <div id="app-card" class="flex-col" style=${this.createdManifest ? styleMap({ backgroundColor: 'white', color: '#595959' }) : styleMap(this.CardStyles)}>
              <div id="app-card-header">
                <div id="pwa-image-holder">
                  ${this.proxyLoadingImage ? html`<span class="proxy-loader"></span>` : html`<img src=${this.appCard.iconURL} alt=${this.appCard.iconAlt} />`}
                </div>
                <div id="card-info" class="flex-col">
                  <p id="site-name">${this.appCard.siteName}</p>
                  <p>${this.appCard.siteUrl}</p>
                </div>
                <p id="app-card-desc">${this.appCard.description}</p>
              </div>
              <div id="app-card-footer" style=${styleMap(this.BorderStyles)}>
                <div id="test" style=${styleMap(this.CardStyles)}>
                  <button
                    type="button"
                    id="retest"
                    @click=${() => {
                      this.retest(false);
                    }}
                    ?disabled=${this.runningTests}
                  >
                    <p id="last-edited" style=${styleMap(this.LastEditedStyles)}>${this.lastTested}</p>

                    <img
                      src=${this.retestPath}
                      alt="retest site"
                      role="presentation"
                    />
                  </button>
                </div>
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
                      Package for stores
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
                          Package for stores
                        </button>
                    </sl-tooltip>
                    `}
                <button type="button" id="test-download" @click=${() => this.openTestPublishModal()}>
                  <p class="arrow_link">Download test package</p>
                  <img
                    src="/assets/new/arrow.svg"
                    alt="arrow"
                    role="presentation"
                  />
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
              @sl-show=${() => this.rotateNinety("todo")}
              @sl-hide=${() => this.rotateZero("todo")}
              open
              >
              <div class="details-summary" slot="summary">
                <div id="todo-summary-left">
                  <p>Action Items</p>
                  ${(!this.manifestDataLoading && !this.swDataLoading && !this.secDataLoading) ? this.renderIndicators() : html``}
                </div>
                  <img class="dropdown_icon" data-card="todo" src="/assets/new/dropdownIcon.svg" alt="dropdown toggler"/>
                
              </div>
             ${(!this.manifestDataLoading && !this.swDataLoading && !this.secDataLoading) ? this.paginate().map((todo: any) =>
                html`
                  <todo-item
                    .status=${todo.status}
                    .field=${todo.field}
                    .fix=${todo.fix}
                    .card=${todo.card}
                    .displayString=${todo.displayString}
                    @todo-clicked=${(e: CustomEvent) => this.animateItem(e)}>
                  </todo-item>`
              ) : html`<span class="loader"></span>`}

            ${((!this.manifestDataLoading && !this.swDataLoading && !this.secDataLoading) && (this.todoItems.length > this.pageSize)) ?
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
                          role="presentation"
                        />
                      </a>
                  `}

                </div>
              </div>

              <div id="mh-right">
                ${this.manifestDataLoading ?
                    html`<sl-skeleton class="progressRingSkeleton" effect="pulse"></sl-skeleton>` :
                    html`<sl-progress-ring
                            id="manifestProgressRing"
                            class=${classMap(this.decideColor("manifest"))}
                            value="${this.createdManifest ? 0 : (parseFloat(JSON.stringify(this.manifestValidCounter)) / this.manifestTotalScore) * 100}"
                          >${this.createdManifest ? html`<img src="assets/new/macro_error.svg" class="macro_error" alt="missing manifest requirements" />` : html`${this.manifestValidCounter} / ${this.manifestTotalScore}`}</sl-progress-ring>`
                }
              </div>
            </div>
            <sl-details
              id="mani-details"
              class="details"
              @sl-show=${() => this.rotateNinety("mani-details")}
              @sl-hide=${() => this.rotateZero("mani-details")}
              >
              ${this.manifestDataLoading ? html`<div slot="summary"><sl-skeleton class="summary-skeleton" effect="pulse"></sl-skeleton></div>` : html`<div class="details-summary" slot="summary"><p>View Details</p><img class="dropdown_icon" data-card="mani-details" src="/assets/new/dropdownIcon.svg" alt="dropdown toggler"/></div>`}
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
                  ${this.reccMissingFields.length > 0 ?
                  html`
                    ${this.reccMissingFields.map((field: string) =>
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
              </div>
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
                    html`<sl-skeleton class="progressRingSkeleton" effect="pulse"></sl-skeleton>` :
                    html`<sl-progress-ring
                    id="swProgressRing"
                    class=${classMap(this.decideColor("sw"))}
                    value="${(parseFloat(JSON.stringify(this.swValidCounter)) / this.swTotalScore) * 100}"
                    >${this.swValidCounter == 0 ? html`<img src="assets/new/macro_error.svg" class="macro_error" alt="missing service worker requirements" />` : html`${this.swValidCounter} / ${this.swTotalScore}`}</sl-progress-ring>
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
                          role="presentation"
                        />
                      </a>
                    `
                  }

                </div>
              </div>
              <sl-details
                id="sw-details"
                class="details"
                @sl-show=${() => this.rotateNinety("sw-details")}
                @sl-hide=${() => this.rotateZero("sw-details")}
              >
                ${this.swDataLoading ? html`<div slot="summary"><sl-skeleton class="summary-skeleton" effect="pulse"></sl-skeleton></div>` : html`<div class="details-summary" slot="summary"><p>View Details</p><img class="dropdown_icon" data-card="sw-details" src="/assets/new/dropdownIcon.svg" alt="dropdown toggler"/></div>`}
                <div class="detail-grid">
                  <div class="detail-list">
                    <p class="detail-list-header">Required</p>
                    ${this.serviceWorkerResults.map((result: TestResult) => result.category === "required" ?
                    html`
                      <div class="test-result" data-field=${result.infoString}>
                        ${result.result ? html`<img src=${valid_src} alt="passing result icon"/>` : html`<img src=${stop_src} alt="invalid result icon"/>`}
                        <p>${result.infoString}</p>
                      </div>
                    ` :
                    html``)}
                  </div>
                  <div class="detail-list">
                    <p class="detail-list-header">Recommended</p>
                    ${this.serviceWorkerResults.map((result: TestResult) => result.category === "recommended" ?
                    html`
                    <div class="test-result" data-field=${result.infoString}>
                        ${result.result ? html`<img src=${valid_src} alt="passing result icon"/>` : html`<img src=${yield_src} alt="yield result icon"/>`}
                        <p>${result.infoString}</p>
                      </div>
                    ` :
                    html``)}
                  </div>
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
                </div>
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
                    html`<sl-skeleton class="progressRingSkeleton" effect="pulse"></sl-skeleton>` :
                    html`<sl-progress-ring
                    id="secProgressRing"
                    class=${classMap(this.decideColor("sec"))}
                    value="${(parseFloat(JSON.stringify(this.secValidCounter)) / this.secTotalScore) * 100}"
                    >${this.secValidCounter == 0 ? html`<img src="assets/new/macro_error.svg" class="macro_error" alt="missing requirements"/>` : html`${this.secValidCounter} / ${this.secTotalScore}`}</sl-progress-ring>
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
                          role="presentation"
                        />
                      </a>
                    `
                  }
                </div>
              </div>
              <sl-details
                id="sec-details"
                class="details"
                @sl-show=${() => this.rotateNinety("sec-details")}
                @sl-hide=${() => this.rotateZero("sec-details")}
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

      <publish-pane></publish-pane>
      <test-publish-pane></test-publish-pane>
      ${this.manifestDataLoading ? html`` : html`<manifest-editor-frame .isGenerated=${this.createdManifest} @readyForRetest=${() => this.addRetestTodo("Manifest")}></manifest-editor-frame>`}
      <sw-selector @readyForRetest=${() => this.addRetestTodo("Service Worker")}></sw-selector>

    `;
  }
}
