import {
  LitElement,
  css,
  html,
  customElement,
  internalProperty,
  property,
} from 'lit-element';
import { chooseServiceWorker, getServiceWorkers } from '../services/service_worker';

import '../components/app-button';

//@ts-ignore
import style from '../../../styles/list-defaults.css';

@customElement('sw-picker')
export class SWPicker extends LitElement {
  @property({ type: Number }) score = 0;

  @internalProperty() serviceWorkers: any[] | undefined;
  @internalProperty() chosenSW: number | undefined;

  static get styles() {
    return [
      style,
      css`
        :host {
          display: block;
          width: 100%;
        }

        ul {
          margin-top: 4em;
        }

        li {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        h4 {
          font-size: var(--medium-font-size);
          margin-bottom: 12px;
        }

        h5 {
          margin-bottom: 0;
          font-size: 22px;
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
          max-width: 767px;
        }

        #header-block {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        #header-actions {
          display: flex;
          justify-content: flex-end;
        }

        #score-block {
          font-size: var(--medium-font-size);
          font-weight: var(--font-bold);
        }

        .actions #select-button::part(underlying-button) {
          background: white;
          color: var(--font-color);
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

  chooseSW(sw) {
    console.log(sw);
    this.chosenSW = sw.id;

    if (this.chosenSW) {
      chooseServiceWorker(this.chosenSW);
    }
  }

  render() {
    return html`
      <div>
        <div id="sw-spicker-header">
          <div id="header-info">
            <div id="header-block">
              <h4>Service Worker</h4>

              <span id="score-block">${this.score} / 20</span>
            </div>
          </div>

          <div id="summary-block">
            <h5 id="summary">Summary</h5>

            <p>
              Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit
              aut fugit, sed quia consequuntur magni dolores eos qui ratione
              voluptatem sequi nesciunt. ven further!
            </p>

            <div id="header-actions">
              <app-button>Done</app-button>
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
                  ${this.chosenSW === sw.id ? html`<app-button>Remove</app-button>` : html`<app-button id="select-button" @click="${() => this.chooseSW(sw)}">Select</app-button>`}
                </div>
              </li>
            `;
          })}
        </ul>

        <div id="bottom-actions">
          <app-button>Done</app-button>
        </div>
      </div>
    `;
  }
}
