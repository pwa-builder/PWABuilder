import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { swSelectorStyles } from "./sw-selector.styles";

import '../components/sw-panel'
import { AnalyticsBehavior, recordPWABuilderProcessStep } from '../utils/analytics';
import { service_workers } from '../utils/service-workers/service-workers';
import '@awesome.me/webawesome/dist/components/dialog/dialog.js';
import '@awesome.me/webawesome/dist/components/tab/tab.js';
import '@awesome.me/webawesome/dist/components/tab-group/tab-group.js';
import '@awesome.me/webawesome/dist/components/tab-panel/tab-panel.js';

@customElement('sw-selector')
export class SWSelector extends LitElement {

  @state() selectedSW: string = "0";
  private swNameList: string[] = ["Offline Pages", "Offline Page Copy of Pages", "Offline Copy with Backup Offline Page"]

  static styles = [swSelectorStyles];

  constructor() {
    super();
  }

  // hides modal
  async hideDialog(e: any){
    let dialog: any = this.shadowRoot!.querySelector(".dialog");
    if(e.target === dialog){
      dialog!.open = false;
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
      <wa-dialog class="dialog" @wa-show=${() => document.body.style.height = "100vh"} @wa-hide=${(e: any) => this.hideDialog(e)}>
        <div id="selector-header">
          <h1>Download a Service Worker</h1>
          <p>Download one of our pre-built Service Workers package that utilize Workbox to make building your offline experience easy.</p>
        </div>
        <wa-tab-group id="sw-tabs" @wa-tab-show=${(e: any) => this.setSelectedSW(e)}>
          ${service_workers.map((_sw: any, index: number) => 
            html`
            <wa-tab tabindex="0" slot="nav" panel=${index}>${this.swNameList[index]}</wa-tab>`)}
          ${service_workers.map((sw: any, index: number) => 
            html`
            <wa-tab-panel name=${index}><sw-panel .sw=${sw} ></sw-panel></wa-tab-panel>`)}
        </wa-tab-group>

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
      </wa-dialog>
    `;
  }
}
