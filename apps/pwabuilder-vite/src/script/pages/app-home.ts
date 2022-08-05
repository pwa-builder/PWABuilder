import { LitElement, css, html } from 'lit';

import { customElement, state } from 'lit/decorators.js';

import { classMap } from 'lit/directives/class-map.js';
import { localeStrings } from '../../locales';

import {
  mediumBreakPoint,
  largeBreakPoint,
  xLargeBreakPoint,
  xxxLargeBreakPoint,
} from '../utils/css/breakpoints';
import { isValidURL } from '../utils/url';

import '../components/content-header';
import '../components/loading-button';
import '../components/dropdown-menu';
import '../components/app-sidebar';
import '../components/companies-packaged';
import '../components/resource-hub-new';
import '../components/success-stories';
import '../components/community-hub';

// For more info on the @pwabuilder/pwainstall component click here https://github.com/pwa-builder/pwa-install
import '@pwabuilder/pwainstall';
import { Router } from '@vaadin/router';
import { getProgress, getURL, setProgress } from '../services/app-info';
import { Lazy, ProgressList, Status } from '../utils/interfaces';
import { fetchOrCreateManifest, resetInitialManifest } from '../services/manifest';
import { AnalyticsBehavior, recordPWABuilderProcessStep } from '../utils/analytics';

@customElement('app-home')
export class AppHome extends LitElement {
  @state() siteURL: Lazy<string>;
  @state() gettingManifest = false;
  @state() errorGettingURL = false;
  @state() errorMessage: string | undefined;

  @state() disableStart = true;

