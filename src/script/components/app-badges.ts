import {
  LitElement,
  css,
  html,
  customElement,
  internalProperty,
} from 'lit-element';
import { classMap } from 'lit-html/directives/class-map';

import { getCurrentBadges, getPossibleBadges } from '../services/badges';

@customElement('app-badges')
export class AppBadges extends LitElement {
  @internalProperty() current_badges:
    | Array<{ name: string; url: string }>
    | undefined;
  @internalProperty() possible_badges:
    | Array<{ name: string; url: string }>
    | undefined;

    duplicate: Array<string>;

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
        opacity: 0.5;
      }
    `;
  }

  constructor() {
    super();
  }

  firstUpdated() {
    this.possible_badges = getPossibleBadges();
    this.current_badges = getCurrentBadges();

    const combined: Array<string> = [];

    this.possible_badges.forEach(badge => {
      combined.push(badge.url);
    });

    this.current_badges.forEach(badge => {
      combined.push(badge.url);
    });

    console.log('here in app-badges');

    this.duplicate = combined.reduce(
      (acc: Array<string>, currentValue, index, array) => {
        if (array.indexOf(currentValue) != index && !acc.includes(currentValue))
          acc.push(currentValue);
        return acc;
      },
      []
    );

    console.log('duplicate', this.duplicate);
  }

  render() {
    return html`
      <div id="badges-container">
        ${this.possible_badges?.map(badge => {
          return html`
            <div
              class="badge ${classMap({
                'locked': this.duplicate.includes(badge.url) ? false : true,
              })}"
            >
              <img .src="${badge.url}" .alt="${badge.name} icon" />

              <span>${badge.name}</span>
            </div>
          `;
        })}
      </div>
    `;
  }
}
