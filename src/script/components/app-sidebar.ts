import { BreakpointValues, mediumBreakPoint, smallBreakPoint } from './../utils/css/breakpoints';
import {
  LitElement,
  css,
  html,
  customElement,
  property,
  internalProperty,
} from 'lit-element';
import { getProgress, getResults, getURL } from '../services/app-info';
import {
  Progress,
  ProgressItem,
  ProgressList,
  RawTestResult,
  Status,
} from '../utils/interfaces';

import { classMap } from 'lit-html/directives/class-map';

@customElement('app-sidebar')
export class AppSidebar extends LitElement {
  static get styles() {
    return css`
      fast-accordion {
        --neutral-foreground-rest: white;
      }

      fast-accordion-item::part(icon) {
        display: none;
      }

      fast-accordion-item::part(button) {
        font-size: 16px;
        font-weight: var(--font-bold);
      }

      .sidebar-item-header {
        display: flex;
      }

      .item-name {
        padding-right: 16px;
      }

      #sidebar-subitems-list {
        list-style: none;
        padding-left: 0;
      }

      #sidebar-subitems-list li {
        font-weight: var(--font-bold);
        padding-left: 23px;
      }

      /*.done::part(button) {
        --neutral-foreground-rest: green
      }*/

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

      #website-tested,
      #your-score {
        font-size: var(--small-font-size);
        margin-top: 1em;
      }

      #website-tested {
        text-align: center;
        color: white;
        text-decoration: none;
      }

      aside.desktop-sidebar img,
      aside.desktop-sidebar #score-progress {
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

      aside.desktop-sidebar hr {
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

        font-size: var(--small-font-size);
        font-weight: var(--font-bold);
      }

      aside.tablet-sidebar .menu > .heading {
        display: flex;
        flex-direction: column;
        align-items: center;
        align-content: center;
        text-transform: capitalize;
        color: var(--light-primary-color);
        margin: 0 0.5rem;
      }

      aside.tablet-sidebar .menu .active {
        color: white;
      }

      aside.tablet-sidebar #score-progress {
        border-right: 1px solid var(--secondary-color);

        width: 44%;
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

      .pending,
      .done,
      .pending::part(heading),
      .done::part(heading) {
        color: rgba(255, 255, 255, 0.5);
      }

      .done ion-icon {
        color: var(--success-color);
      }

      .active::part(heading) {
        background: white;
        color: black;
        padding-left: 23px;
      }

      .done::part(heading),
      .pending::part(heading) {
        background: rgba(255, 255, 255, 0.05);
        padding-left: 23px;
      }

      .active .sidebar-item-header ion-icon {
        color: white;
      }

      .pending .sidebar-item-header ion-icon {
        color: rgb(52 55 68);
      }

      ${
        mediumBreakPoint(css`
          aside.tablet-sidebar, aside.desktop-sidebar {
            display: none;
          }
        `),

        smallBreakPoint(css`
          aside.tablet-sidebar, aside.desktop-sidebar {
            display: none;
          }
        `)
      }

    `;
  }
  constructor() {
    super();
    this.mql.addEventListener('change', e => {
      this.isDeskTopView = e.matches;
    });
  }

  firstUpdated() {
    this.menuItems = getProgress();

    this.current_url = getURL();

    this.results = getResults();
    console.log('results', this.results);

    if (this.results) {
      this.handleResults();
    }
  }

  handleResults() {
    // Check where we are at
    const loc = new URL(location.href);

    // Check for all items done
    this.menuItems?.progress.map(item => {
      if (item.items) {
        const remaining: Array<Progress> = [];

        item.items.map(innerItem => {
          if (innerItem.done !== Status.DONE) {
            remaining.push(item);
          }
        });

        if (loc.pathname === item.location) {
          item.done = Status.ACTIVE;
        } else if (remaining.length === 0) {
          item.done = Status.DONE;
        } else {
          item.done = Status.PENDING;
        }
      }
    });
  }

  @internalProperty() current_url: string | undefined;
  @internalProperty() results: RawTestResult | undefined;
  @internalProperty() menuItems: ProgressList | undefined;

  @property({ type: Object }) mql = window.matchMedia(
    `(min-width: ${BreakpointValues.largeUpper}px)`
  );

  @property({ type: Boolean }) isDeskTopView = this.mql.matches;

  renderIcon(item: Progress | ProgressItem) {
    switch (item.done) {
      case 'active':
        return html`<ion-icon class="icon active" name="ellipse"></ion-icon>`;
      case 'done':
        return html`
          <ion-icon class="icon done" name="checkmark-outline"></ion-icon>
        `;
      case 'pending':
      default:
        return html`<ion-icon class="icon pending" name="ellipse"></ion-icon>`;
    }
  }

  renderDesktopBar() {
    return html`
      <aside class="desktop-sidebar">
        <div id="top-of-menu">
          <img src="/assets/images/sidebar-icon.svg" alt="pwd-icon" />
          <hr />
          <h4>URL tested:</h4>
          <a href="${this.current_url || ''}" id="website-tested"
            >${this.current_url}</a
          >
          <hr />
          <h4 id="your-score">Your PWA Score:</h4>
          <span id="score-number">100</span>
          <span id="score-message">Excellent score!</span>
          <hr />
          <h4 id="score-progress">PWAB Progress</h4>
        </div>

        <fast-accordion class="menu">
          ${this.menuItems?.progress.map(item => {
            return html`
              <fast-accordion-item
                expanded
                class=${classMap({
                  active: item.done === Status.ACTIVE,
                  done: item.done === Status.DONE,
                  pending: item.done === Status.PENDING,
                })}
              >
                <div class="sidebar-item-header" slot="heading">
                  <span class="item-name">${this.renderIcon(item)}</span>
                  <span>${item.header}</span>
                </div>

                <ul id="sidebar-subitems-list">
                  ${item.items.map(item => {
                    return html`
                      <li>
                        <span class="item-name">${this.renderIcon(item)}</span>
                        <span>${item.name}</span>
                      </li>
                    `;
                  })}
                </ul>
              </fast-accordion-item>
            `;
          })}
        </fast-accordion>
      </aside>
    `;
  }

  renderTabletBar() {
    return html`<aside class="tablet-sidebar">
      <img src="/assets/images/sidebar-icon.svg" alt="pwd-icon" />
      <h4 id="score-progress">PWAB Progress</h4>
      <div class="menu">
        ${this.menuItems?.progress.map(
          item =>
            html`<div
              class=${classMap({
                heading: true,
                active: item.done === Status.ACTIVE,
                done: item.done === Status.DONE,
                pending: item.done === Status.PENDING,
              })}
            >
              ${this.renderIcon(item)}
              <span>${item.header}</span>
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

  renderComponent() {
    if (this.isDeskTopView) return this.renderDesktopBar();
    else return this.renderTabletBar();
  }

  render() {
    return html`${this.renderComponent()}`;
  }
}
