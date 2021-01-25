import {
  LitElement,
  css,
  html,
  customElement,
  internalProperty,
} from 'lit-element';
import { Router } from '@vaadin/router';

import { smallBreakPoint } from '../utils/breakpoints';

import { runAllTests } from '../services/tests';
import '../components/app-header';

//@ts-ignore
import style from '../../../styles/animations.css';

@customElement('app-testing')
export class AppTesting extends LitElement {
  @internalProperty() loading = false;
  @internalProperty() currentPhrase: string =
    'PWABuilder is loading your PWA in the background';

  static get styles() {
    return [
      style,
      css`
        :host {
          display: flex;
          flex-direction: column;
          background: url(/assets/images/background-copy.webp);
          height: 100vh;
          overflow: hidden;
        }

        #testing-container {
          flex: 0.7;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;

          text-align: center;

          animation: 160ms fadeIn linear;
        }

        #testing-container img {
          width: 466px;
        }

        #testing-container fast-progress {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          margin-bottom: 0;
        }

        #testing-container fast-progress::part(progress) {
          border-radius: 0;
        }

        #testing-container span {
          font-weight: var(--font-bold);
          font-size: var(--large-font-size);
          margin-top: 12px;
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
  }

  async runTests(site: string) {
    try {
      const testResults = await runAllTests(site);

      if (testResults) {
        // Completes the loading phase
        // set last phrase and give 300ms to display to user
        // before moving on
        this.loading = false;

        this.currentPhrase = 'Results coming to you in 3..2..1..';
        setTimeout(() => {
          Router.go(`/reportcard?results=${JSON.stringify(testResults)}`);
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
      <div id="testing-container">
        <img alt="PWABUilder Logo" src="/assets/images/full_header_logo.png" />

        <span>${this.currentPhrase}</span>

        ${this.loading ? html`<fast-progress></fast-progress>` : null}
      </div>`;
  }
}
