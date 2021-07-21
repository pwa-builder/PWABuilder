import { css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';

import { ScreenTemplate } from './screen-template';
import { getContrastingColor } from '../../../utils/previewer-utils';
import './display-screen.js';

@customElement('themecolor-screen')
export class ThemecolorScreen extends ScreenTemplate {
  static get styles() {
    return [
      super.styles,
      css`
        .container {
          position: relative;
          width: 250px;
          margin: 120px auto 0;
        }
        
        .android .switcher-img {
          width: 100%;
          position: absolute; 
          top: 0;
          box-shadow: var(--previewer-card-box-shadow);
        }
    
        .android .app-box {
          border-radius: 3px 3px 0 0;
          display: flex;
          width: 163px;
          position: absolute;
          top: 33px;
          height: 42px;
          left: 44px;
          background-color: var(--previewer-theme-color);
        }
    
        .android .app-icon {
          border-radius: 50%;
          width: 30px;
          height: 30px;
          margin: -15px auto 0;
          background-color: #FFF;
        }
    
        .android .menu-actions {
          display: flex;
          width: 100%;
          justify-content: space-evenly;
          position: absolute;
          bottom: 4px;
          font-family: Roboto;
          font-size: 10px;
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
          background-color: var(--previewer-theme-color);
        }
    
        .ios .status-bar img {
          width: 100%;
          height: 16px;
          overflow-y: hidden;
          object-fit: cover;
          object-position: top;
        }

        .container.windows {
          font-family: var(--previewer-windows-font-family);
          height: 160px;
          border: 1px solid #000;
          margin-top: 50px;
        }

        .windows .title-bar {
          width: 100%;
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
          line-height: 1.8;
        }
    
        @media(max-width: 1366px) {
          .windows .titlebar {
            bottom: 16px;
          }
    
          .android .app-box {
            width: 164px;
            top: 33px;
            height: 42px;
            left: 43px;
          }
    
          .android .app-icon {
            width: 26px;
            height: 26px;
            margin: -12px auto 0;
          }
    
          .android .menu-actions {
            font-size: 8px;
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

  firstUpdated() {
    this.contrastingColor = this.themeColor ? getContrastingColor(this.themeColor) : '#FFF';
  }

  renderWindows() {
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
            <div class="collapse" style=${styleMap({ backgroundColor: this.contrastingColor })}></div>
            <div class="enlarge" style=${styleMap({ borderColor: this.contrastingColor })}></div>
            <svg class="close" width="6px" height="6px" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 1000 1000" enable-background="new 0 0 1000 1000" xml:space="preserve">
              <g><path style="fill:${this.contrastingColor}" d="M990,61.2L933.3,5.1L500,443.3L66.7,5.1L10,61.2L443.9,500L10,938.8l56.7,56.1L500,556.7l433.3,438.2l56.7-56.1L556.1,500L990,61.2z"/></g>
            </svg>
          </div>
        </div>
      </div>
    `;
  }

  renderAndroid() {
    return html`
      <div class="container android">
        <img alt="Android's app switcher" src="../../../../../assets/previewer-images/android/appswitcher.jpg" class="switcher-img" />
        <div 
        class="app-box" 
        style=${styleMap({ '--previewer-theme-color': this.themeColor })}>
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
      <div class="container ios">
        <img class="phone" alt="Iphone" src="../../../../../assets/previewer-images/ios/iphone.svg" />
        <div class="status-bar" style=${styleMap({ '--previewer-theme-color': this.themeColor })}>
          <img alt="Status bar" src="../../../../../assets/previewer-images/ios/statusbar.svg" />
        </div>
      </div>
    `;
  }
}