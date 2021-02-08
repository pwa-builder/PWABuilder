import {
  LitElement,
  css,
  html,
  customElement,
  internalProperty,
} from 'lit-element';

import '../components/content-header';
import '../components/report-card';
import '../components/manifest-options';
import '../components/sw-picker';

@customElement('app-report')
export class AppReport extends LitElement {
  @internalProperty() resultOfTest = null;
  @internalProperty() swScore = 0;
  @internalProperty() maniScore = 0;
  @internalProperty() securityScore = 0;

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

      .tab[aria-selected='true'] {
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
      this.resultOfTest = JSON.parse(results);
      console.log('resultOfTest', this.resultOfTest);
    }
  }

  openManiOptions() {
    const maniTab = this.shadowRoot?.querySelector('#mani');
    (maniTab as HTMLButtonElement).click();
  }

  openSWOptions() {
    const maniTab = this.shadowRoot?.querySelector('#sw');
    (maniTab as HTMLButtonElement).click();
  }

  openOverview() {
    const overviewTab = this.shadowRoot?.querySelector("#overview");
    (overviewTab as HTMLButtonElement).click();
  }

  handleScoreForDisplay(type: string, score: number) {
    if (type === 'sw') {
      this.swScore = score;
    } else if (type === 'manifest') {
      this.maniScore = score;
    } else if (type === 'security') {
      this.securityScore = score;
    }
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
            <report-card
              @sw-scored="${ev =>
                this.handleScoreForDisplay('sw', ev.detail.score)}"
              @mani-scored="${ev =>
                this.handleScoreForDisplay('manifest', ev.detail.score)}"
              @security-scored="${ev =>
                this.handleScoreForDisplay('manifest', ev.detail.score)}"
              @open-mani-options="${() => this.openManiOptions()}"
              @open-sw-options="${() => this.openSWOptions()}"
              .results="${this.resultOfTest}"
            ></report-card>
          </fast-tab-panel>
          <fast-tab-panel id="manifestPanel">
            <manifest-options></manifest-options>
          </fast-tab-panel>
          <fast-tab-panel id="swPanel">
            <sw-picker @back-to-overview="${() => this.openOverview()}" score="${this.swScore}"></sw-picker>
          </fast-tab-panel>
        </fast-tabs>
      </section>
    </div>`;
  }
}
