import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import {classMap} from 'lit/directives/class-map.js';
import { smallBreakPoint } from '../utils/css/breakpoints';



@customElement('share-card')
export class ShareCard extends LitElement {

  @property() preventClosing = false;
  @property() manifestData = "";
  @property() swData = "";
  @property() securityData = "";
  @property() siteName = "";

  


  static get styles() {
    return css`
         .dialog::part(header){
        margin-bottom: 20px;
      }
      .dialog::part(body){
        padding: 0;
        width: 100%;
      }
      .dialog::part(title){
        display: none;
      }
      .dialog::part(panel) {
        width: 460px !important;
        height: 478px;
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        border-radius: 10px;
      }
      .dialog::part(overlay){
        backdrop-filter: blur(10px);
      }
      .dialog::part(close-button__base){
        position: absolute;
        top: 5px;
        right: 5px;
        z-index: 1000;
        color: #C2C9D1;
      }
      .dialog_header {
        height: 12px !important;
      }
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
        height: 330px;
        border-radius: 8px;
        margin-top: 12px;
        background-image: url("/assets/share_score_backdrop.png");
        background-position: center;
        background-size: cover;
        background-repeat: no-repeat;
      }
      #site-name {
        padding: 15px;
        font-weight: bold;
        font-size: 24px;
        line-height: 20px;
        color: #292C3A;
      }
      #share-content {
        display: flex;
        flex-direction: row;
        align-items: flex-start;
        justify-content: space-between;
        margin-bottom: 15px;
      }
      #share-content img {
        margin-right: 5px;
      }
      .standard-button {
        width: 201.96px;
        height: 44px;
        background: transparent;
        color: rgb(79, 63, 182);
        border: 1px solid rgb(79, 63, 182);
        font-size: 16px;
        font-weight: bold;
        border-radius: 50px;
      }
      #share-button {
        color: white;
        background-color: #292C3A;
        border-color: #292C3A;
      }
      #cancel-button {
        display: none;
      }
      #download-button:hover, #cancel-button:hover {
        box-shadow: rgb(0 0 0 / 30%) 0px 0px 10px;
      }
      #share-button:hover {
        outline: rgba(79, 63, 182, 0.7) solid 2px;
      }
      sl-progress-ring {
          --track-width: 4px;
          --indicator-width: 4px;
          --size: 65.32px;
          font-size: 12px;
          height: 65.32px;
          align-self: center;
      }
      sl-progress-ring::part(base) {
        border-radius: 50%;
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
      .red::part(base) {
        background-color: #f7bebe;
      }
      .yellow::part(base) {
        background-color: #FFFAED !important;
      }
      .green::part(base){
        background-color: #E3FFF2;
      }

      #rings {
        display: flex;
        flex-direction: row;
        justify-content: space-evenly;
        height: 150px;
      }

      ${smallBreakPoint(css`
        .standard-button {
          width: 133px;
        }
        #cancel-button {
          display: block;
        }
        #download-button {
          display: none;
        }
      `)}
    `
  }

  renderProgressRings(cardData: any) {
    let data = cardData.split('/');
    let validCounter = parseFloat(data[0]);
    let totalScore = parseFloat(data[1]);
    let color = JSON.parse(data[2]);
    let categoryName = data[3];
    
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
              <div id="site-name">
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
            <div id="share-content">        
              <button type="button" id="cancel-button" class="standard-button" @click=${(e:any) => this.hideDialog(e)}>Cancel</button>
              <!-- todo: add image download function -->
              <button type="button" id="download-button" class="standard-button"><img src="/assets/download-icon.png"/>  Download Image</button>
              <button type="button" id="share-button" class="standard-button"><img src="/assets/modal-share-icon.png"/>  Share</button>                    
            </div>
          </div>
        </div>
      </sl-dialog>
    `
  }
}