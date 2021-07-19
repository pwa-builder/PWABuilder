import { LitElement, css, html } from 'lit';
import { property } from 'lit/decorators.js';

import type { Platform } from '../../../utils/interfaces.previewer';

export abstract class ScreenTemplate extends LitElement {
  static styles = css`
    .preview-title {
      margin: 10px auto;
      width: fit-content;
      font-weight: 600;
      font-size: 14px;
      text-align: center;
    }

    .preview-info {
      margin: 0 auto;
      font-weight: 400;
      font-size: 12px;
      line-height: 16px;
      text-align: center;
      color: var(--secondary-font-color);
      width: 230px;
      display: block;
    }

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
      ${this.isInFullScreen ? 
        null : 
        html`
          <slot class="preview-title" name="title"></slot>
          <slot class="preview-info" name="info-${this.platform}"></slot>
        `}
      <div class=${this.isInFullScreen ? 'fullscreen-content' : ''}>
        ${this.mainContent()}
      </div>
    `;
  }
}