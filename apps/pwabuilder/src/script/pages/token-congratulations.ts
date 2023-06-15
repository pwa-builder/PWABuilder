import { LitElement, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { largeBreakPoint, mediumBreakPoint, smallBreakPoint} from '../utils/css/breakpoints';

@customElement('token-congratulations')
export class TokenCongratulations extends LitElement {

  static get styles() {
    return [
      css`
        #congrats-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 80px 101px;
        }
        #header h1 {
          font-size: 36px;
          line-height: 40px;
          text-align: center;
        }
        #header h2 {
          font-size: 16px;
          line-height: 22px;
          text-align: center;
          color: #292C3A;
          font-weight: 400;
        }
        .username {
          color:#4F3FB6;
        }
        #content-holder {
          flex-direction: column;
          justify-content: center;
          display: flex;
          padding: 0 52px;
        }
        #token-id {
          display: grid;
          grid-auto-rows: 150px;
          grid-auto-columns: 82px;
          grid-row-gap: 95px;
          width: 719px;
          height: 647px;
          margin: 20px 0;
          background-image: url(/assets/token_code_bg_image.png);
          background-repeat: no-repeat;
          background-position: center;
          background-size: 100% 100%;
        }
        .site-card {
          display: flex;
          flex-direction: row;
          justify-content: space-evenly;
          align-items:center;
          width: 256px;
          height: 86px;
          background: #FFFFFF;
          box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.15);
          border-radius: 6px;
          margin: 26px 0 0 25px;
        }
        .site-icon {
          display: grid;
          width: 62px;
          height: 62px;
          background: #FFFFFF;
          box-shadow: 2px 2px 15px rgba(0, 0, 0, 0.15);
          border-radius: 4px;
        }
        .site-icon img {
          width: 38.26px;
          height: 36.65px;
          place-self: center;
        }
        .site-desc {
          font-weight: bold;
          color: #292C3A;
        }
        .title {
          font-size: 24px;
        }
        .url {
          font-size: 14px;
          width: 145px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .token-input-container {
          display: flex;
          align-items: center;
          grid-row-start: 2;
          grid-column-start: 3;
          width: 402px;
          height: 68px;
          background: rgba(255, 255, 255, 0.4);
          border: 1px solid #4F3FB6;
          box-shadow: 2px 2px 20px rgba(79, 63, 182, 0.4);
          border-radius: 4px;
        }
        .token-input-container sl-input::part(base) {     
          width: 100%;
          height: 50px;
          background: #FFFFFF;
          border: 1px;
          border-radius: 4px;
          margin-left: 9px;
          background: #FFFFFF;
          border: 1px dashed #000000;
          border-radius: 4px;
 
        }
        .copy-button {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 50px;
          height: 50px;
          background: #FFFFFF;
          border: 1px solid #4F3FB6;
          border-radius: 4px;
          margin-left: 5px;
        }
        #next-steps {
          width: 719px;
          height: 300px;
          border-radius: 10px;
          background-color: #fff;
          align-self: center;
          font-size: 13px;
        }
        #next-steps h3 {
          font-family: Hind;
          font-size: 20px;
          font-weight: 700;
          line-height: 24px;
          letter-spacing: 0em;
          text-align: left;
          color:#4F3FB6;
          margin: 0;
          padding: 15px 0px 0px 10px;
        }
        #next-steps h4 {
          color: #4F3FB6;
        }
        .steps-list {
          padding: 0px 25px 0px 30px;          
          margin-bottom: 0;
        }
        .steps-list li {
          padding: 10px 0;
        }
        .steps-list a {
          color: black;
          text-decoration: underline;
        }
        .steps-list a:hover, .steps-list a:hover {
          cursor: pointer;
          color: #4F3FB6;
        }
        #publishing-instructions {
          display: inline-flex;
          text-decoration: underline;
          color: #4F3FB6;
          padding: 0px 0px 0px 10px;
        }
        #publishing-instructions img {
          margin-left: 5px;
        }
        #publishing-instructions:hover,  #publishing-instructions:focus {
          color: black !important;
          cursor: pointer;
        }
        //screen at pixels 479 and 639 seem to not take breakpoint styling -- bug
        ${smallBreakPoint(css`
          #congrats-wrapper {
            padding: 30px;
          }
          #content-holder {
            padding: 0;
          }
          #token-id {
            width: 369px;
            height: 347px;
            grid-auto-rows: 100px;
            grid-auto-columns: 35px;
            row-gap: 20px;          
          }
          .token-input-container {
            width: 300px;
            height: 60px;
            grid-column-start: 2;
          }
          .site-card {
            width: 185px;
            height: 60px;
            margin: 10px 0 0 10px;
          }
          .title {
            font-size: 18px;
          }
          .url {
            font-size: 11px;
          }
          .site-icon {
            width: 50px;
            height: 50px;
          }
          #next-steps {
            width: 369px;
            height: 347px;
            font-size: 9px;
            /* padding: 20px 16px; */
          }
        `)}
        ${mediumBreakPoint(css`
          #congrats-wrapper {
            padding: 40px 50px;
          }
          #content-holder {
            padding: 0 25px;
          }
          #token-id {
            width: 469px;
            height: 447px;
            grid-auto-rows: 125px;
            grid-auto-columns: 35px;
            row-gap: 30px;   
          }
          .token-input-container {
            width: 392px;
            height: 68px;
            grid-column-start: 2;
          }
          .site-card {
            width: 215px;
            height: 72px;
            margin: 10px 0px 0px 10px;
          }
          .title {
            font-size: 18px;
          }
          .url {
            font-size: 11px;
          }
          .site-icon {
            width: 50px;
            height: 50px;
          }
          #next-steps {
            width: 469px;
            font-size: 10px;
          }
        `)}
        ${largeBreakPoint(css`
          #congrats-wrapper {
            padding: 50px 32px;
          }
          #token-id {
            width: 570px;
            height: 548px;
            align-self: center;
            grid-auto-columns: 82px;
            row-gap: 45px;
          }
          .site-card {
            width: 248px;
            height: 78px;
          }
          .token-input-container {
            grid-column-start: 2;
          }
          #next-steps {
            width: 570px;
            height: 315px;
            align-self: center;
          }
        `)}
      `
    ]
  }
  
  constructor() {
    super();
    
  }

  copyCode() {
    let codeBox = this.shadowRoot!.getElementById("code");
    let toolTip = this.shadowRoot!.getElementById("tool-tip");
    let code = (codeBox as HTMLInputElement).value;
    navigator.clipboard.writeText(code).then(() => { 
      console.log("hit");
      setTimeout(()=> {
        toolTip!.removeAttribute("open")
      }, 2000);     
    });
  }

  render() {
    return html`
      <div id="congrats-wrapper">
        <div id="header">
          <h1>
            <span class="username"> Congratulations Gleb!</span> Use the code below to get a $19 free Windows developer account on the Microsoft Store
          </h1>
          <h2>
            Microsoft Store is the best place to find apps on Windows. Find your success in the Microsoft Store! 
          </h2>
        </div>
        <div id="content-holder"> 
          <div id="token-id">
            <div class="site-card">
              <div class="site-icon">
                <img src="/assets/microsoft_store_icon_white.png" alt="website icon"/>
              </div>
              <div class="site-desc">
                <div class="title">Soundslice</div>
                <div class="url">www.soundslice.com/</div>
              </div>
            </div>
            <div class="token-input-container">
              <div style="display: flex; width: 100%; justify-content: space-evenly">
                <sl-input id="code" value="fce40c30-b8be-45a9-afb7"></sl-input>
                <sl-tooltip id="tool-tip" content="Copied!" trigger="click">
                  <button class="copy-button" @click=${() => this.copyCode() }>
                    <img src="/assets/copy_icon_darkgrey.png" alt="Click here to copy your token code" width="30px" height="30px"/>
                  </button>
                </sl-tooltip>
              </div>
            </div>
          </div>
          <div id="next-steps">
            <h3>Next Steps</h3>
            <ol class="steps-list">
              <li>
                <strong>Reserve Your App:</strong> Use the code above to create a free developer account on <a aria-label="Click here to visit Partner Center Dashboard" href="https://partner.microsoft.com/dashboard">Partner Center Dashboard</a> and reserve your app on Microsoft store
              </li>
              <li>
                <strong>Package Your App:</strong> Go back to <a aria-label="Click here to visit PWABuilder homepage" href="/">PWABuilder</a> and generate package for Windows. You will be prompted to provide some options for your app. Fill these out with the three values you got from reserving your app name.
              </li>
              <li>
                <strong>Submitting Your PWA:</strong> Navigate back to <a aria-label="Click here to visit Partner Center Dashboard" href="https://partner.microsoft.com/dashboard">Partner Center Dashboard</a> and drag and drop both the packages you downloaded from PWABuilder into your submission. It usually takes 24 to 48 hours for your app to be reviewed, after which, it will be available on the Microsoft Store.
              </li> 
            </ol>
             <!-- Need link to publishing instructions -->
            <a id="publishing-instructions">
              <h4>Detailed Publishing instructions</h4> <img src="/assets/new/arrow.svg" alt="" role="presentation"/>
            </a>
          </div>
        </div>
      </div>
    `;
  }
}