  static get styles() {
    return [
      css`

        :host {
          --sl-focus-ring-width: 3px;
          --sl-input-focus-ring-color: #4f3fb670;
          --sl-focus-ring: 0 0 0 var(--sl-focus-ring-width) var(--sl-input-focus-ring-color);
          --sl-input-border-color-focus: #4F3FB6ac;
          --sl-color-primary-300: #4F3FB6;
        }

        #home-block::before {
          content: "";
        }
        #home-block {
          background: url(/assets/new/Hero1920_withmani.jpg);
          background-position: center center;
          background-size: cover;
          background-repeat: no-repeat;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 4em;
        }

        #mani {
          position: fixed;
        }

        #wrapper {
          width: 1000px;
        }
        app-header::part(header) {
          background: transparent;
          position: absolute;
          left: 0;
          right: 0;
          top: 0;
          z-index: 2;
          border: none;
        }
        h1 {
          font-size: var(--xlarge-font-size);
          line-height: 48px;
          letter-spacing: -0.015em;
          margin-bottom: 20px;
        }
        #input-header {
          font-size: 1em;
          font-weight: bold;
          margin: 0;
          line-height: 1.75em;
          color: #4F3FB6;
        }
        #content-grid {
          padding: 0;
          margin: 0;
          display: grid;
          grid-template-columns: auto auto;
          width: fit-content;
        }
        .intro-grid-item {
          width: max-content;
          margin-right: 1em;
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
        .grid-item-header {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          font-weight: bold;
          margin-bottom: .25em;
        }
        .grid-item-header a {
          text-decoration: none;
          border-bottom: 1px solid rgb(79, 63, 182);
          font-size: 1em;
          font-weight: bold;
          margin: 0px 0.5em 0px 0px;
          line-height: 1em;
          color: rgb(79, 63, 182);
        }
        .grid-item-header a:visited {
          color: #4F3FB6;
        }
        .grid-item-header:hover {
          cursor: pointer;
        }
        .grid-item-header:hover img {
          animation: bounce 1s;
        }
        .intro-grid-item p {
          margin: 0;
          color: #292C3A;
          font-size: .75em;
          width: 15em;
        }
        #input-form {
          margin-top: 1em;
          width: max-content;
        }
        #input-header-holder {
          display: flex;
          align-items: center;
          justify-content: center;
          width: max-content;
          margin-bottom: 10px;
        }
        #input-header-holder img {
          width: auto;
          height: 1em;
          margin-left: 20px;
        }
        #input-area {
          display: grid;
          grid-template-columns: 1fr 1fr;
          grid-template-rows: 1fr 1fr;
        }
        #input-and-error {
          grid-column: 1;
          grid-row: 1;
          display: flex;
          flex-direction: column;
        }
        #start-button {
          grid-column: 2;
          grid-row: 1;
        }
        .raise:hover:not(disabled){
          transform: scale(1.01);
        }
        .raise:focus:not(disabled) {
          transform: scale(1.01);
        }
        #demo {
          grid-column: 1 / 2;
          grid-row: 2;
        }
        #input-form sl-input {
          margin-right: 10px;
        }
        #input-form sl-input::part(base) {
          border: 1px solid #e5e5e5;
          border-radius: var(--input-radius);
          color: var(--font-color);
          width: 28em;
          font-size: 14px;
          height: 3em;
        }

        #input-form sl-input::part(input) {
          height: 3em;
        }

        #input-form .error::part(base){
          border-color: #eb5757;
          --sl-input-focus-ring-color: #eb575770;
          --sl-focus-ring-width: 3px;
          --sl-focus-ring: 0 0 0 var(--sl-focus-ring-width) var(--sl-input-focus-ring-color);
          --sl-input-border-color-focus: #eb5757ac;
        }

        .error-message {
          color: var(--error-color);
          font-size: var(--small-font-size);
          margin-top: 6px;
        }

        #input-form .navigation::part(base) {
          background-color: black;
          color: white;
          font-size: 14px;
          height: 3em;
          width: 25%;
          border-radius: 50px;
        }

        #input-form .navigation::part(label){
          display: flex;
          align-items: center;
        }

        #input-block {
          display: flex;
          flex-direction: column;
          flex: 0.8 1 0%;
          width: 100%;
        }
        #demo {
          font-size: .55em;
          margin: 0;
          margin-top: 5px;
          color: #292C3A;
        }
        #demo-action {
          margin: 0;
          text-decoration: underline;
          font-weight: bold;
          background: none;
          border: none;
          padding: 0;
          font-size: 1em;
          margin-left: 1px;
        }
        #demo-action:hover{
          cursor: pointer;
        }
        #home-header {
          max-width: 498px;
        }
        /* 640px - 1023px */
        ${largeBreakPoint(css`
          #home-block {
            padding-left: 4.5em;
            background: url(/assets/new/Hero1024_withmani.png);
            background-position: center center;
            background-size: cover;
            background-repeat: no-repeat;
          }
          #wrapper {
            width: 825px;
          }
          #content-grid {
            column-gap: 1em;
          }
        `)}
        /* 480px - 639px */
        ${mediumBreakPoint(css`
          #home-block {
            padding: 1.5em;
            padding-top: 4em;
            padding-bottom: 6em;
            background: url(/assets/new/Hero480_withmani.jpg);
            background-position: center bottom;
            background-size: cover;
            background-repeat: no-repeat;
          }
          #wrapper {
            width: 530px;
          }
          .intro-grid-item p {
            width: 13em;
          }
          #input-area {
            width: 100%;
          }
          #input-and-error {
            margin-right: 10px;
          }
          #input-form {
            width: 100%;
          }
          #input-form fast-text-field {
            margin-right: 0;
          }
          #home-header{
            font-size: 40px;
          }
        `)}

        @media (min-width: 480px) and (max-width: 580px) {
          #wrapper {
            width: 400px;
          }
          #input-area {
            width: 100%;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            row-gap: 5px;
          }
        }

        /* < 480px */
        @media (max-width: 480px) {
          #home-block {
            padding: 1em;
            padding-top: 4em;
            padding-bottom: 2em;
            background: url(/assets/new/Hero480_withmani.jpg);
            background-position: center bottom;
            background-size: cover;
            background-repeat: no-repeat;
          }
          #wrapper {
            width: 400px;
          }
          #home-header {
            font-size: 1.9em;
          }
          #content-grid {
            display: flex;
            flex-direction: column;
            row-gap: 1em;
          }
          #input-and-error{
            width: 85%;
          }
          #input-area {
            width: 100%;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            row-gap: 5px;
          }
          #input-header-holder img {
            display: none;
          }
          #home-header {
            line-height: 36px;
          }
          #input-form {
            width: 100%;
          }
          #input-form fast-text-field {
            margin-right: 0;
          }
          #input-form fast-text-field::part(control) {
            width: 100%;
          }
          .grid-item-header {
            font-size: 20px;
          }
          #input-header {
            font-size: 20px;
          }
        }
        @media (max-width: 415px) {
          #wrapper {
            width: 300px;
          }
        }
        @media (min-width: 640px) and (max-width: 955px) {
          #home-block {
            background-position: center;
          }
          #wrapper {
            width: 600px;
          }
        }
        @media screen and (-ms-high-contrast: white-on-black) {
          #input-form fast-text-field::part(control):focus {
            outline: none;
          }
          #input-form fast-text-field::part(control):focus-visible {
            outline: skyblue solid 6px;
            outline-offset: 2px;
          }
          #input-form fast-text-field::part(control) {
            color: white;
          }
        }

        /*1024px - 1365px*/
        ${xLargeBreakPoint(css`
            #home-block {
              background: url(/assets/new/Hero1366_withmani.png);
              background-position: center center;
              background-size: cover;
              background-repeat: no-repeat;
            }
        `)}
          /* > 1920 */
        ${xxxLargeBreakPoint(css`
            #wrapper {
              width: 1160px;
            }
        `)}
      `,
    ];
  }

  constructor() {
    super();
  }

  async firstUpdated() {
    // Resetting for a new url
    sessionStorage.clear();
    resetInitialManifest();

    const search = new URLSearchParams(location.search);
    const site = search.get('site');

    if (site) {
      this.siteURL = site.trim();
      await this.analyzeSite();
    }

    recordPWABuilderProcessStep('landing-page-loaded', AnalyticsBehavior.StartProcess);

    /*
    Step 1: Start the process on home page load
    Step 2: Track any button presses a checkpoint
    Step 3: end the process when the user packages
    timer for first action
    */
  }

  handleURL(inputEvent: InputEvent) {
    if (inputEvent) {
      this.siteURL = (inputEvent.target as HTMLInputElement).value.trim();
    }

    if (isValidURL(this.siteURL as string)) {
      this.disableStart = false;
    } else {
      this.disableStart = true;
    }
  }

  async start(inputEvent: InputEvent) {
    inputEvent.preventDefault();

    await this.analyzeSite();
  }

  async analyzeSite() {
    if(this.siteURL !== demoURL){
      sessionStorage.setItem('demoURL', JSON.stringify(false));
    }

    if (this.siteURL) {
      this.gettingManifest = true;
      const isValidUrl = isValidURL(this.siteURL);

      recordPWABuilderProcessStep('.top.entered_link_testing_started', AnalyticsBehavior.ProcessCheckpoint,
      {
        url: this.siteURL,
        valid: isValidUrl
      });

      if (isValidUrl) {
        try {
          const manifestContext = await fetchOrCreateManifest(this.siteURL);
          this.errorGettingURL = false;

          const progress = getProgress();
          this.updateProgress(progress);

          const goodURL = manifestContext.siteUrl;

          if (goodURL !== undefined) {
            Router.go(`/reportcard?site=${goodURL}`);
          }
        } catch (err) {
          // couldnt get manifest
          // continue forward with zeroed out results
          // and use generated manifest
          this.errorGettingURL = false;

          const progress = getProgress();
          this.updateProgress(progress);

          const goodURL = getURL();

          if (goodURL !== undefined) {
            Router.go(`/testing?site=${goodURL}`);
          }
        }
      } else {
        this.errorMessage = localeStrings.input.home.error.invalidURL;
        this.errorGettingURL = true;

        await this.updateComplete;

        (this.shadowRoot?.querySelector('.error-message') as HTMLSpanElement)?.focus();
      }

      // HACK: Lit 2.0 crashes on Safari 14 desktop on the following line:
      // this.gettingManifest = false;
      // To fix this, we've found that putting that call in a 100ms timeout fixes the issue.
      setTimeout(() => this.gettingManifest = false, 100);
    }
  }


  updateProgress(progressData: ProgressList) {
    if (progressData && progressData.progress[0] && progressData.progress[0].items[0]) {
      progressData.progress[0].items[0].done = Status.DONE;
      const newProgress = progressData;
      setProgress(newProgress);
    }
  }

  placeDemoURL(){
    sessionStorage.setItem('demoURL', JSON.stringify(true));
    recordPWABuilderProcessStep("home.top.DemoURL_clicked", AnalyticsBehavior.ProcessCheckpoint);
    this.siteURL = demoURL;
    let box = this.shadowRoot!.getElementById("input-box");
    (box as HTMLInputElement)!.value = this.siteURL;
    this.analyzeSite();
  }


  render() {
    return html`
      <app-header part="header"></app-header>
      <main>
        <div id="home-block">
          <div id="wrapper">
            <h1 id="home-header" slot="hero-container">
              Helping developers build and publish PWAs
            </h1>
            <section id="content-grid" slot="grid-container">
              <div class="intro-grid-item">
                <div class="grid-item-header">
                  <a @click=${() => recordPWABuilderProcessStep("home.top.PWAStarter_clicked", AnalyticsBehavior.ProcessCheckpoint)} href="https://github.com/pwa-builder/pwa-starter/wiki/Getting-Started" target="_blank" rel="noopener">Start a new PWA</a>
                  <img src="/assets/new/arrow.svg" alt="arrow" role="presentation"/>

                </div>
                <p>
                  Looking to build a new Progressive Web App? Checkout all the documentation here.
                </p>
              </div>

              <div class="intro-grid-item">
                <div class="grid-item-header">
                  <a @click=${() => recordPWABuilderProcessStep("home.top.PWAStudio_clicked", AnalyticsBehavior.ProcessCheckpoint)} href="https://aka.ms/install-pwa-studio" target="_blank" rel="noopener">Use dev tools</a>
                  <img src="/assets/new/arrow.svg" alt="arrow" role="presentation"/>
                </div>
                <p>
                  Use our VS Code extension to create, improve, and package your PWA directly in your code editor.
                </p>
              </div>
            </section>

            <form id="input-form" slot="input-container" @submit="${(e: InputEvent) => this.start(e)}">
              <div id="input-block" role="region">
                <div id="input-header-holder">
                  <h2 id="input-header">Ship your PWA to app stores</h2>
                  <img title="Windows" src="/assets/windows_icon.svg" alt="Windows" />
                  <img title="iOS" src="/assets/apple_icon.svg" alt="iOS" />
                  <img title="Android" src="/assets/android_icon_full.svg" alt="Android" />
                  <img title="Meta Quest" src="/assets/meta_icon.svg" alt="Meta Quest" />
                </div>
                <div id="input-area">
                  <div id="input-and-error">
                    <sl-input slot="input-container" type="text" id="input-box" placeholder="Enter the URL to your PWA" name="url-input"
                      class="${classMap({ error: this.errorGettingURL })}" aria-labelledby="input-header" @input="${(e: InputEvent) => this.handleURL(e)}">
                    </sl-input>

                    ${this.errorMessage && this.errorMessage.length > 0
                      ? html`<span role="alert" aria-live="polite" class="error-message">${this.errorMessage}</span>`
                      : null}
                  </div>

                  <sl-button
                    id="start-button"
                    type="submit"
                    class="navigation raise"
                    ?loading="${this.gettingManifest}"
                    ?disabled="${this.disableStart}"
                    @click="${(e: InputEvent) => this.start(e)}">Start</sl-button>
                  <p id="demo">Try a <button id="demo-action" aria-label="click here for demo url" @click=${() => this.placeDemoURL()}>demo url</button></p>
                </div>

              </div>
            </form>
          </div>
        </div>
        <companies-packaged></companies-packaged>
        <resource-hub-new></resource-hub-new>
        <success-stories></success-stories>
        <community-hub></community-hub>
      </main>
    `;
  }
}

const demoURL: string = "https://webboard.app";
