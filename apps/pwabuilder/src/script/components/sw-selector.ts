import { LitElement, css, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import '../components/sw-panel'
import { AnalyticsBehavior, recordPWABuilderProcessStep } from '../utils/analytics';
import { service_workers } from '../utils/service-workers/service-workers';

@customElement('sw-selector')
export class SWSelector extends LitElement {

  @state() selectedSW: string = "0";

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
      .dialog::part(overlay){
          backdrop-filter: blur(10px);
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

      @media(max-width: 600px){  
        
        #frame-footer {
          flex-direction: column-reverse;
          gap: 1em;
        }
        #footer-actions {
          width: 100%;
        }
        #footer-links {
          width: 100%;
          align-items: center;
        }
        .primary {
          font-size: 14px;
          white-space: nowrap;
          width: 100%;
        }
      }
    `;
  }

  constructor() {
    super();
  }

  async hideDialog(e: any){
    let dialog: any = this.shadowRoot!.querySelector(".dialog");
    if(e.target === dialog){
      await dialog!.hide();
      recordPWABuilderProcessStep("sw_selector_closed", AnalyticsBehavior.ProcessCheckpoint);
      document.body.style.height = "unset";
    }
  }

  setSelectedSW(e: any){
    this.selectedSW = e.detail.name;
  }

  downloadSW(){
    let filename = "pwabuilder-sw.js";
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(service_workers[parseInt(this.selectedSW)].code));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);

    let readyForRetest = new CustomEvent('readyForRetest', {
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(readyForRetest);

  }

  render() {
    return html`
      <sl-dialog class="dialog" @sl-show=${() => document.body.style.height = "100vh"} @sl-hide=${(e: any) => this.hideDialog(e)} noHeader>
        <div id="selector-header">
          <h1>Download a Service Worker</h1>
          <p>Download one of our pre-built Service Workers package that utilize Workbox to make building your offline experience easy.</p>
        </div>
        <sl-tab-group id="sw-tabs" @sl-tab-show=${(e: any) => this.setSelectedSW(e)}>
          ${service_workers.map((sw: any, index: number) => 
            html`
            <sl-tab slot="nav" panel=${index}>SW #${index + 1}</sl-tab>
            <sl-tab-panel name=${index}><sw-panel .sw=${sw} ></sw-panel></sl-tab-panel>`)}
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