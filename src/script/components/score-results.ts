import { LitElement, css, html, customElement, property, internalProperty } from 'lit-element';

@customElement('score-results')
export class ScoreResults extends LitElement {
  @property() maniTestResults: any | undefined;
  @internalProperty() organizedResults: any | undefined;

  static get styles() {
    return css`
      h4 {
        font-size: 22px;
      }

      #score-grid {
        display: grid;
        grid-template-columns: auto auto;
      }
    `;
  }

  constructor() {
    super();
  }

  firstUpdated() {
    console.log('maniTestResults', this.maniTestResults);

    this.organizedResults = this.organize();
    console.log(this.organizedResults);
  }

  organize() {
    const reqResults: any = [];
    const recResults: any = [];
    const optionalResults: any = [];

    this.maniTestResults.map((result: any) => {
      if (result.category === "required") {
        reqResults.push(result);
      }
      else if (result.category === "recommended") {
        recResults.push(result);
      }
      else {
        optionalResults.push(result);
      }
    });

    return {
      "required": reqResults,
      "recommended": recResults,
      "optional": optionalResults
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
            <h5>Required</h5>

            <ul>
              ${
                this.organizedResults && this.organizedResults.required.length > 0 ?
                  this.organizedResults.required.map((result: any) => {
                    return html`
                      <li>
                        <span>${result.infoString}</span>

                        ${result.result === true ? html`<span class="goodScore">5</span>` : html`<span class="badScore">0</span>`}
                      </li>
                    `
                  })
                 : null
              }
            </ul>
          </div>
          <div id="recommended">
            <h5>Recommended</h5>

            <ul>
              ${
                this.organizedResults && this.organizedResults.recommended.length > 0 ?
                  this.organizedResults.recommended.map((result: any) => {
                    return html`
                      <li>
                        <span>${result.infoString}</span>

                        ${result.result === true ? html`<span class="goodScore">5</span>` : html`<span class="badScore">0</span>`}
                      </li>
                    `
                  })
                 : null
              }
            </ul>
          </div>
          <div id="optional">
             <h5>Optional</h5>

             <ul>
              ${
                this.organizedResults && this.organizedResults.optional.length > 0 ?
                  this.organizedResults.optional.map((result: any) => {
                    return html`
                      <li>
                        <span>${result.infoString}</span>

                        ${result.result === true ? html`<span class="goodScore">5</span>` : html`<span class="badScore">0</span>`}
                      </li>
                    `
                  })
                 : null
              }
            </ul>
          </div>
        </div>
      </div>
    `;
  }
}
