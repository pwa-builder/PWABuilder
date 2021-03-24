import {
  LitElement,
  css,
  html,
  customElement,
  internalProperty,
} from 'lit-element';
import { classMap } from 'lit-html/directives/class-map';

import { BreakpointValues, xxxLargeBreakPoint, largeBreakPoint } from '../utils/css/breakpoints';

// @ts-ignore
import style from '../../../styles/layout-defaults.css';

import '../components/app-header';
import '../components/app-sidebar';
import '../components/content-header';

@customElement('app-congrats')
export class AppCongrats extends LitElement {
  @internalProperty() mql = window.matchMedia(
    `(min-width: ${BreakpointValues.largeUpper}px)`
  );

  @internalProperty() isDeskTopView = this.mql.matches;

  static get styles() {
    return [
      style,
      css`
        content-header::part(header) {
          display: none;
        }

        #summary-block {
          padding: 16px;
          border-bottom: var(--list-border);

          margin-right: 2em;
        }

        p {
          font-size: var(--font-size);
        }

        h2 {
          font-size: var(--xlarge-font-size);
          line-height: 46px;
          max-width: 526px;
        }

        #hero-p {
          font-size: var(--font-size);
          line-height: 24px;
          max-width: 406px;
        }

        ${xxxLargeBreakPoint(
          css`
            app-sidebar {
              display: block;
            }

            #tablet-sidebar {
              display: none;
            }

            #desktop-sidebar {
              display: block;
            }
          `
        )}

        ${largeBreakPoint(
          css`
            #tablet-sidebar {
              display: block;
            }

            #desktop-sidebar {
              display: none;
            }
          `
        )}
      `,
    ];
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

          <div>
            <content-header>
              <h2 slot="hero-container">Congrats! Your PWA has...</h2>
              <p id="hero-p" slot="hero-container">
                Description about what is going to take place below and how they
                are on their way to build their PWA. Mention nav bar for help.
              </p>

              <img
                slot="picture-container"
                src="/assets/images/reportcard-header.svg"
                alt="congrats header image"
              />
            </content-header>

            <app-sidebar id="tablet-sidebar"></app-sidebar>
          </div>
        </div>
      </div>
    `;
  }
}
