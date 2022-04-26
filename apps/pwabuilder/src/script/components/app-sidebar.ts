import {
  BreakpointValues,
  mediumBreakPoint,
  smallBreakPoint,
} from './../utils/css/breakpoints';
import { LitElement, css, html, TemplateResult } from 'lit';

import { customElement, property, state } from 'lit/decorators.js';

import { getProgress, getResults, getURL } from '../services/app-info';
import {
  Progress,
  ProgressItem,
  ProgressList,
  RawTestResult,
  Status,
} from '../utils/interfaces';

import { classMap } from 'lit/directives/class-map.js';

import './sidebar-card';
import { getOverallScore } from '../services/tests';

import './rating-dial';
import './app-badges';

@customElement('app-sidebar')
export class AppSidebar extends LitElement {
  static get styles() {
    return css`
      sidebar-card {
        margin-top: 20px;
      }

      #badges-card {
        margin-bottom: 20px;
      }

      .sidebar-item-header {
        display: flex;
        font-size: var(--small-font-size);
        font-weight: var(--font-bold);
        padding-bottom: 11px;
        padding-left: 5px;
      }

      .progress-index {
        margin-right: 4px;
      }

      .lastItem .sidebar-item-header {
        padding-bottom: 0;
      }

      .item-name {
        display: flex;
        align-items: center;
        font-size: 11px;

        padding-left: 12px;
      }

      #sidebar-subitems-list {
        list-style: none;
        padding-left: 0;
      }

      #sidebar-subitems-list li {
        font-weight: var(--font-bold);
        padding-left: 23px;
      }

      /** DESKTOP STYLES */
      aside.desktop-sidebar {
        color: var(--secondary-color);
        background: var(--primary-purple);
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

        margin-top: 0;
        margin-bottom: 16px;
        font-weight: var(--font-bold);
        font-size: 9px;
      }

      aside.desktop-sidebar img {
        height: 56px;
        width: 56px;
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

      aside.desktop-sidebar h4 {
        font-size: var(--font-size);
        margin-top: 16px;
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
        color: var(--sidebar-accent);

        font-weight: var(--font-bold);
        margin-top: -1em;
      }

      /** TABLET STYLES */
      aside.tablet-sidebar {
        color: var(--secondary-color);
        background: var(--primary-purple);
        height: 50px;
        max-width: 100%;
        display: flex;
        justify-content: space-evenly;
        align-items: center;
        padding: 0.25rem 0rem;
      }

      aside.tablet-sidebar .done,
      .tablet-sidebar .done::part(heading) {
        color: white !important;
      }

      aside.tablet-sidebar .done ion-icon {
        color: var(--sidebar-accent) !important;
      }

      .tablet-sidebar #score-block {
        display: flex;
        align-items: center;
        justify-content: space-around;
        width: 100%;

        border-right: 1px solid var(--secondary-color);
        padding-right: 20px;
      }

      .tablet-sidebar #score-message {
        font-size: var(--font-size);
        margin-top: 0;
      }

      .tablet-sidebar #your-score {
        margin-bottom: 0px;
        margin-top: 0px;

        font-size: var(--smallish-font-size);
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
        height: 100%;
        font-size: var(--smallish-font-size);

        flex: none;
        width: 32vw;

        display: flex;
        justify-content: center;
      }

      aside.tablet-sidebar #score-number {
        font-weight: var(--font-bold);
      }

      /** ICON STYLES */
      .desktop-sidebar .icon {
        position: relative;
        left: -9.4px;
        height: auto;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 6.18px;

        width: 8px;
        height: 10px;
      }

      .item-name ion-icon {
        height: 10px;
        color: var(--sidebar-color);
        padding-bottom: 3px;
      }

      .tablet-sidebar .icon {
        width: 0.75rem;
        height: 0.75rem;
      }

      .pending,
      .pending::part(heading) {
        color: #A5A8CF;
      }

      .done,
      .done::part(heading) {
        color: var(--sidebar-accent);
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

      #overall-score-block {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-between;
        text-align: center;
        padding: 14px 12px;
      }

      #progress-block {
        padding: 14px 12px;
      }

      #score-header,
      #score-notify {
        font-weight: var(--font-bold);
        font-size: var(--font-size);
      }

      .overall-score {
        border: 2.45288px solid #ffffff;
        width: 100%;
        border-radius: 8px;
        font-weight: var(--font-bold);
        background: linear-gradient(
          118.44deg,
          rgba(52, 41, 102, 0.5) 12.3%,
          rgba(93, 68, 140, 0.5) 38.83%,
          rgba(50, 27, 62, 0.5) 96.92%
        );
        margin-top: 15px;
        margin-bottom: 19px;
        text-align: center;
      }

      .overall-score span {
        vertical-align: sub;
      }

      #plus {
        color: var(--sidebar-accent);
      }

      .tablet-sidebar .overall-score {
        max-width: 64px;
        text-align: center;
      }

      #overall-score-block {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-between;
        text-align: center;
        padding-left: 12px;
        padding-right: 12px;
        padding-top: 14px;
        padding-bottom: 14px;
      }

      #score-header,
      #score-notify {
        font-weight: var(--font-bold);
        font-size: var(--font-size);
      }

      .overall-score {
        border: 2.45288px solid #ffffff;
        width: 100%;
        border-radius: 8px;
        font-weight: var(--font-bold);
        background: linear-gradient(
          118.44deg,
          rgba(52, 41, 102, 0.5) 12.3%,
          rgba(93, 68, 140, 0.5) 38.83%,
          rgba(50, 27, 62, 0.5) 96.92%
        );
        margin-top: 15px;
        margin-bottom: 19px;
        text-align: center;
      }

      #plus {
        color: var(--sidebar-accent);
      }

      .tablet-sidebar .overall-score {
        max-width: 64px;
        text-align: center;
      }

      #overall-score-block,
      #rating-block {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-between;
        text-align: center;
        padding-left: 12px;
        padding-right: 12px;
        padding-top: 14px;
        padding-bottom: 14px;
      }

      #score-header,
      #score-notify {
        font-weight: var(--font-bold);
        font-size: var(--small-font-size);
      }

      .rating-header {
        font-size: var(--small-font-size);
        display: block;
        text-align: center;
        margin-bottom: 8px;
      }

      .overall-score {
        border: 2.45288px solid #ffffff;
        width: 100%;
        border-radius: 8px;
        font-weight: var(--font-bold);
        background: linear-gradient(
          118.44deg,
          rgba(52, 41, 102, 0.5) 12.3%,
          rgba(93, 68, 140, 0.5) 38.83%,
          rgba(50, 27, 62, 0.5) 96.92%
        );
        margin-top: 15px;
        margin-bottom: 19px;
        text-align: center;
      }

      #rating-block .overall-score {
        width: 100%;
        font-weight: var(--font-bold);
        margin-bottom: 14px;
        text-align: center;
        margin-top: -4px;

        background: initial;
        border-radius: initial;
        border: none;
      }

      #plus,
      #top {
        color: var(--sidebar-accent);
      }

      .tablet-sidebar .overall-score {
        max-width: 64px;
        text-align: center;
      }

      ${(mediumBreakPoint(css`
        aside.desktop-sidebar {
          display: none;
        }

        aside.tablet-sidebar {
          flex-direction: row-reverse;
          overflow-x: scroll;
        }

        aside.tablet-sidebar .menu {
          display: none;
        }

        aside.tablet-sidebar #score-progress {
          width: 46%;
          border-right: none;
          overflow-x: scroll;
          white-space: nowrap;
          justify-content: unset;
          align-items: center;
        }

