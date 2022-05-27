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
        padding: 1em;
        display: flex;
        flex-direction: column;
        row-gap: .5em;
        width: 100%;
      }

      #frame-header {
        display: flex;
        flex-direction: column;
        row-gap: .5em;
      }

      #frame-header > * {
        margin: 0;
      }

      /* < 480px */
      ${smallBreakPoint(css`

      `)}

      /* 480px - 639px */
      ${mediumBreakPoint(css`

      `)}

      /* 640px - 1023px */
      ${largeBreakPoint(css`
        .card {
          min-width: 140px;
          max-width: 200px;
          height: 12em;
          padding: .75em;
          padding-bottom: 1.25em;
        }
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

  render() {
    return html`
      <div id="frame-wrapper">
        <div id="frame-header">
          <h1>Generate Manifest</h1>
          <p>Generate your Manifest Base Files Package below by editing the required fields. Once you have added the updated maifest to your PWA, re-test the url to make sure your PWA is ready for stores!</p>
        </div>
        <pwa-manifest-editor .initialManifest=${getManifestContext().manifest} .manifestURL=${getManifestContext().manifestUrl}></pwa-manifest-editor>
        <div id="frame-footer"></div>
      </div>
    `;
  }
}