import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { BeforeEnterObserver, Router, RouterLocation } from '@vaadin/router';

import style from './token-congratulations.style';
import '../../components/arrow-link'
import { AnalyticsBehavior, recordPWABuilderProcessStep } from '../../utils/analytics';
import { env } from '../../utils/environment';

type Params = {
  appicon?: string;
  appname?: string;
  appurl?: string;
  token: string;
  username: string;
};

@customElement('token-congratulations')
export class TokenCongratulations extends LitElement implements BeforeEnterObserver {

  static get styles() {
    return [
      style
    ]
  }

  // constructor() {
  //   super();
  // }

  private paramsData: null | Params = null;

  async onBeforeEnter(location: RouterLocation) {

    // if(!env.tokensCampaignRunning){
    //   Router.go("/freeToken");
    // } else {

      this.paramsData = location.params as Params;
      console.log(this.paramsData);

    // }
  }

  copyCode() {
    let codeBox = this.shadowRoot!.getElementById("code");
    let toolTip = this.shadowRoot!.getElementById("tool-tip");
    let code = (codeBox as HTMLInputElement).value;
    navigator.clipboard.writeText(code).then(() => {
      setTimeout(()=> {
        toolTip!.removeAttribute("open")
      }, 2000);
    });
    recordPWABuilderProcessStep("copy_code_button_clicked", AnalyticsBehavior.ProcessCheckpoint);
  }

  trackLinkClick(linkDescription: string){
    recordPWABuilderProcessStep(`${linkDescription}_link_clicked`, AnalyticsBehavior.ProcessCheckpoint);
  }

  render() {
    return html`
      <div id="congrats-wrapper">
        <div id="header">
          <h1>
            <span class="username"> Congratulations ${this.paramsData?.username}!</span> Use the code below to get a $19 free Windows developer account on the Microsoft Store
          </h1>
          <h2>
            Microsoft Store is the best place to find apps on Windows. Find your success in the Microsoft Store!
          </h2>
        </div>
        <div id="content-holder">
          <div id="token-id">
          ${this.paramsData?.appurl ? html`
            <div class="site-card">
              <div class="site-icon">
                <img src=${this.paramsData?.appicon!} alt="website icon"/>
              </div>
              <div class="site-desc">
                <div class="title">${this.paramsData?.appname}</div>
                <div class="url">${this.paramsData?.appurl}</div>
              </div>
            </div>` : null}
            <div class="token-input-container">
              <div style="display: flex; width: 100%; justify-content: space-evenly">
                <sl-input id="code" value=${this.paramsData?.token!}></sl-input>
                <sl-tooltip id="tool-tip" content="Copied!" trigger="click">
                  <button class="copy-button" @click=${() => this.copyCode() }>
                    <img src="/assets/copy_icon_darkgrey.svg" alt="Click here to copy your token code" width="30px" height="30px"/>
                  </button>
                </sl-tooltip>
              </div>
            </div>
          </div>
          <div id="next-steps">
            <h3>Next Steps</h3>
            <ol class="steps-list">
              <li>
                <strong>Create a developer account and reserve your app name:</strong> Use the code above to create a free developer account on
                <a aria-label="Click here to learn how to open a developer account" href="https://learn.microsoft.com/en-us/windows/apps/publish/partner-center/open-a-developer-account" target="_blank" rel="noopener" @click=${() => this.trackLinkClick("partner_center_account_setup")}>Partner Center Dashboard</a>
                and reserve your app on Microsoft Store
              </li>
              <li>
                <strong>Package Your App:</strong>
                Go back to
                <a aria-label="Click here to visit PWABuilder homepage" href="/" target="_blank" rel="noopener" @click=${() => this.trackLinkClick("pwabuilder_homepage")}>PWABuilder</a>
                and generate package for Windows. You will be prompted to provide some options for your app. Fill these out with the three values you got from reserving your app name.
              </li>
              <li>
                <strong>Submitting Your PWA:</strong>
                Navigate back to <a aria-label="Click here to visit Partner Center Dashboard" href="https://partner.microsoft.com/dashboard" target="_blank" rel="noopener" @click=${() => this.trackLinkClick("partner_center_dashboard")}>Partner Center Dashboard</a>
                and drag and drop both the packages you downloaded from PWABuilder into your submission. It usually takes 24 to 48 hours for your app to be reviewed, after which, it will be available on the Microsoft Store.
              </li>
            </ol>
             <!-- Need link to publishing instructions -->
            <div id="publishing-instructions">
              <arrow-link .text=${`Detailed Publishing Instructions`} .link=${`https://docs.pwabuilder.com/#/builder/windows`}></arrow-link>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}