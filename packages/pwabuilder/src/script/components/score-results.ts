import { LitElement, css, html } from 'lit';

import { customElement, property, state } from 'lit/decorators.js';
import { OrganizedResults, TestResult } from '../utils/interfaces';

import { mediumBreakPoint, smallBreakPoint } from '../utils/css/breakpoints';

@customElement('score-results')
export class ScoreResults extends LitElement {
  @property({ attribute: false }) testResults:
    | Array<TestResult>
    | boolean
    | undefined;
  @property() scoreMessage: string = '';
  @state() organizedResults: OrganizedResults | undefined;

  static get styles() {
    return css`
      h4 {
        font-size: 22px;
      }

      h5 {
        font-size: 18px;
        margin-bottom: 0;
      }

      #score-grid {
        display: grid;
        grid-template-columns: auto auto;
        grid-gap: 0 3em;

        margin-bottom: 16px;
      }

      #mani-scorecard-header p {
        font-size: var(--smallish-font-size);
        line-height: 24px;
      }

      ul {
        list-style: none;
        padding: 0;
      }

      ul li {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 10px;
        font-size: 14px;
      }

      .good-score,
      .bad-score {
        font-weight: var(--font-bold);
      }

      .good-score {
        color: var(--success-color);
      }

      .bad-score {
        color: red;
      }

      ${mediumBreakPoint(
        css`
          #score-grid {
            grid-template-columns: auto;
          }
        `
      )}

      ${smallBreakPoint(
        css`
          #score-grid {
            grid-template-columns: auto;
          }

          #options-block {
            display: flex;
            align-items: center;
            justify-content: center;
          }
        `
      )}
    `;
  }

  constructor() {
    super();
  }

  firstUpdated() {
    this.organizedResults = this.organize();
  }

  organize() {
    const reqResults: Array<TestResult> = [];
    const recResults: Array<TestResult> = [];
    const optionalResults: Array<TestResult> = [];

    if (typeof this.testResults !== 'boolean') {
      this.overallScore(this.testResults);

      this.testResults?.map((result: TestResult) => {
        if (result.category === 'required') {
          reqResults.push(result);
        } else if (result.category === 'recommended') {
          recResults.push(result);
        } else {
          optionalResults.push(result);
        }
      });
    }

    return {
      required: reqResults,
      recommended: recResults,
      optional: optionalResults,
    };
  }

  overallScore(results: Array<TestResult> | undefined) {
    let score = 0;

    if (results && results.length > 0) {
      results.map((result: TestResult) => {
        if (result.result === true) {
          score = score + 10;
        }
      });

      const event = new CustomEvent('scored', {
        detail: {
          score,
        },
      });
      this.dispatchEvent(event);
    }
  }

  render() {
    return html`
      <div>
        <div id="mani-scorecard-header">
          <p>${this.scoreMessage}</p>

          <div id="options-block">
            <slot name="options-button"></slot>
          </div>
        </div>

        <div id="score-grid">
          <div id="required">
            ${this.organizedResults && this.organizedResults.required.length > 0
              ? html` <h5>Required</h5>

                  <ul>
                    ${this.organizedResults.required.map(
                      (result: TestResult) => {
                        return html`
                          <li>
                            <span>${result.infoString}</span>

                            ${result.result === true
                              ? html`<span class="good-score">10</span>`
                              : html`<span class="bad-score">0</span>`}
                          </li>
                        `;
                      }
                    )}
                  </ul>`
              : null}
          </div>
          <div id="recommended">
            ${this.organizedResults &&
            this.organizedResults.recommended.length > 0
              ? html` <h5>Recommended</h5>

                  <ul>
                    ${this.organizedResults.recommended.map(
                      (result: TestResult) => {
                        return html`
                          <li>
                            <span>${result.infoString}</span>

                            ${result.result === true
                              ? html`<span class="good-score">10</span>`
                              : html`<span class="bad-score">0</span>`}
                          </li>
                        `;
                      }
                    )}
                  </ul>`
              : null}
          </div>
          <div id="optional">
            ${this.organizedResults && this.organizedResults.optional.length > 0
              ? html` <h5>Optional</h5>

                  <ul>
                    ${this.organizedResults.optional.map(
                      (result: TestResult) => {
                        return html`
                          <li>
                            <span>${result.infoString}</span>

                            ${result.result === true
                              ? html`<span class="good-score">10</span>`
                              : html`<span class="bad-score">0</span>`}
                          </li>
                        `;
                      }
                    )}
                  </ul>`
              : null}
          </div>
        </div>
      </div>
    `;
  }
}
