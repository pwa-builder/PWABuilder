import { css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import '../disclaimer-message.js';
import { screenBaseStyles, ScreenTemplate } from './screen-template';
import { ImageResource } from '../models';

@customElement('categories-screen')
export class CategoriesScreen extends ScreenTemplate {
  static get styles() {
    return [
      screenBaseStyles,
      css`
        .container {
          position: relative;
          margin: 30px auto 0;
          width: 260px;
        }

        .container.windows {
          font-family: var(--windows-font-family, Arial);
        }

        .container.android {
          width: 225px;
          box-shadow: var(--card-box-shadow);
          height: 375px;
        }

        .store-img {
          width: 100%;
          box-shadow: var(--card-box-shadow);
        }

        .windows .app-header {
          background-color: #FFF;
          position: absolute;
          top: 5px;
          width: 160px;
          left: calc(50% - 75px);
          display: flex;
          flex-direction: column;
          align-items: center;
          height: 144px;
          padding-top: 20px;
        }

        .windows .app-header img {
          width: 80px;
        }

        .windows .app-header h4 {
          text-align: center;
        }

        .windows .description {
          background-color: #FFF;
          position: absolute;
          font-size: 9px;
          text-align: center;
          bottom: 56px;
          padding: 0 30px;
          box-sizing: border-box;
          height: 50px;
          width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 4;
          -webkit-box-orient: vertical;
        }

        .categories {
          display: flex;
          flex-wrap: wrap;
          position: absolute;
          background-color: #FFF;
          left: 6px;
          right: 6px;
          height: 45px;
        }

        .windows .categories {
          bottom: 12px;
        }

        .android .categories {
          top: 315px;
          height: 55px;
        }

        .windows .categories div, .android .categories div {
          margin-right: 8px;
          border-radius: 17px;
          height: fit-content;
          padding: 2px 7px;
          font-size: 10px;
          min-width: 20px;
          text-align: center;
          border: solid 0.5px #CECECE;
        }

        .android .app-icon {
          width: 41px;
          height: 41px;
          position: absolute;
          top: 25px;
          left: 12px;
          background-color: #FFF;
        }

        .android .app-name {
          font-size: 14px;
          margin: 0;
          position: absolute;
          background-color: #FFF;
          font-weight: 600;
          top: 35px;
          left: 66px;
          min-width: 70px;
          height: 30px;
        }

        .android .install-button {
          background-color: #0E825E;
          color: #FFF;
          width: 95%;
          position: absolute;
          top: 80px;
          text-align: center;
          left: 2.5%;
          font-size: 10px;
          padding: 2px 0px;
          border-radius: 3px;
        }

        .android .screenshots {
          position: absolute;
          display: flex;
          height: 100px;
          top: 117px;
          width: 100%;
          overflow-x: hidden;
          background-color: #FFF;
        }

        .android .screenshots img {
          height: 100%;
          margin: 0 5px;
        }

        .android .description {
          position: absolute;
          background-color: #FFF;
          font-size: 9px;
          top: 235px;
          padding-left: 10px;
          max-height: 80px;
          width: 80%;
          overflow: hidden;
        }

        .android .description p {
          font-weight: 600;
          margin: 0;
          font-size: 13px;
        }

        .ios-message {
          margin: 130px auto 0px;
          width: 60%;
        }
      `
    ];
  }

  /**
   * The categories attribute on the manifest.
   */
  @property({ type: Array }) categories?: string[];

  /**
   * The application's name.
   */
  @property() appName?: string;

  /**
   * The URL to use for displaying the icon.
   */
  @property() iconUrl?: string;

  /**
   * The description attribute on the manifest.
   */
  @property() description?: string;

  /**
   * The screenshots attribute on the manifest.
   */
  @property({ type: Array }) screenshots?: ImageResource[];

  /**
   * The URL where the manifest resides.
   */
  @property() manifestUrl = '';

  /**
   * We use this screen for both categories and description. This controls what we highlight.
   */
  @property() highlight: 'categories' | 'description' = 'categories';

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
      <div role="img" tabindex="0" aria-label="PWA categories in Windows" class="container windows">
        <img class="store-img" alt="Microsoft Store" src="../assets/images/windows/store-listing.png" />
        <div class="app-header">
          ${this.iconUrl ? html`<img alt="App icon" src=${this.iconUrl} />` : null}
          <h4>${this.appName || 'PWA App'}</h4>
        </div>
        <div class="description">
          ${this.description || 'A description of your PWA.'}
        </div>
        <div class="categories">
          ${this.categories?.map(categ => html`<div>${categ}</div>`)}
        </div>
      </div>
    `;
  }

  renderAndroid() {
    return html`
      <div role="img" tabindex="0" aria-label="PWA categories in Android" class="container android">
        <div class="install-button">Install</div>
        ${this.iconUrl ?
          html`<img class="app-icon" alt="App icon" src=${this.iconUrl} />` :
          html`<div class="app-icon"></div>`}
        <div class="app-name">${this.appName || 'PWA App'}</div>
        <div class="screenshots">
          ${this.screenshots?.map(shot =>
            html`<img alt="App screenshot" src=${this.getImageUrl(shot.src)} />`)}
        </div>
        <div class="description">
          <p>About this app</p>
          ${this.description || 'A description of your PWA.'}
        </div>
        <div class="categories">
          ${this.categories?.map(categ => html`<div>${categ}</div>`)}
        </div>
      </div>
    `;
  }

  renderiOS() {
    const message = this.highlight === 'categories' ?
      html`Categories in iOS App Store may not necessarily be related to the manifest's categories.` :
      html`Description in iOS App Store may not necessarily related to the manifest's description.`;
    return html`
      <div class="ios-message">
        <disclaimer-message>
          ${message}
        </disclaimer-message>
      </div>
    `;
  }
}
