import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';

import {
  BreakpointValues,
  mediumBreakPoint,
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

const possible_messages = {
  overview: {
    heading: "Your PWA's report card.",
    supporting:
      'Check out the the Overview below to see if your PWA is store-ready! If not, tap the section that needs work to begin upgrading your PWA.',
  },
  mani: {
    heading: 'Manifest great PWAs.',
    supporting:
      'PWABuilder has analyzed your Web Manifest, check out the results below. If you are missing something, tap Manifest Options to update your Manifest.',
  },
  sw: {
    heading: 'Secret Ingredient: A Service Worker',
    supporting:
      'PWABuilder has analyzed your Service Worker, check out the results below. Want to add a Service Worker or check out our pre-built Service Workers? Tap Service Worker Options.',
  },
};

@customElement('app-report')
export class AppReport extends LitElement {
  @property({ type: Object }) resultOfTest: RawTestResult | undefined;

  @state() swScore = 0;
  @state() maniScore = 0;
  @state() securityScore = 0;

  @state() selectedTab: string = 'overview';
  @state() currentHeader: string = possible_messages.overview.heading;
  @state() currentSupporting: string = possible_messages.overview.supporting;

  @state() mql = window.matchMedia(
    `(min-width: ${BreakpointValues.largeUpper}px)`
  );

  @state() isDeskTopView = this.mql.matches;

  static get styles() {
    return [
      style,
      css`
        h2 {
          font-size: 44px;
          line-height: 46px;
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

        fast-tabs::part(tablist) {
          margin-left: 26px;
        }

        report-card {
          margin-top: 20px;
        }

        manifest-options {
          width: 100%;
        }

        #overview-panel {
          padding-left: 14px;
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

            #report-wrapper {
              max-width: 69em;
              background: white;
            }

            #grid {
              background: white;
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

        ${mediumBreakPoint(
          css`
            .reportCard h2 {
              font-size: 33px;
              margin-top: 0;
              margin-bottom: 1em;
            }

            .reportCard p {
              display: none;
            }

            #desktop-sidebar {
              display: none;
            }

            #tablet-sidebar {
              display: block;
            }
          `
        )}

        ${smallBreakPoint(
          css`
            fast-tabs::part(tablist) {
              display: none;
            }

            .reportCard h2 {
              font-size: 33px;
              margin-top: 0;
              margin-bottom: 1em;
            }

            .reportCard p {
              display: none;
            }

            #desktop-sidebar {
              display: none;
            }

            #tablet-sidebar {
              display: block;
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

  handleTabsEvent(type: 'mani' | 'sw' | 'overview') {
    this.selectedTab = type;

    if (type === 'mani') {
      this.currentHeader = possible_messages.mani.heading;
      this.currentSupporting = possible_messages.mani.supporting;
    } else if (type === 'sw') {
      this.currentHeader = possible_messages.sw.heading;
      this.currentSupporting = possible_messages.sw.supporting;
    } else {
      this.currentHeader = possible_messages.overview.heading;
      this.currentSupporting = possible_messages.overview.supporting;
    }
  }

  render() {
    return html` <div id="report-wrapper">
      <app-header></app-header>

      <div
        id="grid"
        class="${classMap({
          'grid-mobile': this.isDeskTopView == false,
        })}"
      >
        <app-sidebar id="desktop-sidebar"></app-sidebar>

        <section id="report">
          <content-header class="reportCard ${this.selectedTab}">
            <h2 slot="hero-container">${this.currentHeader}</h2>
            <p id="hero-p" slot="hero-container">${this.currentSupporting}</p>
          </content-header>

          <app-sidebar id="tablet-sidebar"></app-sidebar>

          <fast-tabs activeId="sections">
            <fast-tab
              class="tab"
              id="overview"
              @click="${() => this.handleTabsEvent('overview')}"
              >Overview</fast-tab
            >
            <fast-tab
              class="tab"
              id="mani"
              @click="${() => this.handleTabsEvent('mani')}"
              >Manifest Options</fast-tab
            >
            <fast-tab
              class="tab"
              id="sw"
              @click="${() => this.handleTabsEvent('sw')}"
              >Service Worker Options</fast-tab
            >

            <fast-tab-panel id="overview-panel">
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
            <fast-tab-panel id="maniPanel">
              <manifest-options @back-to-overview=${() => this.openOverview()}>
              </manifest-options>
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
