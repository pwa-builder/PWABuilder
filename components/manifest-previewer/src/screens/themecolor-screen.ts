import { css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';

import { screenBaseStyles, ScreenTemplate } from './screen-template';
import { getContrastingColor, isDarkColor } from '../utils';
import './display-screen.js';

@customElement('themecolor-screen')
export class ThemecolorScreen extends ScreenTemplate {
  static get styles() {
    return [
      screenBaseStyles,
      css`
        .container {
          position: relative;
          width: 250px;
          margin: 120px auto 0;
        }

        .android .app-box {
          border-radius: 3px 3px 0 0;
          display: flex;
          width: 100%;
          height: 50px;
          background-color: var(--pwa-theme-color, #EBD0FE);
          box-shadow: var(--card-box-shadow);
        }

        .android .app-icon {
          border-radius: 50%;
          width: 40px;
          height: 40px;
          margin: -20px auto 0;
          background-color: #FFF;
        }

        .android .menu-actions {
          display: flex;
          width: 100%;
          justify-content: space-evenly;
          position: absolute;
          bottom: 4px;
          font-family: var(--android-font-family, 'Arial');
          font-size: 12px;
          letter-spacing: 0.3px;
          opacity: 0.7;
        }

        .android .menu-actions span:first-child {
          text-decoration: underline;
        }

        .container.ios {
          margin-top: 60px;
        }

        .ios .phone {
          width: 100%;
          height: 200px;
          position: absolute;
          top: 0px;
          overflow-y: hidden;
          object-fit: cover;
          object-position: top;
        }

        .ios .status-bar {
          position: absolute;
          top: 76px;
          height: 18px;
          left: 19.5px;
          width: 212px;
          background-color: var(--pwa-theme-color, #EBD0FE);
        }

        .ios .status-bar img {
          width: 100%;
          height: 16px;
          overflow-y: hidden;
          object-fit: cover;
          object-position: top;
        }

        .container.windows {
          font-family: var(--windows-font-family, Arial);
          height: 160px;
          border-radius: 5px;
          margin-top: 50px;
          box-shadow: rgb(142 142 142) 0px 0px 8px 0px;
          overflow: hidden;
        }

        .windows .title-bar {
          z-index: 1;
          display: flex;
          justify-content: space-between;
          background-color: var(--pwa-theme-color, #EBD0FE);
          padding: 5px;
        }

        .windows .nav-actions {
          display: flex;
          align-items: center;
        }

        .windows .nav-actions img {
          width: 16px;
          height: 16px;
          margin: 4px 2px 0;
          opacity: 0.8;
        }

        .windows .nav-actions svg {
          margin: 4px 5px 0;
        }

        .windows .nav-actions .collapse {
          margin: 4px 5px 0;
          width: 12px;
          height: 1px;
        }

        .windows .nav-actions .enlarge {
          margin: 4px 5px 0;
          width: 12px;
          height: 12px;
          border-width: 1px;
          border-style: solid;
        }

        .windows .title-bar .app-name {
          margin: 4px;
          text-overflow: ellipsis;
          white-space: nowrap;
          overflow: hidden;
          flex: 1;
          text-align: center;
        }

        @media(max-width: 1366px) {
          .windows .titlebar {
            bottom: 16px;
          }

          .android .app-box {
            height: 45px;
          }

          .android .app-icon {
            width: 30px;
            height: 30px;
            margin: -15px auto 0;
          }

          .android .menu-actions {
            font-size: 10px;
          }
        }
      `
    ];
  }

  /**
   * Theme color attribute on the manifest.
   * To avoid showing the placeholder images, avoid 'transparent' color
   */
  private _themeColor = '';

  set themeColor(val: string) {
    const oldVal = this._themeColor;
    this._themeColor = val === 'none' || val === 'transparent' ? 'darkGray' : val;
    this.contrastingColor = this.themeColor ? getContrastingColor(this.themeColor) : '#FFF';
    this.isLightThemeColor = this.themeColor ? !isDarkColor(this.themeColor) : false;
    this.requestUpdate('themeColor', oldVal);
  }

  @property()
  get themeColor() { return this._themeColor; }

  /**
   * Name attribute on the manifest.
   */
  @property() appName?: string;

  /**
   * The icon to use for Android's task switcher.
   */
  @property() iconUrl?: string;

  /**
   * The color to use on top of the theme color, such that the text is visible.
   */
  @state() private contrastingColor = '';

  /**
   * Whether the color used on top of the theme color is light or dark.
   */
  @state() private isLightThemeColor: boolean = false;

  get backArrowUrl(): string {
    if (this.isLightThemeColor) {
      return "../assets/images/windows/backarrow-dark.svg";
    }

    return "../assets/images/windows/backarrow-light.svg";
  }

  get refreshArrowUrl(): string {
    if (this.isLightThemeColor) {
      return "../assets/images/windows/refresharrow-dark.svg";
    }

    return "../assets/images/windows/refresharrow-light.svg";
  }

  firstUpdated() {
    this.contrastingColor = this.themeColor ? getContrastingColor(this.themeColor) : '#FFF';
  }

  renderWindows() {
    return html`
      <div role="img" tabindex="0" aria-label="Theme color use in Windows" class="windows container">
        <div
        class="title-bar"
        style=${styleMap({ '--pwa-theme-color': this.themeColor })}>
          <div class="nav-actions">
            <img alt="Go back" src="${this.backArrowUrl}" />
            <img alt="Refresh page" src="${this.refreshArrowUrl}" />
          </div>
          <span class="app-name" style=${styleMap({ color: this.contrastingColor })}>
            ${this.appName}
          </span>
          <div role="img" aria-label="Navigation actions" class="nav-actions">
            <div
            class="collapse"
            style=${styleMap({ backgroundColor: this.contrastingColor })}>
            </div>
            <div
            class="enlarge"
            style=${styleMap({ borderColor: this.contrastingColor })}>
            </div>
            <svg
            class="close"
            width="12px"
            height="12px"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 1000 1000" enable-background="new 0 0 1000 1000" xml:space="preserve">
              <g><path style="fill:${this.contrastingColor}" d="M990,61.2L933.3,5.1L500,443.3L66.7,5.1L10,61.2L443.9,500L10,938.8l56.7,56.1L500,556.7l433.3,438.2l56.7-56.1L556.1,500L990,61.2z"/></g>
            </svg>
          </div>
        </div>
      </div>
    `;
  }

  renderAndroid() {
    return html`
      <div role="img" tabindex="0" aria-label="Theme color use in Android" class="container android">
        <div class="app-box" style=${styleMap({ '--pwa-theme-color': this.themeColor })}>
          ${this.iconUrl ?
          html`<img class="app-icon" alt="Application's icon" src=${this.iconUrl} />` :
          html`<div class="app-icon"></div>`}
          <div class="menu-actions" style=${styleMap({ color: this.contrastingColor })}>
            <span>HOME</span>
            <span>PROFILE</span>
            <span>SETTINGS</span>
          </div>
        </div>
      </div>
    `;
  }

  renderiOS() {
    return html`
      <div role="img" tabindex="0" aria-label="Theme color use in iOS" class="container ios">
        <img class="phone" alt="Iphone" src="../assets/images/ios/iphone.svg" />
        <div class="status-bar" style=${styleMap({ '--pwa-theme-color': this.themeColor })}>
          <img alt="Status bar" src="../assets/images/ios/statusbar.svg" />
        </div>
      </div>
    `;
  }
}
