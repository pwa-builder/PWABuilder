import { classMap } from 'lit-html/directives/class-map';
import { BreakpointValues } from './../utils/css/breakpoints';
import { LitElement, css, html, customElement, property } from 'lit-element';

enum Status {
  DONE = 'done',
  ACTIVE = 'active',
  PENDING = 'pending',
}
enum ItemType {
  HEADING = 'done',
  SUB_HEADING = 'sub-heading',
}
interface TabLayoutItem {
  title: string;
  status: Status;
  type: ItemType;
  class?: string;
}
@customElement('app-sidebar')
export class AppSidebar extends LitElement {
  static get styles() {
    return css`
      /** DESKTOP STYLES */
      aside.desktop-sidebar {
        color: var(--secondary-color);
        background: var(--primary-color);
        display: grid;
        grid-template-areas: none;
        position: fixed;
        height: 100vh;
        width: 280px;
        place-items: center;
        overflow-x: auto;
      }
      aside.desktop-sidebar img {
        width: calc(100% - 150px);
        margin: 1rem auto;
      }
      aside.desktop-sidebar fast-menu {
        width: 100%;
        margin: 0;
        padding: 0;
        border: none;
        border-radius: 0;
        box-shadow: none;
        display: grid;
        grid-auto-flow: row;
        width: 280px;
      }
      aside.desktop-sidebar h1,
      aside.desktop-sidebar h4,
      aside.desktop-sidebar h5,
      aside.desktop-sidebar p {
        margin: 0;
      }
      aside.desktop-sidebar h4 {
        margin-bottom: 0.5rem;
      }
      aside.desktop-sidebar > hr {
        background-color: var(--secondary-color);
        width: 240px;
      }
      fast-menu.menu > fast-menu-item {
        display: flex;
        justify-content: flex-start;
        width: 100%;
        color: var(--light-primary-color);
        background: var(--primary-color);
        margin: 0;
        border: none;
        border-radius: 0;
        box-shadow: none;
        padding: 1.1rem 2rem;
        text-transform: capitalize;
      }
      fast-menu.menu > fast-menu-item.heading {
        font-weight: bold;
        background: var(--light-primary-color);
      }
      fast-menu.menu > fast-menu-item.active {
        color: var(--primary-color);
        background: var(--secondary-color);
      }
      fast-menu.menu > fast-menu-item.active-cell {
        font-weight: bold;
        color: var(--secondary-color);
      }
      .desktop-sidebar > #score-number {
        font-size: 3rem;
      }
      .desktop-sidebar > #score-message,
      .tablet-sidebar > #score-message {
        color: var(--success-color);
      }

      /** TABLET STYLES */
      aside.tablet-sidebar {
        color: var(--secondary-color);
        background: var(--primary-color);
        height: 50px;
        max-width: 100%;
        display: flex;
        justify-content: space-evenly;
        align-items: stretch;
        padding: 0.25rem 1rem;
      }
      aside.tablet-sidebar > * {
        padding: 0 0.25rem;
        margin: 0 0.25em;
        display: flex;
        align-items: center;
      }
      aside.tablet-sidebar img {
        max-width: 50px;
      }
      aside.tablet-sidebar > h6 {
        font-size: 0.75rem;
      }
      aside.tablet-sidebar .menu {
        display: flex;
        align-items: center;
        border-right: 1px solid var(--secondary-color);
        height: 50px;
      }
      aside.tablet-sidebar .menu > .heading {
        display: flex;
        flex-direction: column;
        align-items: center;
        align-content: center;
        text-transform: capitalize;
        color: var(--light-primary-color);
        font-size: 0.7rem;
        margin: 0 0.5rem;
      }
      aside.tablet-sidebar > #score-progress {
        border-right: 1px solid var(--secondary-color);
      }
      aside.tablet-sidebar > #score-number {
        font-size: 1.5rem;
      }

      /** ICON STYLES */
      .desktop-sidebar .icon {
        margin-right: 0.25rem;
      }
      .tablet-sidebar .icon {
        width: 0.75rem;
        height: 0.75rem;
      }
      .done {
        color: var(--success-color);
      }
      .pending {
        color: var(--light-primary-color);
      }
      .desktop-sidebar .active {
        color: var(--primary-color);
      }
      .tablet-sidebar .active {
        color: var(--secondary-color);
      }
    `;
  }
  constructor() {
    super();
    this.mql.addEventListener('change', e => {
      this.isDeskTopView = e.matches;
    });
  }

