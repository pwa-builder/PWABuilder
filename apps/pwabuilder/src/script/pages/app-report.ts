import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { doubleCheckManifest, getManifestContext, setResults, setURL } from '../services/app-info';

import {
  BreakpointValues,
  mediumBreakPoint,
  largeBreakPoint,
  xxxLargeBreakPoint,
  smallBreakPoint,
} from '../utils/css/breakpoints';

import '../components/app-header';
import '../components/todo-list-item';


//@ts-ignore
import style from '../../../styles/layout-defaults.css';
import { RawTestResult, ScoreEvent } from '../utils/interfaces';
import { giveOutBadges } from '../services/badges';

const possible_messages = {
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
};

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

@customElement('app-report')
export class AppReport extends LitElement {
  @property({ type: Object }) resultOfTest: RawTestResult | undefined;

  @state() swScore = 0;
  @state() maniScore = 0;
  @state() securityScore = 0;

  @state() errored: boolean = false;
  @state() errorMessage: string | undefined = undefined;
  @state() errorLink: string | undefined = undefined;

  @state() mql = window.matchMedia(
    `(min-width: ${BreakpointValues.largeUpper}px)`
  );

  @state() isDeskTopView = this.mql.matches;

  // will be used to control the state of the "Package for store" button.
  @state() canPackage: Boolean = false;

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
          align-items: baseline;
          height: 100vh;
          background-color: #F2F3FB;
          padding: 20px;
          box-sizing: border-box;
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
          background-color: white;
          border-radius: 10px;
          padding: 1em;

