import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { doubleCheckManifest, getManifestContext, setResults, setURL } from '../services/app-info';

import {
  BreakpointValues,
  mediumBreakPoint,
  largeBreakPoint,
  xxxLargeBreakPoint,
  smallBreakPoint,
} from '../utils/css/breakpoints';

import '../components/content-header';
import '../components/report-card';
import '../components/manifest-options';
import '../components/sw-picker';
import '../components/app-header';
import '../components/app-sidebar';
import '../components/app-modal';

//@ts-ignore
import style from '../../../styles/layout-defaults.css';
import { RawTestResult, ScoreEvent } from '../utils/interfaces';
import { giveOutBadges } from '../services/badges';
import {  AnalyticsBehavior, recordPWABuilderProcessStep } from '../utils/analytics';

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

        #test-download p {
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
      <!-- error modal -->
      <app-modal heading="Wait a minute!" .body="${this.errorMessage || ''}" ?open="${this.errored}" id="error-modal" tabindex="0">
        <img class="modal-image" slot="modal-image" src="/assets/warning.svg" alt="warning icon" />

        <div id="actions" slot="modal-actions">
          <fast-anchor target="__blank" id="error-link" class="button" .href="${this.errorLink}">Documentation <ion-icon
              name="link"></ion-icon>
          </fast-anchor>
        </div>
      </app-modal>

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
                <button type="button" id="test-download"><p>Download test package</p><img src="/assets/new/arrow.svg" alt="arrow" role="presentation"/></button>
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
          
        </div>
      </div>
      `;
    }
  }
