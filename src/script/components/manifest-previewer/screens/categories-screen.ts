import { css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import '../disclaimer-message.js';
import { ScreenTemplate } from './screen-template';
import { Icon } from '../../../utils/interfaces';

@customElement('categories-screen')
export class CategoriesScreen extends ScreenTemplate {
  static get styles() {
    return [
      super.styles,
      css`
        .container {
          position: relative;
          margin: 30px auto 0;
          width: 260px;
        }

        .container.windows {
          font-family: var(--previewer-windows-font-family);
        }

        .container.android {
          width: 225px;
        }

        .store-img {
          width: 100%;
          position: absolute;
          inset: 0;
          box-shadow: var(--previewer-card-box-shadow);
        }

        .windows .app-header {
          background-color: #FFF;
          position: absolute;
          top: 12px;
          width: 100px;
          left: calc(50% - 45px);
          display: flex;
          flex-direction: column;
          align-items: center;
          height: 132px;
        }

        .windows .app-header img {
          width: 80px;
        }

        .windows .rating {
          position: absolute;
          margin: 0px;
          top: 259px;
          left: 49px;
          font-size: 10px;
          background-color: #FFF;
          width: 29px;
          text-align: center;
        }

        .windows .description {
          background-color: #FFF;
          position: absolute;
          font-size: 9px;
          text-align: center;
          top: 290px;
          padding: 0 30px;
          box-sizing: border-box;
          height: 35px;
          width: 100%;
          overflow: hidden;
          line-height: 1.5;
        }

        .categories {
          display: flex;
          flex-wrap: wrap;
          position: absolute;
          background-color: #FFF;
          left: 8px;
          right: 8px;
        }

        .windows .categories {
          top: 324px;
          height: 59px;
        }

        .android .categories {
          top: 340px;
          height: 37px;
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
          top: 34px;
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

        .android .screenshots {
          position: absolute;
          display: flex;
          height: 100px;
          top: 167px;
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
          top: 300px;
          padding-left: 10px;
          height: 30px;
          width: 80%;
          overflow: hidden;
          line-height: 1.5;
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
  @property({ type: Array }) screenshots?: Icon[];

  /**
   * The URL where the manifest resides.
   */
  @property() manifestUrl = '';

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
        <img class="store-img" alt="Microsoft Store" src="../../../../../assets/previewer-images/windows/store-listing.png" />
        <div class="app-header">
          ${this.iconUrl ? html`<img alt="App icon" src=${this.iconUrl} />` : null}
          <h4>${this.appName || 'PWA App'}</h4>
        </div>
        <p class="rating">5.0</p>
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
      <div class="container android">
        <img class="store-img" alt="Microsoft store" src="../../../../../assets/previewer-images/android/app-listing.png" />
        ${this.iconUrl ? 
          html`<img class="app-icon" alt="App icon" src=${this.iconUrl} />` : 
          html`<div class="app-icon"></div>`}
        <div class="app-name">${this.appName || 'PWA App'}</div>
        <div class="screenshots">
          ${this.screenshots?.map(shot => 
            html`<img alt="App screenshot" src=${this.getImageUrl(shot.src)} />`)}
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

  renderiOS() {
    return html`
      <div class="ios-message">
        <disclaimer-message>
          These categories are not necessarily related to those specified on 
          the manifest. 
        </disclaimer-message>
      </div>
    `;
  }
}