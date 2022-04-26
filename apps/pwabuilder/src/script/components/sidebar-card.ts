import { LitElement, css, html } from 'lit';

import { customElement, property, state } from 'lit/decorators.js';

@customElement('sidebar-card')
export class SidebarCard extends LitElement {
  @property() heading: string = '';

  @state() open = true;

  static get styles() {
    return css`
      :host {
        width: 85%;
        display: block;
      }

      #sidecard-container {
        border: 1px solid #ffffff;
        box-shadow: inset 0px 3.08959px 3.08959px rgb(162 244 204 / 10%);
        border-radius: 6px;
      }

      #sidecard-header {
        padding-left: 8px;
        padding-right: 6px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-top: 6px;
        padding-bottom: 6px;
        background: #c4c4c45e;
      }

      #sidecard-header span {
        font-size: var(--font-size);
        font-weight: var(--font-bold);
      }

      #sidecard-header button {
        background: transparent;
        color: white;
        border: none;
        cursor: pointer;
      }
    `;
  }

  constructor() {
    super();
  }

  collapse() {
    this.open = !this.open;
  }

  render() {
    return html`
      <div id="sidecard-container">
        <div id="sidecard-header">
          <span>${this.heading || ''}</span>

          <button @click="${() => this.collapse()}">
            <ion-icon name="chevron-down-outline"></ion-icon>
          </button>
        </div>

        ${this.open
          ? html`<div id="sidecard-content">
              <slot></slot>
            </div>`
          : null}
      </div>
    `;
  }
}