  @property({ type: Array }) tabletSidebarItems: TabLayoutItem[] = [
    {
      title: 'test',
      status: Status.DONE,
      type: ItemType.HEADING,
    },
    {
      title: 'review',
      status: Status.ACTIVE,
      type: ItemType.HEADING,
    },
    {
      title: 'publish',
      status: Status.PENDING,
      type: ItemType.HEADING,
    },
    {
      title: 'complete',
      status: Status.PENDING,
      type: ItemType.HEADING,
    },
  ];

  @property({ type: Array }) desktopSidebarItems: TabLayoutItem[] = [
    {
      title: 'test',
      status: Status.DONE,
      type: ItemType.HEADING,
      class: 'done',
    },
    {
      title: 'step 1',
      status: Status.DONE,
      type: ItemType.SUB_HEADING,
      class: 'done',
    },
    {
      title: 'review',
      status: Status.ACTIVE,
      type: ItemType.HEADING,
      class: 'active',
    },
    {
      title: 'publish',
      status: Status.PENDING,
      type: ItemType.HEADING,
      class: 'pending',
    },
    {
      title: 'complete',
      status: Status.PENDING,
      type: ItemType.HEADING,
      class: 'pending',
    },
  ];
  @property({ type: Object }) mql = window.matchMedia(
    `(min-width: ${BreakpointValues.largeUpper}px)`
  );
  @property({ type: Boolean }) isDeskTopView = this.mql.matches;

  renderIcon(item: TabLayoutItem) {
    switch (item.status) {
      case 'active':
        return html`<ion-icon class="icon active" name="ellipse"></ion-icon>`;
      case 'done':
        return html`
          <ion-icon class="icon done" name="checkmark-outline"></ion-icon>
        `;
      case 'pending':
        return html`<ion-icon class="icon pending" name="ellipse"></ion-icon>`;
    }
  }

  renderTabletBar() {
    return html`<aside class="tablet-sidebar">
      <img src="/assets/images/sidebar-icon.svg" alt="pwd-icon" />
      <h6 id="score-progress">PWAB Progress</h6>
      <div class="menu">
        ${this.tabletSidebarItems.map(
          item =>
            html`<div class="heading">
              ${this.renderIcon(item)}
              <span>${item.title}</span>
            </div>`
        )}
      </div>
      <h6>Your PWA Score</h6>
      <h6 id="score-number">100</h6>
      <h6 id="score-message">Excellent!</h6>
    </aside>`;
  }

  renderMenuItem(items: TabLayoutItem[]) {
    return items.map(item => {
      if (item.type === ItemType.HEADING) {
        return html`
          <fast-menu-item class="heading ${item.class}">
            ${this.renderIcon(item)} <span>${item.title}</span></fast-menu-item
          >
        `;
      } else if (item.type === ItemType.SUB_HEADING) {
        return html`
          <fast-menu-item class="${item.class}">
            ${this.renderIcon(item)}<span>${item.title}</span></fast-menu-item
          >
        `;
      }
    });
  }
  renderDesktopBar() {
    return html`
      <aside class="desktop-sidebar">
        <img src="/assets/images/sidebar-icon.svg" alt="pwd-icon" />
        <hr />
        <h4>URL tested:</h4>
        <h5>www.websitetested.com</h5>
        <hr />
        <h5>Your PWA Score:</h5>
        <h1 id="score-number">100</h1>
        <h4 id="score-message">Excellent score!</h4>
        <hr />
        <h4 id="score-progress">PWA Builder Progress</h4>
        <fast-menu class="menu"
          >${this.renderMenuItem(this.desktopSidebarItems)}
        </fast-menu>
      </aside>
    `;
  }

  renderComponent() {
    if (this.isDeskTopView) return this.renderDesktopBar();
    else return this.renderTabletBar();
  }

  render() {
    return html`${this.renderComponent()}`;
  }
}
