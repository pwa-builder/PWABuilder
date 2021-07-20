import { LitElement, css, html } from 'lit';

import { customElement, property, state } from 'lit/decorators.js';
import {
  chooseServiceWorker,
  getServiceWorkers,
  unsetServiceWorker,
} from '../services/service_worker';

import '../components/app-button';

//@ts-ignore
import style from '../../../styles/list-defaults.css';

interface ServiceWorkerChoice {
  id: number;
  title: string;
  description: string;
}

@customElement('sw-picker')
export class SWPicker extends LitElement {
  @property({ type: Number }) score = 0;

  @state() serviceWorkers: ServiceWorkerChoice[] | undefined;
  @state() chosenSW: number | undefined;

  static get styles() {
    return [
      style,
      css`
        :host {
          display: block;
          width: 100%;

          padding: 32px;
        }

        ul {
          margin-top: 23px;
        }

        li {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 35px;
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

        .actions #select-button::part(underlying-button) {
          background: white;
          color: var(--font-color);
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
    const event = new CustomEvent('back-to-overview', {
      detail: {
        open: true,
      },
    });
    this.dispatchEvent(event);
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
              to make building your offline experience easy! Tap "Add to Base Package" on the Service Worker of your choice and then tap "Done".
              The next page will let you download your Base Package, which will include this Service Worker and a Web Manifest, along with instructions on how to 
              inlude the files in your app.
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
                <div class="info">
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
