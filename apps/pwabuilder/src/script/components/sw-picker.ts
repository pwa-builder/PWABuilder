import { LitElement, css, html } from 'lit';

import { customElement, property, state } from 'lit/decorators.js';

import {
  chooseServiceWorker,
  downloadServiceWorker,
  getServiceWorkerCode,
  getServiceWorkers,
  unsetServiceWorker,
} from '../services/service_worker';

import '../components/app-button';
import '../components/loading-button';
import '../components/code-editor';

//@ts-ignore
import style from '../../../styles/list-defaults.css';
import { AnalyticsBehavior, recordPWABuilderProcessStep } from '../utils/analytics';

interface ServiceWorkerChoice {
  id: number;
  title: string;
  description: string;
}

@customElement('sw-picker')
export class SWPicker extends LitElement {
  @property({ type: Number }) score = 0;

  @state() protected serviceWorkers: ServiceWorkerChoice[] | undefined;
  @state() protected chosenSW: number | undefined;
  @state() protected serviceWorkerCode: any | undefined;
  @state() protected editorOpened = false;
  @state() protected downloading = false;

  static get styles() {
    return [
      style,
      css`
        :host {
          display: block;
          width: 95%;

          padding: 32px;
        }

        ul {
          margin-top: 23px;
        }

        li {
          border-bottom: solid 1px rgb(229, 229, 229);
        }

        h4 {
          font-size: var(--medium-font-size);
          margin-bottom: 12px;
          margin-top: 12px;
        }

        h5 {
          margin-bottom: 0;
          font-size: 22px;
        }

        #sw-picker-header {
          border-bottom: 0.67681px solid rgb(229, 229, 229);
          padding-bottom: 47px;
        }

        #summary {
          font-size: 22px;
          font-weight: var(--font-bold);
        }

        #summary-block p {
          margin-bottom: 0;
        }

        p {
          font-size: var(--font-size);
          color: var(--font-color);

          max-width: 38em;
        }

        #header-block {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        #header-actions {
          display: flex;
          justify-content: flex-start;
          margin-top: 23px;
        }

        .actions {
          margin-left: 16px;
        }

        .actions #select-button {
          /* matches margin on the test-package button 
            on the publish page for consistency */
          margin-bottom: 15px;
        }

        .actions #select-button::part(underlying-button) {
          background: white;
          color: var(--font-color);
        }

        .actions #download-button::part(underlying-button) {
          width: 100%;
        }

        #bottom-actions {
          display: flex;
          justify-content: flex-end;
          margin-top: 64px;
          margin-bottom: 64px;
        }

        .done-button {
          width: 108px;
        }

        .view-code {
          margin-bottom: 8px;
        }

        .view-code fast-accordion {
          border-color: rgb(229, 229, 229);
          border: none;
        }

        .view-code fast-accordion-item {
          border: none;

          --base-height-multiplier: 20;
        }

        .view-code fast-accordion-item::part(icon) {
          display: none;
        }

        .view-code fast-accordion-item::part(button) {
          color: var(--font-color);
        }

        .view-code .code-editor-collapse-header {
          display: flex;
          align-items: center;
          justify-content: space-between;

          color: var(--font-color);
        }

        .sw-block .info {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .sw-download-button {
          width: 150px;
          height: 40px;
          display: inherit;
        }
      `,
    ];
  }

  constructor() {
    super();
  }

  async firstUpdated() {
    const swData = await getServiceWorkers();

    if (swData) {
      this.serviceWorkers = swData.serviceworkers;
    }
  }

  chooseSW(sw: ServiceWorkerChoice) {
    recordPWABuilderProcessStep("sw_options.sw" + sw.id + "_selected", AnalyticsBehavior.ProcessCheckpoint);
    
    this.chosenSW = sw.id;

    if (this.chosenSW) {
      chooseServiceWorker(this.chosenSW);
    }
  }

  removeSW() {
    unsetServiceWorker();
    this.chosenSW = undefined;
  }

  done() {
    recordPWABuilderProcessStep("sw_options.done_sw_options_clicked", AnalyticsBehavior.ProcessCheckpoint);
    const event = new CustomEvent('back-to-overview', {
      detail: {
        open: true,
      },
    });
    this.dispatchEvent(event);
  }

