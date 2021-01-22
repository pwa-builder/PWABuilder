import {
  LitElement,
  css,
  html,
  customElement,
  internalProperty,
} from 'lit-element';
import { Router } from '@vaadin/router';

import { runAllTests } from '../services/tests';
import '../components/app-header';

@customElement('app-testing')
export class AppTesting extends LitElement {
  @internalProperty() loading = false;

  static get styles() {
    return css`
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
    `;
  }

  constructor() {
    super();
  }

  async firstUpdated() {
    const search = new URLSearchParams(location.search);
    const site = search.get('site');

    if (site) {
      this.loading = true;

      const testResults = await runAllTests(site);
      console.log(testResults);

      if (testResults) {
        this.loading = false;
        Router.go(`/reportcard?results=${JSON.stringify(testResults)}`);
      } else {
        this.loading = false;
        // go back to the home page? Not sure
      }
    }
  }

  render() {
    return html` <app-header></app-header>
      <div id="testing-container">
        <img alt="PWABUilder Logo" src="/assets/images/full_header_logo.png" />

        <span>Results coming to you in 3..2..1</span>

        ${this.loading ? html`<fast-progress></fast-progress>` : null}
      </div>`;
  }
}
