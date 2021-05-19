import {
  LitElement,
  css,
  html,
} from 'lit';
import { customElement,
  state, } from "lit/decorators.js"
import { Router } from '@vaadin/router';

import { smallBreakPoint } from '../utils/css/breakpoints';

import { runAllTests } from '../services/tests';
import '../components/app-header';

// have to use ts-ignore here as typescript does not understand
// this import yet
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
import style from '../../../styles/animations.css';

@customElement('app-testing')
export class AppTesting extends LitElement {
  @state() loading = false;
  @state() currentPhrase =
    'PWABuilder is loading your PWA in the background';

  static get styles() {
    return [
      style,
      css`
        :host {
          display: flex;
          flex-direction: column;

          height: calc(100vh - 76px);
          overflow: hidden;

          display: block;
          background: url(/assets/images/glass.jpg);
          background-size: cover;
          background-repeat: no-repeat;
          background-position: right;
          background-color: white;
        }

        #testing-container {
          display: flex;
          flex-direction: column;
          align-items: center;

          text-align: center;
          font-size: var(--large-font-size);

          animation: 160ms fadeIn linear;

          padding-top: 2em;
          width: 100%;
          background-image: url(/assets/images/loading_page.webp);
          height: 100%;
          background-repeat: no-repeat;
          background-position: center;
          justify-content: center;
          background-size: cover;
        }

        #glass {
          height: calc(100% - 66px);
        }

        #testing-container img {
          width: 466px;

          padding-top: 2em;
        }

        #testing-container fast-progress {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          margin-bottom: 0;

          --accent-foreground-rest: var(--primary-purple);
        }

        #testing-container fast-progress::part(progress) {
          border-radius: 0;
        }

        /*#testing-container fast-progress::part(indeterminate-indicator-1), fast-progress::part(indeterminate-indicator-2) {
          background-color: var(--primary-purple);
        }*/

        app-header::part(header) {
          background: transparent;
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          z-index: 2;
          border: none;
        }

        #testing-container span {
          font-weight: var(--font-bold);
          font-size: var(--large-font-size);
          margin-top: 4em;
        }

        app-header::part(header) {
          background: transparent;
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          z-index: 2;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }

          to {
            opacity: 1;
          }
        }

        ${smallBreakPoint(css`
          #testing-container img {
            width: 100%;
          }

          #testing-container span {
            margin-top: 7em;
          }
        `)}
      `,
    ];
  }

  constructor() {
    super();
  }

  async firstUpdated() {
    const search = new URLSearchParams(location.search);
    const site = search.get('site');

    if (site) {
      this.loading = true;
      this.phrasePager();

      await this.runTests(site);
    }
  }

  async runTests(site: string) {
    try {
      const TestResult = await runAllTests(site);
      const search = new URLSearchParams(location.search);
      const siteUrl = search.get('site');

      if (TestResult) {
        // Completes the loading ase
        // set last phrase and give 300ms to display to user
        // before moving on


        this.currentPhrase = 'Results coming to you in 3..2..1..';
        setTimeout(() => {
          Router.go(
            `/reportcard?site=${siteUrl}&results=${JSON.stringify(TestResult)}`
          );
        }, 300);
      } else {
        this.loading = false;
        throw new Error(`Test results could not be gathered for: ${site}`);
      }
    } catch (err) {
      console.error('Tests errored out', err);
      this.loading = false;
    }
  }

  async phrasePager() {
    const phrases = [
      'PWABuilder is loading your PWA in the background...',
      'This may take a minute...',
      'We are analyzing your Service Worker and Web Manifest...',
    ];

    for (let i = 0; i < phrases.length; i++) {
      if (this.loading === true) {
        await this.setPhrase(phrases[i], i);
      }
    }
  }

  setPhrase = (phrase: string, i: number): Promise<void> => {
    return new Promise(resolve => {
      setTimeout(() => {
        this.currentPhrase = phrase;
        resolve();
      }, i * 2000);
    });
  };

  render() {
    return html` <app-header></app-header>
      <div id="glass">
        <div id="testing-container">

          <span>${this.currentPhrase}</span>

          ${this.loading ? html`<fast-progress></fast-progress>` : null}
        </div>
      </div>`;
  }
}
