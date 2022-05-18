import { css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { screenBaseStyles, ScreenTemplate } from './screen-template';

@customElement('name-screen')
export class NameScreen extends ScreenTemplate {
  static get styles() {
    return [
      screenBaseStyles,
      css`
        .container {
          position: relative;
          margin: 70px auto 0;
          width: 260px;
        }

        .container.android {
          height: 225px;
          box-shadow: var(--card-box-shadow);
          border-radius: 5px;
          font-family: var(--android-font-family);
        }

        .container.ios {
          margin-top: 50px;
        }

        .android .info-title{
          font-size: 16px;
          position: absolute;
          top: 10px;
          left: 10px;
        }

        .android .actions {
          width: 100%;
          border-top: 0.5px solid lightgray;
          border-bottom: 0.5px solid lightgray;
          position: absolute;
          top: 140px;
          display: flex;
          height: 50px;
          justify-content: space-evenly;
          align-items: center;
          color: #4285F4;
          font-size: 12px;
        }

        .menu-img {
          position: absolute;
          top: 0;
          width: 100%;
          box-shadow: var(--card-box-shadow);
          border-radius: 5px;
        }

        .windows .app-container {
          background-color: #E3E4FC;
          position: absolute;
          display: flex;
          flex-direction: column;
          align-items: center;
          top: 51px;
          right: 93px;
          min-width: 30px;
          height: 25px;
          justify-content: flex-end;
        }

        .windows .app-name {
          color: rgba(0, 0, 0, 0.8);
          font-size: 5px;
          font-weight: 600;
          letter-spacing: -0.07px;
          margin-top: 2.5px;
          font-family: var(--windows-font-family, Arial);
          max-width: 40px;
          white-space: nowrap;
          overflow-x: hidden;
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
          font-family: var(--ios-font-family, Arial);
          background-color: #F4F4F4;
          position: absolute;
          top: 146px;
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
      <div
      role="img"
      tabindex="0"
      aria-label="The name attribute in Windows"
      class="windows container">
        <img alt="Windows start menu" src="../assets/images/windows/startmenu.png" class="menu-img" />
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
      <div
      role="img"
      tabindex="0"
      aria-label="The name attribute in Android"
      class="android container">
        <div class="info-title">App info</div>
        ${this.iconUrl ?
          html`<img alt="Application's icon" src=${this.iconUrl} class="app-icon" />` :
          html`<div class="app-icon"></div>`}
        <div class="app-name">${this.appName || 'PWA App'}</div>
        <div class="actions">
          <span>Open</span>
          <span>Disable</span>
          <span>Force stop</span>
        </div>
      </div>
    `;
  }

  renderiOS() {
    return html`
      <div
      role="img"
      tabindex="0"
      aria-label="The name attribute in iOS"
      class="container ios">
        <img class="menu-img" alt="iOS settings" src="../assets/images/ios/appsettings.jpg" />
        <div class="app-icon">
          ${this.iconUrl ?
            html`<img alt="Application's icon" src=${this.iconUrl} />` : null}
        </div>
        <div class="app-name">${this.appName || 'PWA App'}</div>
      </div>
    `;
  }
}
