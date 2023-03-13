import { LitElement, TemplateResult, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { smallBreakPoint } from '../utils/css/breakpoints';

const colorMap = new Map([["green", "#3ba372"], ["yellow", "#ebc157"], ["red", "#eb5757"]]);
const accentMap = new Map([["green", "#E3FFF2"], ["yellow", "#FFFAED"], ["red", "#FFF3F3"]]);

@customElement('share-card')
export class ShareCard extends LitElement {

  @property() preventClosing = false;
  @property() manifestData = "";
  @property() swData = "";
  @property() securityData = "";
  @property() siteName = "";

  @state() dataURL = "";
  @state() actionButtons: TemplateResult = html``;

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
        color: #C2C9D1;
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
    await this.draw();
    let canvas = (this.shadowRoot!.getElementById("myCanvas") as HTMLCanvasElement);
    this.dataURL = canvas.toDataURL('image/png', 1.0);
    this.renderShareActionButtons();
    this.shadowRoot!.getElementById("copy-button-label") ? this.shadowRoot!.getElementById("copy-button-label")!.innerText="Copy" : null;
  }
  async draw(){
    // manifest Data
    const maniData = this.manifestData.split('/');
    const maniPercent = `${parseFloat(maniData[0])} / ${parseFloat(maniData[1])}`
    const maniColor: string = maniData[2];
    const maniHeader = maniData[3];

    // sw Data
    const swData = this.swData.split('/');
    const swPercent = `${parseFloat(swData[0])} / ${parseFloat(swData[1])}`
    const swColor = swData[2];
    const swHeader = swData[3];

    // sec Data
    const secData = this.securityData.split('/');
    const secPercent = `${parseFloat(secData[0])} / ${parseFloat(secData[1])}`
    const secColor = secData[2];
    const secHeader = secData[3];

    let canvas = (this.shadowRoot!.getElementById("myCanvas") as HTMLCanvasElement);
    let ctx = canvas!.getContext("2d");

    // canvas resolution
    canvas.width = 824; //413
    canvas.height = 660; //331

    const ringYpos = 243;

    let background = new Image();
    background.src = 'assets/share_score_backdrop.jpg';

     // Use `await` to wait for the image to load
    await new Promise(resolve => background.onload = resolve);
    // Now that the image is loaded, draw it on the canvas
    ctx!.drawImage(background, 0, 0);
    
    // offset to start top middle rather than
    // middle right like a unit circle
    const start = -0.5 * Math.PI;
    const trackColor = "#e4e4e7";

    // makes ends of lines round
    ctx!.lineCap = 'round';
    ctx!.lineJoin = 'round';

    // text for url
    ctx!.font = "bold 48px Hind, sans-serif";
    ctx!.fillStyle = "#292c3a";
    ctx!.fillText(this.siteName.replace(/\/$/, ""), 30, 70);

    ctx!.textAlign = "center";

    //brand label
    ctx!.font = "30px Hind, sans-serif";
    ctx!.fillStyle = "#292c3a";
    ctx!.fillText("PWA Score", 105, 115);

    ctx!.textAlign = "center";

    // --- mani ring ---
    // track
    this.drawRingPart(ctx!, 6, trackColor, 200, ringYpos, 57.44, 0, 2 * Math.PI, false, accentMap.get(maniColor)!)

    // indicator
    let percentMani = eval(maniPercent);
  

    if(percentMani === 0){
      // draw exclamation
      await this.drawExclamation(ctx!, 145);

      ctx!.font = "24px Hind, sans-serif";
      ctx!.fillStyle = "#292c3a";
      ctx!.fillText(maniHeader, 200, 340);
    } else {
      let radiansMani = (360 * percentMani) * (Math.PI / 180);
      let endMani = (start) + radiansMani;
      this.drawRingPart(ctx!, 12, colorMap.get(maniColor)!, 200, ringYpos, 57.44, start, endMani, false, "transparent");
      
      // text
      this.writeText(ctx!, 200, maniPercent, maniHeader);
    }

    // --- sw ring ---
    // track
    this.drawRingPart(ctx!, 6, trackColor, 412.5, ringYpos, 57.44, 0, 2 * Math.PI, false, accentMap.get(swColor)!);

    // indicator
    let percentSW = eval(swPercent);
   
    if(percentSW === 0){
      await this.drawExclamation(ctx!, 357.5);

      ctx!.font = "24px Hind, sans-serif";
      ctx!.fillStyle = "#292c3a";
      ctx!.fillText(swHeader, 412.5, 340);
    } else {
      let radiansSW = (360 * percentSW) * (Math.PI / 180);
      let endSW = (start) + radiansSW;
      this.drawRingPart(ctx!, 12, colorMap.get(swColor)!, 412.5, ringYpos, 57.44, start, endSW, false, "transparent");
      
      // text
      this.writeText(ctx!, 412.5, swPercent, swHeader);
    }
    
    // --- sec ring ---
    // track
    this.drawRingPart(ctx!, 6, trackColor, 624.5, ringYpos, 57.44, 0, 2 * Math.PI, false, accentMap.get(secColor)!);

    // indicator
    let percentSec = eval(secPercent);

    if(percentSec === 0) {
      // draw exclamation
      await this.drawExclamation(ctx!, 569.5);

      ctx!.font = "24px Hind, sans-serif";
      ctx!.fillStyle = "#292c3a";
      ctx!.fillText(secHeader, 624.5, 340);
    } else {
      let radiansSec = (360 * percentSec) * (Math.PI / 180);
      let endSec = (start) + radiansSec;
      this.drawRingPart(ctx!, 12, colorMap.get(secColor)!, 624.5, ringYpos, 57.44, start, endSec, false, "transparent");

      // text
      this.writeText(ctx!, 624.5, secPercent, secHeader);
    }
  }

  drawRingPart(ctx: CanvasRenderingContext2D, lineWidth: number, trackColor: string, x: number, y: number, radius: number, start: number, end: number, clockwise: boolean, fillColor: string){
    ctx.beginPath();
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = trackColor;
    ctx.arc(x, y, radius, start, end, clockwise);
    ctx.fillStyle = fillColor;
    ctx.fill();
    ctx.stroke();
  }

  async drawExclamation(ctx: CanvasRenderingContext2D, x: number){
    // draw exclamation
    let exclamation = new Image();
    exclamation.src = 'assets/new/macro_error.svg';
    // Use `await` to wait for the image to load
    await new Promise(resolve => exclamation.onload = resolve);
    // Now that the image is loaded, draw it on the canvas
    ctx!.drawImage(exclamation, x, 188, 110, 110);
  }

  writeText(ctx: CanvasRenderingContext2D, x: number, percent: string, header: string){
    ctx!.font = "bold 24px Hind, sans-serif";
    ctx!.fillStyle = "#4f3fb6";
    ctx!.fillText(percent, x, 250);
    ctx!.font = "24px Hind, sans-serif";
    ctx!.fillStyle = "#292c3a";
    ctx!.fillText(header, x, 340);
  }

  htmlToImage(shareOption: string) {

    if (shareOption === "download"){
      this.downloadImage(`${this.siteName}_pwabuilder_score.png`)
    } else if (shareOption === "share"){
      const file = this.dataURLtoFile(this.dataURL, `${this.siteName}_pwabuilder_score.png`);
      console.log("file from dataURL()", file);
      this.shareFile(file, `${this.siteName} PWABuilder report card score`, "Check out my report card scores from PWABuilder!")
    } else {  
      return;
    }
    
  }

  downloadImage(filename: string) {
    let downloadButtonText = this.shadowRoot!.getElementById("download-button-label");
    let link = document.createElement('a');
    link.href = "data:image/png;base64" + this.dataURL;
    link.download = filename; 
    link.click();
    URL.revokeObjectURL(link.href);

    downloadButtonText!.innerText="Downloaded";
  }

  copyImage() {
    let canvas = (this.shadowRoot!.getElementById("myCanvas") as HTMLCanvasElement);
    let copyButtonText = this.shadowRoot!.getElementById("copy-button-label");

    canvas.toBlob(blob => navigator.clipboard
    .write([new ClipboardItem({'image/png': blob!})])
    .then(()=>{
      copyButtonText!.innerText="Copied";
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
    console.log("File from shareFile():", file);
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

  renderShareActionButtons(){
    const file = this.dataURLtoFile(this.dataURL, `${this.siteName}_pwabuilder_score.png`);

    if (!navigator.canShare || !navigator.canShare({files: [file]})) {
      //console.log("Share API is unavailable in this browser.")
      this.actionButtons = html`
        <div>
          <button type="button" id="copy-button" class="standard-button secondary" @click=${() => this.copyImage()}><img class="actions-icons" src="/assets/copy-icon-standard-color.svg" alt="Download image button icon"/></button>
          <span id="copy-button-label" class="standard-button-label">Copy</span>
        </div>        
        <div>
          <button type="button" id="download-button" class="standard-button secondary" @click=${() => this.htmlToImage('download')}><img class="actions-icons" src="/assets/download-icon-standard-color.svg" alt="Download image button icon"/></button>
          <span id="download-button-label" class="standard-button-label">Download</span>
        </div>      `
      return;
    }
    if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
      //console.log("This is a mobile browser with the Share API available.");
      //this.shadowRoot!.getElementById("share-actions")!.style.flexDirection = 'column-reverse';
      this.actionButtons = html`
        <div>
          <button type="button" id="copy-button" class="standard-button secondary" @click=${() => this.copyImage()}><img class="actions-icons" src="/assets/copy-icon-standard-color.svg" alt="Download image button icon"/></button>
          <span id="copy-button-label" class="standard-button-label">Copy</span>
        </div>
        <div>
          <button type="button" id="download-button" class="standard-button secondary" @click=${() => this.htmlToImage('download')}><img class="actions-icons" src="/assets/download-icon-standard-color.svg" alt="Download image button icon"/></button>
          <span id="download-button-label" class="standard-button-label">Download</span>
        </div>        
        <div>
          <button type="button" id="share-button" class="standard-button secondary" @click=${() => this.htmlToImage('share')}><img class="actions-icons" src="/assets/share_icon.svg" alt="Share image button icon"/></button>  
          <span class="standard-button-label">Share</span>
        </div>           `
    } else {
        //console.log("This is a desktop browser with the Share API available.");
        this.actionButtons = html`
        <div>
          <button type="button" id="copy-button" class="standard-button secondary" @click=${() => this.copyImage()}><img class="actions-icons" src="/assets/copy-icon-standard-color.svg" alt="Download image button icon"/></button>
          <span id="copy-button-label" class="standard-button-label">Copy</span>
        </div>
        <div>
          <button type="button" id="download-button" class="standard-button secondary" @click=${() => this.htmlToImage('download')}><img class="actions-icons" src="/assets/download-icon-standard-color.svg" alt="Download image button icon"/></button>
          <span id="download-button-label" class="standard-button-label">Download</span>
        </div>
        <div>
          <button type="button" id="share-button" class="standard-button secondary" @click=${() => this.htmlToImage('share')}><img class="actions-icons" src="/assets/share_icon.svg" alt="Share image button icon"/></button>  
          <span class="standard-button-label">Share</span>
        </div>                          
      `
    }
    return;
  }

  render() {
    return html`
      <sl-dialog class="dialog" @sl-show=${() => this.setup()} @sl-hide=${() => this.hideDialog()} noHeader>
        <div class="share-modal-header">Share this image with the community!</div>
        <div id="frame-wrapper">
          <div id="frame-content">
            <div id="canvas-holder">
              <canvas
                id="myCanvas"
              >
                Your browser does not support the canvas element.
              </canvas>
            </div>
            <div id="share-actions">    
              ${this.actionButtons}    
            </div>
          </div>
        </div>
      </sl-dialog>
    `
  }
}