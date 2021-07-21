import { LitElement, css, html } from 'lit';
import { property } from 'lit/decorators.js';

import type { Platform } from '../../../utils/interfaces.previewer';

/**
 * General template of each preview screen.
 */
export abstract class ScreenTemplate extends LitElement {
  static styles = css`
    .fullscreen-content {
      transform: scale(2.1);
      margin-top: 10vh;
      max-height: 10vh;
    }
  `;

  @property() platform: Platform = 'windows';

  @property({ type: Boolean }) isInFullScreen = false;

  abstract renderWindows(): void;
  abstract renderAndroid(): void;
  abstract renderiOS(): void;

  private mainContent() {
    switch(this.platform) {
      case 'windows': return this.renderWindows();
      case 'android': return this.renderAndroid();
      case 'iOS': return this.renderiOS();
    }
  }

  render() {
    return html`
      <div class=${this.isInFullScreen ? 'fullscreen-content' : ''}>
        ${this.mainContent()}
      </div>
    `;
  }
}