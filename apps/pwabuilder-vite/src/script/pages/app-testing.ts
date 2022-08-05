import { LitElement, css, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { Router } from '@vaadin/router';

import { smallBreakPoint } from '../utils/css/breakpoints';

import { runAllTests } from '../services/tests';

import '../components/app-header';
import '../components/app-modal';

// have to use ts-ignore here as typescript does not understand
// this import yet
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
import style from '../../../styles/animations.css';

@customElement('app-testing')
export class AppTesting extends LitElement {
  @state() loading = false;
  @state() currentPhrase = 'PWABuilder is loading your PWA in the background';

  @state() errored: boolean = false;
  @state() errorMessage: string | undefined;

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

        .modal-image {
          width: 50px;
        }

        #report-link {
          color: white;
          border-radius: var(--button-radius);
          box-shadow: var(--button-shadow);
          width: 10em;
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

      try {
        await this.runTests(site);
      } catch (err: unknown) {
        this.errored = true;
        this.errorMessage = (err as Error).message || (err as Error).toString();
      }
    }
  }

  async runTests(site: string) {
    try {
      const testResult = await runAllTests(site);
      const search = new URLSearchParams(location.search);
      const siteUrl = search.get('site');

      if (testResult) {
        // Completes the loading ase
        // set last phrase and give 300ms to display to user
        // before moving on

        this.currentPhrase = 'Results coming to you in 3..2..1..';
        setTimeout(() => {
          Router.go(
            `/reportcard?site=${siteUrl}&results=${JSON.stringify(testResult)}`
          );
        }, 300);
      } else {
        this.loading = false;
        throw new Error(`Test results could not be gathered for ${site}`);
      }
    } catch (err) {
      this.loading = false;
      throw new Error(
        `Test results could not be gathered for ${site} because ${err}`
      );
    }
  }

  async phrasePager() {
    const phrases = [
      'PWABuilder is loading your PWA in the background...',
      'This may take a minute...',
      'We are analyzing your Service Worker and Web Manifest...',
      'Checking your icons...',
      'We are analyzing if your app works offline...',
      'If your app does not have a Web Manifest, we are generating one for you...',
    ];

    for (let i = 0; i < phrases.length; i++) {
      if (this.loading === true) {
        const phrase = phrases[i];
        await this.setPhrase(phrase!, i);
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

      <app-modal
        heading="Uh Oh!"
        .body="${this.errorMessage ||
        'There was an error running the tests. Please open an issue using the below link.'}"
        ?open="${this.errored}"
        id="error-modal"
      >
        <img
          class="modal-image"
          slot="modal-image"
          src="/assets/warning.svg"
          alt="warning icon"
        />

        <div slot="modal-actions">
          <fast-anchor
            target="_blank"
            rel="noopener"
            href="https://github.com/pwa-builder/PWABuilder/issues/new/choose"
            id="report-link"
            appearance="button"
            >Report an Issue</fast-anchor
          >
        </div>
      </app-modal>

      <div id="glass">
        <div id="testing-container">
          <span role="status">${this.currentPhrase}</span>

          ${this.loading ? html`<fast-progress></fast-progress>` : null}
        </div>
      </div>`;
  }
}
