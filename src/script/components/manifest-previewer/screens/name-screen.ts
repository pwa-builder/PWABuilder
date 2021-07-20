import { css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { ScreenTemplate } from './screen-template';

@customElement('name-screen')
export class NameScreen extends ScreenTemplate {
  static get styles() {
    return [
      super.styles,
      css`
        .container {
          position: relative;
          margin: 70px auto 0;
          width: 260px;
        }

        .container.ios {
          margin-top: 50px;
        }
    
        .menu-img {
          position: absolute;
          top: 0;
          width: 100%;
          box-shadow: var(--previewer-card-box-shadow);
        }
    
        .windows .app-container {
          background-color: #E5EBEC;
          position: absolute;
          display: flex;
          flex-direction: column;
          align-items: center;
          top: 34px;
          right: 94px;
          min-width: 30px;
          height: 23.5px;
          justify-content: flex-end;
        }
    
        .windows .app-name {
          color: rgba(0, 0, 0, 0.8);
          font-size: 5px;
          font-weight: 600;
          letter-spacing: -0.07px;
          font-family: var(--previewer-windows-font-family); 
          max-width: 40px;
          white-space: nowrap;
          overflow-x: hidden;
          line-height: 1;
          margin-top: 3px;
          /* display: flex; */
          /* justify-content: center; */
          height: 8px;
        }
    
        .windows .app-icon {
          width: 15px;
          height: 15px;
        }
    
        .android .app-icon {
          position: absolute;
          top: 62px;
          width: 42px;
          height: 42px;
          left: calc(50% - 21px);
          background-color: #FFF;
        }
    
        .android .app-name {
          position: absolute;
          width: 100%;
          background-color: #FFF;
          text-align: center;
          font-size: 14px;
          top: 106px;
        }
    
        .ios .app-icon {
          position: absolute;
          background-color: #000;
          top: 20px;
          display: flex;
          justify-content: center;
          align-items: center;
          width: 21px;
          height: 21px;
          top: 143px;
          left: 10px;
          border-radius: 5px;
        }
    
        .ios .app-icon img {
          width: 80%;
        }
    
        .ios .app-name {
          font-family: var(--previewer-ios-font-family);
          background-color: #F4F4F4;
          position: absolute;
          top: 144px;
          left: 41px;
          font-size: 13px;
          font-weight: 600;
          min-width: 50px;
        }
      `
    ];
  }

  /**
   * Name attribute on the manifest.
   */
  @property() appName?: string;

  /**
   * The URL to use for icon previews, or undefined if the manifest has no
   * icons.
   */
  @property() iconUrl?: string;

  renderWindows() {
    return html`
      <div class="windows container">
        <img alt="Windows start menu" src="../../../../../assets/previewer-images/windows/startmenu.png" class="menu-img" />
        <div class="app-container">
          ${this.iconUrl ?
            html`<img alt="Application's icon" src=${this.iconUrl} class="app-icon" />` : 
            null}
          <div class="app-name">${this.appName || 'PWA App'}</div>
        </div>
      </div>
    `;
  }

  renderAndroid() {
    return html`
      <div class="android container">
        <img alt="Android app info" src="../../../../../assets/previewer-images/android/appinfo.png" class="menu-img" />
        ${this.iconUrl ?
          html`<img alt="Application's icon" src=${this.iconUrl} class="app-icon" />` : 
          html`<div class="app-icon"></div>`}
        <div class="app-name">${this.appName || 'PWA App'}</div>
      </div>
    `;
  }

  renderiOS() {
    return html`
      <div class="container ios">
        <img class="menu-img" alt="iOS settings" src="../../../../../assets/previewer-images/ios/appsettings.jpg" />
        <div class="app-icon">
          ${this.iconUrl ?
            html`<img alt="Application's icon" src=${this.iconUrl} />` : null}
        </div>
        <div class="app-name">${this.appName || 'PWA App'}</div>
      </div>
    `;
  }
}