import {
  LitElement,
  css,
  html,
  customElement,
  internalProperty,
} from 'lit-element';
import { classMap } from 'lit-html/directives/class-map';

import { BreakpointValues } from '../utils/css/breakpoints';

// @ts-ignore
import style from '../../../styles/layout-defaults.css';

@customElement('app-congrats')
export class AppCongrats extends LitElement {
  @internalProperty() mql = window.matchMedia(
    `(min-width: ${BreakpointValues.largeUpper}px)`
  );

  @internalProperty() isDeskTopView = this.mql.matches;

  static get styles() {
    return [style, css``];
  }

  constructor() {
    super();
  }

  render() {
    return html`
      <div>
        <app-header></app-header>

        <div
          id="grid"
          class=${classMap({
            'grid-mobile': this.isDeskTopView == false,
          })}
        >
          <app-sidebar id="desktop-sidebar"></app-sidebar>

          <div></div>
        </div>
      </div>
    `;
  }
}
