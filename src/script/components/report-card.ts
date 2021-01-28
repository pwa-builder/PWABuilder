import { LitElement, css, html, customElement } from 'lit-element';

@customElement('report-card')
export class ReportCard extends LitElement {
  static get styles() {
    return css`
      #report-header {
        margin-bottom: 4em;
        margin-top: 4em;
      }

      .accordion-heading-block {
        width: 90vw;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      h3,
      .accordion-heading,
      .accordion-score {
        font-size: 28px;
        font-weight: var(--font-bold);
      }

      .accordion-score {
        margin-right: 12px;
      }

      fast-accordion-item,
      fast-accordion {
        --neutral-divider-rest: #e5e5e5;
      }

      fast-accordion-item::part(button) {
        height: 6em;
      }

      .flipper-button {
        background: white;
        box-shadow: 0 1px 4px 0px rgb(0 0 0 / 25%);
        border-radius: 50%;
        color: var(--primary-color);
      }

      .flipper-button::part(control) {
        font-size: 22px;
      }

      .score-block {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
    `;
  }

  constructor() {
    super();
  }

  render() {
    return html`
      <div>
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
            <fast-accordion-item>
              <div class="accordion-heading-block" slot="heading">
                <span class="accordion-heading">Manifest</span>

                <div class="score-block">
                  <span class="accordion-score">00/40</span>

                  <fast-button class="flipper-button" mode="stealth">
                    <ion-icon name="caret-forward-outline"></ion-icon>
                  </fast-button>
                </div>
              </div>
              Panel one content
            </fast-accordion-item>
            <fast-accordion-item>
              <div class="accordion-heading-block" slot="heading">
                <span class="accordion-heading">Service Worker</span>

                <div class="score-block">
                  <span class="accordion-score">00/40</span>

                  <fast-button class="flipper-button" mode="stealth">
                    <ion-icon name="caret-forward-outline"></ion-icon>
                  </fast-button>
                </div>
              </div>
              Panel two content
            </fast-accordion-item>
            <fast-accordion-item>
              <div class="accordion-heading-block" slot="heading">
                <span class="accordion-heading">Security</span>

                <div class="score-block">
                  <span class="accordion-score">00/40</span>

                  <fast-button class="flipper-button" mode="stealth">
                    <ion-icon name="caret-forward-outline"></ion-icon>
                  </fast-button>
                </div>
              </div>
              Panel three content
            </fast-accordion-item>
          </fast-accordion>
        </div>
      </div>
    `;
  }
}
