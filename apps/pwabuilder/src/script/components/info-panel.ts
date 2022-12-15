import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import { AnalyticsBehavior, recordPWABuilderProcessStep } from '../utils/analytics';
import { infoPanel } from '../utils/manifest-info';

import '@pwabuilder/code-editor';
import '@pwabuilder/manifest-editor';
import { Manifest } from '@pwabuilder/manifest-validation';
import { getManifestContext } from '../services/app-info';
import { PWAManifestEditor } from '@pwabuilder/manifest-editor';
import { getManifestEditorManifest, updateManifestEditorManifest } from '../services/manifest-editor-handler';

@customElement('info-panel')
export class InfoPanel extends LitElement {

  @property({ type: String}) field: string | undefined;
  @property({ type: Object}) info: infoPanel | undefined;
  @state() infoShowing: boolean = true;
  @state() manifest: Manifest | undefined;
  @state() manifestURL: string | undefined;
  @state() baseURL: string | undefined;
  @state() initME: boolean = false;
  /*
  export interface infoPanel {
    description: string;
    purpose?: string;
    example: string;
    code: string;
    required: boolean;
  } 
  */

  static get styles() {
    return css`
      .dialog {
        --footer-spacing: 0;
      }
      /* .dialog::part(body){
        padding-top: 0;
      } */
      .dialog::part(title){
        display: none;
      }
      .dialog::part(overlay){
          backdrop-filter: blur(10px);
        }
      .dialog::part(panel) {
        position: relative;
        border-radius: 20px;
      }
      .dialog::part(close-button__base){
        position: absolute;
        top: 5px;
        right: 5px;
        z-index: 1000;
      }

      .title-block {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 95%;
      }

      .title {
        font-size: 24px;
        color: #292C3A;
      }

      .title-block .alternate {
        background: var(--secondary-color);
        color: #4f3fb6;
        border: 1px solid #4f3fb6;
        font-size: 16px;
        font-weight: bold;
        border-radius: 50px;
        padding: 0.75em 2em;
        white-space: nowrap;
      }
      .title-block .alternate:hover {
        cursor: pointer;
        box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.3);
      }

      .block {
        color: #292C3A;
      }

      .question {
        font-size: 18px;
        margin: 13px 0;
      }
      .answer {
        font-size: 16px;
        margin: 0;
      }

      .back-button {
        border: none;
        background-color: transparent;
      }
      .back-button:hover {
        cursor: pointer;
      }
    `;
  }

  constructor() {
    super();
  }

  connectedCallback(): void {
    super.connectedCallback();
    let context = getManifestContext();
    if(!this.initME){
      this.manifest = context.manifest;
      this.initME = true;
    } else {
      this.manifest = getManifestEditorManifest();
    }
    this.manifestURL = context.manifestUrl;
    this.baseURL = context.siteUrl;
  }

  capFirstLetter(field: string) {
    return field?.split("_").map((str: string) => str = str.charAt(0).toUpperCase() + str.slice(1)).join(" ");
  }

  // hides modal
  async hideDialog(e: any){
    let dialog: any = this.shadowRoot!.querySelector(".dialog");

    if(e.target === dialog){
      
      // reset to info page
      this.infoShowing = true;

      // save manifest state
      let editor = (this.shadowRoot!.querySelector("pwa-manifest-editor") as PWAManifestEditor)
      if(editor && editor!.manifest){
        updateManifestEditorManifest(editor.manifest);
      }
      
      // hide dialog and record analytics
      await dialog!.hide();
      recordPWABuilderProcessStep("info_panel_closed", AnalyticsBehavior.ProcessCheckpoint);
      document.body.style.height = "unset";
    }
  }

  showEditor(){
    this.infoShowing = !this.infoShowing;
  }

  render() {
    return html`
    
        <sl-dialog class="dialog" @sl-show=${() => document.body.style.height = "100vh"} @sl-hide=${(e: any) => this.hideDialog(e)} noHeader>
        ${this.infoShowing ? 
        html`  
          <div class="title-block"> 
            <h1 class="title">${this.capFirstLetter(this.field!)}</h1>
            <button type="button" class="alternate" @click=${() => this.showEditor()}>Edit in Manifest</button>
          </div>
          
          <div class="block">
            <h2 class="question">What is the ${this.capFirstLetter(this.field!)} field?</h2>
            <p class="answer">${this.info?.description}</p>
          </div>

          <div class="block">
            <h2 class="question">Why should I use the ${this.capFirstLetter(this.field!)} field?</h2>
            <p class="answer">${this.info?.purpose}</p>
          </div>

          <div class="block">
            <h2 class="question">How do I implement the ${this.capFirstLetter(this.field!)} field?</h2>
            <p class="answer">${this.info?.example}</p>
            <code-editor 
              .startText=${this.info?.code}
              .readOnly=${true}>
            </code-editor>
          </div>` :
          html`
            <div class="editor-wrapper">
              <button type="button" class="back-button" @click=${() => this.showEditor()}> <img src="/assets/new/back_for_package_form.svg" alt="back info page" /> </button>
              <h1 class="title">Edit your Manifest</h1>
              <pwa-manifest-editor 
                .initialManifest=${this.manifest} 
                .manifestURL=${this.manifestURL} 
                .baseURL=${this.baseURL}
                .startingTab=${this.info!.location}
                .focusOn=${this.field}
              ></pwa-manifest-editor>
            </div>
          ` 
        }
          
        </sl-dialog>
    `
  }
}
