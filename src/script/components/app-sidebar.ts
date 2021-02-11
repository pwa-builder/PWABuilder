import { BreakpointValues } from './../utils/breakpoints';
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
        height: 100%;
        width: 100%;
        display: flex;
        flex-direction: column;
      }

      #top-of-menu {
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      #website-tested, #your-score {
        font-size: var(--small-font-size);
        margin-top: 1em;
      }

      aside.desktop-sidebar img, aside.desktop-sidebar #score-progress  {
        margin-top: 1em;
        margin-bottom: 1em;
      }

      aside.desktop-sidebar fast-menu {
        margin: 0;
        padding: 0;
        border: none;
        border-radius: 0;
        box-shadow: none;
        display: grid;
        grid-auto-flow: row;
        width: 100%;
      }

      aside.desktop-sidebar h1,
      aside.desktop-sidebar h4,
      aside.desktop-sidebar h5,
      aside.desktop-sidebar p {
        margin: 0;
      }

      aside.desktop-sidebar  hr {
        background-color: var(--secondary-color);
        width: 85%;
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

      .desktop-sidebar #score-number {
        font-size: 72px;
        font-weight: var(--font-bold);
      }

      .desktop-sidebar #score-message,
      .tablet-sidebar #score-message {
        color: var(--success-color);

        font-weight: var(--font-bold);
        margin-top: -1em;
      }

      /** TABLET STYLES */
      aside.tablet-sidebar {
        color: var(--secondary-color);
        background: var(--primary-color);
        height: 50px;
        max-width: 100%;
        display: flex;
        justify-content: space-evenly;
        align-items: center;
        padding: 0.25rem 1rem;
      }

      .tablet-sidebar #score-block {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
      }

      .tablet-sidebar #score-message {
        font-size: var(--font-size);
        margin-top: 0;
      }

      .tablet-sidebar #your-score {
        margin-bottom: 0px;
        margin-top: 0px;
      }

      aside.tablet-sidebar > * {
        padding: 0 0.25rem;
        margin: 0 0.25em;
        display: flex;
        align-items: center;
      }

      aside.tablet-sidebar img {
        max-width: 50px;
        height: 24px;
        width: 24px;
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

      aside.tablet-sidebar #score-progress {
        border-right: 1px solid var(--secondary-color);

        width: 50%;
        height: 100%;
        font-size: var(--small-font-size);
      }

      aside.tablet-sidebar #score-number {
        font-weight: var(--font-bold);
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
      <h4 id="score-progress">PWAB Progress</h4>
      <div class="menu">
        ${this.tabletSidebarItems.map(
          item =>
            html`<div class="heading">
              ${this.renderIcon(item)}
              <span>${item.title}</span>
            </div>`
        )}
      </div>

      <div id="score-block">
        <h4 id="your-score">Your PWA Score</h4>
        <span id="score-number">100</span>
        <span id="score-message">Excellent score!</span>
      </div>
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
        <div id="top-of-menu">
          <img src="/assets/images/sidebar-icon.svg" alt="pwd-icon" />
          <hr />
          <h4>URL tested:</h4>
          <span id="website-tested">www.websitetested.com</span>
          <hr />
          <h4 id="your-score">Your PWA Score:</h4>
          <span id="score-number">100</span>
          <span id="score-message">Excellent score!</span>
          <hr />
          <h4 id="score-progress">PWAB Progress</h4>
        </div>
    
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
