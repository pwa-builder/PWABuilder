import { css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { screenBaseStyles, ScreenTemplate } from './screen-template.js';
import '../disclaimer-message.js';
import type { Shortcut, ImageResource } from '../models';

@customElement('shortcuts-screen')
export class ShortcutsScreen extends ScreenTemplate {
  static get styles() {
    return [
      screenBaseStyles,
      css`
        .container {
          width: 260px;
          position: relative;
          margin: 40px auto 0;
        }

        .container.windows {
          font-family: var(--windows-font-family, Arial);
        }

        .container.android {
          height: 285px;
          border-radius: 10px;
          background: linear-gradient(#C08FA7, #E7A0BF);
        }

        .menu-img {
          width: 100%;
          box-shadow: var(--card-box-shadow);
        }

        .windows .app-icon {
          position: absolute;
          width: 14px;
          height: 14px;
          bottom: 8px;
          right: 91px;
        }

        .windows .menu {
          position: absolute;
          bottom: 57px;
          right: 26px;
          width: 138px;
          height: 72px;
        }

        .windows .shortcut-list {
          list-style: none;
          padding: 0;
          color: rgba(0, 0, 0, 0.6);
          font-size: 6px;
          font-weight: 600;
          background-color: #D2DBEF;
          height: 100%;
        }

        .windows .shortcut-list li {
          padding: 0 0 0 4px;
          margin: 0 0 10px;
          display: flex;
          align-items: center;
        }

        .windows .shortcut-list .icon {
          width: 10px;
          height: 10px;
          margin-right: 5px;
          display: inline-block;
        }

        .android .app-icon {
          position: absolute;
          width: 50px;
          height: 50px;
          top: 41px;
          left: 18px;
          background-color: #FFF;
          border-radius: 50%;
        }

        .android .chrome-icon {
          position: absolute;
          width: 27px;
          height: 27px;
          top: 69px;
          left: 45px;
          z-index: 1;
        }

        .android .menu {
          background-color: #FFF;
          position: absolute;
          right: 30px;
          width: 185px;
          height: 135px;
          bottom: 30px;
          padding: 10px;
          border-radius: 10px;
        }

        .android .shortcut-list {
          list-style: none;
          padding: 0;
          margin: 0;
          color: #000;
          font-size: 12px;
        }

        .android .shortcut-list li {
          padding: 0;
          margin: 0 0 10px;
          display: flex;
          align-items: center;
          height: 25px;
        }

        .android .shortcut-list .icon {
          width: 25px;
          height: 25px;
          margin-right: 15px;
          display: inline-block;
        }

        .ios-message {
          margin: 100px auto 0px;
          width: 70%;
        }
      `
    ];
  }

  /**
   * The URL where the manifest resides.
   */
  @property() manifestUrl = '';

  /**
   * The shortcuts attribute on the manifest
   */
  @property({ type: Array }) shortcuts?: Shortcut[];

  /**
   * The application's icon.
   */
  @property() iconUrl?: string;

  /**
   * @param iconSet - The icons property of the shortcut
   * @returns The icon URL for the respective shortcut
   */
  private getShortcutIcon(iconSet: ImageResource[]) {
    // Use first icon by default
    const iconUrl = iconSet[0]!.src;
    const absoluteUrl = new URL(iconUrl, this.manifestUrl).href;
    return `https://pwabuilder-safe-url.azurewebsites.net/api/getsafeurl?url=${absoluteUrl}`;
  }

  renderWindows() {
    return html`
      <div
      role="img"
      tabindex="0"
      aria-label="Shortcuts in Windows"
      class="container windows">
        <img
        class="menu-img"
        alt="Application shortcuts"
        src="../assets/images/windows/shortcutsmenu.png" />
        ${this.iconUrl ?
          html`<img class="app-icon" alt="Application's icon" src=${this.iconUrl} />`:
          html`<div class="app-icon"></div>`}
        <div class="menu">
          <ul class="shortcut-list">
            ${this.shortcuts?.slice(0, 5).map((shortie) =>
              html`
                <li>
                  ${shortie.icons ?
                  html`<img class="icon" alt=${shortie.name} src=${this.getShortcutIcon(shortie.icons)} />` :
                  html`<div class="icon"></div>`}
                  <span>${shortie.name}</span>
                </li>
              `)}
          </ul>
        </div>
      </div>
    `;
  }

  renderAndroid() {
    return html`
      <div
      role="img"
      tabindex="0"
      aria-label="Shortcuts in Android"
      class="container android">
        ${this.iconUrl ?
          html`<img class="app-icon" alt="Application's icon" src=${this.iconUrl} />`:
          html`<div class="app-icon"></div>`}
        <div class="menu">
          <ul class="shortcut-list">
            ${this.shortcuts?.slice(0, 5).map((shortie) =>
              html`
                <li>
                  ${shortie.icons ?
                  html`<img class="icon" alt=${shortie.name} src=${this.getShortcutIcon(shortie.icons)} />` :
                  html`<div class="icon"></div>`}
                  <span>${shortie.name}</span>
                </li>
              `)}
          </ul>
        </div>
      </div>
    `;
  }

  renderiOS() {
    return html`
      <div class="ios-message">
        <disclaimer-message>
          iOS does not support the shortcuts feature.
        </disclaimer-message>
      </div>
    `;
  }
}
