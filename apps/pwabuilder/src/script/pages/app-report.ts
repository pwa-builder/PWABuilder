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
import '../components/app-modal';
import '../components/todo-list-item';
import '../components/manifest-editor-frame'
import '../components/publish-pane'

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
  @state() canPackage: boolean = false;
  @state() manifestEditorOpened: boolean = false;
  @state() publishModalOpened: boolean = true;

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
        }

        #card-header img {
          height: 85px;
          width: auto;
        }

        #site-name {
          font-size: 24px;
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
          row-gap: 20px;
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

        #hover {
          background-color: rgba(0, 0, 0, 0.75);
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
          white-space: nowrap;
        }

        button:hover {
          cursor: pointer;
        }

        #actions-footer {
          background-color: #F2F3FB;
          width: 100%;
          column-gap: .75em;
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
          background-color: white;
          border-radius: 10px;
          width: 100%;
        }

        #manifest-header {
          display: flex;
          justify-content: space-between;
          border-bottom: 1px solid #C4C4C4;
          padding: 1em;
        }

        #mh-left {
          width: 50%;
          row-gap: .5em;
        }

        .card-header {
          font-size: 24px;
          font-weight: bold;
          margin: 0;
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
          color: #4F3FB6;
        }
        .arrow_anchor:hover {
          cursor: pointer;
        }
        .arrow_anchor:hover img {
          animation: bounce 1s;
        }

        #report-wrapper .alternate {
          background: var(--secondary-color);
          color: #4F3FB6;
          border: 1px solid #4F3FB6;
          font-size: 16px;
          font-weight: bold;
          border-radius: 50px;
          padding: .5em 2em;
        }

        #report-wrapper .alternate:hover {
          box-shadow: 0px 0px 10px rgba(0,0,0,0.3);
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

        .details::part(header){
          height: 40px;
        }

        #two-cell-row {
          display: flex;
          column-gap: 1em;
          width: 100%;
        }

        #sw {
          
        }

        #sw-header {
          row-gap: .5em;
          border-bottom: 1px solid #C4C4C4;
          padding: 1em;
        }

        #swh-top {
          display: flex;
          column-gap: 1em;
        }

        #swh-text {
          row-gap: .5em;
        } 

        #sw-ring {
          --size: 80px;
          height: fit-content;
        }

        #sw-actions {
          row-gap: 1em;
          width: 40%;
        }

        .detail-grid {
          display: flex;
          flex-direction: column;
          row-gap: .5em;
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

        #security {
          justify-content: space-between;
        }

        .half-width-cards {
          display: flex;
          flex-direction: column;

          width: 50%;
          border-radius: 10px;
          background-color: white;
          
          row-gap: .5em;
        }

        #sec-header {
          justify-content: space-between;
          row-gap: .5em;
          height: 100%;
          padding: 1em;
          border-bottom: 1px solid #C4C4C4;
        }

        #sec-top {
          display: flex;
          column-gap: 1em;
        }

        #sec-text {
          row-gap: .5em;
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

  toggleManifestEditorModal(){
    this.manifestEditorOpened = !this.manifestEditorOpened;
    this.requestUpdate();
  }

  togglePublishModal(){
    this.publishModalOpened = !this.publishModalOpened;
    this.requestUpdate();
  }


  render() {
    return html`
      <app-header></app-header>

      <div id="report-wrapper">
        <div id="header-row">
          <div id="app-card" class="flex-col">
            <div id="card-header">
              <img src="/assets/icons/icon_512.png" alt="Your sites logo" />
              <div id="card-info" class="flex-col">
                <p id="site-name">Site Name</p>
                <p>www.site.com</p>
              </div>
            </div>
            <p id="card-desc">This is the description to my application and this is what it does and who its for.</p>
          </div>
          <div id="app-actions" class="flex-col">
            <div id="actions">
              <div id="test" class="flex-col-center">
                <button type="button" id="retest"><img src="/assets/new/retest.png" alt="retest site" role="presentation" />Retest Site</button>
                <p id="last-edited"><img src="/assets/new/last-edited.png" alt="pencil icon" role="presentation" />2 minutes ago</p>
              </div>

              <img src="/assets/new/vertical-divider.png" role="presentation" />

              <div id="package" class="flex-col-center">
                <button type="button" id="pfs" @click=${() => this.togglePublishModal()}>Package for store</button>
                <button type="button" id="test-download"><p class="arrow_link">Download test package</p><img src="/assets/new/arrow.svg" alt="arrow" role="presentation"/></button>
              </div>
            </div>
            <div id="actions-footer" class="flex-center">
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
        <div id="manifest" class="flex-col">
          <div id="manifest-header">
            <div id="mh-left" class="flex-col"> 
              <p class="card-header">Manifest</p>
              <p class="card-desc">PWABuilder has analyzed your Web Manifest. You do not have a web manifest. Use our Manifest editor to generate one. You can package for the store once you have a valid manifest.</p>
            </div>
            <div id="mh-right">
              <div id="mh-actions" class="flex-col">
                <button type="button" class="alternate" @click=${() => this.toggleManifestEditorModal()}>Manifest Editor</button>
                <a class="arrow_anchor" href="https://developer.mozilla.org/en-US/docs/Web/Manifest" rel="noopener" target="_blank">
                  <p class="arrow_link">Manifest Documentation</p> 
                  <img src="/assets/new/arrow.svg" alt="arrow" role="presentation"/>
                </a>
              </div>
              <sl-progress-ring class="red" value="${(1.0/18) * 100}">1/18</sl-progress-ring>
            </div>
          </div>
          <sl-details summary="View details" class="details">
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
        <div id="two-cell-row">
          <div id="sw" class="half-width-cards">
            <div id="sw-header" class="flex-col">
              <div id="swh-top">
                <div id="swh-text" class="flex-col">
                  <p class="card-header">Service Worker</p>
                  <p class="card-desc">PWABuilder has analyzed your Service Worker, check out the results below. Want to add a Service Worker or check out our pre-built Service Workers? Tap Genereate Service Worker. </p>
                </div>
                <sl-progress-ring class="yellow" id="sw-ring" value="${(2.0/3) * 100}">2/3</sl-progress-ring>
              </div>
              <div id="sw-actions" class="flex-col">
                <button type="button" class="alternate">Generate Service Worker</button>
                <a class="arrow_anchor" href="" rel="noopener" target="_blank">
                  <p class="arrow_link">Service Worker Documentation</p> 
                  <img src="/assets/new/arrow.svg" alt="arrow" role="presentation"/>
                </a>
              </div>
            </div>
            <sl-details summary="View details" class="details">
            <div class="detail-grid">
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
          <div id="security" class="half-width-cards">
            <div id="sec-header" class="flex-col">
              <div id="sec-top">
                <div id="sec-text" class="flex-col">
                  <p class="card-header">Security</p>
                  <p class="card-desc">PWABuilder has done a basic analysis of your HTTPS setup. You can use LetsEncrypt to get a free HTTPS certificate, or publish to Azure to get built-in HTTPS support.</p>
                </div>
                <sl-progress-ring class="green" id="sw-ring" value="${(3/3) * 100}">3/3</sl-progress-ring>
              </div>
              <div id="sec-actions" class="flex-col">
                <a class="arrow_anchor" href="" rel="noopener" target="_blank">
                  <p class="arrow_link">Security Documentation</p> 
                  <img src="/assets/new/arrow.svg" alt="arrow" role="presentation"/>
                </a>
              </div>
            </div>
            <sl-details summary="View details" class="details">
            <div class="detail-grid">
                <div class="detail-list">
                  <p>*Required</p>
                </div>
              </div>
            </sl-details>
          </div>
        </div>

        ${this.manifestEditorOpened ? 
          html`
            <div class="modal-blur flex-center">
              <div class="modal flex-col-center">
                <img class="close_x" src="/assets/Close_desk.png" @click=${() => this.toggleManifestEditorModal()} />
                <manifest-editor-frame></manifest-editor-frame>
              </div>
            </div>` : 
          html``
        }

        ${this.publishModalOpened ? 
          html`
            <div class="modal-blur flex-center">
              <div class="modal flex-col-center">
                <img class="close_x" src="/assets/Close_desk.png" @click=${() => this.togglePublishModal()} />
                <publish-pane></publish-pane>
              </div>
            </div>` : 
          html``
        }
      </div>
      `;
    }
  }
