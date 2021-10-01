import { LitElement, css, html } from 'lit';

import { customElement } from 'lit/decorators.js';

import {
  smallBreakPoint,
  mediumBreakPoint,
  xxxLargeBreakPoint,
} from '../utils/css/breakpoints';

@customElement('app-footer')
export class AppFooter extends LitElement {
  static get styles() {
    return css`
      footer {
        /*temp color*/
        background: #f3f3f3;

        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-top: 16px;
        padding-bottom: 16px;
        padding-left: 37px;
        padding-right: 37px;
        font-weight: 700;
        font-size: var(--small-font-size);
      }

      fast-anchor::part(control) {
        border-bottom: none;
      }

      fast-anchor:focus {
        outline: solid;
        outline-width: 2px;
      }

      ion-icon {
        font-size: var(--font-size);
        color: var(--font-color);
      }

      span {
        max-width: 672px;
        display: block;
      }

      #icons {
        width: 8em;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      #links {
        margin-top: 8px;
      }

      #links a {
        margin-right: 12px;
      }

      ${xxxLargeBreakPoint(
        css`
          footer {
            justify-content: center;
          }

          /* 30em here to line up with rest of
          layout at this size */
          #footer-top {
            margin-right: 30em;
          }
        `
      )}

      ${mediumBreakPoint(
        css`
          footer {
            flex-direction: column;
          }

          #footer-top {
            align-items: center;
            text-align: center;
            display: flex;
            flex-direction: column;
          }

          #links {
            margin-top: 30px;
            margin-bottom: 30px;
          }

          #icons {
            width: 10em;
          }

          #icons fast-anchor {
            margin-right: 46px;
          }

          #icons ion-icon {
            font-size: 27px;
            color: black;
          }
        `
      )}

      ${smallBreakPoint(css`
        footer {
          align-items: center;
          display: flex;
          flex-direction: column;
          text-align: center;
        }

        #icons {
          margin-top: 10px;
        }
      `)}
    `;
  }

  constructor() {
    super();
  }

  render() {
    return html`
      <footer>
        <div id="footer-top">
          <span
            >PWA Builder was founded by Microsoft as a community guided, open
            source project to help move PWA adoption forward.</span
          >

          <div id="links">
            <a
              target="_blank"
              rel="noopener"
              href="https://privacy.microsoft.com/en-us/privacystatement"
              >Our Privacy Statement</a
            >
            <a
              target="_blank"
              rel="noopener"
              href="https://github.com/pwa-builder/PWABuilder/blob/master/TERMS_OF_USE.md"
              >Terms of Use</a
            >
          </div>
        </div>

        <div id="icons">
          <fast-anchor
            target="_blank"
            rel="noopener"
            appearance="hypertext"
            href="https://github.com/pwa-builder/PWABuilder"
          >
            <ion-icon name="logo-github"></ion-icon>
          </fast-anchor>

          <fast-anchor
            target="_blank"
            rel="noopener"
            appearance="hypertext"
            href="https://twitter.com/pwabuilder"
          >
            <ion-icon name="logo-twitter"></ion-icon>
          </fast-anchor>

          <fast-anchor
            target="_blank"
            rel="noopener"
            appearance="hypertext"
            href="https://www.youtube.com/c/PWABuilder"
          >
            <ion-icon name="logo-youtube"></ion-icon>
          </fast-anchor>
        </div>
      </footer>
    `;
  }
}
