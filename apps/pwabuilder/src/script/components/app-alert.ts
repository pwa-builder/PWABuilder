import { LitElement, html, css } from 'lit';

import { customElement, property } from 'lit/decorators.js';

@customElement('app-alert')
export class AppAlert extends LitElement {
  @property({ type: Boolean }) open = false;
  @property({ type: String }) heading = 'Title';

  contextAnimation: Animation | undefined = undefined;
  dialog: Element | null | undefined = undefined;

  static get styles() {
    return css`
      #alert {
        padding-left: 16px;
        padding-right: 16px;
        background: var(--primary-background-color);
        box-shadow: 0px 16px 24px rgba(0, 0, 0, 0.24);
        border-radius: 4px;
        max-width: 300px;
      }

      #alert-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      #alert-header h5 {
        font-size: 20px;
        line-height: 24px;
        font-weight: var(--font-bold);
        margin-top: 12px;
        margin-bottom: 12px;
      }

      #alert-header fast-button ion-icon {
        height: 2em;
        width: 2em;
        color: #c2c9d1;
      }

      #alert-actions {
        display: flex;
        justify-content: flex-end;
        padding-bottom: 20px;
      }
    `;
  }

  constructor() {
    super();
  }

  public async openAlert(xValue: number, yValue: number) {
    this.open = true;
    await this.updateComplete;

    this.dialog = this.shadowRoot?.querySelector('#alert');

    if (this.dialog) {
      (this.dialog as HTMLElement).style.top = `${yValue}px`;
      (this.dialog as HTMLElement).style.left = `${xValue}px`;

      this.contextAnimation = this.dialog.animate(
        [
          { transform: 'translateY(6px)', opacity: 0 },
          { transform: 'translateY(0)', opacity: 1 },
        ],
        {
          duration: 100,
          fill: 'both',
        }
      );
    }
  }

  public async close() {
    if (this.contextAnimation) {
      this.contextAnimation.reverse();
      await this.contextAnimation.finished;
    }

    this.open = false;
  }

  render() {
    if (this.open) {
      return html`
        <div id="alert">
          <div id="alert-header">
            <h5>${this.heading}</h5>
        
            <fast-button @click="${() => this.close()}" appearance="lightweight">
              <ion-icon name="close"></ion-icon>
            </fast-button>
          </div>
        
          <div id="alert-content">
            <slot></slot>
          </div>
        
          <div id="alert-actions">
            <slot name="actions"></slot>
          </div>
        </div>
      `;
    } else {
      return null;
    }
  }
}
