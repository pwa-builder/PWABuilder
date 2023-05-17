import { LitElement, css, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';

@customElement('app-token')
export class AppToken extends LitElement {

  @state() siteURL: string = "";
  @state() testsInProgress: boolean = false;
  @state() dupeURL: boolean = false;
  @state() testsPassed: boolean = false;
  @state() appCard = {
    siteName: 'Site Name',
    description: "Your site's description",
    siteUrl: 'Site URL',
    iconURL: '',
    iconAlt: 'Your sites logo'
  };

  static get styles() {
    return [
      css`
        #wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;

          width: 100vw;
          gap: 30px;
        }

        #wrapper > * {
          box-sizing: border-box;
        }

        #hero-section {
          padding: 50px 100px;
          background-image: url("/assets/new/giveaway_banner.png");
          height: 250px;
          background-repeat: no-repeat;
          background-size: cover;
          background-position: center;

          display: flex;
          flex-direction: column;
          gap: 6px;

          align-items: flex-start;
          justify-content: center;
          margin-bottom: 10px;
          width: 100%;
        }

        #hero-section h1 {
          font-family: Hind;
          font-size: var(--header-font-size);
          font-weight: 700;
          line-height: 40px;
          letter-spacing: 0em;
          text-align: left;
          color: #000000;
          margin: 0;
          width: 65%;
        }

        #hero-section p {
          font-family: Hind;
          font-size: var(--subheader-font-size);
          font-weight: 400;
          line-height: 26px;
          letter-spacing: 0em;
          text-align: left;
          margin: 0;
          color: #000000;
          width: 50%;
        }

        #app-info-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 75%;
          background-color: #ffffff;
          border-radius: 10px;
          min-height: 165px;
          box-shadow: 0px 4px 30px 0px #00000014;
          gap: 15px;
          padding: 25px;
        }

        .square::part(indicator) {
          width: 100px;
          height: 100px;
          border-radius: 10px;
        }

        img.square {
          width: 100px;
          height: 100px;
          border-radius: 10px;
          padding: 10px;
        }

        #img-holder {
          border-radius: 10px;
          box-shadow: 0px 4px 30px 0px #00000014;
        }

        #words {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        #words > *::part(indicator) {
          height: 16px;
        }

        #words sl-skeleton:nth-child(1)::part(indicator) {
          height: 24px;
        }
        #words sl-skeleton:nth-child(1)::part(base) {
          width: 55%;
        }

        #words sl-skeleton:nth-child(2)::part(base) {
          width: 60%;
        }

        #words sl-skeleton:nth-child(3)::part(base) {
          width: 70%;
        }

        #words sl-skeleton:nth-child(4)::part(base) {
          width: 60%;
        }

       .card-holder {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
       }

       .card-holder p {
          margin: 0;
          font-size: 14px;
          white-space: nowrap;
       }


       .card-holder sl-progress-ring {
        --size: 72px;
        font-size: 12px;
       }

       #rings {
        display: flex;
        gap: 20px;
        box-shadow: 0px 4px 30px 0px #00000014;
        border-radius: 10px;
        padding: 20px;
       }

      .loader-round {
        width: 72px;
        height: 72px;
        border-radius: 50%;
        position: relative;
        flex-shrink: 0;
        animation: rotate 1s linear infinite
      }

      .loader-round::before {
        content: "";
        box-sizing: border-box;
        position: absolute;
        inset: 0px;
        border-radius: 50%;
        border: 6px solid #D6D6D6;
        /* animation: prixClipFix 2s linear infinite, 2s ease-in-out 0.5s infinite normal none running pulse; */
        clip-path:polygon(50% 50%,0 0,100% 0,100% 100%,0 100%,0 50%)
      }

      @keyframes rotate {
        100%   {transform: rotate(360deg)}
      }

      #words p {
        margin: 0;
        font-size: 14px;
      }

      #words p:nth-child(1) {
        font-size: 24px;
        font-weight: 700;
      }
      #words p:nth-child(2) {
        width: 55%;
        font-weight: 700;
      }

      #app-info {
        display: flex;
        justify-content: center;
        width: 100%;
        height: 100%;
        gap: 15px;
      }

      .feedback-holder {
        display: flex;
        gap: .5em;
        padding: .5em;
        border-radius: 3px;
        width: 100%;
        word-break: break-word;
      }

      .type-error {
        align-items: flex-start;
        background-color: #FAEDF1;
        border-left: 4px solid var(--error-color);
      }

      .feedback-holder p {
        margin: 0;
        font-size: 14px;
      }

      .error-title {
        font-weight: bold;
      }

      .error-desc {
        max-height: 175px;
        overflow-y: auto;
        line-height: normal;
      }

      #qual-sum {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
      }

      #qual-sum h2 {
        font-size: 18px;
        color: #4F3FB6;
        margin: 0;
      }
      

      #action-items-section {
        width: 75%;
      }

      .details::part(base) {
        border-radius: 10px;
        border: none;
      }
      .details::part(summary) {
        font-weight: bold;
        font-size: var(--card-body-font-size);
      }
      .details::part(header) {
        padding: 1em .75em;
      }

      sl-details::part(summary-icon){
        display: none;
      }

      `
    ]
  }

  async connectedCallback(): Promise<void> {
    super.connectedCallback();
    const search = new URLSearchParams(location.search);
    const site = search.get('site');
    if (site) {
      this.siteURL = site;
      this.runGiveawayTests(this.siteURL);
    }
  }

  async runGiveawayTests(url: string){
    // run giveaway validation suite.
    this.testsInProgress = true;

    // pretending to test for now replace with: call to api for test results
    let delay = new Promise(resolve => setTimeout(resolve, 5000));
    await delay;

    this.testsInProgress = false;

    /* if(true) { // replace with: if(dupe url)
      this.dupeURL = true;
    } */

    if(true){ // replace with: if(validations pass)
      this.testsPassed = true;
    }

    this.populateAppCard();

  }

  decideHeroSection(){
    // no site in query params
    if(!this.siteURL){
      return html`
        <h1>Get a Free Windows Developer Account on the Microsoft Store</h1>
        <p>Check below to see if your PWA qualifies </p>
        <div>
          <sl-input placeholder="Enter URL"></sl-input>
          <button type="button">Start</button>
        </div>
      `
    }
      
    // if site in query params and testing in progress
    if(this.siteURL && this.testsInProgress){
      return html`
        <h1>Validation in progress.. </h1>
        <p>We are checking to see if this URL qualifies for a free token</p>
      `
    }

    // if tests complete but its a dupe url
    if(!this.testsInProgress && this.dupeURL){
      return html`
        <h1>Oops!</h1>
        <p>Something is wrong. Please use another URL and try again.</p>
      `
    }

    // if tests complete and validations pass
    if(!this.testsInProgress && this.testsPassed){
      return html`
        <h1>Congratulations!</h1>
        <p>You have qualified for a free account on the Microsoft developer platform. Get your token code after signing in below. </p>
      `
    }

    // if tests complete and validations fail
    if(!this.testsInProgress && !this.testsPassed){
      return html`
        <h1>Almost there!</h1>
        <p>In order to qualify for a free Microsoft developer account check the technical qualifications below.</p>
      `
    }

    return html``
  }

  renderAppCard(){
    // no site in query params
    if(!this.siteURL){
      return html``
    }
      
    // if site in query params and testing in progress
    if(this.siteURL && this.testsInProgress){
      return html`
        <!-- Show card with skeleton -->
        <div id="app-info">
          <sl-skeleton class="square" effect="sheen"></sl-skeleton>
          <div id="words">
            <sl-skeleton effect="sheen"></sl-skeleton>
            <sl-skeleton effect="sheen"></sl-skeleton>
            <sl-skeleton effect="sheen"></sl-skeleton>
            <sl-skeleton effect="sheen"></sl-skeleton>
          </div>
          <div id="rings">
            <div class="card-holder">
              <div class="loader-round"></div>
              <p>Manifest</p>
            </div>
            <div class="card-holder">
              <div class="loader-round"></div>
              <p>Service Worker</p>
            </div>
            <div class="card-holder">
              <div class="loader-round"></div>
              <p>Security</p>
            </div>
          </div>
        </div>
      `
    }

    let banner = html``;

    // if tests complete but its a dupe url
    if(!this.testsInProgress && this.dupeURL){
      banner = html`
        <!-- error banner -->
        <div class="feedback-holder type-error">
          <img src="/assets/new/stop.svg" alt="invalid result icon" />
          <div class="error-info">
            <p class="error-title">URL already in use</p>
            <p class="error-desc">We noticed this PWA has already been linked to an account in the Microsoft store. Please check the URL you are using or try another. </p>
          </div>
        </div>
      `
    }

    // else: tests are complete
      // Show card with app info + results

      return html`
        ${banner} <!-- Error Banner + the results below -->
        <!-- Show card with results + error banner -->
        <div id="app-info">
          <div id="img-holder">
            <img class="square" src="${this.appCard.iconURL}" alt="${this.appCard.iconAlt}"/>
          </div>
          <div id="words">
            <p>${this.appCard.siteName}</p>
            <p>${this.appCard.siteUrl}</p>
            <p>${this.appCard.description}</p>
          </div>
          <div id="rings">
            <div class="card-holder">
              <sl-progress-ring value=${77}>14/18</sl-progress-ring>
              <p>Manifest</p>
            </div>
            <div class="card-holder">
            <sl-progress-ring value=${50}>2/4</sl-progress-ring>
              <p>Service Worker</p>
            </div>
            <div class="card-holder">
            <sl-progress-ring value=${100}>3/3</sl-progress-ring>
              <p>Security</p>
            </div>
          </div>
        </div>
       
      `
  }

  async populateAppCard() {
    
    let iconUrl: string = "/assets/icons/icon_512.png";
    this.appCard = {
      siteName: "short_name",
      siteUrl: "sitename.com",
      iconURL: iconUrl,
      iconAlt: "Your sites logo",
      description: 'Site app description blah blah blah',
    };
  }

  // Rotates the icon on each details drop down to 0 degrees
  rotateZero(card: string, e?: Event){
    //recordPWABuilderProcessStep(card + "_details_expanded", AnalyticsBehavior.ProcessCheckpoint);

    let icon: HTMLImageElement = this.shadowRoot!.querySelector('[data-card="' + card + '"]')!;
    let target: Node = (e!.target as unknown as Node);
    let collapsable: NodeList = this.shadowRoot!.querySelectorAll("sl-details");
    let allowed: boolean = false;

    // added this code because the tooltips that exist on the action items emit the sl-show and 
    // sl-hide events. This causes this function to trigger since its nested and the event bubbles.
    // so this ensures that the target for rotating is a detail card and not a tooltip.
    for (let i = 0; i < collapsable.length; i++) {
      if (collapsable[i].isEqualNode(target!)) {
        allowed = true;
        break
      }
    }

    if(icon && allowed){
      icon!.style.transform = "rotate(0deg)";
    }
  }

  // Rotates the icon on each details drop down to 90 degrees
  rotateNinety(card: string, e?: Event, init?: boolean){
    //recordPWABuilderProcessStep(card + "_details_closed", AnalyticsBehavior.ProcessCheckpoint);

    let icon: HTMLImageElement = this.shadowRoot!.querySelector('[data-card="' + card + '"]')!;

    if(icon && init) {
      icon!.style.transform = "rotate(90deg)";
      return;
    }

    let target: Node = (e!.target as unknown as Node);
    let collapsable: NodeList = this.shadowRoot!.querySelectorAll("sl-details");
    let allowed: boolean = false;

    // added this code because the tooltips that exist on the action items emit the sl-show and 
    // sl-hide events. This causes this function to trigger since its nested and the event bubbles.
    // so this ensures that the target for rotating is a detail card and not a tooltip.
    for (let i = 0; i < collapsable.length; i++) {
      if (collapsable[i].isEqualNode(target!)) {
        allowed = true;
        break
      }
    }

    if(icon && allowed){
      icon!.style.transform = "rotate(90deg)";
    }
  }

  render(){
    return html`
    <div id="wrapper">
      <div id="hero-section">
        ${this.decideHeroSection()}
      </div>
      <div id="app-info-section">
        ${this.renderAppCard()}
      </div>
      <div id="action-items-section">
        <sl-details
          id="qual-details"
          class="details"
          @sl-show=${(e: Event) => this.rotateNinety("qual-details", e)}
          @sl-hide=${(e: Event) => this.rotateZero("qual-details", e)}
        >
          <div id="qual-sum" slot="summary">
            <h2>Technical Qualifications</h2>
            <img class="dropdown_icon" data-card="qual-details" src="/assets/new/dropdownIcon.svg" alt="dropdown toggler"/>
          </div>
        </sl-details>
      </div>
      <div id="qual-section"></div>
      <div id="sign-in-section"></div>
    </div>
    `
  }
}

const qual: string[] = [
  "Own a PWA that meets the technical requirements listed here",
  "You are legally residing in [what countries can we say?]",
  "Have a valid Microsoft Account to use to sign up for the Microsoft Store on Windows developer account",
  "Not have an existing Microsoft Store on Windows individual developer/publisher account",
  "Use the Store Token to create a Microsoft Store on Windows developer account within 30 calendar days of Microsoft sending you the token, using the same Microsoft Account you used to sign in here",
  "Plan to publish an app in the store this calendar year (prior to 12/31/2023 midnight Pacific Standard Time)",
]