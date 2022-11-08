import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import {classMap} from 'lit/directives/class-map.js';



@customElement('share-card')
export class ShareCard extends LitElement {

  @property() preventClosing = false;
  @property() manifestData = "";
  @property() swData = "";
  @property() securityData = "";
  @property() siteName = "";

  


  static get styles() {
    return css`
      #frame-wrapper {
        display: flex;
        flex-direction: column;
        height: 100%;
        padding: 0 20px;
      }
      #frame-content {
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: space-around;
      }
      #html-image {
        width: 100%;
        height: 270px;
        border-radius: 8px;
        margin-top: 12px;
        background-image: url("/assets/share_score_backdrop.png");
      }
      #share-content {
        display: flex;
        flex-direction: row;
        align-items: flex-start;
        justify-content: space-between;
        margin-bottom: 30px;
        padding: 0px 8px;
      }
      #download-button {
        color: white;
        background-color: #292C3A;
        border-color: #292C3A;
      }
      #copy-button {
        width: 43px;
        height: 40px;
        background-color: #FBFBFB;
        border: 1px solid #80808080;
        border-radius: 8px;
      }
      .dialog::part(header){
        display: none;
      }
      .dialog::part(panel) {
        width: 400px !important;
        height: 480px;
        border-radius: 10px;
      }
      .dialog::part(body){
        padding: 0;
        width: 100%;
      }
      .dialog::part(title){
        display: block;
      }
      .dialog::part(panel) {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        border-radius: 20px;
        height: 450px;
        width: 50%;
      }
      .dialog::part(overlay){
        backdrop-filter: blur(10px);
      }
      .dialog::part(close-button__base){
        position: absolute;
        top: 5px;
        right: 5px;
        z-index: 1000;
      }
      .dialog_header {
        height: 12px !important;
      }
      .button {
        width: 166px;
        height: 44px;
        background: transparent;
        color: rgb(79, 63, 182);
        border: 1px solid rgb(79, 63, 182);
        font-size: 16px;
        font-weight: bold;
        border-radius: 50px;
        padding: 10px 46px;
      }
      .icon-button {
        font-size: 15px !important;
      }
      .modal-input-field {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        padding: 0 .2em;
      }
      sl-input::part(base) {
        border: 1px solid #80808080;
        border-radius: var(--input-radius);
        color: var(--font-color);
        width: 298px;
        font-size: 14px;
        height: 40px;
      }
      sl-input::part(input) {
        height: 40px;
        padding: 10px 12.24px;
        color: #757575;
      }
      sl-progress-ring {
          --track-width: 4px;
          --indicator-width: 8px;
          --size: 50px;
          font-size: 18px;
      }
      sl-progress-ring::part(label){
          color: #4F3FB6;
          font-weight: bold;
      }
      .red {
        --indicator-color: var(--error-color);
      }
      .yellow {
        --indicator-color: var(--warning-color);
      } 
      .green {
        --indicator-color: var(--success-color);
      }

      #rings {
        display: flex;
        flex-direction: column;
      }
    `
  }

  renderProgressRings(cardData: any) {
    /* const progress_ring_data = [
      this.manifestData,
      this.swData,
      this.securityData
    ] */

    console.log("Progress Ring Data:", cardData);
    let data = cardData.split('/');
    let validCounter = parseFloat(data[0]);
    let totalScore = parseFloat(data[1]);
    let color = JSON.parse(data[2]);
    let categoryName = data[3];

    console.log("SPLIT DATA:", data);
    
    return html`
      <sl-progress-ring
        id=${categoryName}
        class=${classMap(color)}
        value="${(validCounter / totalScore) * 100}"
      >
        ${validCounter} / ${totalScore}
      </sl-progress-ring>
    `
  }

  getReportCardLink() {
    const url = new URL(window.location.href);
    return url;
  }

  hideDialog(e: any){
    let dialog: any = this.shadowRoot!.querySelector(".dialog");
    dialog!.hide();
  }

  handleRequestClose(e: Event) {
    if (this.preventClosing) {
      e.preventDefault();
    }
  }

  render() {
    return html`
      <sl-dialog class="dialog" @sl-show=${() => document.body.style.height = "100vh"} @sl-hide=${(e: any) => this.hideDialog(e)} noHeader>
        <div id="frame-wrapper">
          <div id="frame-content">
            <div id="html-image">
              <div>
                ${this.siteName}
              </div>
              <div id="rings">
                ${[
                    this.manifestData,
                    this.swData,
                    this.securityData
                  ].map((data: any) => this.renderProgressRings(data))}
              </div>
            </div>
            <div class="modal-input-field">
                <sl-input
                  type="url"
                  .value=${this.getReportCardLink()}
                >
                </sl-input>
                <!-- todo: add copy to clipboard function -->
                <button id="copy-button">
                  <img src="/assets/copy_icon_grey.png"/>
                </button>
            </div>
            <div id="share-content">        
              <button type="button" id="cancel-button" class="button" @click=${(e:any) => this.hideDialog(e)}>Cancel</button>
              <!-- todo: add image download function -->
              <button type="button" id="download-button" class="button">Download</button>                    
            </div>
          </div>
        </div>
      </sl-dialog>
    `
  }
}