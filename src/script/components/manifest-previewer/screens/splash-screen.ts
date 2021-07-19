import { css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';

import { ScreenTemplate } from './screen-template';
import { getContrastingColor } from '../../../utils/previewer-utils';

@customElement('splash-screen')
export class SplashScreen extends ScreenTemplate {
  static get styles() {
    return [
      super.styles,
      css`
        .container {
          position: relative;
          width: 220px;
          margin: 10px auto 0;
        }

        .android .phone {
          position: absolute;
          width: 100%;
          height: 460px;
          top: 0;
          background: #FFF;
          box-shadow: var(--previewer-card-box-shadow);
          border-radius: 8.11976px;
          object-fit: cover;
          object-position: top;
          z-index: -1;
        }

        .android .screen {
          position: absolute;
          width: 100%;
          height: 400px;
          top: 19px;
          border-radius: 8.12px;
          display: flex;
          flex-direction: column;
          align-items: center;
          background-color: var(--previewer-background-color);
        }

        .phone-bar {
          padding: 7px 0;
          width: 100%;
          background-color: var(--previewer-theme-color);
        }

        .icon {
          margin: auto;
          width: 90px;
          height: 90px;
          margin-top: calc(40% + 45px);
        }

        .app-name {
          width: fit-content;
          margin: 0 auto 30px;
          font-size: 16px;
        }

        .container.ios {
          margin-top: 30px;
        }

        .ios .phone {
          width: 100%;
          position: absolute;
          top: 0;
          box-shadow: var(--previewer-card-box-shadow);
          border-radius: 16px;
          object-fit: none;
        }

        .ios .screen {
          height: 280px;
          width: 188px;
          position: absolute;
          top: 66px;
          left: 16px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          font-family: var(--previewer-ios-font-family);
          background-color: var(--previewer-background-color);
        }

        .ios .status-bar {
          width: 100%;
          position: absolute;
          top: 2px;
          height: 19px;
          object-fit: cover;
          object-position: top;
        }

        .ios .icon {
          margin: 0 0 10px;
          width: 80px;
          height: 80px;
        }

        .container.windows {
          width: 250px;
          margin-top: 30px;
        }

        .windows img.desktop {
          position: absolute;
          inset: 0;
          width: 100%;
          box-shadow: var(--previewer-card-box-shadow);
        }

        .windows .screen {
          display: flex;
          align-items: center;
          justify-content: center;
          position: absolute;
          width: 100px;
          height: 55px;
          top: 45px;
          left: calc(50% - 50px);
          background-color: var(--previewer-background-color);
        }

        .windows .app-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: fit-content
        }

        .windows .app-info img {
          width: 30px;
          height: 30px;
          margin-right: 5px;
        }

        .windows .app-info p {
          margin: 0;
          font-size: 10px;
          font-weight: 600;
          font-family: var(--previewer-windows-font-family);
        }

        .windows .window-actions {
          position: absolute;
          top: 2px;
          right: 2px;
          display: flex;
          align-items: center;
        }

        .windows .window-actions .collapse {
          width: 4px;
          height: 0.1px;
          margin-right: 3px;
        }
      `
    ];
  }

  /**
   * Background color attribute on the manifest.
   */
  @property() backgroundColor?: string;

  /**
   * Theme color attribute on the manifest.
   */
  @property() themeColor?: string;

  /**
   * The splash screen's icon.
   */
  @property() iconUrl?: string;

  /**
   * Name attribute on the manifest.
   */
  @property() appName?: string;

  /**
   * The color to use on top of the background color, such that the text is visible.
   */
  @state() private contrastingBackgroundColor = '';
  
  firstUpdated() {
    this.contrastingBackgroundColor = this.backgroundColor ? getContrastingColor(this.backgroundColor) : '#000';
  }

  renderWindows() {
    return html`
      <div 
      class="container windows">
        <img class="desktop" alt="Window's desktop" src="../../../../../assets/previewer-images/windows/desktop.png" />
        <div class="screen" style=${styleMap({ '--previewer-background-color': this.backgroundColor })}>
          <div class="window-actions">
            <div class="collapse" style=${styleMap({ backgroundColor: this.contrastingBackgroundColor })}></div>
            <svg class="close" width="4px" height="4px" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 1000 1000" enable-background="new 0 0 1000 1000" xml:space="preserve">
              <g><path style="fill:${this.contrastingBackgroundColor}" d="M990,61.2L933.3,5.1L500,443.3L66.7,5.1L10,61.2L443.9,500L10,938.8l56.7,56.1L500,556.7l433.3,438.2l56.7-56.1L556.1,500L990,61.2z"/></g>
            </svg>
          </div>
          <div class="app-info">
            ${this.iconUrl ? 
              html`<img src=${this.iconUrl} alt="App's splash screen" />` : null}
            <p style=${styleMap({ color: this.contrastingBackgroundColor })}>
              ${this.appName || 'PWA App'}
            </p>
          </div>
        </div>
      </div>
    `;
  }

  renderAndroid() {
    return html`
    <div class="container android">
      <img class="phone" alt="Application mobile preview" src="../../../../../assets/previewer-images/android/background.svg" />
      <div class="screen" style=${styleMap({ '--previewer-background-color': this.backgroundColor })}>
        <div 
        class="phone-bar"
        style=${styleMap({ '--previewer-background-color': this.themeColor })}></div>
        ${this.iconUrl ?
          html`
          <img 
          class="icon" 
          src=${this.iconUrl} 
          alt="App's splash screen" />
          ` : html`<div class="icon"></div>`}
        <h5 class="app-name" style=${styleMap({ color: this.contrastingBackgroundColor })}>
          ${this.appName || 'PWA App'}
        </h5>
        <div class="phone-bar" style=${styleMap({ '--previewer-background-color': this.themeColor })}></div>
      </div>
    </div>
    `;
  }

  renderiOS() {
    return html`
      <div class="container ios"> 
        <img class="phone" alt="Iphone" src="../../../../../assets/previewer-images/ios/iphone.svg" />
        <div class="screen" style=${styleMap({ '--previewer-background-color': this.backgroundColor })}>
          <img class="status-bar" alt="iOS status bar" src="../../../../../assets/previewer-images/ios/statusbar.svg" />
          ${this.iconUrl ? 
            html`<img class="icon" src=${this.iconUrl} alt="App's splash screen" />` : null}
          <h5 class="app-name" style=${styleMap({ color: this.contrastingBackgroundColor })}>
            ${this.appName || 'PWA App'}
          </h5>
        </div>
      </div>
    `;
  }
}