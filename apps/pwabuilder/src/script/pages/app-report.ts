import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { doubleCheckManifest, getManifestContext } from '../services/app-info';
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
import '../components/app-modal';
import '../components/todo-list-item';
import '../components/manifest-editor-frame';
import '../components/publish-pane';
import '../components/sw-selector';


import { testSecurity } from '../services/tests/security';
import { testServiceWorker } from '../services/tests/service-worker';

//@ts-ignore
import style from '../../../styles/layout-defaults.css';
import {
  Icon,
  ManifestContext,
  RawTestResult,
  TestResult
} from '../utils/interfaces';

import { fetchOrCreateManifest } from '../services/manifest';
import { resolveUrl } from '../utils/url';

import { AnalyticsBehavior, recordPWABuilderProcessStep } from '../utils/analytics';
import { text } from 'express';

/* const possible_messages = {
  overview: {
    heading: "Your PWA's report card.",
    supporting:
      'Check out the the Overview below to see if your PWA is store-ready! If not, tap the section that needs work to begin upgrading your PWA.',
  },
  mani: {
    heading: 'Manifest great PWAs.',
    supporting:
      'PWABuilder has analyzed your Web Manifest, check out the results below. If you are missing something, tap Manifest Options to update your Manifest.',
  },
  sw: {
    heading: 'Secret Ingredient: A Service Worker',
    supporting:
      'PWABuilder has analyzed your Service Worker, check out the results below. Want to add a Service Worker or check out our pre-built Service Workers? Tap Service Worker Options.',
  },
}; */

