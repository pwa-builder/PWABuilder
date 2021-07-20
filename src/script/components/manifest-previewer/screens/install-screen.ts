import { css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { ScreenTemplate } from './screen-template.js';
import type { Icon } from '../../../utils/interfaces';

@customElement('install-screen')
export class InstallScreen extends ScreenTemplate {
  static get styles() {
    return [
      super.styles,
      css`
        .container {
          position: relative;
          width: 220px;
          margin: 20px auto 0;
        }

        .container.windows {
          margin: 80px auto 0;
          font-family: var(--previewer-windows-font-family);
        }

        .container.android {
          width: 200px;
        }

        .android .preview-img {
          position: absolute;
          width: 100%;
          height: auto;
          top: 0;
          bottom: 0;
          right: 0;
          left: 0;
          margin: 0 auto;
          background: #FFF;
          box-shadow: var(--previewer-card-box-shadow);
          border-radius: 8.11976px;
          object-fit: cover;
          z-index: -1;
        }

        .android .url-bar {
          background-color: rgb(215, 215, 215);
          opacity: 0.5;
          position: absolute;
          top: 48px;
          left: 58px;
          font-size: 6.5px;
          width: 90px;
          overflow-x: hidden;
          white-space: nowrap;
          line-height: 1.5;
        }

        .android .dialog {
          background-color: #FFF;
          position: absolute;
          width: 100%;
          top: 174px;
          height: 250px;
          border-radius: 7px 7px 0 0;
          font-family: Roboto;
          padding: 9px;
          box-sizing: border-box;
        }

        .android .swipe-bar {
          background-color: rgb(215, 215, 215);
          width: 15px;
          height: 1px;
          position: absolute;
          top: 3px;
          border-radius: 10px;
          left: calc(50% - 7.5px);
        }

        .android .dialog-header {
          display: flex;
        }

        .android .dialog-header img {
          width: 18px;
          height: 18px;
          margin-right: 8px;
        }

        .android .app-name {
          font-size: 8px;
          margin: 0;
          line-height: 1.8;
        }

        .android .app-url {
          font-size: 8px;
          color: rgb(215, 215, 215);
          white-space: nowrap;
          margin: 0;
          width: 90px;
          overflow-x: hidden;
          height: 10px;
          line-height: 1;
        }

        .android .install-btn {
          background-color: #4285F4;
          color: #FFF;
          display: flex; 
          align-items: center;
          justify-content: center;
          width: 50px;
          height: 22px;
          font-size: 8px;
          border-radius: 2px;
          margin-left: auto;
        }

        .android .divider {
          background-color: rgb(215, 215, 215);
          height: 1px;
          width: 200px;
          margin: 5px 0 10px -9px;
        }

        .android .description {
          width: 100%;
          margin: 0;
          font-size: 8px;
          line-height: 1.4;
        }

        .android .screenshots {
          width: calc(100% - 19px);
          display: flex;
          height: 155px;
          margin-top: 10px;
          overflow-x: hidden;
          position: absolute;
          bottom: 8px;
        }

        .android .screenshots img {
          width: auto;
          height: 100%;
          margin-right: 5%;
        }

        .windows .preview-img {
          position: absolute;
          width: 100%;
          height: 204px;
          top: 0;
        }

        .windows .add-dialog {
          background-color: #FFF;
          width: 208px;
          height: 118px;
          position: absolute;
          top: 36px;
          left: 6px;
          z-index: 1;
          padding: 12px;
          box-sizing: border-box;
          box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
          border-radius: 6px;
        }

        .windows .add-dialog .header {
          display: flex;
        }

        .windows .add-dialog .icon {
          width: 17.5px;
          height: 17.5px;
          border-radius: 50%;
        }

        .windows .add-dialog .dialog-title {
          margin: 0 0 0 7px;
          font-size: 12px;
          font-weight: 600;
        }

        .windows .add-dialog .dialog-text {
          margin: 0 0 7px 25px;
          font-size: 7px;
          line-height: 1.3;
        } 

        .windows .dialog-text {
          font-family: Roboto;
          font-weight: 400;
          font-size: 7.84722px;
          margin: 0;
        }

        .windows .action-buttons {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 10px;
        }

        .windows .action-buttons div {
          font-size: 8px;
          font-weight: 600;
          height: 18px;
          width: 48%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .windows .action-buttons .install {
          color: #FFF;
          background-color: #0579CE;
        }

        .windows .action-buttons .cancel {
          background-color: #EFEFEF;
        }

        .ios .phone-img {
          width: 100%;
          box-shadow: var(--previewer-card-box-shadow);
        }

        .ios .add-btn {
          font-family: var(--previewer-ios-font-family);
          position: absolute;
          font-weight: 600;
          top: 0;
          right: 0;
          background-color: #FAFAFA;
          width: 38px;
          height: 28px;
          font-size: 11px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #147EFB;
        }

        .ios .icon {
          position: absolute;
          top: 58px;
          left: 7px;
          background-color: #FFF;
          display: flex;
          justify-content: center;
          align-items: center;
          width: 37px;
          height: 37px;
        }
    
        .ios .icon img {
          width: 100%;
          height: 100%;
        }

        .ios .hidden {
          position: absolute;
          background-color: #F1F1F1;
          top: 238px;
          height: 34px;
          width: 100%;
        }

        .ios .app-name {
          background-color: #FFF;
          position: absolute;
          top: 57px;
          left: 52px;
          font-size: 11px;
          font-family: var(--previewer-ios-font-family);
          font-weight: 600;
          min-width: 32px;
        }

        .ios .app-link {
          overflow-x: hidden;
          color: rgb(186, 191, 200);
          background-color: #FFF;
          position: absolute;
          top: 84px;
          left: 52px;
          font-size: 9px;
          width: 159px;
          font-family: var(--previewer-ios-font-family);
          white-space: nowrap;
          line-height: 1.3;
        }
      `
    ];
  }

  /**
   * The URL to use for icon previews, or undefined if the manifest has no
   * icons.
   */
  @property() iconUrl?: string;

  /**
   * The website's URL.
   */
  @property() siteUrl = '';

  /**
   * The URL where the manifest resides.
   */
  @property() manifestUrl = '';

  /**
   * Name attribute on the manifest.
   */
  @property() appName?: string;

  /**
   * Short name attribute on the manifest.
   */
  @property() appShortName?: string;

  /**
   * Description attribute on the manifest.
   */
  @property() description?: string;

  /**
   * Screenshots attribute on the manifest.
   */
  @property({ type: Array }) screenshots?: Icon[];

  /**
   * @param src - The src property of the screenshot
   * @returns The icon URL for the respective screenshot
   */
  private getImageUrl(src: string) {
    // Use first icon by default
    const absoluteUrl = new URL(src, this.manifestUrl).href;
    return `https://pwabuilder-safe-url.azurewebsites.net/api/getsafeurl?url=${absoluteUrl}`;
  }

  renderWindows() {
    return html`
      <div class="container windows">
        <div class="add-dialog">
          <div class="header">
            ${this.iconUrl ? 
            html`<img class="icon" alt="App's Windows icon" src=${this.iconUrl} />` :
            html`<div class="icon"></div>`}
            <p class="dialog-title">Install ${this.appName || 'PWA App'}</p>
          </div>
          <p class="dialog-text">Publisher: ${this.siteUrl}</p>
          <p class="dialog-text">
            This site can be installed as an application. It will open in its own window and 
            safely integrate with Window Features.
          </p>
          <div class="action-buttons">
            <div class="install">Install</div>
            <div class="cancel">Not Now</div>
          </div>
        </div>
        <img  
        class="preview-img"
        alt="Application mobile preview" 
        src="../../../../../assets/previewer-images/windows/background.svg" />
      </div>
    `;
  }

  renderAndroid() {
    return html`
      <div class="container android">
        <div class="url-bar">${this.siteUrl}</div>
        <div class="dialog">
          <div class="swipe-bar"></div>
          <div class="dialog-header">
            ${this.iconUrl ? 
            html`<img alt="App icon" src=${this.iconUrl} />` : null}
            <div class="header-text">
              <p class="app-name">${this.appName}</p>
              <p class="app-url">${this.siteUrl}</p>
            </div>
            <div class="install-btn">Install</div>
          </div>
          <div class="divider"></div>
          <p class="description">
            ${this.description || 'A description of your app.'}
          </p>
          <div class="screenshots">
            ${this.screenshots?.slice(0, 2).map(shot => 
              html`<img alt="Preview" src=${this.getImageUrl(shot.src)} />`)}
          </div>
        </div>
        <img 
        class="preview-img"
        alt="Application mobile preview" 
        src="../../../../../assets/previewer-images/android/background.svg" />
      </div>
    `;
  }

  renderiOS() {
    return html`
      <div class="container ios">
        <div class="add-btn">Add</div>
        <img class="phone-img" alt="iOS PWA installation" src="../../../../../assets/previewer-images/ios/add-to-home.png" />
        <div class="hidden"></div>
        <div class="icon">
          ${this.iconUrl ? 
            html`<img alt="App icon" src=${this.iconUrl} />` : null}
        </div>
        <div class="app-name">${this.appName}</div>
        <div class="app-link">${this.siteUrl}</div>
      </div>
    `;
  }
}
