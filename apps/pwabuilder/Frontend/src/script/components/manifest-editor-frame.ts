import { LitElement, html } from 'lit';
import { customElement, state, property } from 'lit/decorators.js';
import { manifestEditorFrameStyles } from "./manifest-editor-frame.styles";


import { getManifestContext } from '../services/app-info';
import { AnalyticsBehavior, recordPWABuilderProcessStep } from '../utils/analytics';
import type { Manifest } from '../models/manifest';
import type WaDialog from '@awesome.me/webawesome/dist/components/dialog/dialog.js';
import { ManifestContext } from '../utils/interfaces';
import { env } from '../utils/environment';
import '../components/manifest-editor/pwa-manifest-editor.js';

@customElement('manifest-editor-frame')
export class ManifestEditorFrame extends LitElement {

    @property({ type: Boolean }) isGenerated: boolean = false;
    @property({ type: String }) startingTab: string = "info";
    @property({ type: String }) focusOn: string = "";
    @property({ type: String }) analysisId: string = "";

    @state() manifest: Manifest = {};
    @state() manifestURL: string = '';
    @state() baseURL: string = '';
    @state() tooltipOpen: boolean = false;
    static styles = [manifestEditorFrameStyles];

    constructor() {
        super();
    }

    // grabs the manifest, manifest url and site base url on load
    connectedCallback(): void {
        super.connectedCallback();
        this.manifest = getManifestContext().manifest;
        this.manifestURL = getManifestContext().manifestUrl;
        this.baseURL = sessionStorage.getItem("current_url")!;
    }

    public launch(appUrl: string, manifest: ManifestContext): void {
        this.manifest = manifest.manifest;
        this.manifestURL = manifest.manifestUrl;
        this.baseURL = appUrl;

        const dialog = this.shadowRoot?.querySelector(".dialog") as WaDialog;
        if (dialog) {
            dialog.open = true;
        }
    }

    // downloads manifest and tells the site they need to retest to see new manifest changes
    downloadManifest() {
        let editor = (this.shadowRoot!.querySelector("pwa-manifest-editor") as any);
        editor.downloadManifest();

        let readyForRetest = new CustomEvent('readyForRetest', {
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(readyForRetest);
    }

    // hides modal
    async hideDialog(e: any) {
        const dialog: any = this.shadowRoot!.querySelector(".dialog");
        if (e.target === dialog) {
            dialog!.open = false;
            recordPWABuilderProcessStep("manifest_editor_closed", AnalyticsBehavior.ProcessCheckpoint);
            document.body.style.height = "unset";
        }
    }

    async openDialog() {
        document.body.style.height = "100vh"
        const dialog = this.shadowRoot!.querySelector(".dialog");

        dialog?.removeEventListener('wa-request-close', () => { });
        dialog?.addEventListener('wa-request-close', (event: any) => {
            if (event.detail.source === 'keyboard' && this.tooltipOpen) {
                event.preventDefault();
            }
        }, { once: true });
    }

    /* Next functions are for analytics */

    handleTabSwitch(e: CustomEvent) {
        recordPWABuilderProcessStep(`manifest_editor.tab_switched`, AnalyticsBehavior.ProcessCheckpoint);
        recordPWABuilderProcessStep(`manifest_editor.${e.detail.tab}_tab_selected`, AnalyticsBehavior.ProcessCheckpoint);
    }

    handleManifestDownloaded() {
        recordPWABuilderProcessStep(`manifest_editor.download_manifest_clicked`, AnalyticsBehavior.ProcessCheckpoint);
    }

    handleFieldChange(e: CustomEvent) {
        let readyForRetest = new CustomEvent('readyForRetest', {
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(readyForRetest);
        recordPWABuilderProcessStep(`manifest_editor.field_change_attempted`, AnalyticsBehavior.ProcessCheckpoint, { field: e.detail.field });
    }

    handleManifestCopied() {
        recordPWABuilderProcessStep(`manifest_editor.copy_manifest_clicked`, AnalyticsBehavior.ProcessCheckpoint);
    }

    handleImageGeneration(e: CustomEvent, field: string) {
        if (field === "icons") {
            recordPWABuilderProcessStep(`manifest_editor.icon_generation_attempted`, AnalyticsBehavior.ProcessCheckpoint, { platforms: [...e.detail.selectedPlatforms] });
        } else {
            recordPWABuilderProcessStep(`manifest_editor.screenshot_generation_attempted`, AnalyticsBehavior.ProcessCheckpoint);
        }
    }

    handleUploadIcon() {
        recordPWABuilderProcessStep(`manifest_editor.upload_icon_clicked`, AnalyticsBehavior.ProcessCheckpoint);
    }

    render() {
        return html`
      <wa-dialog class="dialog" @wa-show=${() => this.openDialog()} @wa-hide=${(e: any) => this.hideDialog(e)}>
        <div id="frame-wrapper">
          <div id="frame-content">
            <div id="frame-header">
              <h1>${this.isGenerated ? "Generate manifest" : "Edit your manifest"}</h1>
              <p>Update your app name and description, add or update your icons, enable platform capabilities and more by editing the fields below. Once you are done with your changes, download or copy the generated manifest and/or icons and upload them to your site. Once done, re-test the url to make sure your PWA is ready for stores!</p>
            </div>
            <pwa-manifest-editor 
              .initialManifest=${this.manifest} 
              .manifestURL=${this.manifestURL} 
              .baseURL=${this.baseURL}
              .focusOn=${this.focusOn}
              .startingTab=${this.startingTab}
              .imageProxyUrl=${env.imageProxyUrl}
              .analysisId=${this.analysisId}
              @tabSwitched=${(e: CustomEvent) => this.handleTabSwitch(e)}
              @manifestDownloaded=${() => this.handleManifestDownloaded()}
              @fieldChangeAttempted=${(e: CustomEvent) => this.handleFieldChange(e)}
              @editorCopied=${() => this.handleManifestCopied()}
              @generateScreenshotsAttempted=${(e: CustomEvent) => this.handleImageGeneration(e, "screenshots")}
              @uploadIcons=${() => this.handleUploadIcon()}
              @generateIconsAttempted=${(e: CustomEvent) => this.handleImageGeneration(e, "icons")}
              
            ></pwa-manifest-editor>
            
          </div>
          <div id="frame-footer" slot="footer">
            <div id="footer-links">
                <a class="arrow_anchor" href="https://aka.ms/install-pwa-studio" rel="noopener" target="_blank">
                  <p class="arrow_link">VS Code Extension</p> 
                  <img src="/assets/new/arrow.svg" alt="arrow" role="presentation"/>
                </a>
                <a class="arrow_anchor" href="https://docs.pwabuilder.com/#/home/pwa-intro?id=web-app-manifests" rel="noopener" target="_blank">
                  <p class="arrow_link">Manifest Documentation</p> 
                  <img src="/assets/new/arrow.svg" alt="arrow" role="presentation"/>
                </a>
            </div>
            <div id="footer-actions">
              <button type="button" class="primary" @click=${() => this.downloadManifest()}>Download Manifest</button>
            </div>
          </div>
        </div>
      </wa-dialog>
    `;
    }
}