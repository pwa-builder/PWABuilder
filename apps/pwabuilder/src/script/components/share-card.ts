import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import {classMap} from 'lit/directives/class-map.js';
import { smallBreakPoint } from '../utils/css/breakpoints';
import html2canvas from 'html2canvas'



const colorMap = new Map([["green", "#3ba372"], ["yellow", "#ebc157"], ["red", "#eb5757"]]);
const accentMap = new Map([["green", "#E3FFF2"], ["yellow", "#FFFAED"], ["red", "#FFF3F3"]]);

@customElement('share-card')
export class ShareCard extends LitElement {

  @property() preventClosing = false;
  @property() manifestData = "";
  @property() swData = "";
  @property() securityData = "";
  @property() siteUrl = "";

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
        padding: 0;
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

      #canvas-holder {
        display: flex;
        align-items: center;
        justify-content: center;
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
      .standard-button:hover {
        cursor: pointer;
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

      ${smallBreakPoint(css`
        
        .standard-button {
          width: 133px;
        }
        #cancel-button {
          display: none;
        }
        #download-button {
          display: block;
          flex-direction: row;
          align-items: center;
          padding: 0px 15px;  
        }
      `)}
    `
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
    canvas.width = 413;
    canvas.height = 331;

    var background = new Image();
    background.src = 'assets/share_score_backdrop.png';

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
    ctx!.font = "bold 24px Hind, sans-serif";
    ctx!.fillStyle = "#292c3a";
    ctx!.fillText(this.siteUrl, 15, 35);

    ctx!.textAlign = "center";

    // --- mani ring ---
    // track
    this.drawRingPart(ctx!, 3, trackColor, 68.83, 100, 40, 0, 2 * Math.PI, false, accentMap.get(maniColor)!)

    // indicator
    let percentMani = eval(maniPercent);
    let radiansMani = (360 * percentMani) * (Math.PI / 180);
    let endMani = (start) + radiansMani;
    this.drawRingPart(ctx!, 6, colorMap.get(maniColor)!, 68.83, 100, 40, start, endMani, false, "transparent");

    // text
    this.writeText(ctx!, 68.83, maniPercent, maniHeader);

    // --- sw ring ---
    // track
    this.drawRingPart(ctx!, 3, trackColor, 206.5, 100, 40, 0, 2 * Math.PI, false, accentMap.get(swColor)!);

    // indicator
    let percentSW = eval(swPercent);
    let radiansSW = (360 * percentSW) * (Math.PI / 180);
    let endSW = (start) + radiansSW;
    this.drawRingPart(ctx!, 6, colorMap.get(swColor)!, 206.5, 100, 40, start, endSW, false, "transparent");

    // text
    this.writeText(ctx!, 206.5, swPercent, swHeader);

    // --- sec ring ---
    // track
    this.drawRingPart(ctx!, 3, trackColor, 344.16, 100, 40, 0, 2 * Math.PI, false, accentMap.get(secColor)!);

    // indicator
    let percentSec = eval(secPercent);
    let radiansSec = (360 * percentSec) * (Math.PI / 180);
    let endSec = (start) + radiansSec;
    this.drawRingPart(ctx!, 6, colorMap.get(secColor)!, 344.16, 100, 40, start, endSec, false, "transparent");

    // text
    this.writeText(ctx!, 344.16, secPercent, secHeader);
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

  writeText(ctx: CanvasRenderingContext2D, x: number, percent: string, header: string){
    ctx!.font = "bold 16px Hind, sans-serif";
    ctx!.fillStyle = "#4f3fb6";
    ctx!.fillText(percent, x, 106);
    ctx!.font = "16px Hind, sans-serif";
    ctx!.fillStyle = "#292c3a";
    ctx!.fillText(header, x, 170);
  }

  htmlToImage(shareOption: string) {
    const canvas = (this.shadowRoot!.getElementById("myCanvas") as HTMLCanvasElement);
    const dataUrl = canvas.toDataURL('image/png', 1.0);

    if (shareOption === "download"){
      this.downloadImage(dataUrl, `${this.siteUrl}_pwabuilder_score.png`)
    } else if (shareOption === "share"){
      const file = this.dataURLtoFile(dataUrl, `${this.siteUrl}_pwabuilder_score.png`);
      console.log("file from dataURL()", file);
      this.shareFile(file, `${this.siteUrl} PWABuilder report card score`, "Check out my report card scores from PWABuilder!")
    } else {  
      return;
    }
    
  }

  downloadImage(url: string, filename: string) {
    let link = document.createElement('a');
    link.href = "data:image/png;base64" + url;
    console.log("File link from downloadImage()", link.href);
    link.download = filename; 
    link.click();

    URL.revokeObjectURL(link.href);
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

  render() {
    return html`
      <sl-dialog class="dialog" @sl-show=${() => this.draw()} @sl-hide=${() => this.hideDialog()} noHeader>
        <div id="frame-wrapper">
          <div id="frame-content">
            <div id="canvas-holder">
              <canvas
                id="myCanvas"
              >
                Your browser does not support the canvas element.
              </canvas>
            </div>
            <div id="share-content">        
              <button type="button" id="cancel-button" class="standard-button" @click=${() => this.hideDialog()}>Cancel</button>
              <button type="button" id="download-button" class="standard-button" @click=${() => this.htmlToImage('download')}><img src="/assets/download-icon.png" alt="Download image button icon"/>  Download Image</button>
              <button type="button" id="share-button" class="standard-button" @click=${() => this.htmlToImage('share')}><img src="/assets/modal-share-icon.png" alt="Share image button icon"/>  Share</button>                    
            </div>
          </div>
        </div>
      </sl-dialog>
    `
  }
}