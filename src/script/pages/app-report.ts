import {
  LitElement,
  css,
  html,
  customElement,
  internalProperty,
  property
} from 'lit-element';
import { classMap } from 'lit-html/directives/class-map';

import {
  BreakpointValues,
  largeBreakPoint,
  xxxLargeBreakPoint,
  smallBreakPoint,
} from '../utils/css/breakpoints';

import '../components/content-header';
import '../components/report-card';
import '../components/manifest-options';
import '../components/sw-picker';
import '../components/app-header';
import '../components/app-sidebar';

//@ts-ignore
import style from '../../../styles/layout-defaults.css';
import { RawTestResult, ScoreEvent } from '../utils/interfaces';

@customElement('app-report')
export class AppReport extends LitElement {
  @property() resultOfTest: RawTestResult | undefined;

  @internalProperty() swScore = 0;
  @internalProperty() maniScore = 0;
  @internalProperty() securityScore = 0;

  @internalProperty() mql = window.matchMedia(
    `(min-width: ${BreakpointValues.largeUpper}px)`
  );

  @internalProperty() isDeskTopView = this.mql.matches;

  static get styles() {
    return [
      style,
      css`
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

        #tablet-sidebar {
          display: none;
        }

        #desktop-sidebar {
          display: block;
        }

        content-header::part(header) {
          display: none;
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

        ${xxxLargeBreakPoint(
          css`
            #report {
              max-width: 69em;
            }

            app-sidebar {
              display: block;
            }

            #tablet-sidebar {
              display: none;
            }

            #desktop-sidebar {
              display: block;
            }
          `
        )}

        ${largeBreakPoint(
          css`
            #tablet-sidebar {
              display: block;
            }

            #desktop-sidebar {
              display: none;
            }
          `
        )}

        ${smallBreakPoint(
          css`
            fast-tabs::part(tablist) {
              display: none;
            }
          `
        )}
      `,
    ];
  }

  constructor() {
    super();

    this.mql.addEventListener('change', e => {
      this.isDeskTopView = e.matches;
    });
  }

  firstUpdated() {
    const search = new URLSearchParams(location.search);
    const results = search.get('results');

    if (results) {
      /*
        cache results string as we may need this farther in the flow
        if the user needs to be redirected back here.
        Normally this would be because of issues with their manifest
        that are causing issues with packaging
      */
      sessionStorage.setItem('results-string', results);

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
    const overviewTab = this.shadowRoot?.querySelector('#overview');
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
      <app-header></app-header>

      <div
        id="grid"
        class=${classMap({
          'grid-mobile': this.isDeskTopView == false,
        })}
      >
        <app-sidebar id="desktop-sidebar"></app-sidebar>

        <section id="report">
          <content-header>
            <h2 slot="hero-container">Getting down to business.</h2>
            <p id="hero-p" slot="hero-container">
              Description about what is going to take place below and how they
              are on their way to build their PWA. Mention nav bar for help.
            </p>

            <img
              slot="picture-container"
              src="/assets/images/reportcard-header.svg"
              alt="report card header image"
            />
          </content-header>

          <app-sidebar id="tablet-sidebar"></app-sidebar>

          <fast-tabs activeId="sections">
            <fast-tab class="tab" id="overview">Overview</fast-tab>
            <fast-tab class="tab" id="mani">Manifest Options</fast-tab>
            <fast-tab class="tab" id="sw">Service Worker Options</fast-tab>

            <fast-tab-panel id="overviewPanel">
              <report-card
                @sw-scored="${(ev: CustomEvent<ScoreEvent>) =>
                  this.handleScoreForDisplay('sw', ev.detail.score)}"
                @mani-scored="${(ev: CustomEvent<ScoreEvent>) =>
                  this.handleScoreForDisplay('manifest', ev.detail.score)}"
                @security-scored="${(ev: CustomEvent<ScoreEvent>) =>
                  this.handleScoreForDisplay('manifest', ev.detail.score)}"
                @open-mani-options="${() => this.openManiOptions()}"
                @open-sw-options="${() => this.openSWOptions()}"
                .results="${this.resultOfTest}"
              ></report-card>
            </fast-tab-panel>
            <fast-tab-panel id="manifestPanel">
              <manifest-options .score=${this.maniScore}></manifest-options>
            </fast-tab-panel>
            <fast-tab-panel id="swPanel">
              <sw-picker
                @back-to-overview="${() => this.openOverview()}"
                score="${this.swScore}"
              ></sw-picker>
            </fast-tab-panel>
          </fast-tabs>
        </section>
      </div>
    </div>`;
  }
}
