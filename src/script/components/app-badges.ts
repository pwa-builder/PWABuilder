import { LitElement, css, html, customElement, internalProperty } from 'lit-element';
import { getCurrentBadges, getPossibleBadges } from '../services/badges';

@customElement('app-badges')
export class AppBadges extends LitElement {

  @internalProperty() current_badges: Array<{name: string, url: string}> | undefined;
  @internalProperty() possible_badges: Array<{name: string, url: string}> | undefined;

  static get styles() {
    return css`
      
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
        ${
          this.current_badges?.map((badge) => {
            return html`
              <img src="${badge.url}" alt="${badge.name} icon">
            `
          })
        }
      </div>
    `;
  }
}
