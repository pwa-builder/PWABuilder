import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { draw } from '../utils/share-card-helper';
import { Ref, createRef, ref } from 'lit/directives/ref.js';
import { AnalyticsBehavior, recordPWABuilderProcessStep } from '../utils/analytics';

import { shareCardStyles } from "./share-card.styles";
import '@awesome.me/webawesome/dist/components/dialog/dialog.js';
@customElement('share-card')
export class ShareCard extends LitElement {

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


  static styles = [shareCardStyles];

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
    dialog!.open = false;
  }

  render() {
    return html`
      <wa-dialog class="dialog" light-dismiss @wa-show=${() => this.setup()} @wa-hide=${() => this.hideDialog()}>
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
      </wa-dialog>
    `
  }
}