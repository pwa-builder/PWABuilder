import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { langCodes } from '../../locales';
import { fastMenuCss } from '../utils/css/fast-elements';
import { Lazy } from '../utils/interfaces';
import { KeyboardKeys } from '../utils/keyboard';

const dropdownComponentClass = 'dropdown-component';

@customElement('app-dropdown')
export class DropdownMenu extends LitElement {
  @property({ type: Boolean }) openMenu = false;
  @property({ type: Array }) menuItems: Array<string> | Array<langCodes> = [];
  @property({ type: Number }) selectedIndex = 0;

  @property({ attribute: 'static-text', type: String })
  staticButtonText: Lazy<string>;

  static get styles() {
    return [
      css`
        ion-icon {
          vertical-align: middle;
        }
      `,
      fastMenuCss,
      css`
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

          max-height: 15em;
          overflow-x: hidden;
        }

        fast-button:hover {
          background: none;
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
          background-color: var(--primary-background-color);
          color: var(--font-color);
          width: 100%;
          overflow-y: auto;
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
          color: var(--primary-background-color);
        }

        fast-menu-item:active,
        fast-menu-item:focus-visible,
        fast-menu-item:hover,
        fast-menu-item.selected::part(content) {
          font-weight: var(--font-bold);
        }
      `,
    ];
  }

  get value() {
    return this.menuItems[this.selectedIndex];
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

        <fast-menu
          class="${classMap({
            'menu': true,
            'dropdown-component': true,
            'closed': !this.openMenu,
          })}"
        >
          ${this.menuItems.map((item, i) => {
            const isSelectedItem = i === this.selectedIndex;
            return html` <fast-menu-item
              part="menu-item"
              class="${classMap({
                'dropdown-component': true,
                'selected': isSelectedItem,
              })}"
              @click=${() => this.clickMenuItem(i)}
              data-index=${i}
              tabindex="0"
            >
              ${isSelectedItem
                ? html`<span slot="start">
                    <ion-icon name="checkmark-outline"></ion-icon>
                  </span> `
                : undefined}
              <span>${(item as langCodes).formatted || item}</span>
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

    return (this.menuItems[this.selectedIndex] as any)?.formatted
      ? (this.menuItems[this.selectedIndex] as any).formatted
      : this.menuItems[this.selectedIndex];
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
}
