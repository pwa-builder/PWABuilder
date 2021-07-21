import { css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { styleMap } from 'lit/directives/style-map.js';

import { ScreenTemplate } from './screen-template';
import { getContrastingColor } from '../../../utils/previewer-utils';
import { Display } from '../../../utils/interfaces';
import '../disclaimer-message.js';

@customElement('display-screen')
export class DisplayScreen extends ScreenTemplate {
  static get styles() {
    return [
      super.styles,
      css`
        .container {
          position: relative;
          display: flex;
          justify-content: center;
          margin: 0 auto;
          width: fit-content;
        }

        .container.windows {
          font-family: var(--previewer-windows-font-family);
        }

        .container.android {
          margin-top: 20px;
        }

        .android .phone {
          position: absolute;
          top: 0;
          width: 200px;
          height: 450px;
          box-shadow: var(--previewer-card-box-shadow);
          border-radius: 8px;
          object-fit: cover;
          z-index: -1;
        }

        .android .status-bar {
          width: 200px;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          height: 18px;
          position: absolute;
          top: 16px;
          z-index: 1;
          background-color: var(--previewer-theme-color);
        }

        .android .status-bar img {
          width: 60px;
          margin-left: 5px;
        }

        .android .app-background-full {
          width: 200px;
          position: absolute;
          height: 412px;
          top: 17px;
          display: flex;
          justify-content: center;
          align-items: center;
          flex-direction: column;
          background-color: var(--previewer-background-color);
        }

        .android .app-background-partial {
          width: 200px;
          position: absolute;
          top: 70px;
          height: 359px;
          display: flex;
          justify-content: center;
          align-items: center;
          flex-direction: column;
          background-color: var(--previewer-background-color);
        }

        .android .app-icon {
          width: 70px;
          height: auto;
        }

        .android .app-name {
          width: fit-content;
          margin: 15px auto 0px;
          font-size: 16px;
          line-height: 1.7;
        }

        .android .app-url {
          background-color: #D7D7D7;
          opacity: 0.5;
          position: absolute;
          top: 48px;
          left: -42px;
          font-size: 6.5px;
          width: 93px;
          overflow-x: hidden;
          white-space: nowrap;
          line-height: 1.5;
        }

        .windows .browser-img {
          width: 260px;
        }

        .windows .app-background {
          width: 99%;
          position: absolute;
          left: 0;
          height: 214.5px;
          display: flex;
          justify-content: center;
          align-items: center;
          flex-direction: column;
          box-shadow: var(--previewer-card-box-shadow);
          background-color: var(--previewer-background-color);
        }

        .windows .app-background.browser {
          top: 20px;
        }

        .windows .app-background.fullscreen {
          top: 12px;
          height: 222.8px;
        }

        .windows .app-background.minimal-ui {
          width: 260px;
        }

        .windows .app-background.standalone {
          width: 260px;
        }

        .windows .app-icon {
          width: 55px;
        }

        .windows .app-name {
          width: fit-content;
          margin: 10px auto 0px;
          font-size: 12px;
        }

        .windows .app-url {
          top: 14px;
          position: absolute;
          left: 47px;
          font-size: 3.5px;
          width: 162px;
          overflow-x: hidden;
          white-space: nowrap;
          background-color: white;
        }

        .windows .title-bar {
          width: 260px;
          z-index: 1;
          display: flex;
          justify-content: space-between;
          background-color: var(--previewer-theme-color);
        }

        .windows .nav-actions {
          display: flex;
          align-items: center;
        }

        .windows .nav-actions img {
          width: 10px;
          height: 8px;
          margin: 4px 2px 0;
          opacity: 0.8;
        }

        .windows .nav-actions svg {
          margin: 4px 5px 0;
        }

        .windows .nav-actions .collapse {
          margin: 4px 5px 0;
          width: 6px;
          height: 1px;
        }

        .windows .nav-actions .enlarge {
          margin: 4px 5px 0;
          width: 6px;
          height: 6px;
          border-width: 1px;
          border-style: solid;
        }

        .windows .title-bar .app-name {
          margin: 4px;
          font-size: 6px;
        }

        .ios-message {
          margin: 90px auto 0px;
          width: 70%;
        }
      `
    ];
  }

  /**
   * Value of the display property on the manifest
   */
  @property() display?: Display;

  /**
   * Theme color attribute on the manifest.
   * To avoid showing the placeholder images, avoid 'transparent' color
   */
  private _themeColor = '';

  set themeColor(val: string) {
    const oldVal = this._themeColor;
    this._themeColor = val === 'none' || val === 'transparent' ? 'darkGray' : val;
    this.requestUpdate('themeColor', oldVal);
  } 
 
  @property()
  get themeColor() { return this._themeColor; }

  /**
   * Background color attribute on the manifest.
   * To avoid showing the placeholder images, avoid 'transparent' color
   */
  private _backgroundColor = '';

  set backgroundColor(val: string) {
    const oldVal = this._backgroundColor;
    this._backgroundColor = val === 'none' || val === 'transparent' ? '#FFF' : val;
    this.requestUpdate('backgroundColor', oldVal);
  } 
 
  @property()
  get backgroundColor() { return this._backgroundColor; }

  /**
   * The splash screen's icon.
   */
  @property() iconUrl?: string;

  /**
   * Name attribute on the manifest.
   */
  @property() appName?: string;

  /**
   * The app's URL.
   */
  @property() siteUrl = '';

  /**
   * The color to use on top of the theme color, such that the text is visible.
   */
  @state() private contrastingThemeColor = '';

  firstUpdated() {
    this.contrastingThemeColor = this.themeColor ? getContrastingColor(this.themeColor) : '#000';
  }

  renderWindows() {
    const appSplash = html`
      <div
      class="app-background ${this.display}"
      style=${styleMap({ '--previewer-background-color': this.backgroundColor })}>
        ${this.iconUrl ?
          html`<img class="app-icon" alt="App icon" src=${this.iconUrl} />` : null}
        <h4 
        class="app-name" 
        style=${styleMap({ color: this.backgroundColor ? getContrastingColor(this.backgroundColor) : '#000' })}>
          ${this.appName || 'PWA App'}
        </h4>
      </div>
    `;

    switch (this.display) {
      case 'fullscreen':
        return html`
          <div class="container windows">
            <img class="browser-img" alt="Window's browser" src="../../../../../assets/previewer-images/windows/browserwindow.png" />
            ${appSplash}
          </div>
        `;
      case 'browser':
        return html`
          <div class="container windows">
            <img class="browser-img" alt="Window's browser" src="../../../../../assets/previewer-images/windows/browserwindow.png" />
            <span class="app-url">${this.siteUrl}</span>
            ${appSplash}
          </div>
        `;
      case 'minimal-ui': 
        return html`
          <div class="windows container">
            <div 
            class="title-bar"
            style=${styleMap({ '--previewer-theme-color': this.themeColor })}>
              <div class="nav-actions">
                <img alt="Go back" src="../../../../../assets/previewer-images/windows/backarrow.svg" />
                <img alt="Refresh page" src="../../../../../assets/previewer-images/windows/refresharrow.svg" />
              </div>
              <span class="app-name">${this.appName}</span>
              <div class="nav-actions">
                <div class="collapse" style=${styleMap({ backgroundColor: this.contrastingThemeColor })}></div>
                <div class="enlarge" style=${styleMap({ borderColor: this.contrastingThemeColor })}></div>
                <svg class="close" width="6px" height="6px" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 1000 1000" enable-background="new 0 0 1000 1000" xml:space="preserve">
                  <g><path style="fill:${this.contrastingThemeColor}" d="M990,61.2L933.3,5.1L500,443.3L66.7,5.1L10,61.2L443.9,500L10,938.8l56.7,56.1L500,556.7l433.3,438.2l56.7-56.1L556.1,500L990,61.2z"/></g>
                </svg>
              </div>
            </div>
            ${appSplash}
          </div>
        `;
      case 'standalone':
        return html`
          <div class="windows container">
            <div 
            class="title-bar"
            style=${styleMap({ '--previewer-theme-color': this.themeColor })}>
              <span class="app-name">${this.appName}</span>
              <div class="nav-actions">
                <div class="collapse" style=${styleMap({ backgroundColor: this.contrastingThemeColor })}></div>
                <div class="enlarge" style=${styleMap({ borderColor: this.contrastingThemeColor })}></div>
                <svg class="close" width="6px" height="6px" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 1000 1000" enable-background="new 0 0 1000 1000" xml:space="preserve">
                  <g><path style="fill:${this.contrastingThemeColor}" d="M990,61.2L933.3,5.1L500,443.3L66.7,5.1L10,61.2L443.9,500L10,938.8l56.7,56.1L500,556.7l433.3,438.2l56.7-56.1L556.1,500L990,61.2z"/></g>
                </svg>
              </div>
            </div>
            ${appSplash}
          </div>
        `;
      default: return null;
    }
  }

  renderAndroid() {
    return html`
      <div class="container android">
        ${this.display !== 'fullscreen' ? 
        html`
          <div 
          class="status-bar" 
          style=${styleMap({ '--previewer-theme-color': this.themeColor })}>
            <img alt="Status bar" src="../../../../../assets/previewer-images/android/statusbar-icons.png" />
          </div>
        ` : null}
        ${this.display === 'browser' || this.display === 'minimal-ui' ? 
        html`<span class="app-url">${this.siteUrl}</span>` : null}
        <div 
        class=${classMap({ 
          'app-background-full': this.display === 'fullscreen' || this.display === 'standalone',
          'app-background-partial': this.display === 'minimal-ui' || this.display === 'browser'
        })} 
        style=${styleMap({ '--previewer-background-color': this.backgroundColor })}>
          ${this.iconUrl ?
            html`<img class="app-icon" alt="App icon" src=${this.iconUrl} />` : null}
          <h4 
          class="app-name" 
          style=${styleMap({ color: this.backgroundColor ? getContrastingColor(this.backgroundColor) : '#000' })}>
            ${this.appName || 'PWA App'}
          </h4>
        </div>
        <img class="phone" alt="Android phone" src="../../../../../assets/previewer-images/android/background.svg" />
      </div>
    `;
  }

  renderiOS() {
    return html`
      <div class="ios-message">
        <disclaimer-message>
          iOS does not support different display modes.
        </disclaimer-message>
      </div>
    `;
  }
}