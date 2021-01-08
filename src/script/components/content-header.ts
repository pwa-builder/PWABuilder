import { LitElement, css, html, customElement } from 'lit-element';

import './app-header';

@customElement('content-header')
export class ContentHeader extends LitElement {

  static get styles() {
    return css`
      :host {
        display: block;
        background: url(/assets/images/background-copy.webp);
      }

      #main-container {
        display: flex;
        align-items: center;
        
        padding-bottom: 91px;
      }

      img {
        margin-left: 30px;
        height: 389px;
        width: 369px;
      }

      @media(max-width: 542px) {
        #content-side {
          padding: 1em;
        }

        #main-container {
          padding-top: initial;
        }

        ::slotted(ul) {
          grid-gap: 10px;
        }
      }

      @media(max-width: 800px) {
        #main-container {
          flex-direction: column;
        }

        img {
          margin-top: 2em;
        }
      }

      @media(max-width: 1024px) {
        img {
          height: 18em;
          width: initial;
        }
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

          <slot part="grid-container" name="grid-container"></slot>

          <slot name="input-container"></slot>
        </section>

        <section>
          <img src="/assets/images/pwab3d.png" alt="3d version of the PWABuilder logo">
        </section>
      </div>
    `;
  }
}
