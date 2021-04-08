import {
  LitElement,
  css,
  html,
  customElement,
  internalProperty,
} from 'lit-element';
import { getCurrentBadges, getPossibleBadges } from '../services/badges';

@customElement('app-badges')
export class AppBadges extends LitElement {
  @internalProperty() current_badges:
    | Array<{ name: string; url: string }>
    | undefined;
  @internalProperty() possible_badges:
    | Array<{ name: string; url: string }>
    | undefined;

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
    `;
  }

  constructor() {
    super();
  }

  firstUpdated() {
    this.possible_badges = getPossibleBadges();
    this.current_badges = getCurrentBadges();
  }

  render() {
    return html`
      <div id="badges-container">
        ${this.possible_badges?.map(badge => {
          return html`
            <div class="badge">
              <img .src="${badge.url}" .alt="${badge.name} icon" />

              <span>${badge.name}</span>
            </div>
          `;
        })}
      </div>
    `;
  }
}
