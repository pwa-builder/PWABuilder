import {
  LitElement,
  css,
  html,
  customElement,
  property,
  internalProperty,
} from 'lit-element';
import { RawTestResult, ScoreEvent } from '../utils/interfaces';

import {
  largeBreakPoint,
  xLargeBreakPoint,
  smallBreakPoint,
} from '../utils/css/breakpoints';

import './score-results';

@customElement('report-card')
export class ReportCard extends LitElement {
  @property() results: RawTestResult | undefined;
  @property() scoreCardResults: RawTestResult | undefined;

  @internalProperty() maniScore = 0;
  @internalProperty() swScore = 0;
  @internalProperty() securityScore = 0;

  @internalProperty() currentURL: string | undefined;

  maxManiScore = 80;
  maxSWSCore = 20;
  maxSecurityScore = 15;

  static get styles() {
    return css`
      :host {
        width: 100%;
        display: block;
      }

      #main-report-section {
        padding-left: 32px;
        padding-right: 32px;
        padding-bottom: 32px;
      }

      #report-header {
        margin-bottom: 4em;
        margin-top: 4em;
      }

      #report-content {
        --neutral-foreground-hover: black;
      }

      .accordion-heading-block {
        width: 76vw;
        display: flex;
        align-items: center;
        justify-content: space-between;

        color: var(--font-color);
      }

      h3,
      .accordion-heading,
      .accordion-score,
      #overall-score {
        font-size: var(--medium-font-size);
        font-weight: var(--font-bold);
      }

      .accordion-score {
        margin-right: 20px;
      }

      fast-accordion-item,
      fast-accordion {
        --neutral-divider-rest: #e5e5e5;
      }

      fast-accordion-item::part(icon) {
        display: none;
      }

      fast-accordion-item::part(button) {
        height: 6em;
        width: 70vw;
      }

      .flipper-button {
        background: white;
        box-shadow: 0 1px 4px 0px rgb(0 0 0 / 25%);
        border-radius: 50%;
        color: #5231a7;

        height: 32px;
        min-width: 32px;
      }

      .flipper-button ion-icon {
        pointer-events: none;
      }

      .flipper-button ion-icon {
        pointer-events: none;
      }

      .flipper-button::part(control) {
        font-size: 18px;
        padding: 0;
      }

      .flipper-button::part(content) {
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .score-block {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-right: 1.2em;
      }

      .options-button {
        width: 217px;
        float: right;
        margin-right: 4em;
      }

      .options-button::part(underlying-button) {
        background: white;
        color: var(--font-color);
      }

      #total-score {
        display: flex;
        align-items: center;
        justify-content: space-between;

        margin-right: 1.4em;
      }

      #total-score h4 {
        font-size: var(--medium-font-size);
      }

      #package-block {
        display: flex;
        justify-content: flex-end;
        margin-right: 1.2em;
        margin-top: 40px;
      }

      #package-block fast-anchor {
        width: 152px;
        color: white;
        box-shadow: var(--button-shadow);
        border-radius: var(--button-radius);
      }

      ${xLargeBreakPoint(
        css`
          .accordion-heading-block,
          #report-content {
            width: 71vw;
          }

