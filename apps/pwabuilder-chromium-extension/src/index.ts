import { LitElement, html } from "lit";
import {customElement, property} from 'lit/decorators.js';
import './components/scanner';
import './components/package-windows';
// import './components/manifest-designer';
// import '@pwabuilder/manifest-editor';

import "@shoelace-style/shoelace/dist/components/tab-group/tab-group";
import "@shoelace-style/shoelace/dist/components/tab/tab";
import "@shoelace-style/shoelace/dist/components/tab-panel/tab-panel";
import { getManifestInfo } from "./checks/manifest";
import { SiteData } from "./interfaces/validation";
import { getSwInfo } from "./checks/sw";


@customElement("pwa-extension")
export class PwaExtension extends LitElement {

  @property() public siteData!: SiteData;

  async firstUpdated() {
    let url = await chrome.tabs.query({ active: true, currentWindow: true });
    if (url.length < 1) {
      return;
    }
    
    let manifestInfo = await getManifestInfo();
    let swInfo = await getSwInfo();
    this.siteData = {
      currentUrl: url[0].url || "",
      manifest: manifestInfo,
      sw: swInfo
    }
    console.log(this.siteData);
  }

  render() {
    return html`
    <sl-tab-group>
      <sl-tab slot="nav" panel="validate">Validate</sl-tab>
      <sl-tab slot="nav" panel="manifest">Manifest</sl-tab>
      <sl-tab slot="nav" panel="package">Package</sl-tab>

      <sl-tab-panel name="validate">
        <pwa-scanner .siteData=${this.siteData}></pwa-scanner>
      </sl-tab-panel>

      <sl-tab-panel name="manifest">
        <!-- <pwa-manifest-editor></pwa-manifest-editor> -->
      </sl-tab-panel>

      <sl-tab-panel name="package">
        <package-windows .siteData=${this.siteData}></package-windows>
      </sl-tab-panel>
    </sl-tab-group>
    `
    ;
  }

}