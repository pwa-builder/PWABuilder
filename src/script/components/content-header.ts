import { LitElement, css, html, customElement } from 'lit-element';

import './app-header';

@customElement('content-header')
export class ContentHeader extends LitElement {

  static get styles() {
    return css`
      :host {
      }

      #main-container {
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

      <div part="main-container" id="main-container">
        <section id="content-side">
          <div id="hero-container">
            <slot name="hero-container"></slot>
          </div>

          <slot name="grid-container"></slot>

          <slot name="input-container"></slot>
        </section>

        <section>
          <img src="/assets/images/pwab3d.png" alt="3d version of the PWABuilder logo">
        </section>
      </div>
    `;
  }
}
