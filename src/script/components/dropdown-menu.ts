import { LitElement, css, html, customElement, property } from 'lit-element';
import { classMap } from 'lit-html/directives/class-map';

@customElement('app-dropdown')
export class DropdownMenu extends LitElement {
  @property({ type: Boolean }) openMenu = false;
  @property({ type: Array }) menuItems = [];
  @property({ type: Number }) selectedIndex = -1;
  @property({ type: Number }) default = 0;

  @property({ attribute: 'static-text', type: String })
  staticButtonText = undefined;

  static get styles() {
    return css`
      :root {
      }

      ion-icon {
        vertical-align: middle;
      }

      fast-menu {
        margin-top: 4px;
      }

      .closed {
        display: none;
      }

      fast-button::part(control) {
        color: var(--secondary-font-color);
        background: rgba(128, 128, 128, 0.05);
        border-color: var(--secondary-font-color);
      }

      fast-menu {
        position: absolute;
        padding: 0;
        background-color: #ffffff;
        color: var(--font-color);
      }

      fast-menu-item {
        color: var(--font-color);
        margin: 0;
      }

      fast-menu-item:hover {
        background-color: var(--link-color);
        font-weight: 500;
        color: #ffffff;
      }

      fast-menu-item:hover,
      fast-menu-item.selected::part(content) {
        font-weight: var(--font-bold);
      }
    `;
  }

  constructor() {
    super();
  }

  render() {
    return html`
      <div part="layout" @focusout=${this.closeMenu}>
        <fast-button
          class="menu-button"
          appearance="outline"
          @click=${this.clickMenuButton}
        >
          <span part="menu-text">${this.menuButtonText()}</span>
          <span part="end">
            ${this.openMenu
              ? html`<ion-icon name="chevron-down-outline"></ion-icon>`
              : html`<ion-icon name="chevron-up-outline"></ion-icon>`}
          </span>
        </fast-button>
        <fast-menu class=${this.menuClassMap()}>
          ${this.menuItems.map((item, i) => {
            const isSelectedItem = i === this.selectedIndex;
            return html` <fast-menu-item
              part="menu-item"
              class="${isSelectedItem ? 'selected' : ''}"
              @click=${() => this.clickMenuItem(i)}
            >
              ${isSelectedItem
                ? html`<span slot="start">
                    <ion-icon name="checkmark-outline"></ion-icon>
                  </span> `
                : undefined}
              <span>${item}</span>
            </fast-menu-item>`;
          })}
        </fast-menu>
      </div>
    `;
  }

  menuButtonText() {
    if (this.staticButtonText) {
      return this.staticButtonText;
    }

    if (this.selectedIndex >= 0) {
      return this.menuItems[this.selectedIndex];
    }

    return 'Default';
  }

  clickMenuButton() {
    this.openMenu = !this.openMenu;
  }

  closeMenu() {
    // this.openMenu = false;
  }

  clickMenuItem(index: number) {
    this.selectedIndex = index;
  }

  menuClassMap() {
    return classMap({
      menu: true,
      closed: !this.openMenu,
    });
  }
}
