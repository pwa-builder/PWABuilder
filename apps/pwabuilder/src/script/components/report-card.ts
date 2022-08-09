import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { RawTestResult, ScoreEvent } from '../utils/interfaces';

import {
  largeBreakPoint,
  xLargeBreakPoint,
  xxLargeBreakPoint,
  xxxLargeBreakPoint,
  mediumBreakPoint,
  smallBreakPoint,
} from '../utils/css/breakpoints';

import './score-results';
import '../components/app-button';
import { baseOrPublish, getURL } from '../services/app-info';
import { Router } from '@vaadin/router';
import { getOverallScore } from '../services/tests';
import { getPossibleBadges, sortBadges } from '../services/badges';

import { classMap } from 'lit/directives/class-map.js';
import { styleMap } from 'lit/directives/style-map.js';
import { AnalyticsBehavior, recordPWABuilderProcessStep } from '../utils/analytics';

@customElement('report-card')
export class ReportCard extends LitElement {
  @property({ type: Object }) results: RawTestResult | undefined;
  @property({ type: Object }) scoreCardResults: RawTestResult | undefined;

  @state() maniScore = 0;
  @state() swScore = 0;
  @state() securityScore = 0;
  @state() overallScore = 0;

  @state() currentURL: string | undefined;

  @state() pwa_icon: { url: string; locked: boolean } | undefined;
  @state() manifest_icon: { url: string; locked: boolean } | undefined;
  @state() sw_icon: { url: string; locked: boolean } | undefined;
  @state() security_icon: { url: string; locked: boolean } | undefined;

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
        padding-left: 18px;
        padding-right: 32px;
        padding-bottom: 32px;
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

      fast-accordion {
        border-top: none;
      }

      fast-accordion-item::part(icon) {
        display: none;
      }

      fast-accordion-item::part(button) {
        height: 6em;
        width: 70vw;
      }

      .flipper-button {
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 18px;
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
        --button-width: 217px;

        margin-top: 33px;
        margin-bottom: 33px;
      }

      #total-score {
        display: flex;
        flex-direction: column;
        align-items: initial;
        justify-content: initial;

