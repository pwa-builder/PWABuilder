import { css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { ScreenTemplate } from './screen-template';

@customElement('share-target')
export class ShareTarget extends ScreenTemplate {
  static get styles() {
    return [
      super.styles,
      css`
        .container {
          position: relative;
          width: fit-content;
          margin: 0px auto;
          width: 260px;
        }

        .dialog {
          width: 100%;
          box-shadow: var(--previewer-card-box-shadow);
          border-radius: 6px;
        }

        .windows .contacts {
          background-color: #F3F3F3;
          position: absolute;
          top: 190px;
          width: 100%;
          left: 0;
          height: 70px;
          font-family: var(--previewer-windows-font-family);
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
        }

        .windows .app {
          position: absolute;
          bottom: 52px;
          background-color: #F3F3F3;
          font-weight: 400;
          font-size: 9px;
          margin-left: 14px;
          min-width: 46px;
          max-width: 63px;
          white-space: nowrap;
          overflow: hidden;
          min-height: 45px;
        }

        .windows .app img {
          width: 30px;
          height: 30px;
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
          bottom: 17px;
          padding-bottom: 10px;
          left: 36px;
          height: 64px;
          width: 65px;
          overflow: hidden;
          background-color: #FFF;
          color: rgba(0, 0, 0, 0.5);
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
          font-family: var(--previewer-ios-font-family);
          width: 50px;
          overflow: hidden;
          min-height: 61px;
        }

        .ios .app img {
          width: 45px;
          height: 45px;
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

  // Because Android and Windows have basically the same code, 
  // we put it in a single method.
  private sharedRender() {
    return html`
      <div class="container ${this.platform}">
        <img class="dialog" alt="Web share trigger" src="../../../../../assets/previewer-images/${this.platform}/share-dialog.png" />
        ${this.platform === 'android' ? 
          html`<div class="media-url">via Media Content https://media-content.com</div>` : null}
        <div class="contacts">
          <div class="avatar">
            <div>JD</div>
            John Doe
          </div>
        </div>
        <div class="app">
          ${this.iconUrl ? html`<img alt="PWA icon" src=${this.iconUrl} />` : null}
          ${this.shortName || this.appName || 'PWA App'}
        </div>
      </div>
    `;
  }
   
  renderWindows() { return this.sharedRender(); }

  renderAndroid() { return this.sharedRender(); }

  renderiOS() {
    return html`
      <div class="container ios">
        <img class="dialog" alt="" src="../../../../../assets/previewer-images/ios/share-dialog.jpg" />
        <div class="app">
          ${this.iconUrl ? html`<img alt="PWA icon" src=${this.iconUrl} />` : null}
          ${this.shortName || 'PWA App'}
        </div>
      </div>
    `;
  }
}