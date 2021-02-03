import {
  LitElement,
  css,
  html,
  customElement,
  internalProperty,
  property,
} from 'lit-element';
import { getServiceWorkers } from '../services/service_worker';

import '../components/app-button';

//@ts-ignore
import style from '../../../styles/list-defaults.css';

@customElement('sw-picker')
export class SWPicker extends LitElement {
  @property({ type: Number }) score = 0;

  @internalProperty() serviceWorkers: any[] | undefined;

  static get styles() {
    return [
      style,
      css`
        :host {
          display: block;
          width: 100%;
        }

        li {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        h4 {
          font-size: var(--medium-font-size);
        }

        h5 {
          margin-bottom: 0;
        }

        p {
          font-size: var(--font-size);
          color: var(--font-color);
          max-width: 767px;
        }

        #summary-block {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        #score-block {
          font-size: var(--medium-font-size);
          font-weight: var(--font-bold);
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
      console.log(this.serviceWorkers);
    }
  }

  render() {
    return html`
      <div>
        <div id="sw-spicker-header">
          <div id="header-info">
            <div id="summary-block">
              <h4>Service Worker</h4>

              <span id="score-block">00 / ${this.score}</span>
            </div>
          </div>

          <div id="header-actions">
            <app-button>Done</app-button>
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
                  <app-button>Select</app-button>
                </div>
              </li>
            `;
          })}
        </ul>
      </div>
    `;
  }
}
