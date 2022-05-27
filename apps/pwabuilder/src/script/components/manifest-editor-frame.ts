import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import {
  smallBreakPoint,
  mediumBreakPoint,
  largeBreakPoint,
  xLargeBreakPoint,
  xxxLargeBreakPoint,
} from '../utils/css/breakpoints';

import '@pwabuilder/manifest-editor';
import { getManifestContext } from '../services/app-info';

@customElement('manifest-editor-frame')
export class ManifestEditorFrame extends LitElement {

  static get styles() {
    return [
    css`

      * {
        box-sizing: border-box;
      }
      
      #frame-wrapper {
        display: flex;
        flex-direction: column;
        row-gap: .5em;
        width: 100%;
      }

      #frame-content {
        display: flex;
        flex-direction: column;
        row-gap: 1em;
        padding: 1em;
      }

      #frame-header {
        display: flex;
        flex-direction: column;
        row-gap: .5em;
      }

      #frame-header > * {
        margin: 0;
      }

      #frame-header h1 {
        font-size: 24px;
      }

      #frame-header p {
        font-size: 14px;
      }

      #frame-footer {
        background-color: #F2F3FB;
        padding: 1em 2em;
        border-bottom-left-radius: 10px;
        border-bottom-right-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .arrow_link {
        margin: 0;
        border-bottom: 1px solid #4F3FB6;
      }
      .arrow_anchor {
        text-decoration: none;
        font-size: 14px;
        font-weight: bold;
        margin: 0px 0.5em 0px 0px;
        line-height: 1em;
        color: rgb(79, 63, 182);
        display: flex;
        column-gap: 10px;
      }
      .arrow_anchor:visited {
        color: #4F3FB6;
      }
      .arrow_anchor:hover {
        cursor: pointer;
      }
      .arrow_anchor:hover img {
        animation: bounce 1s;
      }
      @keyframes bounce {
        0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
        }
        40% {
          transform: translateX(-5px);
        }
        60% {
            transform: translateX(5px);
        }
      }

      #footer-links {
        display: flex;
        flex-direction: column;
        row-gap: 1em;
        width: 50%;
      }

      #footer-actions {
        display: flex;
        flex-direction: column;
        row-gap: .5em;
        align-items: center;
        width: 50%;
      }

      #footer-actions sl-checkbox::part(base){
        --sl-input-font-size-medium: 12px;
      }

      .primary {
          background: black;
          color: white;
          border: none;
          font-size: 16px;
          font-weight: bold;
          border-radius: 50px;
          padding: 1em 1em;
          width: 75%;
        }

        .primary:hover {
          cursor: pointer;
        }

      /* < 480px */
      ${smallBreakPoint(css`

      `)}

      /* 480px - 639px */
      ${mediumBreakPoint(css`

      `)}

      /* 640px - 1023px */
      ${largeBreakPoint(css`
      `)}

      /*1024px - 1365px*/
      ${xLargeBreakPoint(css`
      `)}

      /* > 1920 */
      ${xxxLargeBreakPoint(css`
          
      `)}

    `
    ];
  }

  constructor() {
    super();
  }

  firstUpdated(){
  }

  downloadManifest(){
    let editor = (this.shadowRoot!.querySelector("pwa-manifest-editor") as any);
    editor.downloadManifest();
  }

  render() {
    return html`
      <div id="frame-wrapper">
        <div id="frame-content">
          <div id="frame-header">
            <h1>Generate Manifest</h1>
            <p>Generate your Manifest Base Files Package below by editing the required fields. Once you have added the updated maifest to your PWA, re-test the url to make sure your PWA is ready for stores!</p>
          </div>
          <pwa-manifest-editor .initialManifest=${getManifestContext().manifest} .manifestURL=${getManifestContext().manifestUrl}></pwa-manifest-editor>
          
        </div>
        <div id="frame-footer">
          <div id="footer-links">
              <a class="arrow_anchor" href="https://aka.ms/install-pwa-studio" rel="noopener" target="_blank">
                <p class="arrow_link">VS Code Extension</p> 
                <img src="/assets/new/arrow.svg" alt="arrow" role="presentation"/>
              </a>
              <a class="arrow_anchor" href="https://developer.mozilla.org/en-US/docs/Web/Manifest" rel="noopener" target="_blank">
                <p class="arrow_link">Manifest Documentation</p> 
                <img src="/assets/new/arrow.svg" alt="arrow" role="presentation"/>
              </a>
          </div>
          <div id="footer-actions">
            <sl-checkbox id="add-to-pack">Add a service worker to this package</sl-checkbox>
            <button type="button" class="primary" @click=${() => this.downloadManifest()}>Download Manifest</button>
          </div>
        </div>
      </div>
    `;
  }
}