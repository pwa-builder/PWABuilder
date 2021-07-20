import { css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';

import { ScreenTemplate } from './screen-template';
import { getContrastingColor } from '../../../utils/previewer-utils';
import '../disclaimer-message.js';

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
          margin-top: 120px;
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
      <div class="container windows">
        <disclaimer-message>
          Windows does not currently use splash screens.
        </disclaimer-message>
      </div>
    `;
  }

  renderAndroid() {
    return html`
    <div class="container android">
      <img class="phone" alt="Application mobile preview" src="../../../../../assets/previewer-images/android/background.svg" />
      <div 
      class="screen" 
      style=${styleMap({ 
        '--previewer-background-color': (this.backgroundColor === 'none' || this.backgroundColor === 'trasparent') ? '#FFF' : this.backgroundColor
      })}>
        <div 
        class="phone-bar"
        style=${styleMap({ 
          '--previewer-theme-color': (this.themeColor === 'none' || this.themeColor === 'trasparent') ? '#FFF' : this.themeColor
        })}></div>
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
        <div 
        class="phone-bar" 
        style=${styleMap({ 
          '--previewer-theme-color': (this.themeColor === 'none' || this.themeColor === 'trasparent') ? '#FFF' : this.themeColor
        })}></div>
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