const error_messages = {
  icon: {
    message:
      'Your app is missing a 512x512 or larger PNG icon. Because of this your PWA cannot currently be packaged. Please visit the documentation below for how to fix this.',
    link: 'https://docs.microsoft.com/microsoft-edge/progressive-web-apps-chromium/how-to/icon-theme-color#define-icons',
  },
  start_url: {
    message:
      'Your app is missing a start_url, because of this your PWA cannot currently be packaged. Please visit the documentation below for how to fix this.',
    link: 'https://developer.mozilla.org/en-US/docs/Web/Manifest/start_url',
  },
  name: {
    message:
      'Your app is missing a name, because of this your PWA cannot currently be packaged. Please visit the documentation below for how to fix this.',
    link: 'https://developer.mozilla.org/en-US/docs/Web/Manifest/name',
  },
};

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
  };
  @property({ type: Object }) styles = { backgroundColor: 'white', color: 'black' };
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
  @state() canPackage: boolean = true;
  @state() manifestEditorOpened: boolean = false;
  @state() publishModalOpened: boolean = false;

  @state() swSelectorOpen: boolean = false;

  // Controls the last tested section
  @state() lastTested: string = "Last tested seconds ago";

  // validation
  @state() validationResults: Validation[] = [];
  @state() manifestTotalScore: number = 0;
  @state() manifestValidCounter: number = 0;
  @state() manifestDataLoading: boolean = true;

  @state() serviceWorkerResults: any[] = [];
  @state() swTotalScore: number = 0;
  @state() swValidCounter: number = 0;
  @state() swDataLoading: boolean = true;

  @state() securityResults: any[] = [];
  @state() secTotalScore: number = 0;
  @state() secValidCounter: number = 0;
  @state() secDataLoading: boolean = true;

  @state() requiredMissingFields: any[] = [];
  @state() reccMissingFields: any[] = [];
  @state() optMissingFields: any[] = [];

 /*  
  So in order to connect the to do items with the things below 
  We can have an object that looks like this
  {
    card: id to the details card (manifest, sw, sec)
    field: the manifest field name, security check or sw check
    fix: the string that will surround the field name ie "Add ~ to your manfiest!"
  }
  We can use the card to expand the details (details.show())
  and then we can use a data-field on each validation to connect to the field
  and then do some shake animation via that.
  We can use the field, split on the ~, and then rejoin to slot the word in.
  */
  @state() todoItems: any[] = [];


  static get styles() {
    return [
      style,
      css`
        * {
          box-sizing: border-box;
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
          flex-wrap: wrap;
          gap: 1.5em;
        }
        #header-row {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          column-gap: 1em;
        }
        #app-card {
          width: 30%;
          height: 180px;
          border-radius: 10px;
          background-color: white;
          padding: 1em;
          row-gap: 10px;
          box-shadow: 0px 4px 30px 0px #00000014;
        }
        .flex-col {
          display: flex;
          flex-direction: column;
        }
        #card-header {
          display: flex;
          column-gap: 10px;
          align-items: center;
          font-size: 14px;
          font-weight: bold;
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
          box-shadow: rgb(0 0 0 / 20%) 0px 4px 30px 0px;
        }
        #card-header img {
          height: 85px;
          width: auto;
          padding: 10px;
        }
        #site-name {
          font-size: 24px;
        }
        #card-info {
          width: 100%;
          overflow: hidden;
          white-space: nowrap;
        }
        #card-info p {
          margin: 0;
        }
        #card-desc {
          margin: 0;
          font-size: 14px;
          width: 100%;
          white-space: normal;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box !important;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
        #app-actions {
          width: 70%;
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
        #actions {
          display: flex;
          align-items: flex-start;
          padding: 1em;
          width: 100%;
          gap: .5em;
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
        #test {
          row-gap: 1em;
          width: 45%;
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
          background-color: #4f3fb6;
          color: white;
          display: flex;
          align-items: center;
          column-gap: 10px;
          border: none;
        }
        #last-edited {
          color: #808080;
          font-size: 12px;
          line-height: 12px;
          white-space: nowrap;
          margin: 0;
          display: flex;
          align-items: center;
          column-gap: .5em;
        }
        #package {
          row-gap: 20px;
          width: 55%;
        }
        #pfs {
          background-color: black;
          color: white;
          border: none;
        }
        #pfs-disabled{
          background-color: #00000065;
          border: none;
          color: white;
        }
        #pfs-disabled:hover{
          cursor: no-drop;
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
          padding: .75em 1em;
        }
        #actions-footer img {
          height: 20px;
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
          padding-top: 0;
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
          row-gap: 10px;
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
          padding: 1.5em .75em;
        }

        #two-cell-row {
          display: flex;
          column-gap: 1em;
          width: 100%;
        }

        #two-cell-row > * {
          width: 50%;
        }

        #sw-header {
          row-gap: 0.5em;
          border-bottom: 1px solid #c4c4c4;
          padding: 1em;
        }
        #swh-top {
          display: flex;
          column-gap: 1em;
        }
        #swh-text {
          row-gap: 0.5em;
        }
        #sw-ring {
          --size: 80px;
          height: fit-content;
        }
        #sw-actions {
          row-gap: 1em;
          width: fit-content;
        }
        .detail-grid {
          display: flex;
          flex-direction: column;
          row-gap: 0.5em;
        }

        sl-progress-ring {
          height: fit-content;
        }

        sl-progress-ring::part(base).progress-ring__track {
          stroke-width: 2px;
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
        .half-width-cards {
          display: flex;
          flex-direction: column;
          border-radius: 10px;
          background-color: white;
          align-self: flex-start;
        }

        #security {
          height: 100%;
        }
        #sec-header {
          justify-content: space-between;
          row-gap: .5em;
          padding: 1em;
          border-bottom: 1px solid #c4c4c4;
          height: 100%;
        }
        #sec-top {
          display: flex;
          column-gap: 1em;
        }
        #sec-text {
          row-gap: 0.5em;
        }
        #sec-actions {
          row-gap: 1em;
          width: 66%;
        }
        .close_x {
          position: absolute;
          top: 1em;
          right: 1em;
          height: 20px;
          width: auto;
          z-index: 10;
        }
        .close_x:hover {
          cursor: pointer;
        }
        .modal-blur {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: transparent;
          backdrop-filter: blur(10px);
          z-index: 3;
        }
        .modal {
          background: white;
          max-width: 765px;
          max-height: 840px;
          border-radius: 10px;
          box-shadow: 0px 16px 24px rgba(0, 0, 0, 0.12);
          position: relative;
          z-index: 4;
          display: flex;
        }
        .progressRingSkeleton::part(base) {
          height: 128px;
          width: 128px;
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

        @media(max-width: 765px){
          .modal {
            max-width: 600px;
            max-height: 600px;
          }

          manifest-editor-frame {
            max-width: 600px;
            max-height: 600px;
            overflow-y: scroll;
          }
        }

        @media(max-width: 600px){
          .modal {
            max-width: 480px;
            max-height: 650px;
          }

          manifest-editor-frame {
            max-width: 480px;
            max-height: 650px;
          }
        }

        @media(max-width: 480px){
          .modal {
            max-width: 320px;
            max-height: 600px;
          }

          manifest-editor-frame {
            max-width: 320px;
            max-height: 600px;
          }
        }

        ${xxxLargeBreakPoint(css``)}
        ${largeBreakPoint(css``)}
        ${mediumBreakPoint(css`
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

          sl-progress-ring {
            --size: 75px;
            font-size: 14px;
          }
          .progressRingSkeleton::part(base) {
            width: 75px;
            height: 75px;
          }
          #two-cell-row {
            flex-direction: column;
            row-gap: 1em;
          }
          #two-cell-row > * {
            width: 100%;
          }
        `)}
        ${smallBreakPoint(css`
        
          sl-progress-ring {
            --size: 75px;
            font-size: 14px;
          }
          .progressRingSkeleton::part(base) {
            width: 75px;
            height: 75px;
          }
          #two-cell-row {
            flex-direction: column;
            row-gap: 1em;
          }
          #two-cell-row > * {
            width: 100%;
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
          #last-edited {
            font-size: 10px;
          }

          #test {
            width: 50%;
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

          .modal {
            max-width: 90vw;
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

  async firstUpdated() {
    const search = new URLSearchParams(location.search);
    const site = search.get('site');
    if (site) {
      this.siteURL = site;
      this.runAllTests(site);
      sessionStorage.setItem('last_tested', JSON.stringify(new Date()));
    }

    setInterval(() => this.pollLastTested(), 120000);
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
    const manifestContext = await fetchOrCreateManifest(url);
    this.isAppCardInfoLoading = false;
    this.populateAppCard(manifestContext, url);
    return manifestContext;
  }

  populateAppCard(manifestContext: ManifestContext, url: string) {
    if (manifestContext) {
      const parsedManifestContext = manifestContext;

      let cleanURL = url.replace(/(^\w+:|^)\/\//, '')

      this.appCard = {
        siteName: parsedManifestContext.manifest.short_name
          ? parsedManifestContext.manifest.short_name
          : (parsedManifestContext.manifest.name ? parsedManifestContext.manifest.name : 'Untitled App'),
        siteUrl: cleanURL,
        description: parsedManifestContext.manifest.description
          ? parsedManifestContext.manifest.description
          : 'Add an app description to your manifest',
      };
      if(manifestContext.manifest.theme_color && manifestContext.manifest.theme_color !== 'none'){
        this.styles.backgroundColor = manifestContext.manifest.theme_color;
        // calculate whether is best to use white or black
        this.styles.color = this.pickTextColorBasedOnBgColorAdvanced(manifestContext.manifest.theme_color, '#ffffff', '#000000');

      }
    }
  }

  pickTextColorBasedOnBgColorAdvanced(bgColor: string, lightColor: string, darkColor: string) {
    var color = (bgColor.charAt(0) === '#') ? bgColor.substring(1, 7) : bgColor;
    var r = parseInt(color.substring(0, 2), 16); // hexToR
    var g = parseInt(color.substring(2, 4), 16); // hexToG
    var b = parseInt(color.substring(4, 6), 16); // hexToB
    var uicolors = [r / 255, g / 255, b / 255];
    var c = uicolors.map((col) => {
      if (col <= 0.03928) {
        return col / 12.92;
      }
      return Math.pow((col + 0.055) / 1.055, 2.4);
    });
    var L = (0.2126 * c[0]) + (0.7152 * c[1]) + (0.0722 * c[2]);
    return (L > 0.3) ? darkColor : lightColor;
  }

  async runAllTests(url: string) {
    await this.getManifest(url);
    this.testManifest();
    this.testServiceWorker(url);
    this.testSecurity(url);
    //this.updateTimeLastTested();
  }

  // idk if we need the url for this function bc we can just get the manifest context
  async testManifest() {
    //add manifest validation logic
    // note: wrap in try catch (can fail if invalid json)
    let details = (this.shadowRoot!.getElementById("mani-details") as any);
    details!.disabled = true;

    let manifest = JSON.parse(sessionStorage.getItem("PWABuilderManifest")!).manifest;
    
    this.validationResults = await validateManifest(manifest);

    //  This just makes it so that the valid things are first
    // and the invalid things show after.
    this.validationResults.sort((a, b) => {
      if(a.valid && !b.valid){
        return -1;
      } else if(b.valid && !a.valid){
        return 1;
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
        if(test.category === "required"){
          status = "red";
          this.canPackage = this.canPackage && false;
        } else {
          status = "yellow";
        }

        this.todoItems.push({"card": "mani-details", "field": test.member, "displayString": test.displayString ?? "", "fix": test.errorString, "status": status});
      }
    });

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

  async handleMissingFields(manifest: Manifest){
    let missing = await reportMissing(manifest);
    
    missing.forEach((field: string) => {
      if(required_fields.includes(field)){
        this.requiredMissingFields.push(field)
      } else if(reccommended_fields.includes(field)){
        this.reccMissingFields.push(field)
      } if(optional_fields.includes(field)){
        this.optMissingFields.push(field)
      } 
      this.todoItems.push({"card": "mani-details", "field": field, "fix": "Add~to your manifest"})
    });
    return missing.length;
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
          this.canPackage = this.canPackage && false;
          this.todoItems.push({"card": "sw-details", "field": "Open SW Modal", "fix": "Add Service Worker to Base Package", "status": status});
        } else {
          status = "yellow";
        }

        if(!missing){
          this.todoItems.push({"card": "sw-details", "field": result.infoString, "fix": result.infoString, "status": status});
        }
      }
    })
    this.swTotalScore = this.serviceWorkerResults.length;
    
    this.swDataLoading = false;
    details!.disabled = false;

    //save serviceworker tests in session storage
    sessionStorage.setItem(
      'service_worker_tests',
      JSON.stringify(serviceWorkerTestResult)
    );
    //console.log(serviceWorkerTestResult);
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
          this.canPackage = this.canPackage && false;
        } else {
          status = "yellow";
        }

        this.todoItems.push({"card": "sec-details", "field": result.infoString, "fix": result.infoString, "status": status});
      }
    })
    this.secTotalScore = this.securityResults.length;

    this.secDataLoading = false;
    details!.disabled = false;

    //save security tests in session storage
    sessionStorage.setItem('security_tests', JSON.stringify(securityTests));
    //console.log(securityTests);
    this.requestUpdate();
  }

  async retest() {
    recordPWABuilderProcessStep("retest_clicked", AnalyticsBehavior.ProcessCheckpoint);
    if (this.siteURL) {
      this.resetData();
      this.runAllTests(this.siteURL);
      sessionStorage.setItem('last_tested', JSON.stringify(new Date()));
    }
  }

  resetData(){
    // reset scores
    this.manifestValidCounter = 0;
    this.manifestTotalScore = 0;
    this.swValidCounter = 0;
    this.swTotalScore = 0;
    this.secValidCounter = 0;
    this.secTotalScore = 0;

    // reset missing lists
    this.requiredMissingFields = [];
    this.reccMissingFields = [];
    this.optMissingFields = [];

    // activate loaders
    this.manifestDataLoading = true;
    this.swDataLoading = true;
    this.secDataLoading = true;

    // hide the detail lists
    let details = this.shadowRoot!.querySelectorAll('sl-details');

    details.forEach((detail: any) => {
      detail.hide();
    });
  }

  async handleDoubleChecks() {
    const maniContext = getManifestContext();

    // If we couldn't find the manifest and we instead generated one,
    // punt back; no need to do additional manifest checks.
    if (maniContext.isGenerated) {
      return;
    }

    const doubleCheckResults = await doubleCheckManifest(maniContext);
    if (doubleCheckResults) {
      if (!doubleCheckResults.icon) {
        this.errorMessage = error_messages.icon.message;
        this.errorLink = error_messages.icon.link;

        this.errored = true;
        return;
      } else if (!doubleCheckResults.name || !doubleCheckResults.shortName) {
        this.errorMessage = error_messages.name.message;
        this.errorLink = error_messages.name.link;

        this.errored = true;
        return;
      } else if (!doubleCheckResults.startURL) {
        this.errorMessage = error_messages.start_url.message;
        this.errorLink = error_messages.start_url.link;

        this.errored = true;
        return;
      }
    }
  }

  toggleManifestEditorModal() {
    if(this.manifestEditorOpened){
      recordPWABuilderProcessStep("manifest_editor_closed", AnalyticsBehavior.ProcessCheckpoint);
    } else {
      recordPWABuilderProcessStep("manifest_editor_opened", AnalyticsBehavior.ProcessCheckpoint);
    }
    this.manifestEditorOpened = !this.manifestEditorOpened;
    this.requestUpdate();
  }

  togglePublishModal() {
    if(this.publishModalOpened){
      recordPWABuilderProcessStep("publish_modal_closed", AnalyticsBehavior.ProcessCheckpoint);
    } else {
      recordPWABuilderProcessStep("publish_modal_opened", AnalyticsBehavior.ProcessCheckpoint);
    }
    this.publishModalOpened = !this.publishModalOpened;
    this.requestUpdate();
  }

  iconSrcListParse() {

    let manifest = getManifestContext().manifest;
    let manifestURL = getManifestContext().manifestUrl;

    if (!manifest && !manifestURL) {
      return ["/assets/icons/icon_512.png"];
    }

    let screenshotSrcList: any[] = [];

    manifest!.icons?.forEach((icon: any) => {
      let iconURL: string = this.handleImageUrl(icon, manifest, manifestURL) || '';
      if(iconURL){
        screenshotSrcList.push((iconURL as string));
      }
    })

    return screenshotSrcList;
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

  decideColor(valid: number, total: number){
    let ratio = parseFloat(JSON.stringify(valid)) / total;
    
    if(ratio == 1){      
      return {"green": true, "red": false, "yellow": false};
    } else if(ratio < 1.0/3) {
      return {"green": false, "red": true, "yellow": false};
    } else {
      return {"green": false, "red": false, "yellow": true};
    }
  }

  async animateItem(e: CustomEvent){
    e.preventDefault;
    recordPWABuilderProcessStep("todo_item_clicked", AnalyticsBehavior.ProcessCheckpoint);

    if(e.detail.card === "retest"){
      // pop up a message that confirms they have updated their files
      // that pop up has the button that can retest
      return;
    }

    let details = this.shadowRoot!.getElementById(e.detail.card);

    await (details as any)!.show();

    details!.scrollIntoView({behavior: "smooth"});

    if(e.detail.field === "Open SW Modal"){
      this.swSelectorOpen = true;
      console.log("Open SW Modal");
    }

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
    this.todoItems.push({"card": "retest", "field": "Manifest", "fix": "Add " + toAdd + " to your server and retest your site!", "status": "retest"});
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
              <div id="card-header">
                <sl-skeleton id="app-image-skeleton" effect="pulse"></sl-skeleton>
                <div id="card-info" class="flex-col">
                  <sl-skeleton class="app-info-skeleton" effect="pulse"></sl-skeleton>
                  <sl-skeleton class="app-info-skeleton" effect="pulse"></sl-skeleton>
                </div>
              </div>
              <sl-skeleton class="app-info-skeleton" effect="pulse"></sl-skeleton>
            </div>`
            :
            html`
            <div id="app-card" class="flex-col" style=${styleMap(this.styles)}>
              <div id="card-header">
                <div id="pwa-image-holder">
                  <img src=${this.iconSrcListParse()![0]} alt="Your sites logo" />
                </div>
                <div id="card-info" class="flex-col">
                  <p id="site-name">${this.appCard.siteName}</p>
                  <p>${this.appCard.siteUrl}</p>
                </div>
              </div>
              <p id="card-desc">${this.appCard.description}</p>
            </div>`}
            <div id="app-actions" class="flex-col">
              <div id="actions">
                <div id="test" class="flex-col-center">
                  <button
                    type="button"
                    id="retest"
                    @click=${() => {
                      this.retest();
                    }}
                  >
                    <img
                      src="/assets/new/retest.svg"
                      alt="retest site"
                      role="presentation"
                    />Retest Site
                  </button>
                  <p id="last-edited">
                    <img
                      src="/assets/new/last-edited.png"
                      alt="pencil icon"
                      role="presentation"
                    />${this.lastTested}
                  </p>
                </div>
                <img src="/assets/new/vertical-divider.png" role="presentation" />
                <div id="package" class="flex-col-center">
                    ${this.canPackage ?
                      html`
                      <button
                        type="button"
                        id="pfs"
                        @click=${() => this.togglePublishModal()}
                      >
                        Package for store
                      </button>
                      ` : 
                      html`
                      <sl-tooltip content="Handle all required todo's and retest in order to package!">
                          <button
                            type="button"
                            id="pfs-disabled"
                            aria-disabled="true"
                          >
                            Package for store
                          </button>
                      </sl-tooltip>
                      `}
                  <button type="button" id="test-download">
                    <p class="arrow_link">Download test package</p>
                    <img
                      src="/assets/new/arrow.svg"
                      alt="arrow"
                      role="presentation"
                    />
                  </button>
                </div>
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
              summary="To-do list"
              @click=${() => recordPWABuilderProcessStep("todo_details_expanded", AnalyticsBehavior.ProcessCheckpoint)}
              >
             ${this.todoItems.map((todo: any) => 
                html`
                  <todo-item
                    .status=${todo.status}
                    .field=${todo.field}
                    .fix=${todo.fix}
                    .card=${todo.card}
                    .displayString=${todo.displayString}
                    @todo-clicked=${(e: CustomEvent) => this.animateItem(e)}>
                  </todo-item>`
              )}
            
            </sl-details>
          </div>
          <div id="manifest" class="flex-col">
            <div id="manifest-header">
              <div id="mh-content">
                <div id="mh-text" class="flex-col">
                  <p class="card-header">Manifest</p>
                  <p class="card-desc">
                    PWABuilder has analyzed your Web Manifest. You do not have a web
                    manifest. Use our Manifest editor to generate one. You can
                    package for the store once you have a valid manifest.
                  </p>
                </div>

                <div id="mh-actions" class="flex-col">
                  <button
                    type="button"
                    class="alternate"
                    @click=${() => this.toggleManifestEditorModal()}
                  >
                    Manifest Editor
                  </button>
                  <a
                    class="arrow_anchor"
                    href="https://developer.mozilla.org/en-US/docs/Web/Manifest"
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
                </div>
              </div>
              
              <div id="mh-right">
                ${this.manifestDataLoading ? 
                    html`<sl-skeleton class="progressRingSkeleton" effect="pulse"></sl-skeleton>` :
                    html`<sl-progress-ring 
                            id="manifestProgressRing" 
                            class=${classMap(this.decideColor(this.manifestValidCounter, this.manifestTotalScore))}
                            value="${(parseFloat(JSON.stringify(this.manifestValidCounter)) / this.manifestTotalScore) * 100}"
                          >${this.manifestValidCounter == 0 ? html`<img src="assets/new/macro_error.svg" class="macro_error" alt="missing manifest requirements" />` : html`${this.manifestValidCounter} / ${this.manifestTotalScore}`}</sl-progress-ring>`
                }
              </div>
            </div>
            <sl-details 
              id="mani-details" 
              class="details"
              @click=${() => recordPWABuilderProcessStep("manifest_details_expanded", AnalyticsBehavior.ProcessCheckpoint)}
              >
              ${this.manifestDataLoading ? html`<div slot="summary"><sl-skeleton class="summary-skeleton" effect="pulse"></sl-skeleton></div>` : html`<div slot="summary">View Details</div>`}
              <div id="manifest-detail-grid">
                <div class="detail-list">
                  <p class="detail-list-header">*Required</p>
                  ${this.validationResults.map((result: Validation) => result.category === "required" ? 
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

                  ${this.requiredMissingFields.length > 0 ?
                  html`
                    <p class="missing">-- Missing Required Fields --</p>
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
                  
                </div>
                <div class="detail-list">
                  <p class="detail-list-header">Recommended</p>
                  ${this.validationResults.map((result: Validation) => result.category === "recommended" ? 
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

                  ${this.reccMissingFields.length > 0 ?
                  html`
                    <p class="missing">-- Missing Recommended Fields --</p>
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
                </div>
                <div class="detail-list">
                  <p class="detail-list-header">Optional</p>
                  ${this.validationResults.map((result: Validation) => result.category === "optional" ? 
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

                  ${this.optMissingFields.length > 0 ?
                  html`
                    <p class="missing">-- Missing Optional Fields --</p>
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
                    <p class="card-desc">
                      PWABuilder has analyzed your Service Worker, check out the
                      results below. Want to add a Service Worker or check out our
                      pre-built Service Workers? Tap Genereate Service Worker.
                    </p>
                  </div>
                  ${this.swDataLoading ? 
                    html`<sl-skeleton class="progressRingSkeleton" effect="pulse"></sl-skeleton>` :
                    html`<sl-progress-ring
                    id="swProgressRing"
                    class=${classMap(this.decideColor(this.swValidCounter, this.swTotalScore))}
                    value="${(parseFloat(JSON.stringify(this.swValidCounter)) / this.swTotalScore) * 100}"
                    >${this.swValidCounter == 0 ? html`<img src="assets/new/macro_error.svg" class="macro_error" alt="missing service worker requirements" />` : html`${this.swValidCounter} / ${this.swTotalScore}`}</sl-progress-ring>
                    `
                  }
                </div>
                <div id="sw-actions" class="flex-col">
                  <button type="button" class="alternate" @click=${() => this.swSelectorOpen = true}>
                    Generate Service Worker
                  </button>
                  <a 
                    class="arrow_anchor"
                    href="" rel="noopener" 
                    target="_blank"
                    href=""
                    @click=${() => recordPWABuilderProcessStep("sw_documentation_clicked", AnalyticsBehavior.ProcessCheckpoint)}>
                    <p class="arrow_link">Service Worker Documentation</p>
                    <img
                      src="/assets/new/arrow.svg"
                      alt="arrow"
                      role="presentation"
                    />
                  </a>
                </div>
              </div>
              <sl-details 
                id="sw-details" 
                class="details"
                @click=${() => recordPWABuilderProcessStep("sw_details_expanded", AnalyticsBehavior.ProcessCheckpoint)}>
                ${this.swDataLoading ? html`<div slot="summary"><sl-skeleton class="summary-skeleton" effect="pulse"></sl-skeleton></div>` : html`<div slot="summary">View Details</div>`}
                <div class="detail-grid">
                  <div class="detail-list">
                    <p class="detail-list-header">*Required</p>
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
                    <p class="card-desc">
                      PWABuilder has done a basic analysis of your HTTPS setup.
                      You can use LetsEncrypt to get a free HTTPS certificate, or
                      publish to Azure to get built-in HTTPS support.
                    </p>
                  </div>
                  ${this.secDataLoading ? 
                    html`<sl-skeleton class="progressRingSkeleton" effect="pulse"></sl-skeleton>` :
                    html`<sl-progress-ring
                    id="secProgressRing"
                    class=${classMap(this.decideColor(this.secValidCounter, this.secTotalScore))}
                    value="${(parseFloat(JSON.stringify(this.secValidCounter)) / this.secTotalScore) * 100}"
                    >${this.secValidCounter == 0 ? html`<img src="assets/new/macro_error.svg" class="macro_error" alt="missing requirements"/>` : html`${this.secValidCounter} / ${this.secTotalScore}`}</sl-progress-ring>
                    `
                  }
                  
                </div>
                <div id="sec-actions" class="flex-col">
                  <a 
                    class="arrow_anchor" 
                    href="" rel="noopener" 
                    target="_blank"
                    @click=${() => recordPWABuilderProcessStep("security_documentation_clicked", AnalyticsBehavior.ProcessCheckpoint)}>
                    <p class="arrow_link">Security Documentation</p>
                    <img
                      src="/assets/new/arrow.svg"
                      alt="arrow"
                      role="presentation"
                    />
                  </a>
                </div>
              </div>
              <sl-details 
                id="sec-details" 
                class="details"
                @click=${() => recordPWABuilderProcessStep("security_details_expanded", AnalyticsBehavior.ProcessCheckpoint)}
                >
              ${this.secDataLoading ? html`<div slot="summary"><sl-skeleton class="summary-skeleton" effect="pulse"></sl-skeleton></div>` : html`<div slot="summary">View Details</div>`}
                <div class="detail-grid">
                  <div class="detail-list">
                    <p class="detail-list-header">*Required</p>
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
          <manifest-editor-frame @readyForRetest=${() => this.addRetestTodo("Manifest")} .open=${this.manifestEditorOpened} @manifestEditorClosed=${() => this.manifestEditorOpened = false}></manifest-editor-frame>
          ${this.publishModalOpened
            ? html` <div class="modal-blur flex-center">
                <div class="modal flex-col-center">
                  <img class="close_x" alt="close button" src="/assets/Close_desk.png" @click=${() => this.togglePublishModal()} />
                  <publish-pane></publish-pane>
                </div>
              </div>`
            : html``}
            <sw-selector .open=${this.swSelectorOpen} @swSelectorClosed=${() => this.swSelectorOpen = false} @readyForRetest=${() => this.addRetestTodo("Service Worker")}></sw-selector>
        </div>
      </div>
    `;
  }
}