        margin-right: 1.4em;
      }

      #total-score h4 {
        font-size: var(--medium-font-size);
      }

      #package-block {
        --button-width: 127px;

        display: flex;
        justify-content: flex-end;
        margin-top: 40px;
      }

      #package-block fast-anchor {
        width: 152px;
        color: white;
        box-shadow: var(--button-shadow);
        border-radius: var(--button-radius);
      }

      #total-score-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      #total-score-header h4 {
        font-size: var(--medium-font-size);
      }

      #badge-section {
        display: flex;
        align-items: center;
        margin-top: -18px;
      }

      #badge-section img {
        width: 60px;
        margin-left: -10px;
      }

      #badge-text h4 {
        font-size: var(--smallish-font-size);
        margin-bottom: 0;
        margin-top: 0;
      }

      #badge-text p {
        font-size: var(--smallish-font-size);
        font-weight: normal;
        margin-top: 0;
        margin-bottom: 0;
      }

      #overall-score #badge-section img {
        margin-right: 10px;
      }

      .locked {
        opacity: 0.5;
      }

      ${xxxLargeBreakPoint(
        css`
          .accordion-heading-block {
            width: 97em;
          }
        `
      )}

      ${xxLargeBreakPoint(
        css`
          .accordion-heading-block {
            max-width: 83vw;
            width: 83vw;
          }

          #total-score {
            margin-right: 1.2em;
          }
        `
      )}

      ${xLargeBreakPoint(
        css`
          .accordion-heading-block,
          #report-content {
            width: 78vw;
          }

          #total-score {
            width: 72vw;
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

      ${mediumBreakPoint(
        css`
          .accordion-heading-block {
            width: 90vw;
          }

          #package-block {
            justify-content: center;
            margin-bottom: 40px;
          }
        `
      )}

      ${mediumBreakPoint(
        css`
          loading-button {
            --loading-button-height: 64px;
          }
          loading-button::part(underlying-button) {
            --font-size: 22px;
          }
        `,
        'no-lower'
      )}

      ${smallBreakPoint(
        css`
          #main-report-section {
            padding-left: 12px;
            padding-right: 12px;
          }

          .accordion-heading-block {
            width: 90vw;
          }

          #package-block {
            justify-content: center;
            margin-bottom: 40px;
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
      } catch (err) {
        throw new Error(`Error handling results: ${err}`);
      }
    } else {
      this.scoreCardResults = this.results;
    }

    const urlData = getURL();

    if (urlData) {
      this.currentURL = urlData;
    }

    this.overallScore = getOverallScore();

    // Record analysis results to our analytics portal.
    recordPWABuilderProcessStep('url-analyzed', AnalyticsBehavior.ProcessCheckpoint, {
      url: this.currentURL || '',
      score: this.overallScore,
      hasManifest: Array.isArray(this.scoreCardResults.manifest) && this.scoreCardResults.manifest.some(t => t.result === true),
      hasServiceWorker: this.scoreCardResults.service_worker.some(t => t.result === true),
      hasHttps: this.scoreCardResults.security.some(t => t.result === true)
    });

    await this.handleBadges();
  }

  async handleBadges() {
    const possible_badges = getPossibleBadges();
    const achievedBadges = sortBadges();

    if (possible_badges) {
      possible_badges.forEach(badge => {
        if (badge.name === 'PWA') {
          this.pwa_icon = {
            url: badge.url,
            locked: achievedBadges.find(dupe => {
              return badge.name === dupe.name;
            })
              ? false
              : true,
          };
          return;
        } else if (badge.name === 'Manifest') {
          this.manifest_icon = {
            url: badge.url,
            locked: achievedBadges.find(dupe => {
              return badge.name === dupe.name;
            })
              ? false
              : true,
          };
          return;
        } else if (badge.name === 'Service Worker') {
          this.sw_icon = {
            url: badge.url,
            locked: achievedBadges.find(dupe => {
              return badge.name === dupe.name;
            })
              ? false
              : true,
          };
        } else if (badge.name === 'Security') {
          this.security_icon = {
            url: badge.url,
            locked: achievedBadges.find(dupe => {
              return badge.name === dupe.name;
            })
              ? false
              : true,
          };
        }
      });
    }

    return undefined;
  }

  async handleNoResults(): Promise<RawTestResult> {
    return new Promise((resolve, reject) => {
      const rawResultsData = sessionStorage.getItem('results-string');

      if (rawResultsData) {
        const resultsData = JSON.parse(rawResultsData);

        if (resultsData) {
          resolve(resultsData);
        }
      } else {
        reject(new Error('No results passed'));
      }
    });
  }

  opened(targetEl: EventTarget | null, analyticText: string) {
    recordPWABuilderProcessStep(analyticText + "_clicked", AnalyticsBehavior.ProcessCheckpoint);
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
    recordPWABuilderProcessStep("manifest_accordion.manifest_options_button_clicked", AnalyticsBehavior.ProcessCheckpoint);
    const event = new CustomEvent('open-mani-options', {
      detail: {
        open: true,
      },
    });
    this.dispatchEvent(event);
  }

  openSWOptions() {
    recordPWABuilderProcessStep("sw_accordion.sw_options_button_clicked", AnalyticsBehavior.ProcessCheckpoint);
    const event = new CustomEvent('open-sw-options', {
      detail: {
        open: true,
      },
    });
    this.dispatchEvent(event);
  }

  async decideWhereToGo() {
    recordPWABuilderProcessStep("next_button_clicked", AnalyticsBehavior.ProcessCheckpoint);
    const baseOrPublishIffy = await baseOrPublish();

    if (baseOrPublishIffy === 'base') {
      Router.go('/basepackage');
    } else if (baseOrPublishIffy === 'publish') {
      Router.go(`/publish?site=${this.currentURL}`);
    } else {
      Router.go('/basepackage');
    }
  }

  decideScoreColor(score: number, locked?: boolean) {
    if (score === 0) {
      return 'var(--error-color)';
    } else if (locked) {
      return 'var(--warning-color)';
    } else {
      return 'var(--success-color)';
    }
  }

  render() {
    return html`
      <div id="main-report-section">
        <div id="report-content">
          <fast-accordion>
            <fast-accordion-item
              @click="${(ev: Event) => this.opened(ev.target, "manifest-accordian")}"
            >
              <div class="accordion-heading-block" slot="heading">
                <span class="accordion-heading">Manifest</span>

                <div class="score-block">
                  <span
                    class="accordion-score"
                    style=${styleMap({
                      color: this.decideScoreColor(
                        this.maniScore,
                        this.manifest_icon?.locked
                      ),
                    })}
                    >${this.maniScore}</span
                  >

                  <div class="flipper-button" aria-label="caret dropdown" role="button">
                    <ion-icon name="caret-forward-outline"></ion-icon> 
                  </div>                
                  
                </div>
              </div>

              ${this.manifest_icon
                ? html`<div id="badge-section">
                    <img
                      class="${classMap({
                        locked: this.manifest_icon.locked,
                      })}"
                      src="${this.manifest_icon.url}"
                    />

                    <div id="badge-text">
                      ${this.manifest_icon.locked
                        ? html`<h4>
                            Uh oh, your Manifest needs more work before this
                            badge is unlocked
                          </h4>`
                        : html`<h4>You have unlocked the Manifest Badge!</h4>`}
                    </div>
                  </div>`
                : null}
              ${this.scoreCardResults
                ? html`<score-results
                    .testResults="${this.scoreCardResults.manifest}"
                    scoreMessage="PWABuilder has analyzed your Web Manifest, check out the results below. If you are missing something, tap Manifest Options to update your Manifest."
                    @scored="${(ev: CustomEvent) => this.handleManiScore(ev)}"
                  >
                    <app-button
                      @click="${() => this.openManiOptions()}"
                      class="options-button secondary"
                      slot="options-button"
                      >Manifest Options</app-button
                    >
                  </score-results>`
                : null}
            </fast-accordion-item>
            <fast-accordion-item
              @click="${(ev: Event) => this.opened(ev.target, "sw-accordian")}"
            >
              <div class="accordion-heading-block" slot="heading">
                <span class="accordion-heading">Service Worker</span>

                <div class="score-block">
                  <span
                    style=${styleMap({
                      color: this.decideScoreColor(
                        this.swScore,
                        this.sw_icon?.locked
                      ),
                    })}
                    class="accordion-score"
                    >${this.swScore}</span
                  >

                  <div class="flipper-button" aria-label="caret dropdown" role="button">
                    <ion-icon name="caret-forward-outline"></ion-icon> 
                  </div> 
                </div>
              </div>

              ${this.sw_icon
                ? html`<div id="badge-section">
                    <img
                      class="${classMap({
                        locked: this.sw_icon.locked,
                      })}"
                      src="${this.sw_icon.url}"
                    />

                    <div id="badge-text">
                      ${this.sw_icon.locked
                        ? html`<h4>
                            Uh oh, your Service Worker needs more work before
                            this badge is unlocked
                          </h4>`
                        : html`<h4>
                            You have unlocked the Service Worker Badge!
                          </h4>`}
                    </div>
                  </div>`
                : null}
              ${this.scoreCardResults
                ? html`<score-results
                    .testResults="${this.scoreCardResults.service_worker}"
                    scoreMessage="PWABuilder has analyzed your Service Worker, check out the results below. Want to add a Service Worker or check out our pre-built Service Workers? Tap Service Worker Options."
                    @scored="${(ev: CustomEvent) => this.handleSWScore(ev)}"
                  >
                    <app-button
                      @click="${() => this.openSWOptions()}"
                      slot="options-button"
                      class="options-button secondary"
                      >Service Worker Options</app-button
                    >
                  </score-results>`
                : null}
            </fast-accordion-item>
            <fast-accordion-item
              @click="${(ev: Event) => this.opened(ev.target, "security-accordian")}"
            >
              <div class="accordion-heading-block" slot="heading">
                <span class="accordion-heading">Security</span>

                <div class="score-block">
                  <span
                    style=${styleMap({
                      color: this.decideScoreColor(
                        this.securityScore,
                        this.security_icon?.locked
                      ),
                    })}
                    class="accordion-score"
                    >${this.securityScore}</span
                  >

                  <div class="flipper-button" aria-label="caret dropdown" role="button">
                    <ion-icon name="caret-forward-outline"></ion-icon> 
                  </div> 
                </div>
              </div>

              ${this.security_icon
                ? html`<div id="badge-section">
                    <img
                      class="${classMap({
                        locked: this.security_icon.locked,
                      })}"
                      src="${this.security_icon.url}"
                    />

                    <div id="badge-text">
                      ${this.security_icon.locked
                        ? html`<h4>
                            Uh oh, your Security needs more work before this
                            badge is unlocked
                          </h4>`
                        : html`<h4>You have unlocked the Security Badge!</h4>`}
                    </div>
                  </div>`
                : null}
              ${this.scoreCardResults
                ? html`<score-results
                    .testResults="${this.scoreCardResults.security}"
                    scoreMessage="PWABuilder has done a basic analysis of your HTTPS setup. You can use LetsEncrypt to get a free HTTPS certificate, or publish to Azure to get built-in HTTPS support."
                    @scored="${(ev: CustomEvent) =>
                      this.handleSecurityScore(ev)}"
                  ></score-results>`
                : null}
            </fast-accordion-item>
          </fast-accordion>
        </div>

        <div id="overall-score">
          <div id="total-score">
            <div id="total-score-header">
              <h4>Total Score</h4>
              <span
                style=${styleMap({
                  color: this.decideScoreColor(
                    this.overallScore,
                    this.pwa_icon?.locked
                  ),
                })}
                id="overall-score"
                >${this.overallScore}</span
              >
            </div>

            ${this.pwa_icon
              ? html`<div id="badge-section">
                  <img
                    class="${classMap({
                      locked: this.pwa_icon.locked,
                    })}"
                    src="${this.pwa_icon.url}"
                    role="presentation"
                  />

                  <div id="badge-text">
                    ${this.pwa_icon.locked === false
                      ? html`<h4>Congrats!</h4>
                          <p>You have a great PWA!</p>`
                      : html`
                          <h4>Uh Oh</h4>
                          <p>
                            Your PWA needs more work, look above for details.
                          </p>
                        `}
                  </div>
                </div>`
              : null}
          </div>

          <div id="package-block">
            <app-button
              class="navigation"
              @click="${() => this.decideWhereToGo()}"
              >Next</app-button
            >
          </div>
        </div>
      </div>
    `;
  }
}
