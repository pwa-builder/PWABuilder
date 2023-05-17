import { LitElement, css, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';

@customElement('app-token')
export class AppToken extends LitElement {

  @state() siteURL: string = "";
  @state() testsInProgress: boolean = false;
  @state() dupeURL: boolean = false;
  @state() testsPassed: boolean = false;

  static get styles() {
    return [
      css`
        #wrapper {
          display: flex;
          flex-direction: column;
          width: 100vw;
        }

        #wrapper > * {
          box-sizing: border-box;
        }

        #hero-section {
          padding: 50px 100px;
          background-image: url("/assets/new/giveaway_banner.png");
          height: 100%;
          background-repeat: no-repeat;
          background-size: cover;
          background-position: center;

          display: flex;
          flex-direction: column;
          gap: 6px;

          align-items: flex-start;
          justify-content: center;
        }

        #hero-section h1 {
          font-family: Hind;
          font-size: var(--header-font-size);
          font-weight: 700;
          line-height: 40px;
          letter-spacing: 0em;
          text-align: left;
          color: #ffffff;
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
          color: #ffffff;
          width: 50%;
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

    /* if(true){ // replace with: if(validations pass)
      this.testsPassed = true;
    } */

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
      `
    }

    let returnHTML;

    // if tests complete but its a dupe url
    if(!this.testsInProgress && this.dupeURL){
      returnHTML = html`
        <!-- error banner -->
      `
    }

    // else: tests are complete
      // Show card with app info + results

      return html`
        ${returnHTML} <!-- Error Banner + the results below -->
        <!-- Show card with results + error banner -->
      `
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
      <div id="action-items-section"></div>
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