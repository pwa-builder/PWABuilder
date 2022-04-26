import { LitElement, css, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';

import { getPossibleBadges, sortBadges } from '../services/badges';

@customElement('app-badges')
export class AppBadges extends LitElement {
  @state() current_badges: Array<{ name: string; url: string }> | undefined;
  @state() possible_badges: Array<{ name: string; url: string }> | undefined;

  duplicate: Array<{ name: string; url: string }> | undefined;

  static get styles() {
    return css`
      #badges-container {
        padding: 14px 12px;
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-gap: 10px;
      }

      .badge {
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      .badge span {
        font-size: 8px;
        font-weight: var(--font-bold);
        text-align: center;
      }

      .locked {
        opacity: 0.3;
      }
    `;
  }

  constructor() {
    super();
  }

  firstUpdated() {
    this.duplicate = sortBadges();
    this.possible_badges = getPossibleBadges();
  }

  render() {
    return html`
      <div id="badges-container">
        ${this.possible_badges?.map(badge => {
          return html`
            <div
              class="${classMap({
                badge: true,
                // @ts-ignore
                // I am ignoring here as this is valid JS, but when I fix the TS error
                // the functionality of this code breaks
                // Justin: Revisit
                locked: this.duplicate.find(dupe => {
                  return badge.name === dupe.name;
                })
                  ? false
                  : true,
              })}"
            >
              <img
                .title="${badge.name}"
                .src="${badge.url}"
                .alt="${badge.name} icon"
              />
            </div>
          `;
        })}
      </div>
    `;
  }
}
