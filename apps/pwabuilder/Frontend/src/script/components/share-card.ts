import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { smallBreakPoint } from '../utils/css/breakpoints';
import { draw } from '../utils/share-card-helper';
import { Ref, createRef, ref } from 'lit/directives/ref.js';
import { AnalyticsBehavior, recordPWABuilderProcessStep } from '../utils/analytics';
import '@shoelace-style/shoelace/dist/components/dialog/dialog.js';

@customElement('share-card')
export class ShareCard extends LitElement {

  @property() preventClosing = false;
  @property() manifestData = "";
  @property() swData = "";
  @property() enhancementsData = "";
  @property() siteName = "";

  @state() dataURL = "";
  @state() canShare: boolean = true;

  shareCanvas: Ref<HTMLCanvasElement> = createRef();
  downloadText: Ref<HTMLCanvasElement> = createRef();
  copyText: Ref<HTMLCanvasElement> = createRef();
  file!: File;
  canvas!: HTMLCanvasElement;


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
        height: auto;
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
        padding: 0;
        top: 5px;
        right: 5px;
        z-index: 1000;
        color: #000000;
      }
      .dialog::part(close-button__base):focus-visible {
        outline: 2px solid #4f3fb6;
        outline-offset: 2px;
      }
      .dialog_header {
        height: 12px !important;
      }
      .share-modal-header {
        font-weight: 600;
        font-size: 16px;
        line-height: 22px;
        text-align: center;
        color: #292C3A;
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
        justify-content: space-evenly;
      }

      #canvas-holder {
        display: flex;
        align-items: center;
        justify-content: center;
      }

      #myCanvas {
        width: 413px;
        height: 322px;
        margin: 20px 0;
      }

      #share-actions {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        margin-bottom: 15px;
        gap: 10px;
        text-align: center;
      }
      .standard-button {
        padding: 12px 40px;
        white-space: nowrap;
        width: 80px;
        height: 45px;
        font-size: var(--button-font-size);
        font-weight: bold;
        border-radius: var(--button-border-radius);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 5px;
      }

      #share-button {
        padding: 12px 30px;
      }

      .standard-button-label {
        font-size: 14px;
        font-weight: bold;
        color: #292C3A;
      }

      .standard-button:hover {
        cursor: pointer;
        box-shadow: var(--button-box-shadow);
      }
      .standard-button:focus-visible {
        outline: 2px solid #4f3fb6;
        outline-offset: 2px;
      }
      .primary {
        background-color: var(--font-color);
        border-color: var(--font-color);
        color: var(--primary-color);
      }

      .secondary {
        border: 1px solid var(--primary-color);
        color: var(--primary-color);
        background-color: transparent;
      }

      .actions-icons {
        width: 25px;
        height: auto;
      }

      ${smallBreakPoint(css`

        #myCanvas {
          width: 313px;
          height: auto;
        }

        #share-actions {
          justify-content: space-evenly;
        }

        .standard-button {
          margin-bottom: 8px;
        }

      `)}
    `
  }

  async setup(){
    this.canvas = (this.shareCanvas.value as HTMLCanvasElement);
    await draw(this.canvas, this.manifestData, this.swData, this.enhancementsData, this.siteName);
    this.dataURL = this.canvas.toDataURL('image/png', 1.0);
    this.file = this.dataURLtoFile(this.dataURL, `${this.siteName}_pwabuilder_score.png`);

    if (!navigator.canShare || !navigator.canShare({files: [this.file]})) {
      this.canShare = false;
    } else {
      this.canShare = true;
    }
  }

  htmlToImage(shareOption: string) {

    if (shareOption === "download"){
      recordPWABuilderProcessStep(`sharepwascorecard.download_clicked`, AnalyticsBehavior.ProcessCheckpoint);
      this.downloadImage(`${this.siteName}_pwabuilder_score.png`)
    } else if (shareOption === "share"){
      recordPWABuilderProcessStep(`sharepwascorecard.share_clicked`, AnalyticsBehavior.ProcessCheckpoint);
      this.shareFile(this.file, `${this.siteName} PWABuilder report card score`, "Check out my report card scores from #PWABuilder #BuildPackageShip")
    } else {
      return;
    }

  }

  downloadImage(filename: string) {
    let link = document.createElement('a');
    link.href = "data:image/png;base64" + this.dataURL;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);

    this.downloadText.value!.innerText="Downloaded";
  }

  copyImage() {
    recordPWABuilderProcessStep(`sharecard.copy_clicked`, AnalyticsBehavior.ProcessCheckpoint);

    this.canvas.toBlob(blob => navigator.clipboard
    .write([new ClipboardItem({'image/png': blob!})])
    .then(()=>{
      this.copyText.value!.innerText = "Copied";
    }))
  }

  dataURLtoFile(dataurl: string, filename: string) {
    var arr = dataurl.split(","),
    mimeType = arr[0].match(/:(.*?);/)![1],
    decodedData = atob(arr[1]),
    lengthOfDecodedData = decodedData.length,
    u8array = new Uint8Array(lengthOfDecodedData);
    while (lengthOfDecodedData--) {
      u8array[lengthOfDecodedData] = decodedData.charCodeAt(lengthOfDecodedData);
    }
    return new File([u8array], filename, { type: mimeType });
  };

  shareFile(file: File, title: string, text: string) {
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      navigator
        .share({
          files: [file],
          title,
          text
        })
        .then(() => console.log("Share was successful."))
        .catch((error) => console.log("Sharing failed", error));
    } else {
      console.log(`Your system doesn't support sharing files.`);
    }
  };

  hideDialog(){
    let dialog: any = this.shadowRoot!.querySelector(".dialog");
    dialog!.hide();
  }

  handleRequestClose(e: Event){
    if (this.preventClosing) {
      e.preventDefault();
    }
  }

  render() {
    return html`
      <sl-dialog class="dialog" @sl-show=${() => this.setup()} @sl-hide=${() => this.hideDialog()} noHeader>
        <div class="share-modal-header">Share your PWA score with the community!</div>
        <div id="frame-wrapper">
          <div id="frame-content">
            <div id="canvas-holder">
              <canvas id="myCanvas" ${ref(this.shareCanvas)} aria-label="Shareable PWA Report card score image">
                Your browser does not support the canvas element.
              </canvas>
            </div>
            <div id="share-actions">
              <div>
                <button type="button" id="copy-button" class="standard-button secondary"  @click=${() => this.copyImage()}><img class="actions-icons" src="/assets/copy-icon-standard-color.svg" alt="Click here to copy PWA score image" role="img"/></button>
                <span id="copy-button-label" class="standard-button-label" ${ref(this.copyText)}>Copy</span>
              </div>
              <div>
                <button type="button" id="download-button" class="standard-button secondary" @click=${() => this.htmlToImage('download')}><img class="actions-icons" src="/assets/download-icon-standard-color.svg" alt="Click here to download PWA score image" role="img"/></button>
                <span id="download-button-label" class="standard-button-label" ${ref(this.downloadText)}>Download</span>
              </div>
              ${this.canShare ? html`
                <div>
                  <button type="button" id="share-button" class="standard-button secondary" @click=${() => this.htmlToImage('share')}><img class="actions-icons" src="/assets/share_icon.svg" alt="Click here to share PWA score image"/></button>
                  <span class="standard-button-label">Share</span>
                </div>
              ` : ''}
            </div>
          </div>
        </div>
      </sl-dialog>
    `
  }
}