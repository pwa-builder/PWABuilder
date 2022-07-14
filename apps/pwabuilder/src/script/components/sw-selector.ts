import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import '../components/sw-panel'

@customElement('sw-selector')
export class SWSelector extends LitElement {

  @property({type: Boolean}) open: boolean = false;
  @state() selectedSW: string = "1";

  static get styles() {
    return css`

      sl-tab-group {
        --indicator-color: #4F3FB6;
      }
      sl-tab::part(base) {
        --sl-font-size-small: 14px;
        --sl-spacing-medium: .75rem;
        --sl-space-large: 1rem;
      }
      sl-tab[active]::part(base) {
        color: #4F3FB6;
      }
      sl-tab::part(base):hover {
        color: #4F3FB6;
      }
      sl-tab-panel::part(base){
        overflow-y: auto;
        overflow-x: hidden;
        height: 500px;
        padding: .5em 0;
      }
      #selector-header {
        display: flex;
        flex-direction: column;
        gap: .5em;
        padding-top: 1em;
      }
      #selector-header h1 {
        margin: 0;
        font-size: 24px;
      }
      #selector-header p {
        margin: 0;
        font-size: 14px;
      }
      .dialog {
        --footer-spacing: 0;
      }
      .dialog::part(body){
        padding-top: 0;
      }
      .dialog::part(title){
        display: none;
      }
      .dialog::part(panel) {
        position: relative;
      }
      .dialog::part(close-button__base){
        position: absolute;
        top: 5px;
        right: 5px;
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
        white-space: nowrap;
        width: fit-content;
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
    `;
  }

  constructor() {
    super();
  }

  communicateHide(){
    let swSelectorClosed = new CustomEvent('swSelectorClosed', {
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(swSelectorClosed);
  }

  setSelectedSW(e: any){
    this.selectedSW = e.detail.name;
    console.log(this.selectedSW);
  }

  downloadSW(){
    var a = document.createElement("a");
    a.href = '/assets/service-workers/sw_' + this.selectedSW + '.js';
    a.setAttribute("download", "pwabuilder-sw.js");
    a.click();
  }

  render() {
    return html`
      <sl-dialog class="dialog" ?open=${this.open} @sl-hide=${() => this.communicateHide()} noHeader>
        <div id="selector-header">
          <h1>Download a Service Worker</h1>
          <p>Download one of our pre-built Service Workers package that utilize Workbox to make building your offline experience easy.</p>
        </div>
        <sl-tab-group id="sw-tabs" @sl-tab-show=${(e: any) => this.setSelectedSW(e)}>
          <sl-tab slot="nav" panel="1">SW #1</sl-tab>
          <sl-tab slot="nav" panel="2">SW #2</sl-tab>
          <sl-tab slot="nav" panel="3">SW #3</sl-tab>

          <sl-tab-panel name="1"><sw-panel .type=${"Offline Pages"}></sw-panel></sl-tab-panel>
          <sl-tab-panel name="2"><sw-panel .type=${"Offline Page Copy of Pages"}></sw-panel></sl-tab-panel>
          <sl-tab-panel name="3"><sw-panel .type=${"Offline Copy with Backup Offline Page"}></sw-panel></sl-tab-panel>
        </sl-tab-group>

        <div id="frame-footer" slot="footer">
            <div id="footer-links">
                <a class="arrow_anchor" href="https://aka.ms/install-pwa-studio" rel="noopener" target="_blank">
                  <p class="arrow_link">VS Code Extension</p> 
                  <img src="/assets/new/arrow.svg" alt="arrow" role="presentation"/>
                </a>
                <a class="arrow_anchor" href="" rel="noopener" target="_blank">
                  <p class="arrow_link">Service Worker Documentation</p> 
                  <img src="/assets/new/arrow.svg" alt="arrow" role="presentation"/>
                </a>
            </div>
            <div id="footer-actions">
              <button type="button" class="primary" @click=${() => this.downloadSW()}>Download Service Worker</button>
            </div>
          </div>
      </sl-dialog>
    `;
  }
}