          #total-score {
            width: 70vw;
          }
        `
      )}

      ${largeBreakPoint(
        css`
          .accordion-heading-block {
            width: 90vw;
          }
        `
      )}

      ${smallBreakPoint(
        css`
          #main-report-section {
            padding-left: 12px;
            padding-right: 12px;
          }
        `
      )}
    `;
  }

  constructor() {
    super();
  }

  async firstUpdated() {
    if (!this.results) {
      // Should never really end up here
      // But just in case this component tries to render without results
      // lets attempt to grab the last saved results
      try {
        this.scoreCardResults = await this.handleNoResults();
      }
      catch(err) {
        throw new Error(`Error handling results: ${err}`);
      }
    }
    else {
      this.scoreCardResults = this.results;
    }
  }

  async handleNoResults(): Promise<RawTestResult> {
    return new Promise((resolve, reject) => {
      const rawResultsData = sessionStorage.getItem('results-string');

      if (rawResultsData) {
        const resultsData = JSON.parse(rawResultsData);

        if (resultsData) {
          resolve(resultsData);
        }
      }
      else {
        reject(new Error("No results passed"));
      }
    })
  }

  opened(targetEl: EventTarget | null) {
    console.log(targetEl);

    if (targetEl) {
      const flipperButton = (targetEl as Element).classList.contains(
        'flipper-button'
      )
        ? (targetEl as Element)
        : (targetEl as Element).querySelector('.flipper-button');

      if (flipperButton) {
        if (flipperButton.classList.contains('opened')) {
          flipperButton.animate(
            [
              {
                transform: 'rotate(0deg)',
              },
            ],
            {
              duration: 200,
              fill: 'forwards',
            }
          );

          flipperButton.classList.remove('opened');
        } else {
          flipperButton.classList.add('opened');

          flipperButton.animate(
            [
              {
                transform: 'rotate(0deg)',
              },
              {
                transform: 'rotate(90deg)',
              },
            ],
            {
              duration: 200,
              fill: 'forwards',
            }
          );
        }
      }
    }
  }

  handleManiScore(ev: CustomEvent) {
    this.maniScore = ev?.detail?.score || 0;

    const event = new CustomEvent<ScoreEvent>('mani-scored', {
      detail: {
        score: this.maniScore,
      },
    });
    this.dispatchEvent(event);
  }

  handleSWScore(ev: CustomEvent) {
    this.swScore = ev?.detail?.score || 0;

    const event = new CustomEvent<ScoreEvent>('sw-scored', {
      detail: {
        score: this.swScore,
      },
    });
    this.dispatchEvent(event);
  }

  handleSecurityScore(ev: CustomEvent) {
    this.securityScore = ev?.detail?.score || 0;

    const event = new CustomEvent<ScoreEvent>('security-scored', {
      detail: {
        score: this.securityScore,
      },
    });
    this.dispatchEvent(event);
  }

  openManiOptions() {
    const event = new CustomEvent('open-mani-options', {
      detail: {
        open: true,
      },
    });
    this.dispatchEvent(event);
  }

  openSWOptions() {
    const event = new CustomEvent('open-sw-options', {
      detail: {
        open: true,
      },
    });
    this.dispatchEvent(event);
  }

  render() {
    return html`
      <div id="main-report-section">
        <div id="report-header">
          <h3>The Scoop</h3>

          <p>
            Ready to build your PWA? Tap "Build My PWA" to package your PWA for
            the app stores or tap "Feature Store" to check out the latest web
            components from the PWABuilder team to improve your PWA even
            further!
          </p>
        </div>

        <div id="report-content">
          <fast-accordion>
            <fast-accordion-item
              @click="${(ev: Event) => this.opened(ev.target)}"
            >
              <div class="accordion-heading-block" slot="heading">
                <span class="accordion-heading">Manifest</span>

                <div class="score-block">
                  <span class="accordion-score"
                    >${this.maniScore} / ${this.maxManiScore}</span
                  >

                  <fast-button class="flipper-button" mode="stealth">
                    <ion-icon name="caret-forward-outline"></ion-icon>
                  </fast-button>
                </div>
              </div>

              <app-button
                @click="${() => this.openManiOptions()}"
                class="options-button"
                >Manifest Options</app-button
              >

              ${this.scoreCardResults ? html`<score-results
                .testResults="${this.scoreCardResults.manifest}"
                @scored="${(ev: CustomEvent) => this.handleManiScore(ev)}"
              ></score-results>` : null}
            </fast-accordion-item>
            <fast-accordion-item
              @click="${(ev: Event) => this.opened(ev.target)}"
            >
              <div class="accordion-heading-block" slot="heading">
                <span class="accordion-heading">Service Worker</span>

                <div class="score-block">
                  <span class="accordion-score"
                    >${this.swScore} / ${this.maxSWSCore}</span
                  >

                  <fast-button class="flipper-button" mode="stealth">
                    <ion-icon name="caret-forward-outline"></ion-icon>
                  </fast-button>
                </div>
              </div>
              <app-button
                @click="${() => this.openSWOptions()}"
                class="options-button"
                >Service Worker Options</app-button
              >
              ${this.scoreCardResults ? html`<score-results
                .testResults="${this.scoreCardResults.service_worker}"
                @scored="${(ev: CustomEvent) => this.handleSWScore(ev)}"
              ></score-results>` : null}
            </fast-accordion-item>
            <fast-accordion-item
              @click="${(ev: Event) => this.opened(ev.target)}"
            >
              <div class="accordion-heading-block" slot="heading">
                <span class="accordion-heading">Security</span>

                <div class="score-block">
                  <span class="accordion-score"
                    >${this.securityScore} / ${this.maxSecurityScore}</span
                  >

                  <fast-button class="flipper-button" mode="stealth">
                    <ion-icon name="caret-forward-outline"></ion-icon>
                  </fast-button>
                </div>
              </div>

              ${this.scoreCardResults ? html`<score-results
                .testResults="${this.scoreCardResults.security}"
                @scored="${(ev: CustomEvent) => this.handleSecurityScore(ev)}"
              ></score-results>` : null}
            </fast-accordion-item>
          </fast-accordion>
        </div>

        <div id="overall-score">
          <div id="total-score">
            <h4>Total Score</h4>

            <span id="overall-score">00 / 100</span>
          </div>

          <div id="package-block">
            <fast-anchor href="${`/publish?site=${this.currentURL}`}" appearance="button"
              >Package</fast-anchor
            >
          </div>
        </div>
      </div>
    `;
  }
}
