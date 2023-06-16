import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';

import style from './token-congratulations.style';

@customElement('token-congratulations')
export class TokenCongratulations extends LitElement {

  static get styles() {
    return [
      style
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