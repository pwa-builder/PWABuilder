import { LitElement, css, html } from 'lit';

import { customElement } from 'lit/decorators.js';
import { AnalyticsBehavior, recordPWABuilderProcessStep } from '../utils/analytics';
import '@shoelace-style/shoelace/dist/components/icon/icon.js';
import {
  xSmallBreakPoint,
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
        background: var(--font-color);
        color: #ffffff;
        fill: #ffffff;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-top: 16px;
        padding-bottom: 16px;
        padding-left: 37px;
        padding-right: 37px;
        font-weight: 700;
        font-size: var(--footer-font-size);
      }


      sl-icon {
        font-size: var(--font-size);
        color: #ffffff;
        pointer-events: none;
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
        color: #ffffff;
      }

      #links a:visited {
        color: #ffffff;
      }

      @media screen and (-ms-high-contrast: black-on-white) {
          /* All high contrast styling rules */
          sl-icon {
            color: var(--font-color);
          }
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
            color: #ffffff;
            width: 10em;
          }

          #icons a {
            margin-right: 46px;
          }

          #icons sl-icon {
            font-size: 27px;
            color: #ffffff;
          }
        `
      )}

      ${xSmallBreakPoint(css`
        footer {
          align-items: center;
          display: flex;
          flex-direction: column;
          text-align: center;
          padding: 12px 10px;
          font-size: 10px;
        }

        #icons {
          margin-top: 8px;
        }

        #footer-top span {
          font-size: 10px;
          line-height: 1.4;
        }

        #links {
          margin-top: 8px;
        }

        #links a {
          font-size: 10px;
          margin: 0 6px;
        }
      `)}

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
            >PWABuilder was founded by Microsoft as a community guided, open
            source project to help move PWA adoption forward.</span
          >

          <div id="links">
            <a
              target="_blank"
              rel="noopener"
              href="https://privacy.microsoft.com/en-us/privacystatement"
              @click=${() => recordPWABuilderProcessStep(`footer.privacy_policy_clicked`, AnalyticsBehavior.ProcessCheckpoint)}
              >Our Privacy Statement</a
            >
            <a
              target="_blank"
              rel="noopener"
              href="https://go.microsoft.com/fwlink/?linkid=2259814"
              @click=${() => recordPWABuilderProcessStep(`footer.consumer_health_policy_clicked`, AnalyticsBehavior.ProcessCheckpoint)}
              >Consumer Health Privacy</a
            >
            <a
              target="_blank"
              rel="noopener"
              href="https://github.com/pwa-builder/PWABuilder/blob/master/TERMS_OF_USE.md"
              @click=${() => recordPWABuilderProcessStep(`footer.terms_of_use_clicked`, AnalyticsBehavior.ProcessCheckpoint)}
              >Terms of Use</a
            >
          </div>
        </div>

        <div id="icons">
          <a
            target="_blank"
            rel="noopener"
            appearance="hypertext"
            href="https://github.com/pwa-builder/PWABuilder"
            aria-label="Contribute to our Github, will open in separate tab"
            @click=${() => recordPWABuilderProcessStep(`footer.github_clicked`, AnalyticsBehavior.ProcessCheckpoint)}
          >
            <span title="Contribute to our Github"><sl-icon name="github" role="presentation"></sl-icon></span>
          </a>

          <a
            target="_blank"
            rel="noopener"
            appearance="hypertext"
            href="https://x.com/pwabuilder"
            aria-label="Follow us on X, will open in separate tab"
            @click=${() => recordPWABuilderProcessStep(`footer.twitter_clicked`, AnalyticsBehavior.ProcessCheckpoint)}
          >
            <span title="Follow us on X"><sl-icon name="twitter-x" role="presentation"></sl-icon></span>
          </a>

          <a
            target="_blank"
            rel="noopener"
            appearance="hypertext"
            href="https://www.youtube.com/c/PWABuilder"
            aria-label="Subscribe to our Youtube, will open in separate tab"
            @click=${() => recordPWABuilderProcessStep(`footer.youtube_clicked`, AnalyticsBehavior.ProcessCheckpoint)}
          >
            <span title="Subscribe to our Youtube"><sl-icon name="youtube" role="presentation"></sl-icon></span>
          </a>
        </div>
      </footer>
    `;
  }
}
