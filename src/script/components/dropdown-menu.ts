import { LitElement, css, html, customElement, property } from 'lit-element';
import { classMap } from 'lit-html/directives/class-map';
import { KeyboardKeys } from '../utils/keyboard';

const dropdownComponentClass = 'dropdown-component';

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

      .dropdown-menu,
      fast-button {
        width: 100%;
      }

      fast-menu {
        margin-top: 4px;
      }

      .closed {
        display: none;
      }

      .dropdown-component {
        z-index: 20;
      }

      fast-button::part(control) {
        color: var(--secondary-font-color);
        background: rgba(128, 128, 128, 0.05);
        border-color: var(--secondary-font-color);
        width: 100%;
        justify-content: normal;
      }

      fast-button::part(content) {
        flex-grow: 2;
        text-align: left;
      }

      fast-menu {
        position: absolute;
        padding: 0;
        background-color: #ffffff;
        color: var(--font-color);
        width: 100%;
      }

      fast-menu-item {
        color: var(--font-color);
        margin: 0;
      }

      fast-menu-item:active,
      fast-menu-item:focus-visible,
      fast-menu-item:hover {
        background-color: var(--link-color);
        font-weight: 500;
        color: #ffffff;
      }

      fast-menu-item:active,
      fast-menu-item:focus-visible,
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
      <div
        class="dropdown-menu"
        part="layout"
        @keyup=${this.keyupHandler}
        @focusout=${this.closeMenu}
      >
        <fast-button
          class="menu-button ${dropdownComponentClass}"
          appearance="outline"
          @click=${this.clickMenuButton}
        >
          <span part="menu-text">${this.menuButtonText()}</span>
          <span part="end" slot="end">
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
              class=${classMap({
                'dropdown-component': true,
                'selected': isSelectedItem,
              })}
              @click=${() => this.clickMenuItem(i)}
              data-index=${i}
              tabindex="0"
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

  keyupHandler(event: KeyboardEvent) {
    if (event.key === KeyboardKeys.escape) {
      this.openMenu = false;
    } else if (event.key === KeyboardKeys.enter) {
      const curr = event.composedPath()[0] as HTMLElement;

      if (curr.tagName === 'FAST-MENU-ITEM') {
        this.selectedIndex = Number(curr.dataset.index);
        this.openMenu = false;
      }
    }
  }

  closeMenu(event: FocusEvent) {
    const related = <Element | undefined>event.relatedTarget;

    if (related?.className?.indexOf(dropdownComponentClass) === -1) {
      this.openMenu = false;
    }
  }

  clickMenuItem(index: number) {
    this.selectedIndex = index;
    this.openMenu = false;
  }

  menuClassMap() {
    return classMap({
      'menu': true,
      'dropdown-component': true,
      'closed': !this.openMenu,
    });
  }
}
