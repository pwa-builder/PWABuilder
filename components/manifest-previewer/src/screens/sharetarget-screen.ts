import { css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { screenBaseStyles, ScreenTemplate } from './screen-template';

@customElement('share-target')
export class ShareTarget extends ScreenTemplate {
  static get styles() {
    return [
      screenBaseStyles,
      css`
        .container {
          position: relative;
          width: fit-content;
          margin: 30px auto 0;
          width: 260px;
        }

        .container.android {
          box-shadow: var(--card-box-shadow);
          border-radius: 6px;
          height: 315px;
          font-family: var(--android-font-family, 'Arial');
        }

        .dialog {
          width: 100%;
          box-shadow: var(--card-box-shadow);
          border-radius: 6px;
        }

        .windows .contacts {
          background-color: #F3F3F3;
          position: absolute;
          top: 197px;
          width: 100%;
          left: 0;
          height: 70px;
          font-family: var(--windows-font-family, Arial);
        }

        .avatar, .app {
          display: flex;
          flex-direction: column;
          font-size: 10px;
          font-weight: 600;
          align-items: center;
          width: fit-content;
          margin-left: 28px;
          justify-content: flex-end;
        }

        .avatar > div {
          border-radius: 50%;
          background-color: #66D3FA;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 30px;
          height: 30px;
          font-size: 15px;
          margin-bottom: 7px;
        }

        .windows .app {
          position: absolute;
          bottom: 63px;
          background-color: #F3F3F3;
          font-weight: 400;
          font-size: 9px;
          margin-left: 14px;
          min-width: 46px;
          max-width: 63px;
          min-height: 45px;
        }

        .windows .app .name {
          text-shadow: 0 0 2px darkgray;
          max-width: 63px;
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
        }

        .windows .app img {
          width: 22px;
          height: 22px;
          margin-bottom: 4px;
        }

        .android .share-title {
          font-weight: 600;
          text-align: center;
          position: absolute;
          top: 15px;
          left: calc(50% - 20px);
        }

        .android .action-buttons {
          display: flex;
          justify-content: space-between;
          position: absolute;
          top: 95px;
          left: calc(50% - 60px);
          width: 120px;
        }

        .android .action-buttons div {
          border: solid 0.5px lightgray;
          color: gray;
          font-size: 11px;
          padding: 2px 10px;
          border-radius: 12px;
        }

        .android .divisor {
          padding: 0.5px 0;
          width: 100%;
          background-color: lightgray;
          position: absolute;
        }

        .android .divisor.first {
          top: 130px;
        }

        .android .divisor.second {
          top: 220px;
        }

        .android .contacts {
          background-color: #FFF;
          position: absolute;
          top: 150px;
          width: 100%;
          left: 0;
          height: 48px;
        }

        .android .avatar {
          font-weight: 400;
          margin-left: 15px;
        }

        .android .app {
          position: absolute;
          bottom: 20px;
          padding-bottom: 10px;
          height: 64px;
          font-weight: 600;
          overflow: hidden;
          background-color: #FFF;
          color: rgba(0, 0, 0, 0.6);
          margin-left: 12px;
        }

        .android .app img {
          width: 35px;
          height: 35px;
          margin-bottom: 2px;
        }

        .android .media-url {
          background-color: #FFF;
          position: absolute;
          top: 51px;
          font-size: 10px;
          height: 27px;
          width: 84%;
          left: 4%;
        }

        .container.ios {
          margin-top: 15px;
        }

        .ios .app {
          background-color: #FFF;
          position: absolute;
          top: 12px;
          right: 81px;
          font-family: var(--ios-font-family, Arial);
          width: 50px;
          overflow: hidden;
          min-height: 61px;
        }

        .ios .app img {
          width: 48px;
          height: 48px;
          margin-bottom: 3px;
        }
      `
    ];
  }

  /**
   * The splash screen's icon.
   */
  @property() iconUrl?: string;

  /**
   * Name attribute on the manifest.
   */
  @property() appName?: string;

  /**
   * Short name attribute on the manifest.
   */
  @property() shortName?: string;

  /**
   * The app's URL.
   */
  @property() siteUrl = '';

  renderWindows() {
    return html`
      <div role="img" tabindex="0" aria-label="Share target in Windows" class="container windows">
        <img class="dialog" alt="Web share trigger" src="../assets/images/windows/share-dialog.png" />
        <div class="contacts">
          <div class="avatar">
            <div>JD</div>
            John Doe
          </div>
        </div>
        <div class="app">
          ${this.iconUrl ? html`<img alt="PWA icon" src=${this.iconUrl} />` : null}
          <span class="name">
            ${this.shortName || this.appName || 'PWAApp'}
          </span>
        </div>
      </div>
    `;
  }

  renderAndroid() {
    return html`
      <div role="img" tabindex="0" aria-label="Share target in Android" class="container android">
        <div class="share-title">Share</div>
        <!-- <div class="media-url">via Media Content https://media-content.com</div> -->
        <div class="action-buttons">
          <div>Copy</div>
          <div>Nearby</div>
        </div>
        <div class="divisor first"></div>
        <div class="contacts">
          <div class="avatar">
            <div>JD</div>
            John Doe
          </div>
        </div>
        <div class="divisor second"></div>
        <div class="app">
          ${this.iconUrl ? html`<img alt="PWA icon" src=${this.iconUrl} />` : null}
          ${this.shortName || this.appName || 'PWA App'}
        </div>
      </div>
    `;
  }

  renderiOS() {
    return html`
      <div role="img" tabindex="0" aria-label="Share target in iOS" class="container ios">
        <img class="dialog" alt="" src="../assets/images/ios/share-dialog.jpg" />
        <div class="app">
          ${this.iconUrl ? html`<img alt="PWA icon" src=${this.iconUrl} />` : null}
          ${this.shortName || 'PWA App'}
        </div>
      </div>
    `;
  }
}
