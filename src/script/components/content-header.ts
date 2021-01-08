import { LitElement, css, html, customElement } from 'lit-element';

import './app-header';

@customElement('content-header')
export class ContentHeader extends LitElement {

  static get styles() {
    return css`
      :host {
      }

      #mainContainer {
        display: flex;
        align-items: center;
        
        padding-bottom: 91px;
      }

      img {
        margin-left: 30px;
      }
    `;
  }

  constructor() {
    super();
  }

  render() {
    return html`
      <app-header></app-header>

      <div part="mainContainer" id="mainContainer">
        <section id="contentSide">
          <div id="heroContainer">
            <slot name="heroContainer"></slot>
          </div>

          <slot name="gridContainer"></slot>

          <slot name="inputContainer"></slot>
        </section>

        <section>
          <img src="/assets/images/pwab3d.png" alt="3d version of the PWABuilder logo">
        </section>
      </div>
    `;
  }
}
