import { LitElement, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('app-toast')
export class AppToast extends LitElement {

  static get styles() {
    return css`
      #toast {
        position: fixed;
        bottom: 16px;
        right: 16px;
        background: slategrey;
        color: white;
        padding: 12px;
        border-radius: 6px;
        font-weight: bold;
        animation-name: slideup;
        animation-duration: 300ms;
      }
      @keyframes slideup {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0px);
        }
      }
      @media(max-width: 450px){
        #toast {
          right: 16px;
          left: 16px;
          text-align: center;
        }
      }
    `
  }

  constructor() {
    super();
  }

  render() {
    return html`
      <div id="toast">
        <slot></slot>
      </div>
    `
  }
}