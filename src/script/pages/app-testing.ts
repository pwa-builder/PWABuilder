import {
  LitElement,
  css,
  html,
  customElement,
  internalProperty,
} from 'lit-element';
import { Router } from '@vaadin/router';

import { smallBreakPoint } from '../utils/css/breakpoints';

import { runAllTests } from '../services/tests';
import '../components/app-header';

// have to use ts-ignore here as typescript does not understand
// this import yet
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
import style from '../../../styles/animations.css';
import { loadPaintPolyfillIfNeeded } from '../polyfills/css-paint';

@customElement('app-testing')
export class AppTesting extends LitElement {
  @internalProperty() loading = false;
  @internalProperty() currentPhrase =
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
          flex: 0.7;
          display: flex;
          flex-direction: column;
          align-items: center;

          text-align: center;
          font-size: var(--large-font-size);

          animation: 160ms fadeIn linear;

          padding-top: 2em;
          height: 100%;
          width: 100%;
          background: linear-gradient( 
      106.57deg
      , rgba(255, 255, 255, 0.616) 0%, rgba(255, 255, 255, 0.098) 100% );
          backdrop-filter: blur(40px);
        }

        #glass {
          --colors: #888094, #5a5ab7, #d9a0f7, #5d2863, #5b5bb9;
          --min-radius: 30;
          --max-radius: 100;
          --num-circles: 15;
          --min-opacity: 10;
          --max-opacity: 50;
          background-image: paint(circles);
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
          margin-top: 12px;
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

    await loadPaintPolyfillIfNeeded();
    (CSS as any).paintWorklet.addModule('/workers/header-paint.js');
  }

  async runTests(site: string) {
    try {
      const TestResult = await runAllTests(site);
      const search = new URLSearchParams(location.search);
      const siteUrl = search.get('site');

      if (TestResult) {
        // Completes the loading phase
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
          <img
            alt="PWABUilder Logo"
            src="/assets/images/full_header_logo.png"
          />

          <span>${this.currentPhrase}</span>

          ${this.loading ? html`<fast-progress></fast-progress>` : null}
        </div>
      </div>`;
  }
}
