import {
  LitElement,
  css,
  html,
  customElement,
  property,
  internalProperty,
} from 'lit-element';
import { OrganizedResults, TestResult } from '../utils/interfaces';

@customElement('score-results')
export class ScoreResults extends LitElement {
  @property() testResults: Array<TestResult> | undefined;
  @internalProperty() organizedResults: OrganizedResults | undefined;

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

      .bad-score {
        color: red;
      }
    `;
  }

  constructor() {
    super();
  }

  firstUpdated() {
    this.organizedResults = this.organize();
    console.log(this.organizedResults);
  }

  organize() {
    const reqResults: Array<TestResult> = [];
    const recResults: Array<TestResult> = [];
    const optionalResults: Array<TestResult> = [];

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

    return {
      required: reqResults,
      recommended: recResults,
      optional: optionalResults,
    };
  }

  overallScore(results) {
    let score = 0;

    if (results && results.length > 0) {
      results.map((result: TestResult) => {
        if (result.result === true) {
          score = score + 5;
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

  overallScore(results) {
    let score = 0;

    if (results && results.length > 0) {
      results.map((result) => {
        if (result.result === true) {
          score = score + 5;
        }
      })

      const event = new CustomEvent('scored', {
        detail: {
          score
        }
      });
      this.dispatchEvent(event);
    }
  }

  render() {
    return html`
      <div>
        <div id="mani-scorecard-header">
          <h4>Summary</h4>

          <p>
            Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut
            fugit, sed quia consequuntur magni dolores eos qui ratione
            voluptatem sequi nesciunt. ven further!
          </p>
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
                              ? html`<span class="good-score">5</span>`
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
                              ? html`<span class="good-score">5</span>`
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
                              ? html`<span class="good-score">5</span>`
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
