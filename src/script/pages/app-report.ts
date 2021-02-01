import {
  LitElement,
  css,
  html,
  customElement,
  internalProperty,
} from 'lit-element';

import '../components/content-header';
import '../components/report-card';

@customElement('app-report')
export class AppReport extends LitElement {
  @internalProperty() TestResult = null;

  static get styles() {
    return css`
      h2 {
        font-size: 44px;
        line-height: 46px;
        max-width: 526px;
      }

      #hero-p {
        font-size: 16px;
        line-height: 24px;
        max-width: 406px;
      }

      content-header::part(header) {
        --header-background: white;
      }

      #report {
        padding: 16px;
      }

      .tab {
        background: var(--background-color);
        color: rgba(41, 44, 58, 1);
      }

      .tab[aria-selected="true"] {
        color: var(--font-color);
        font-weight: var(--font-bold);
      }

      fast-tabs::part(activeIndicator) {
        background: black;
        border-radius: 0;
        height: 2px;
        margin-top: 0;
      }
    `;
  }

  constructor() {
    super();
  }

  firstUpdated() {
    const search = new URLSearchParams(location.search);
    const results = search.get('results');

    if (results) {
      this.TestResult = JSON.parse(results);
      console.log('TestResult', this.TestResult);
    }
  }

  openManiOptions() {
    const maniTab = this.shadowRoot?.querySelector("#mani");
    (maniTab as HTMLButtonElement).click();
  }

  openSWOptions() {
    const maniTab = this.shadowRoot?.querySelector("#sw");
    (maniTab as HTMLButtonElement).click();
  }

  render() {
    return html` <div>
      <content-header>
        <h2 slot="hero-container">Getting down to business.</h2>
        <p id="hero-p" slot="hero-container">
          Description about what is going to take place below and how they are
          on their way to build their PWA. Mention nav bar for help.
        </p>

        <img
          slot="picture-container"
          src="/assets/images/reportcard-header.svg"
          alt="report card header image"
        />
      </content-header>

      <section id="report">
        <fast-tabs activeId="sections">
          <fast-tab class="tab" id="overview">Overview</fast-tab>
          <fast-tab class="tab" id="mani">Manifest Options</fast-tab>
          <fast-tab class="tab" id="sw">Service Worker Options</fast-tab>

          <fast-tab-panel id="overviewPanel">
            <report-card @open-mani-options="${() => this.openManiOptions()}" @open-sw-options="${() => this.openSWOptions()}" .results="${this.TestResult}"></report-card>
          </fast-tab-panel>
        </fast-tabs>
      </section>
    </div>`;
  }
}
