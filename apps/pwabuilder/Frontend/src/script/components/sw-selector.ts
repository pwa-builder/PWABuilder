import { LitElement, css, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import '../components/sw-panel'
import { AnalyticsBehavior, recordPWABuilderProcessStep } from '../utils/analytics';
import { service_workers } from '../utils/service-workers/service-workers';
import '@shoelace-style/shoelace/dist/components/dialog/dialog.js';
import '@shoelace-style/shoelace/dist/components/tab-group/tab-group.js';
import '@shoelace-style/shoelace/dist/components/tab/tab.js';
import '@shoelace-style/shoelace/dist/components/tab-panel/tab-panel.js';

@customElement('sw-selector')
export class SWSelector extends LitElement {

  @state() selectedSW: string = "0";
  private swNameList: string[] = ["Offline Pages", "Offline Page Copy of Pages", "Offline Copy with Backup Offline Page"]

  static get styles() {
    return css`

      sl-tab-group {
        --indicator-color: #4F3FB6;
      }
      sl-tab {
        display: flex;
      }
      sl-tab::part(base) {
        --sl-font-size-small: 14px;
        --sl-spacing-medium: .75rem;
        --sl-space-large: 1rem;
        max-width: 190px;
        white-space: unset;
        text-align: center;
        align-self: flex-end;
      }
      sl-tab[active]::part(base) {
        color: #4F3FB6;
      }
      sl-tab::part(base):hover {
        color: #4F3FB6;
      }
      sl-tab::part(base):focus-visible{
        color: #4F3FB6;
        outline: 1px solid black;
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
        border-radius: var(--card-border-radius);
      }
      .dialog::part(close-button__base){
        position: absolute;
        top: 5px;
        right: 5px;
        z-index: 1000;
      }
      .dialog::part(close-button__base):focus-visible{
        outline: 1px solid black;
      }

      #frame-footer {
        background-color: #F2F3FB;
        padding: 1.5em 2em;
        border-bottom-left-radius: var(--card-border-radius);
        border-bottom-right-radius: var(--card-border-radius);
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
      #footer-links #instructions {
        font-size: 14px;
        color: #808080;
        text-align: left;
        margin: 0;
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

  // hides modal
  async hideDialog(e: any){
    let dialog: any = this.shadowRoot!.querySelector(".dialog");
    if(e.target === dialog){
      await dialog!.hide();
      recordPWABuilderProcessStep("sw_selector_closed", AnalyticsBehavior.ProcessCheckpoint);
      document.body.style.height = "unset";
    }
  }

  // sets selected SW so we know which to download
  setSelectedSW(e: any){
    this.selectedSW = e.detail.name;
    recordPWABuilderProcessStep(`${this.selectedSW}_tab_clicked`, AnalyticsBehavior.ProcessCheckpoint)
  }

  // downloads selected SW
  downloadSW(){
    let filename = "pwabuilder-sw.js";
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(service_workers[parseInt(this.selectedSW)].code));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);

    recordPWABuilderProcessStep(`sw_modal.${this.selectedSW}_downloaded`, AnalyticsBehavior.ProcessCheckpoint);

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
          ${service_workers.map((_sw: any, index: number) => 
            html`
            <sl-tab tabindex="0" slot="nav" panel=${index}>${this.swNameList[index]}</sl-tab>`)}
          ${service_workers.map((sw: any, index: number) => 
            html`
            <sl-tab-panel name=${index}><sw-panel .sw=${sw} ></sw-panel></sl-tab-panel>`)}
        </sl-tab-group>

        <div id="frame-footer" slot="footer">
          <div id="footer-links">
            <p id="instructions">Click below for instructions on how to register your Service Worker.</p>
            <a 
              class="arrow_anchor" 
              href="https://docs.pwabuilder.com/#/home/sw-intro?id=registration" 
              rel="noopener" 
              target="_blank"
              @click=${() => recordPWABuilderProcessStep("sw_modal.sw_documentation_clicked", AnalyticsBehavior.ProcessCheckpoint)}>
              <p class="arrow_link">Register your Service Worker</p> 
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
