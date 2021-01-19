import { LitElement, css, html, customElement, property } from 'lit-element';

@customElement('app-modal')
export class AppModal extends LitElement {
  @property({ type: Boolean }) open: boolean = false;
  @property({ type: String }) title: string = '';
  @property({ type: String }) body: string = '';

  static get styles() {
    return css`
      #background {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: transparent;
        backdrop-filter: blur(10px);
        z-index: 1;
        display: flex;
        align-items: center;
        justify-content: center;

        animation-name: fadein;
        animation-duration: 280ms;
      }

      #modal {
        background: white;
        margin: 51px;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        padding-left: 16px;
        padding-right: 16px;
        padding-bottom: 45px;
        border-radius: 8px;
        box-shadow: 0px 16px 24px rgba(0, 0, 0, 0.12);

        animation-name: slideup;
        animation-duration: 280ms;
      }

      #modal-header #title {
        font-weight: bold;
        font-size: 28px;
        line-height: 28px;
      }

      #modal-body p {
        font-weight: 300;
        font-size: 14px;
        line-height: 20px;
        color: var(--secondary-font-color);
      }

      #back-button-block {
        width: 100%;
        display: flex;
        justify-content: flex-end;
      }

      #back-button-block fast-button {
        margin-top: 12px;
      }

      #back-button-block fast-button ion-icon {
        height: 2em;
        width: 2em;
        color: #c2c9d1;
      }

      @keyframes fadein {
        from {
          opacity: 0;
        }

        to {
          opacity: 1;
        }
      }

      @keyframes slideup {
        from {
          opacity: 0;
          transform: translateY(10px);
        }

        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `;
  }

  constructor() {
    super();
  }

  close() {
    this.open = false;
  }

  render() {
    if (this.open) {
      return html`
        <div id="background">
          <div id="modal">
            <div id="back-button-block">
              <fast-button
                @click="${() => this.close()}"
                appearance="lightweight"
              >
                <ion-icon name="close"></ion-icon>
              </fast-button>
            </div>

            <section id="modal-header">
              <span id="title">${this.title}</span>
            </section>

            <section id="modal-body">
              <p>${this.body}</p>
            </section>

            <section id="modal-actions">
              <slot name="modal-actions"></slot>
            </section>
          </div>
        </div>
      `;
    } else {
      return null;
    }
  }
}
