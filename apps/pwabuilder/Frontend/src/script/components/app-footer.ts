import { LitElement, html } from 'lit';

import { customElement } from 'lit/decorators.js';
import { AnalyticsBehavior, recordPWABuilderProcessStep } from '../utils/analytics';
import { appFooterStyles } from './app-footer.styles';
import '@awesome.me/webawesome/dist/components/icon/icon.js';

@customElement('app-footer')
export class AppFooter extends LitElement {
  static styles = [appFooterStyles];

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
            <span title="Contribute to our Github"><wa-icon name="github" role="presentation"></wa-icon></span>
          </a>

          <a
            target="_blank"
            rel="noopener"
            appearance="hypertext"
            href="https://x.com/pwabuilder"
            aria-label="Follow us on X, will open in separate tab"
            @click=${() => recordPWABuilderProcessStep(`footer.twitter_clicked`, AnalyticsBehavior.ProcessCheckpoint)}
          >
            <span title="Follow us on X"><wa-icon name="twitter-x" role="presentation"></wa-icon></span>
          </a>

          <a
            target="_blank"
            rel="noopener"
            appearance="hypertext"
            href="https://www.youtube.com/c/PWABuilder"
            aria-label="Subscribe to our Youtube, will open in separate tab"
            @click=${() => recordPWABuilderProcessStep(`footer.youtube_clicked`, AnalyticsBehavior.ProcessCheckpoint)}
          >
            <span title="Subscribe to our Youtube"><wa-icon name="youtube" role="presentation"></wa-icon></span>
          </a>
        </div>
      </footer>
    `;
  }
}