  resetSWCodeEditor() {
    this.shadowRoot?.querySelectorAll('fast-accordion-item').forEach(item => {
      item.removeAttribute('expanded');
      item.classList.remove('expanded');
    });

    this.shadowRoot?.querySelectorAll('flipper-button').forEach(item => {
      if (item.hasAttribute('opened')) {
        item.removeAttribute('opened');
      }
    });
  }

  manuallyHandleFlipperButton(event: Event) {
    const button =
      (event.target as HTMLElement).querySelector('flipper-button') ||
      (event.target as HTMLElement);

    button.toggleAttribute('opened');
    this.requestUpdate();
  }

  async handleEditorOpened(swID: number, event: Event) {
    recordPWABuilderProcessStep("sw_options.sw" + swID + "_view_code_clicked", AnalyticsBehavior.ProcessCheckpoint);

    // close all the accordions and flipper buttons
    this.resetSWCodeEditor();

    // open the one that was clicked on
    this.manuallyHandleFlipperButton(event);

    // update the service worker code
    const sw_code = await getServiceWorkerCode(swID);

    if (sw_code) {
      this.serviceWorkerCode = sw_code;
    }
  }

  async handleEditorUpdate(swID: number) {
    const sw_code = await getServiceWorkerCode(swID);

    if (sw_code) {
      this.serviceWorkerCode = sw_code;
    }
  }

  async downloadSW(id: number) {
    this.downloading = true;
    await downloadServiceWorker(id);
    this.downloading = false;
  }

  render() {
    return html`
      <div>
        <div id="sw-spicker-header">
          <div id="header-info">
            <div id="header-block">
              <h4>Service Worker</h4>
            </div>
          </div>

          <div id="summary-block">
            <h5 id="summary">Summary</h5>

            <p>
              Choose one of our pre-built Service Workers that utilize
              <a href="https://developers.google.com/web/tools/workbox/"
                >Workbox</a
              >
              to make building your offline experience easy! Tap "Add to Base
              Package" on the Service Worker of your choice and then tap "Done".
              The next page will let you download your Base Package, which will
              include this Service Worker and a Web Manifest, along with
              instructions on how to inlude the files in your app.
            </p>

            <div id="header-actions">
              <app-button class="done-button" @click="${() => this.done()}"
                >Done</app-button
              >
            </div>
          </div>
        </div>

        <ul>
          ${this.serviceWorkers?.map(sw => {
            return html`
              <li>
                <div class="sw-block">
                  <div class="info">
                    <div>
                      <h5>${sw.title}</h5>

                      <p>${sw.description}</p>
                    </div>

                    <div class="actions">
                      ${this.chosenSW === sw.id
                        ? html`<app-button @click="${() => this.removeSW()}"
                            >Remove</app-button
                          >`
                        : html`<app-button
                            id="select-button"
                            @click="${() => this.chooseSW(sw)}"
                            >Add to Base Package</app-button
                          >`}
                    </div>
                  </div>

                  <section class="view-code">
                    <fast-accordion>
                      <fast-accordion-item
                        @click=${($event: Event) =>
                          this.handleEditorOpened(sw.id, $event)}
                      >
                        <div class="code-editor-collapse-header" slot="heading">
                          <h1>View Code</h1>
                          <flipper-button class="large end"></flipper-button>
                        </div>

                        <code-editor
                          copyText="Copy Service Worker"
                          .startText=${this.serviceWorkerCode}
                          @code-editor-update=${() =>
                            this.handleEditorUpdate(sw.id)}
                        >
                          <loading-button
                            .loading=${this.downloading}
                            @click="${() => this.downloadSW(sw.id)}"
                            appearance="outline"
                            class="sw-download-button secondary"
                            .secondary=${true}
                            >Download Service Worker</loading-button
                          >
                        </code-editor>
                      </fast-accordion-item>
                    </fast-accordion>
                  </section>
                </div>
              </li>
            `;
          })}
        </ul>

        <div id="bottom-actions">
          <app-button class="done-button" @click="${() => this.done()}"
            >Done</app-button
          >
        </div>
      </div>
    `;
  }
}
