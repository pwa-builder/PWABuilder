import { LitElement, css, html } from 'lit';

import { customElement } from 'lit/decorators.js';

@customElement('companies-packaged')
export class ComapniesPackaged extends LitElement {

  static get styles() {
    return css`
      #success-wrapper {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 100%;
        padding: 2em 0;
        background-color: white;
      }

      #success-title {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: #292C3A;
        margin-bottom: 1em;
      }

      #success-title h2 {
        text-align: center;
        font-size: 1.6em;
        margin: 0;
      }

      #success-title p {
        text-align: center;
        margin: 0;
        font-size: .75em;
      }

    `;
  }

  constructor() {
    super();
  }

  firstUpdated() {
  }


  render() {
    return html`
    <div id="success-wrapper">
      <div id="success-title">
          <h2>Apps Packaged</h2>
          <p>Companies of all sizes—from startups to Fortune 500s—have used PWABuilder to package their PWAs.</p>
      </div>
      <img src="/assets/new/success.svg" alt="Companies with PWAs" />
    </div>
    `;
  }
}
