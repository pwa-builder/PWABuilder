import { Router } from '@vaadin/router';
import { LitElement, PropertyValueMap, TemplateResult, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import '../../components/arrow-link'
import { cleanUrl, isValidURL } from '../../utils/url';
import { env } from '../../utils/environment'
import { getHeaders } from '../../utils/platformTrackingHeaders';
import { Manifest } from '@pwabuilder/manifest-validation';
import { AuthModule } from '../../services/auth_service';
import { localeStrings } from '../../../locales';

import style from './app-token.style';
import { decideHeroSection, qualificationStrings, renderAppCard, rotateNinety, rotateZero } from './app-token.template';
import { populateAppCard } from './app-token.helper';
import { SlInput } from '@shoelace-style/shoelace';
import { classMap } from 'lit/directives/class-map.js';

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
  @state() installablePassed: boolean = true;
  @state() installableRatio = 0;
  @state() installableTodos: TemplateResult[] = [];
  @state() installableClassMap = {red: false, yellow: false, green: false};

  @state() requiredPassed: boolean = true;
  @state() requiredRatio = 0;
  @state() requiredTodos: TemplateResult[] = [];
  @state() requiredClassMap = {red: false, yellow: false, green: false};

  @state() enhancementsPassed: boolean = true;
  @state() enhancementsRatio = 0;
  @state() enhancementsTodos: TemplateResult[] = [];
  @state() enhancementsClassMap = {red: false, yellow: false, green: false};
  @state() enhancementsIndicator = "";

  @state() errorGettingURL = false;
  @state() errorGettingToken = false;
  @state() errorMessage: string | undefined;

  @state() testResults: any = {};
  @state() manifest: Manifest = {};
  @state() manifestUrl: string = '';
  @state() noManifest: boolean = false;
  
  @state() heroBanners = {covered: false, uncovered: true};

  @state() showTerms: boolean = false;
  @state() acceptedTerms: boolean = false;

  @state() userAccount = {
    accessToken: '',
    email: '',
    name: '',
    loggedIn: false
  };
  @state() authModule = new AuthModule();
  @state() tokenId: string = '';
  @state() validateUrlResponseData: any = {};

  static get styles() {
    return [
      style
    ]
  }

  protected firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
    this.authModule = new AuthModule(window.location.host + `/freeToken`);
    this.checkIfLoggedIn();
  }

  async checkIfLoggedIn() {
    const account = await (this.authModule as AuthModule).registerPostLoginListener();
    if(account !== null) {
      this.userAccount = account;
      this.userAccount.loggedIn = true;
      const storedData = sessionStorage.getItem('validate_url_response');
      if(storedData !== null) {
        this.validateUrlResponseData = JSON.parse(storedData);
      }

      //this.getUserToken();
    }
  }
  async connectedCallback(): Promise<void> {
    super.connectedCallback();
    const search = new URLSearchParams(location.search);
    const site = search.get('site');
    if (site) {
      this.siteURL = site;
      this.runGiveawayTests();
    }
    this.decideBackground();
  }

  async runGiveawayTests(){
    
    this.decideBackground();
    // run giveaway validation suite.
    this.testsInProgress = true;

    // pretending to test for now replace with: call to api for test results
    await this.validateUrl();

    this.testsInProgress = false;

    this.handleInstallable(this.testResults.installable);
    this.handleRequired(this.testResults.additional);
    this.handleEnhancements(this.testResults.progressive);
    this.appCard = await populateAppCard(this.siteURL, this.manifest, this.manifestUrl);

  }

  async validateUrl(){

    if(sessionStorage.getItem('PWABuilderManifest')){
      this.manifest = JSON.parse(sessionStorage.getItem('PWABuilderManifest')!).manifest;
      this.manifestUrl = JSON.parse(sessionStorage.getItem('PWABuilderManifest')!).manifestUrl;
    }

    const encodedUrl = encodeURIComponent(this.siteURL);

    const validateGiveawayUrl = env.validateGiveawayUrl + `/validateurl?site=${encodedUrl}`;
    
    let headers = {...getHeaders(), 'content-type': 'application/json' };

    console.log(`the manifest in this context is ${JSON.stringify(this.manifest)}}`)

    try {
      const response = await fetch(validateGiveawayUrl, {
        method: 'POST',
        body: JSON.stringify({manifestJson: Object.keys(this.manifest).length > 0 ? this.manifest : null}),
        headers: new Headers(headers)
      });
      
      if (!response.ok) {
        console.warn('Validation Failed', response.statusText);

        throw new Error(
          `Unable to fetch response using ${validateGiveawayUrl}. Response status  ${response}`
        );
      }

      const responseData = await response.json();


      if(!responseData){
        console.warn(
          'Validating url failed due to no response data',
          response
        );
        throw new Error(`Unable to get JSON from ${validateGiveawayUrl}`);
      }

      if(responseData.error){
        console.error(responseData.error)
        this.noManifest = true;
      }

      sessionStorage.setItem('validate_url_response', JSON.stringify(responseData));

      this.testResults = responseData.testResults;

      if(!this.manifest){
        this.manifest = responseData.manifestJson;
        this.manifestUrl = responseData.manifestUrl;

      }

      this.testsPassed = responseData.isEligibleForToken;
      this.dupeURL = responseData.isInDenyList

    } catch (e) {
      console.error(e);
    }
  }

  handleInstallable(installable: any){

    let passedCount = 0;

    for (let key in installable) {
      let test = installable[key]
      this.installableTodos.push(
        html`
          <div class="inner-todo">
            ${test.valid ? 
              html`<img src=${valid_src} alt="passed test icon" />` : 
              html`
                ${test.errorString ? 
                  html`<sl-tooltip content=${test.errorString} placement="right">
                        <img src=${stop_src} alt="failed test icon" />
                      </sl-tooltip>` : 
                  html`
                    <img src=${stop_src} alt="failed test icon" />
                  `
                  }
              `}
            <p>${test.displayString}</p>
          </div>
        `
      )
      this.installablePassed = this.installablePassed && test.valid;
      if(test.valid) passedCount++;
    }

    this.installableRatio = (passedCount / Object.keys(installable).length) * 100;

    if(this.installablePassed){
      this.installableClassMap["green"] = true;
    } else {
      this.installableClassMap["red"] = true;
    }
    
  }

  handleRequired(required: any){

    let passedCount = 0;

    for (let key in required) {
      let test = required[key]
      this.requiredTodos.push(
        html`
          <div class="inner-todo">
            ${test.valid ? 
              html`<img src=${valid_src} alt="passed test icon" />` : 
              html`
                ${test.errorString ? 
                  html`<sl-tooltip content=${test.errorString} placement="right">
                        <img src=${stop_src} alt="failed test icon" />
                      </sl-tooltip>` : 
                  html`
                    <img src=${stop_src} alt="failed test icon" />
                  `
                  }
              `}
            <p>${test.displayString}</p>
          </div>
        `
      )
      this.requiredPassed = this.requiredPassed && test.valid;
      if(test.valid) passedCount++;
    }

    this.requiredRatio = (passedCount / Object.keys(required).length) * 100;

    if(this.requiredPassed){
      this.requiredClassMap["green"] = true;
    } else {
      this.requiredClassMap["red"] = true;
    }
    
  }

  handleEnhancements(enhancements: any){
    let passedCount = 0;

    for (let key in enhancements) {
      let test = enhancements[key]
      this.enhancementsTodos.push(
        html`
          <div class="inner-todo">
            ${test.valid ? 
              html`<img src=${valid_src} alt="passed test icon" />` : 
              html`
                ${test.errorString ? 
                  html`<sl-tooltip content=${test.errorString} placement="right">
                        <img src=${stop_src} alt="failed test icon" />
                      </sl-tooltip>` : 
                  html`
                    <img src=${stop_src} alt="failed test icon" />
                  `
                  }
              `}
            <p>${test.displayString}</p>
          </div>
        `
      )
      if(test.valid) passedCount++;
    }

    if(passedCount > 1){
      this.enhancementsRatio = 100;
      this.enhancementsClassMap["green"] = true;
      this.enhancementsPassed = true;
      this.enhancementsIndicator = "assets/new/macro_passed.svg";
    } else if (passedCount == 1) {
      this.enhancementsRatio = 50;
      this.enhancementsClassMap["yellow"] = true;
      this.enhancementsPassed = false;
      this.enhancementsIndicator = "assets/new/yellow_exclamation.svg";
    } else {
      this.enhancementsRatio = 0;
      this.enhancementsClassMap["red"] = true;
      this.enhancementsPassed = false;
      this.enhancementsIndicator = "assets/new/macro_error.svg";
    }
  }

  async signInUser() {
    try {
    
    const result = await (this.authModule as AuthModule).signIn();
    if(result != null && result != undefined && "idToken" in result){
      return result;
    }
    else
      return null;
    }
    catch(e) {
      console.log("Authentication Error", e);
    } 
    return null;
  }

  async getUserToken() {
    const userResult = await this.signInUser();
    if(userResult != null) {
      this.userAccount = userResult;
      await this.claimToken();
      this.userAccount.loggedIn = true;
    }
    this.requestUpdate();
  }

  async signOut() {
    try {
      await (this.authModule as AuthModule).signOut();
      this.userAccount.loggedIn = false;
      this.requestUpdate();
    }
    catch(e) {
      console.log(e, "Authentication Error");
    } 
  }

  async claimToken() {
    const encodedUrl = encodeURIComponent(this.siteURL);

    const validateGiveawayUrl = env.validateGiveawayUrl + `/GetTokenForUser?site=${encodedUrl}`;
    let headers = getHeaders();

    try {
      const request = await fetch(validateGiveawayUrl, {
        method: 'GET',
        headers: {
          ...new Headers(headers),
          'Authorization': `Bearer ${this.userAccount.accessToken}`
        }
      });
      const response = await request.json() as {tokenId: string, errorMessage: string, rawError: unknown}
      // better way to do this?
      if (response.tokenId) { // :token/:appurl/:appname/:appicon/:user
        this.tokenId = response.tokenId
      }
      else {
        this.errorGettingToken = true;
        this.dupeURL = true;
        this.errorMessage = response.errorMessage;
      }
    }
    catch(e){}
  }

  goToCongratulationsPage(){
    Router.go(`/congratulations/${this.tokenId}/${encodeURIComponent(this.appCard.siteUrl)}/${this.appCard.siteName}/${encodeURIComponent(this.appCard.iconURL)}/${this.userAccount.name}`)
  }

  handleEnteredURL(e: SubmitEvent, root: any){
    e.preventDefault();

    let input: SlInput = root.shadowRoot!.querySelector(".url-input") as unknown as SlInput;

    const data = new FormData(e.target as HTMLFormElement);

    let url = data.get('site') as string;

    try {
      url = cleanUrl(url);
    } catch {
      input.setCustomValidity(localeStrings.input.home.error.invalidURL);
      input.reportValidity();
      return;
    }

    const isValidUrl = isValidURL(url);

    if(isValidUrl){
      input.setCustomValidity("");
      
      const urlParams = new URLSearchParams(window.location.search);

      urlParams.set('site', url);

      window.location.search = urlParams.toString();

      root.runGiveawayTests();
    } else {
      input.setCustomValidity(localeStrings.input.home.error.invalidURL);
      input.reportValidity();
      root.requestUpdate();
      return;
    }
  }

  decideBackground(){
    let covered = true;
    if(!this.siteURL){
      covered = false;
    }
    this.heroBanners.covered = covered;
    this.heroBanners.uncovered = !covered;
  }

  showTandC(){
    this.showTerms = true;
  }

  handleTermsResponse(accepted: boolean){
    this.showTerms = false;
    let checkbox = this.shadowRoot!.querySelector(".confirm-terms") as HTMLInputElement;
    checkbox.checked = accepted;
    this.acceptedTerms = accepted;
  }

  render(){
    return html`
    <div id="wrapper">
      <div id="hero-section" class=${classMap(this.heroBanners)}>
        <div id="hero-section-content">
        ${!this.testsInProgress && this.siteURL ? 
          html`
            <div class="back-to-giveaway-home" @click=${() => Router.go("/freeToken")}>
              <img src="/assets/new/left-arrow.svg" alt="enter new url" />
              <p class="diff-url">
                Enter different URL
              </p>
            </div>
            <sl-button class="retest-button secondary" @click=${() => Router.go(`/freeToken?site=${this.siteURL}`)}>
                <img src="/assets/new/retest-black.svg" alt="retest site" role="presentation" />
                <p>Retest site</p>
            </sl-button>` :
          html``}
        <img class="store-logo" src="/assets/new/msft-logo-giveaway.svg" alt="Microsoft Icon" />
        ${decideHeroSection(
          this.siteURL,
          {
            testsInProgress: this.testsInProgress,
            testsPassed: this.testsPassed,
            noManifest: this.noManifest,
            dupeURL: this.dupeURL
          },
          this.userAccount,
          this.errorGettingToken,
          this.handleEnteredURL,
          this
        )}
        </div>
      </div>
      ${this.siteURL ? 
        html`
          <div id="app-info-section">
            ${renderAppCard(
              this.siteURL,
              {
                testsInProgress: this.testsInProgress,
                dupeURL: this.dupeURL,
                requiredPassed: this.requiredPassed,
                installablePassed: this.installablePassed,
              },
              this.appCard,
              {
                installableClassMap: this.installableClassMap,
                enhancementsClassMap: this.enhancementsClassMap,
                requiredClassMap: this.requiredClassMap,
              },
              {
                installableRatio: this.installableRatio,
                enhancementsRatio: this.enhancementsRatio,
                requiredRatio: this.requiredRatio,
                enhancementsIndicator: this.enhancementsIndicator,
              },
              this.userAccount
            )}
          </div>
          ${!this.userAccount.loggedIn ? html`
          <div id="action-items-section">
            <div id="qual-div">
              <div id="qual-sum">
                <h2>Technical Qualifications</h2>
              </div>
              <div id="categories">
                ${this.testsInProgress ? 
                  html`
                    <sl-skeleton effect="sheen"></sl-skeleton>
                    <sl-skeleton effect="sheen"></sl-skeleton>
                    <sl-skeleton effect="sheen"></sl-skeleton>
                  ` :
                  html`
                    <sl-details
                      id="installable-details" 
                      class="inner-details"
                      @sl-show=${(e: Event) => rotateNinety("installable-details", this.shadowRoot, e)}
                      @sl-hide=${(e: Event) => rotateZero("installable-details", this.shadowRoot, e)}
                      data-card="installable-details">
                      <div slot="summary" class="inner-summary">
                        <div class="summary-left">
                          ${this.installablePassed ? html`<img class="" src=${valid_src} alt="installable tests passed icon"/>` : html`<img class="" src=${stop_src} alt="installable tests failed icon"/>`}
                          <h3>PWA is installable</h3>
                        </div>
                        <img class="dropdown_icon" data-card="installable-details" src="/assets/new/dropdownIcon.svg" alt="dropdown toggler"/>
                      </div>
                      <div class="todos">
                        ${this.installableTodos.length > 0 ? this.installableTodos.map((todo: TemplateResult) => todo) : html``}
                      </div>
                    </sl-details>
                    <sl-details 
                      id="required-details" 
                      class="inner-details"
                      @sl-show=${(e: Event) => rotateNinety("required-details", this.shadowRoot, e)}
                      @sl-hide=${(e: Event) => rotateZero("required-details", this.shadowRoot, e)}
                      data-card="required-details">
                      <div slot="summary" class="inner-summary">
                        <div class="summary-left">
                          ${this.requiredPassed ? html`<img class="" src=${valid_src} alt="required tests passed icon"/>` : html`<img class="" src=${stop_src} alt="required tests failed icon"/>`}
                          <h3>Manifest has required fields</h3>
                        </div>
                        <img class="dropdown_icon" data-card="required-details" src="/assets/new/dropdownIcon.svg" alt="dropdown toggler"/>
                      </div>
                      <div class="todos">
                        ${this.requiredTodos.length > 0 ? this.requiredTodos.map((todo: TemplateResult) => todo) : html``}
                      </div>
                    </sl-details>
                    <sl-details 
                      id="enhancements-details" 
                      class="inner-details"
                      @sl-show=${(e: Event) => rotateNinety("enhancements-details", this.shadowRoot, e)}
                      @sl-hide=${(e: Event) => rotateZero("enhancements-details", this.shadowRoot, e)}
                      data-card="enhancements-details">
                      <div slot="summary" class="inner-summary">
                        <div class="summary-left">
                          ${this.enhancementsPassed ? html`<img class="" src=${valid_src} alt="enhancements tests passed icon"/>` : html`<img class="" src=${stop_src} alt="enhancements tests failed icon"/>`}
                          <h3>Includes two or more desktop enhancements</h3>
                        </div>
                        <img class="dropdown_icon" data-card="enhancements-details" src="/assets/new/dropdownIcon.svg" alt="dropdown toggler"/>
                      </div>
                      <div class="todos">
                        ${this.enhancementsTodos.length > 0 ? this.enhancementsTodos.map((todo: TemplateResult) => todo) : html``}
                      </div>
                    </sl-details>
                    `
                }
              </div>
            </div>
          </div> ` : html``}
        ` : 
        html``
      }
      
      ${ !this.userAccount.loggedIn ? html`
      <div id="qual-section">
        <h2>Qualifications</h2>
        <ul>
          ${qualificationStrings.map((point: string) => html`<li>${point}</li>`)}
        </ul>
        <arrow-link .link=${"https://pwabuilder.com"} .text=${"Full Terms and conditions"}></arrow-link>
      </div>` : html``}
      ${this.siteURL ? 
        html`
          ${ !this.userAccount.loggedIn ? 
            html`
              <div id="sign-in-section">
                ${this.testsPassed ? 
                  html`<sl-button class="primary sign-in-button" @click=${this.getUserToken}>
                  <img class="sign-in-logo" src="assets/new/colorful-logo.svg" alt="Color Windows Logo" />
                    Sign in with a Microsoft account
                  </sl-button>` : 
              html`<sl-button class="primary" @click=${() => Router.go(`/reportcard?site=${this.siteURL}`) }>Back to PWABuilder</sl-button>`}
              </div>
            ` : 
              !this.dupeURL ?
            html `
                <div id="terms-and-conditions">
                  <label><input type="checkbox" class="confirm-terms" @click=${() => this.showTandC()} /> By clicking this button, you accept the Terms of Service and our Privacy Policy.</label>
                  <sl-button class="primary" @click=${this.goToCongratulationsPage} ?disabled=${!this.acceptedTerms}>View Token Code</sl-button>
                  <p>You are signed in as ${this.userAccount.email} <a @click=${this.signOut}>Sign out</a></p>
                </div>
            ` :
            html`
              <sl-button class="primary" @click=${() => Router.go(`/reportcard?site=${this.siteURL}`) }>Back to PWABuilder</sl-button>
            `
          
          }
        ` : html``}
      
          <div id="footer-section">
            <!-- Class Map to show the whole grid vs just the last half of the grid -->
            <div id="footer-section-grid" class=${classMap({"footer-grid-one-row": this.siteURL.length > 0, "footer-grid-two-row": this.siteURL.length == 0})}>
            ${!this.siteURL ?
              html`
                <div class="grid-item sc-img"><img id="marketing-img" src="/assets/new/marketing-img1.png" alt="pwabuilder home page" /></div>
                
                <div class="grid-item footer-text">
                  <p class="subheader">Ship your PWAs to App Store</p>
                  <p class="body-text">Build and Package progressive web apps for native app stores with PWABuilder.</p>
                  <sl-button class="primary" @click=${() => Router.go("/")} >PWABuilder</sl-button>
                </div> ` 
                : null
              }
              <div class="grid-item footer-text">
                <p class="subheader">Find your success in the Microsoft Store</p>
                <p class="large-body-text">Companies of all sizes—from startups to Fortune 500s—have used PWABuilder to package their PWAs.</p>
              </div>
              <div class="grid-item grid-img wheel-img-1920"><img src="/assets/new/marketing-img2.png" alt="different PWAs" /></div>
              <div class="grid-item grid-img wheel-img-1024"><img src="/assets/new/marketing-img2.png" alt="different PWAs" /></div>
              <div class="grid-item grid-img wheel-img-small"><img src="/assets/new/marketing-img2-mobile.png" alt="different PWAs" /></div>
            </div>
          </div>
        
      <!-- <div id="hero-section-bottom">

      </div>    -->
    </div>

    <sl-dialog class="dialog terms-and-conditions" label=${"Full Terms and conditions"} .open=${this.showTerms} @sl-request-close=${() => this.handleTermsResponse(false)}>
      
      <p>Thank you for your interest in the Microsoft Store on Windows Free Developer account offer! We would like to empower PWA developers to bring their ideas and experiences to Windows.</p>
      <h2>Offer details, terms, and conditions</h2>
      <p>A limited number of Microsoft Store on Windows developer account tokens (value approximately $20 USD each) are available and will be distributed to the first [number] qualified developers while supplies last. This token will enable you to create an account through which you can publish your own apps to the Microsoft Store on Windows 10 and Windows 11. To qualify, you must:</p>
      <ul>
        <li>Own a PWA that meets the technical requirements listed here</li>
        <li>You are legally residing in [what countries can we say?]</li>
        <li>Have a valid Microsoft Account to use to sign up for the Microsoft Store on Windows developer account</li>
        <li>Not have an existing Microsoft Store on Windows individual developer/publisher account</li>
        <li>Use the Store Token to create a Microsoft Store on Windows developer account within 30 calendar days of Microsoft sending you the token, using the same Microsoft Account you used to sign in here</li>
        <li>Plan to publish an app in the store this calendar year (prior to 12/31/2023 midnight Pacific Standard Time)</li>
        <li>Offer open to signups from [date] through [date] midnight Pacific Standard Time, or when the limited supply of [number] tokens run out, whichever comes first. Limit one free account token per developer and PWA.</li>
      </ul>
      <p>If you qualify and tokens are available, you will be given a token on this page when you submit the form. You can come back to this page to retrieve your token again at any time by signing in with your Microsoft Account. Free developer account tokens are not valid if transferred, sold, or otherwise used by any Microsoft Account other than the one which signed up here. These tokens are for individual, not corporate, Microsoft Store on Windows developer accounts. </p>
      <h2>Privacy and Communications</h2>
      <p>When you sign up, we will securely retain an anonymous account id and your PWA URL to enforce the above requirements. We will not store your name or email and we will not contact you.</p>
      <p>All data is retained in accordance with the Microsoft Privacy Policy found here: https://go.microsoft.com/fwlink/?LinkId=521839.</p>
      <sl-button class="primary accept-terms" @click=${() => this.handleTermsResponse(true)}>Accept Terms</sl-button>
    </sl-dialog>
    `
    
  }
}

const valid_src = "/assets/new/valid.svg";
const stop_src = "/assets/new/stop.svg";