        aside.tablet-sidebar #score-block {
          width: 50%;
        }
      `),
      smallBreakPoint(css`
        aside.desktop-sidebar {
          display: none;
        }

        aside.tablet-sidebar {
          flex-direction: row-reverse;
          overflow-x: scroll;
        }

        aside.tablet-sidebar .menu {
          display: none;
        }

        aside.tablet-sidebar #score-progress {
          width: 46%;
          border-right: none;
          overflow-x: scroll;
          white-space: nowrap;
          justify-content: unset;
          align-items: center;
        }

        aside.tablet-sidebar #score-block {
          width: 50%;
        }
      `))}
    `;
  }

  @state() overallScore = 0;

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

    if (this.results) {
      this.handleResults();
    }

    this.overallScore = getOverallScore();
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

  @state() current_url: string | undefined;
  @state() results: RawTestResult | undefined;
  @state() menuItems: ProgressList | undefined;

  @property({ type: Object }) mql = window.matchMedia(
    `(min-width: ${BreakpointValues.largeUpper}px)`
  );

  @property({ type: Boolean }) isDeskTopView = this.mql.matches;

  renderIcon(item: Progress | ProgressItem): TemplateResult | void {
    if (item.done == 'done') {
      return html`
        <ion-icon class="icon done" name="checkmark-outline"></ion-icon>
      `;
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

          <sidebar-card title="Score">
            <div id="overall-score-block">
              <span id="score-header">Your PWA Score:</span>

              <div class="overall-score"><span>${this.overallScore}</span></div>

              <span id="score-notify">
                ${this.overallScore > 0
                  ? html`<span id="plus">10+</span> added to score`
                  : html`<span id="plus">0+ added to score</span>`}
              </span>
            </div>
          </sidebar-card>

          <sidebar-card title="Progress">
            <div id="progress-block">
              ${this.menuItems?.progress.map((item, index) => {
                return html`
                  <div
                    class="${classMap({
                      active: item.done === Status.ACTIVE,
                      done: item.done === Status.DONE,
                      pending: item.done === Status.PENDING,
                      lastItem: item.header === 'Complete',
                    })}"
                  >
                    <div class="sidebar-item-header" slot="heading">
                      <span class="progress-index">${++index}.</span>
                      <span>${item.header}</span>
                    </div>
                  </div>
                `;
              })}
            </div>
          </sidebar-card>

          <sidebar-card title="Rating">
            <div id="rating-block">
              <span class="rating-header" id="score-header"
                >Your PWA Score compared with other developers</span
              >
              <rating-dial></rating-dial>
            </div>
          </sidebar-card>

          <sidebar-card id="badges-card" title="Badges">
            <app-badges></app-badges>
          </sidebar-card>
        </div>
      </aside>
    `;
  }

  renderTabletBar() {
    return html`<aside class="tablet-sidebar">
      <h4 id="score-progress">${this.current_url}</h4>

      <div id="score-block">
        <h4 id="your-score">PWA Score</h4>
        <span class="overall-score">${this.overallScore}</span>
      </div>

      <div class="menu">
        ${this.menuItems?.progress.map(
          item =>
            html`<div
              class="${classMap({
                heading: true,
                active: item.done === Status.ACTIVE,
                done: item.done === Status.DONE,
                pending: item.done === Status.PENDING,
              })}"
            >
              ${item.done === Status.ACTIVE
                ? html`<ion-icon class="icon active" name="ellipse"></ion-icon>`
                : item.done === Status.DONE
                ? html`${this.renderIcon(item)}`
                : html`<img
                    class="icon other"
                    src="/assets/ellipse-outline.svg"
                    aria-hidden="true"
                  />`}
              <span>${item.header}</span>
            </div>`
        )}
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
