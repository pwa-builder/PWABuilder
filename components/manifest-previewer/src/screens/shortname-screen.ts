import { css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { screenBaseStyles, ScreenTemplate } from './screen-template.js';
import './name-screen.js';

@customElement('shortname-screen')
export class ShortnameScreen extends ScreenTemplate {
  static get styles() {
    return [
      screenBaseStyles,
      css`
        .windows-message {
          margin: 100px auto 0px;
          width: 70%;
        }

        .container {
          position: relative;
          width: 260px;
          margin: 70px auto 0;
        }

        .android.container {
          margin-top: 50px;
          width: 225px;
          height: 285px;
          background: linear-gradient(#C08FA7, #E7A0BF);
          border-radius: 10px;
        }

        .android .homescreen {
          width: 100%;
          border-radius: 0 0 15px 15px;
          box-shadow: var(--card-box-shadow);
        }

        .android .icon-and-label-container {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          position: absolute;
          bottom: 140px;
          left: 23px;
          border-radius: 13px;
        }

        .android .app-icon {
          border-radius: 50%;
          width: 44px;
          height: 44px;
        }

        .android .app-name {
          font-size: 12px;
          max-width: 56px;
          min-width: 40px;
          text-align: center;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          text-shadow: 0 0 7px rgb(0 0 0 / 50%);
          color: rgb(255,255,255, 0.85);
        }

        .ios .background {
          width: 100%;
          position: absolute;
          top: 0;
          box-shadow: var(--card-box-shadow);
        }

        .ios .app-name {
          position: absolute;
          top: 79px;
          left: 75px;
          width: 50px;
          text-align: center;
          background-color: rgb(113, 137, 150);
          color: rgb(255, 255, 255);
          font-family: var(--ios-font-family, Arial);
          font-size: 9px;
        }

        .ios .app-icon {
          background-color: rgb(0, 0, 0);
          display: flex;
          align-items: center;
          justify-content: center;
          width: 50px;
          position: absolute;
          top: 27px;
          left: 74px;
          height: 50px;
          border-radius: 11px;
        }

        .ios .app-icon img {
          width: 80%;
        }
      `
    ];
  }


  /**
   * Short name attribute on the manifest.
   */
  @property() shortName?: string;

  /**
   * The URL to use for icon previews, or undefined if the manifest has no
   * icons.
   */
  @property() iconUrl?: string;

  renderWindows() {
    return html`
      <name-screen
      .isInFullScreen=${this.isInFullScreen}
      .platform=${this.platform}
      .appName=${this.shortName}
      .iconUrl=${this.iconUrl}>
      </name-screen>
    `;
  }

  renderAndroid() {
    return html`
      <div
      role="img"
      tabindex="0"
      aria-label="Short name in Android"
      class="android container">
        <div class="icon-and-label-container">
          <div class="icon-container">
            ${this.iconUrl ?
              html`<img alt="Application's icon" src=${this.iconUrl} class="app-icon" />` : null}
          </div>
          <div class="app-name">${this.shortName || 'PWA App'}</div>
          </div>
      </div>
    `;
  }

  renderiOS() {
    return html`
      <div
      role="img"
      tabindex="0"
      aria-label="The short name attribute in iOS"
      class="ios container">
        <img class="background" alt="iOS home screen" src="../assets/images/ios/homemenu.png" />
        <div class="app-name">${this.shortName || 'PWA App'}</div>
        <div class="app-icon">
          ${this.iconUrl ?
            html`<img alt="Application's icon" src=${this.iconUrl} />` :
            null}
        </div>
      </div>
    `;
  }
}