          display: flex;
          flex-direction: column;
          row-gap: 10px;
          box-shadow: 0px 4px 30px 0px #00000014;
        }

        #card-header {
          display: flex;
          column-gap: 10px;
          align-items: center;
          font-size: 14px;
          font-weight: bold;
        }

        #card-header img {
          height: 85px;
          width: auto;
        }

        #site-name {
          font-size: 24px;
        }

        #card-info {
          display: flex;
          flex-direction: column;
        }

        #card-info p{
          margin: 0;
        }

        #card-desc {
          margin: 0;
          font-size: 14px;
        }

        #app-actions { 
          width: 70%;
          display: flex;
          flex-direction: column;
          border-radius: 10px;
          background-color: white;
          height: 180px;
          align-items: center;
          justify-content: space-between;
          box-shadow: 0px 4px 30px 0px #00000014;
        }

        #app-actions button {
          font-weight: bold;
        }

        #actions {
          display: flex;
          align-items: center;
          padding: 1em;
          padding-bottom: 0;
          width: 100%;
        }
        
        #test {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          row-gap: 20px;
          width: 45%;
        }

        #retest {
          background-color: #4F3FB6;
          border-radius: 50px;
          padding: 1em;
          color: white;
          display: flex;
          align-items: center;
          column-gap: 10px;
          font-size: 16px;
          border: none;
        }

        #last-edited {
          color: #808080;
          font-size: 12px;
          margin: 0;
          display: flex;
          align-items: center;
          column-gap: 10px;
        }

        #package {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          row-gap: 20px;
          width: 55%;
        }

        #pfs {
          background-color: black;
          color: white; 
          font-size: 16px;
          border-radius: 50px;
          padding: 1em 3em;
          border: none;
        }

        #test-download {
          background-color: transparent;
          color: #4F3FB6;
          border: none;
          width: fit-content;
          display: flex;
          column-gap: .5em;
          align-items: center;
        }

        #test-download:hover img {
          animation: bounce 1s;
        }

        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
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
          border-bottom: 1px solid #4F3FB6;
        }

        button:hover {
          cursor: pointer;
        }

        #actions-footer {
          background-color: #F2F3FB;
          width: 100%;
          display: flex;
          column-gap: .75em;
          align-items: center;
          justify-content: center;
          border-bottom-left-radius: 10px;
          border-bottom-right-radius: 10px;
          padding: .5em 1em;
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
        }

        sl-details {
          width: 100%;
        }

        #todo-detail::part(base) {
          border-radius: 10px;
        }

        #todo-detail::part(header){
          height: 60px;
        }

        #todo-detail::part(summary) {
          color: #4F3FB6;
          font-size: 20px;
          font-weight: bold;
        }

        #manifest {
          box-shadow: 0px 4px 30px 0px #00000014;
          display: flex;
          flex-direction: column;
          background-color: white;
          border-radius: 10px;
        }

        #manifest-header {
          display: flex;
          justify-content: space-between;
          border-bottom: 1px solid #C4C4C4;
          padding: 1em;
        }

        #mh-left {
          display: flex;
          flex-direction: column;
          width: 50%;
          row-gap: .5em;
        }

        #mh-header {
          font-size: 24px;
          font-weight: bold;
          margin: 0;
        }

        #mh-desc {
          margin: 0;
          font-size: 17px;
        }

        #mh-right {
          display: flex;
          column-gap: 2.5em;
        }
        #mh-actions {
          display: flex;
          flex-direction: column;
          row-gap: 1em;
        }

        #mh-actions a {
          text-decoration: none;
          font-size: 14px;
          font-weight: bold;
          margin: 0px 0.5em 0px 0px;
          line-height: 1em;
          color: rgb(79, 63, 182);
          display: flex;
          column-gap: 10px;
        }
        #mh-actions a:visited {
          color: #4F3FB6;
        }
        #mh-actions:hover {
          cursor: pointer;
        }
        #mh-actions:hover img {
          animation: bounce 1s;
        }

        #mh-actions .alternate {
          background: var(--secondary-color);
          color: #4F3FB6;
          border: 1px solid #4F3FB6;
          font-size: 16px;
          font-weight: bold;
          border-radius: 50px;
          padding: 1em 3em;
        }

        #mh-actions .alternate:hover {
          box-shadow: 0px 0px 10px rgba(0,0,0,0.3);
        }

        #manifest-details {

        }

        #manifest-detail-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
        }

        .detail-list {
          display: flex;
          flex-direction: column;
          row-gap: 10px;
        }

        .detail-list p {
          font-size: 18px;
          margin: 0;
          font-weight: bold;
        }

        #manifest-details::part(base) {
          border-radius: 0;
          border-bottom-left-radius: 10px;
          border-bottom-right-radius: 10px;
        }

        #manifest-details::part(summary) {
          font-weight: bold;
          font-size: 14px;
        }

        #manifest-details::part(header){
          height: 40px;
        }

        ${xxxLargeBreakPoint(
        css`
            
          `
      )}

        ${largeBreakPoint(
        css`
            
          `
      )}

        ${mediumBreakPoint(
        css`
            
          `
      )}

        ${smallBreakPoint(
        css`
            
          `
      )}
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
    const results = search.get('results');

    const url = search.get('site');
    const hasBadges = sessionStorage.getItem('current_badges');
    setURL(url!);
    
    if (results) {
      /*
        cache results string as we may need this farther in the flow
        if the user needs to be redirected back here.
        Normally this would be because of issues with their manifest
        that are causing issues with packaging
      */
      sessionStorage.setItem('results-string', results);

      this.resultOfTest = JSON.parse(results);
      setResults((this.resultOfTest as RawTestResult));

      this.resultOfTest = JSON.parse(results);

      if(!hasBadges) {
        giveOutBadges();
      }
    }

    await this.handleDoubleChecks();
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


  render() {
    return html`
      <app-header></app-header>

      <div id="report-wrapper">
        <div id="header-row">
          <div id="app-card">
            <div id="card-header">
              <img src="/assets/icons/icon_512.png" alt="Your sites logo" />
              <div id="card-info">
                <p id="site-name">Site Name</p>
                <p>www.site.com</p>
              </div>
            </div>
            <p id="card-desc">This is the description to my application and this is what it does and who its for.</p>
          </div>
          <div id="app-actions">
            <div id="actions">
              <div id="test">
                <button type="button" id="retest"><img src="/assets/new/retest.png" alt="retest site" role="presentation" />Retest Site</button>
                <p id="last-edited"><img src="/assets/new/last-edited.png" alt="pencil icon" role="presentation" />2 minutes ago</p>
              </div>

              <img src="/assets/new/vertical-divider.png" role="presentation" />

              <div id="package">
                <button type="button" id="pfs" disabled>Package for store</button>
                <button type="button" id="test-download"><p class="arrow_link">Download test package</p><img src="/assets/new/arrow.svg" alt="arrow" role="presentation"/></button>
              </div>
            </div>
            <div id="actions-footer">
              <p>Available stores:</p>
              <img title="Windows" src="/assets/windows_icon.svg" alt="Windows" />
              <img title="iOS" src="/assets/apple_icon.svg" alt="iOS" />
              <img title="Android" src="/assets/android_icon_full.svg" alt="Android" />
              <img title="Meta Quest" src="/assets/meta_icon.svg" alt="Meta Quest" />
            </div>
          </div>
        </div>
        <div id="todo">
          <sl-details id="todo-detail" summary="To-do list">
            <todo-item .status=${"red"} .content=${"This is an example to do item."}></todo-item>
            <todo-item .status=${"red"} .content=${"Theoretically we'd loop through these."}></todo-item>
            <todo-item .status=${"red"} .content=${"and display them here."}></todo-item>
          </sl-details>
        </div>
        <div id="manifest">
          <div id="manifest-header">
            <div id="mh-left">
              <p id="mh-header">Manifest</p>
              <p id="mh-desc">PWABuilder has analyzed your Web Manifest. You do not have a web manifest. Use our Manifest editor to egenrate one. You can package for the store once you have a valid manifest.</p>
            </div>
            <div id="mh-right">
              <div id="mh-actions">
                <button type="button" class="alternate">Manifest Editor</button>
                <a href="https://developer.mozilla.org/en-US/docs/Web/Manifest" rel="noopener" target="_blank">
                  <p class="arrow_link">Manifest Documentation</p> 
                  <img src="/assets/new/arrow.svg" alt="arrow" role="presentation"/>
                </a>
              </div>
              <sl-progress-ring value="${(1.0/18) * 100}">1/18</sl-progress-ring>
            </div>
          </div>
          <sl-details summary="View details" id="manifest-details">
            <div id="manifest-detail-grid">
              <div class="detail-list">
                <p>*Required</p>
              </div>
              <div class="detail-list">
                <p>Recommended</p>
              </div>
              <div class="detail-list">
                <p>Optional</p>
              </div>
            </div>
          </sl-details>
        </div>
      </div>
      `;
    }
  }
