import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import { classMap } from 'lit/directives/class-map.js';
import { localeStrings } from '../../locales';
import { cleanUrl, isValidURL } from '../utils/url';

import '../components/app-header';
import '../components/companies-packaged';
import '../components/resource-hub';
import '../components/success-stories';
import '../components/community-hub';

import { Router } from '@vaadin/router';
import { setProgress } from '../services/app-info';
import { Lazy, ProgressList, Status } from '../utils/interfaces';
import { resetInitialManifest } from '../services/manifest';
import { AnalyticsBehavior, recordPWABuilderProcessStep } from '../utils/analytics';

import '@shoelace-style/shoelace/dist/components/input/input.js';
import '@shoelace-style/shoelace/dist/components/button/button.js';
import { homeStyles } from './app-home.styles';

@customElement('app-home')
export class AppHome extends LitElement {
  @state() siteURL: Lazy<string>;
  @state() gettingManifest = false;
  @state() errorGettingURL = false;
  @state() errorMessage: string | undefined;

  @state() disableStart = true;

  static styles = homeStyles;

  constructor() {
    super();
  }

  async firstUpdated() {
    // Resetting for a new url, keep referrer value
    const referrer = sessionStorage.getItem('ref');
    sessionStorage.clear();
    if (referrer) {
      sessionStorage.setItem('ref', referrer);
    }
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
    if (this.siteURL !== demoURL) {
      sessionStorage.setItem('demoURL', JSON.stringify(false));
    }

    let isValidUrl = false;
    if (this.siteURL) {
      this.gettingManifest = true;
      try {
        this.siteURL = cleanUrl(this.siteURL);
        isValidUrl = isValidURL(this.siteURL);
      } catch (error) {
        isValidUrl = false;
      }

      recordPWABuilderProcessStep('top.entered_link_testing_started', AnalyticsBehavior.ProcessCheckpoint,
        {
          url: this.siteURL,
          valid: isValidUrl
        });

      if (isValidUrl) {
        // ensures we get a new unique id everytime we enter a new url
        // for platform tracking purposes
        if (sessionStorage.getItem('uid')) {
          sessionStorage.removeItem('uid');
        }
        Router.go(`/reportcard?site=${this.siteURL}`);
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

  placeDemoURL() {
    sessionStorage.setItem('demoURL', JSON.stringify(true));
    recordPWABuilderProcessStep("top.DemoURL_clicked", AnalyticsBehavior.ProcessCheckpoint);
    this.siteURL = demoURL;
    let box = this.shadowRoot!.getElementById("input-box");
    (box as HTMLInputElement)!.value = this.siteURL;
    this.analyzeSite();
  }


  render() {
    return html`
      <app-header part="header" .page=${"home"}></app-header>
      <main>
        <div id="home-block">
          <div id="wrapper">
            <h1 id="home-header" slot="hero-container">
              Helping developers build and publish PWAs
            </h1>
            <section id="content-grid" slot="grid-container">
              <div class="intro-grid-item">
                <div class="grid-item-header">
                  <a @click=${() => recordPWABuilderProcessStep("top.PWAStarter_clicked", AnalyticsBehavior.ProcessCheckpoint)} href="https://docs.pwabuilder.com/#/starter/quick-start" target="_blank" rel="noopener" aria-label="Start a new pwa, will open in separate tab">Start a new PWA</a>
                  <img src="/assets/new/arrow.svg" alt="arrow"/>

                </div>
                <p>
                  Looking to build a new Progressive Web App? Checkout all the documentation here.
                </p>
              </div>

              <div class="intro-grid-item">
                <div class="grid-item-header">
                  <a @click=${() => recordPWABuilderProcessStep("home.top.PWAStudio_clicked", AnalyticsBehavior.ProcessCheckpoint)} href="https://aka.ms/install-pwa-studio" target="_blank" rel="noopener" aria-label="Use dev tools, will open a separate tab">Use dev tools</a>
                  <img src="/assets/new/arrow.svg" alt="arrow"/>
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
                    @click="${(e: InputEvent) => this.start(e)}"
                    aria-label="Start your pwa, will redirect to testing page">Start</sl-button>
                  <p id="demo">Try a <button id="demo-action" aria-label="click here for demo url, will redirect to testing page" @click=${() => this.placeDemoURL()}>demo url</button></p>
                </div>

              </div>
            </form>
          </div>
        </div>
        <companies-packaged></companies-packaged>
        <resource-hub></resource-hub>
        <success-stories></success-stories>
        <community-hub></community-hub>
      </main>
    `;
  }
}

const demoURL: string = "https://webboard.app";
