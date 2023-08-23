import { Router } from '@vaadin/router';
import { LitElement, TemplateResult, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import '../../components/arrow-link'
import { cleanUrl, isValidURL } from '../../utils/url';
import { env } from '../../utils/environment'
import { getHeaders } from '../../utils/platformTrackingHeaders';
import { Manifest } from '@pwabuilder/manifest-validation';
import { AuthModule } from '../../services/auth_service';
import { localeStrings } from '../../../locales';

import style from './app-token.style';
import { decideHeroSection, renderAppCard, rotateNinety, rotateZero } from './app-token.template';
import { CheckUserTokenAvailability, GetTokenCampaignStatus, populateAppCard } from './app-token.helper';
import { SlInput } from '@shoelace-style/shoelace';
import { classMap } from 'lit/directives/class-map.js';
import { FindWebManifest } from '../app-report.api';
import { AnalyticsBehavior, recordPWABuilderProcessStep } from '../../utils/analytics';

@customElement('app-token')
export class AppToken extends LitElement {

  @state() siteURL: string = "";
  @state() testsInProgress: boolean = false;
  @state() isDenyList: boolean = false;
  @state() isPopularUrl: boolean = false;
  @state() isClaimed: boolean = false;
  @state() testsPassed: boolean = false;
  @state() appCard = {
    siteName: 'Site Name',
    description: "Your site's description",
    siteUrl: 'Site URL',
    iconURL: '/assets/new/icon_placeholder.png',
    iconAlt: 'Your sites logo'
  };
  @state() appCardInformationAvailable: boolean = false;
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
  @state() showTermsNoAccept: boolean = false;
  @state() acceptedTerms: boolean = false;

  @state() userAccount = {
    accessToken: '',
    email: '',
    name: '',
    loggedIn: false,
    state: ''
  };
  @state() authModule: AuthModule | null = null;
  @state() tokenId: string = '';
  @state() validateUrlResponseData: any = {};
  @state() userSignedIn: boolean = false;

  @state() tokensCampaignRunning: boolean = true;
  @state() validURL: boolean = true;
  @state() attemptingReclaimFromHome: boolean = false;

  static get styles() {
    return [
      style
    ]
  }

  async checkIfLoggedIn(state: string) {
    let account = await (this.authModule as AuthModule).registerPostLoginListener();
    if (!account) {
      try {
        account = await (this.authModule as AuthModule).getAccessTokenSilent();
      }
      catch (e) {
        return false;
      }
    }

    if(account && account.account) {
      if (account.state == '[object PointerEvent]')
        account.state = '';

      this.userAccount.name = account.account.name || '';
      this.userAccount.email = account.account.username || '';
      this.userAccount.accessToken = account.accessToken;
      this.userAccount.state = account.state || state;
      this.userAccount.loggedIn = true;
      this.siteURL = this.userAccount.state != 'reclaim' ? this.userAccount.state : state;

      const storedData = sessionStorage.getItem('validateUrlResponseData');
      if(storedData !== null) {
        this.validateUrlResponseData = JSON.parse(storedData);
        await this.registerData(this.validateUrlResponseData);
        return true;
      } else {
        return false;
      }

      //this.getUserToken();
    }
    return false;
  }

  firstUpdated(){
    recordPWABuilderProcessStep('free-token-page-loaded', AnalyticsBehavior.StartProcess);
  }
  async connectedCallback(): Promise<void> {

    this.tokensCampaignRunning = await GetTokenCampaignStatus();
    env.tokensCampaignRunning = this.tokensCampaignRunning;

    const search = new URLSearchParams(location.search);
    const site = search.get("site");

    // need to change this dirty hack to a proper singleton / state storage
    //@ts-ignore
    !window.authModule? window.authModule = new AuthModule() : null;
    //@ts-ignore
    this.authModule = window.authModule;

    if(site && site!.length > 0){
      const isValidUrl = isValidURL(site!);
      this.validURL = isValidUrl;
      if(!isValidUrl){
        this.siteURL = "";
      }
    }

    let dataRegisted: boolean = await this.checkIfLoggedIn(site || '');

    if(this.userAccount.loggedIn && (!this.tokensCampaignRunning || this.userAccount.state === 'reclaim')){
      this.reclaimToken(this.siteURL.length === 0);
    }

    if(this.userAccount.loggedIn){
      try {
        this.claimToken(true);
      } catch (e){
        console.error(e)
      }
    }

    if (site && this.validURL) {
      this.siteURL = site;
      if(!dataRegisted){
        this.runGiveawayTests();
      }
    }

    if(this.siteURL && this.testsPassed && this.userAccount.loggedIn){
      await this.preClaimToken();
    }

    this.decideBackground();
    super.connectedCallback();
  }

  // disconnectedCallback() {
  //   super.disconnectedCallback();
  // }

  async findManifest(url: string) {
    try {
      await FindWebManifest(url).then( async (result) => {
        if (result?.content?.json) {
          this.manifest = result.content.json;
          this.manifestUrl = result.content.url;
          //this.appCard = await populateAppCard(this.siteURL, this.manifest, this.manifestUrl);
        }
      });
    } catch(e) {
      console.error(e);
    }
  }

  async runGiveawayTests(){

    this.decideBackground();
    // run giveaway validation suite.
    this.testsInProgress = true;
    this.attemptingReclaimFromHome = false;

    // pretending to test for now replace with: call to api for test results
    await this.validateUrl();

    if(this.siteURL && this.testsPassed && this.userAccount.loggedIn){
      await this.preClaimToken();
    }

    this.testsInProgress = false;

  }

  async validateUrl(){

    await this.findManifest(this.siteURL);

    if(Object.keys(this.manifest)){
      this.appCardInformationAvailable = true;
      this.appCard = await populateAppCard(this.siteURL, this.manifest, this.manifestUrl);
    }

    const encodedUrl = encodeURIComponent(this.siteURL);

    const validateGiveawayUrl = env.validateGiveawayUrl + `/validateurl?site=${encodedUrl}`;

    let headers = {...getHeaders(), 'content-type': 'application/json' };

    try {
      const response = await fetch(validateGiveawayUrl, {
        method: 'POST',
        body: JSON.stringify(
          {
            manifestJson: Object.keys(this.manifest).length > 0 ? this.manifest : null,
            manifestUrl: this.manifestUrl.length > 0 ? this.manifestUrl : null
          }
        ),
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

      recordPWABuilderProcessStep('tests_completed', AnalyticsBehavior.ProcessCheckpoint,
      {
        url: this.siteURL,
        passed: this.testResults.testsPassed
      });

      this.validateUrlResponseData = responseData;
      sessionStorage.setItem("validateUrlResponseData", JSON.stringify(this.validateUrlResponseData));

      await this.registerData(responseData);

    } catch (e) {
      console.error(e);
    }
  }

  /*
    data can come from api response or
    in the case of login, from the msal cached state.
    this function allows us to update that information
    from either method.
  */
  async registerData(data: any){
    this.testResults = data.testResults;
    if(Object.keys(this.manifest).length == 0){
      this.manifest = data.manifestJson;
      this.manifestUrl = data.manifestUrl;
      sessionStorage.setItem('PWABuilderManifest', JSON.stringify({
        manifest: this.manifest,
        manifestUrl: this.manifestUrl
      }));
      sessionStorage.setItem('current_url', this.manifestUrl);
    }

    this.testsPassed = data.isEligibleForToken;
    this.isDenyList = data.isInDenyList;
    this.isPopularUrl = data.isPopUrl;
    this.isClaimed = data.isClaimedUrl;

    this.handleInstallable(this.testResults.installable);
    this.handleRequired(this.testResults.additional);
    this.handleEnhancements(this.testResults.progressive);
    this.appCard = await populateAppCard(this.siteURL, this.manifest, this.manifestUrl);
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
              <a href="${test.docsLink}" target="_blank" @click=${() => this.trackLinkClick(`${key}_inside_details`)}>${test.displayString}</a>
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
      let test = required[key];
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
            <a href="${test.docsLink}" target="_blank" @click=${() => this.trackLinkClick(`${key}_inside_details`)}>${test.displayString}</a>
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
            <a href="${test.docsLink}" target="_blank" @click=${() => this.trackLinkClick(`${key}_inside_details`)}>${test.displayString}</a>
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

  async signInUser(stateOverride?: string) {
    recordPWABuilderProcessStep("sign_in_button_clicked", AnalyticsBehavior.ProcessCheckpoint);

    try {
      const result = await (this.authModule as AuthModule).signIn(stateOverride || this.siteURL);
      if(result != null && result != undefined && "idToken" in result){
        this.requestUpdate();
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

  // async getUserToken() {
  //   recordPWABuilderProcessStep("sign_in_button_clicked", AnalyticsBehavior.ProcessCheckpoint);
  //   // const userResult =
  //   await this.signInUser();
  //   // This one is not working anymore?
  //   // if(userResult != null) {
  //   //   this.userAccount = userResult;
  //   //   // await this.claimToken();
  //   //   this.userAccount.loggedIn = true;
  //   //   this.userSignedIn = true;
  //   //   await this.claimToken();
  //   // }
  //   this.requestUpdate();
  // }

  async signOut() {
    try {
      await (this.authModule as AuthModule).signOut();
      this.userAccount.loggedIn = false;
      recordPWABuilderProcessStep("sign_out_button_clicked", AnalyticsBehavior.ProcessCheckpoint);
      this.requestUpdate();
    }
    catch(e) {
      console.log(e, "Authentication Error");
    }
  }

  async preClaimToken() {
    if (this.userAccount.accessToken && this.siteURL) {
      const availability = await CheckUserTokenAvailability(this.siteURL, this.userAccount.accessToken);
      if (!availability.isTokenAvailable && availability.errorMessage) {
        this.errorGettingToken = true;
        this.errorMessage = availability.errorMessage;
      }
    }
  }

  @state() claimTokenLoading = false;
  async claimToken(isAutoClaim = false) {
    !isAutoClaim && recordPWABuilderProcessStep("view_token_code_button_clicked", AnalyticsBehavior.ProcessCheckpoint);

    const fullInfo = this.siteURL.length > 0 && this.tokensCampaignRunning;
    let encodedUrl;
    let validateGiveawayUrl;
    if(fullInfo && !isAutoClaim){
      encodedUrl = encodeURIComponent(this.siteURL);
      validateGiveawayUrl = env.validateGiveawayUrl + `/GetTokenForUser?site=${encodedUrl}`;
    } else {
      validateGiveawayUrl = env.validateGiveawayUrl + `/GetTokenForUser`;
    }


    let headers = getHeaders();

    try {
      this.claimTokenLoading = true;
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
        this.goToCongratulationsPage(fullInfo);
      }
      else if (!isAutoClaim) {
        this.errorGettingToken = true;
        //this.isDenyList = true;
        // @jay error like this is not working: errorMessage: "There are no more free tokens left. Please contact pwabuilder@microsoft.com"
        this.errorMessage = response.errorMessage;
      }
    }
    catch(e){}

    this.claimTokenLoading = false;
    this.requestUpdate();
  }

  goToCongratulationsPage(fullInfo: boolean){
    console.log(encodeURIComponent(this.appCard.siteUrl))
    if(fullInfo){
      Router.go(`/congratulations/${this.tokenId}/${encodeURIComponent(this.appCard.siteUrl)}/${this.appCard.siteName}/${encodeURIComponent(this.appCard.iconURL)}/${this.userAccount.name || 'Developer'}/${encodeURIComponent(this.userAccount.email)}`)
      return;
    }
    Router.go(`/congratulations/${this.tokenId}/${this.userAccount.name || 'Developer'}/${encodeURIComponent(this.userAccount.email)}`)
    return;
  }

  resetData(){
    this.testsInProgress = false
    this.testsPassed = false
    this.noManifest = false
    this.isDenyList = false;
    this.isClaimed = false;
    this.errorGettingToken = false;
    this.userSignedIn = false;
    this.appCardInformationAvailable = false;
    this.siteURL = '';
    if(sessionStorage.getItem('PWABuilderManifest')){
      sessionStorage.removeItem('PWABuilderManifest');
    }
    if(sessionStorage.getItem('validateUrlResponseData')){
      sessionStorage.removeItem('validateUrlResponseData');
    }
  }

  handleEnteredURL(e: SubmitEvent, root: any){
    e.preventDefault();

    // come back here potentially to collect more info
    recordPWABuilderProcessStep("url_entered", AnalyticsBehavior.ProcessCheckpoint);

    root.resetData()

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

      sessionStorage.setItem("current_url", url);

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

  // if showAcceptButton is true we are coming from the accept t and c button
  // if its false its just the link in the qualifications section
  showTandC(showAcceptButton: boolean){
    this.showTerms = true;
    this.showTermsNoAccept = !showAcceptButton;

    // if we are showing the accept button we are in the final t and c
    // if not it must be from the qualifications box.
    let location = showAcceptButton ? "full" : "qualification";
    
    recordPWABuilderProcessStep(`${location}_terms_and_conditions_clicked`, AnalyticsBehavior.ProcessCheckpoint);
    recordPWABuilderProcessStep("terms_and_conditions_modal_opened", AnalyticsBehavior.ProcessCheckpoint);

  }

  handleTermsResponse(accepted: boolean){
    this.showTerms = false;
    this.showTermsNoAccept = false;
    let checkbox = this.shadowRoot!.querySelector(".confirm-terms") as HTMLInputElement;
    if(checkbox){
      checkbox.checked = accepted;
      this.acceptedTerms = accepted;
    }
    if(accepted){
      recordPWABuilderProcessStep("terms_and_conditions_accept_clicked", AnalyticsBehavior.ProcessCheckpoint);
    } else {
      recordPWABuilderProcessStep("terms_and_conditions_close_clicked", AnalyticsBehavior.ProcessCheckpoint);
    }
  }

  enterDifferentURL(){
    recordPWABuilderProcessStep("enter_different_url_button_clicked", AnalyticsBehavior.ProcessCheckpoint);
    Router.go(`/freeToken`)
    this.siteURL = "";
  }

  reclaimToken(fromHome: boolean){
    recordPWABuilderProcessStep("reclaim_token_button_clicked", AnalyticsBehavior.ProcessCheckpoint);
    this.attemptingReclaimFromHome = fromHome;
    // new function call with sign in key
    if(!this.userAccount.loggedIn){
      this.signInUser('reclaim');
      //this.siteURL = "";
    } else {
      this.claimToken();
    }
  }

  backToPWABuilderHome(location: string){
    recordPWABuilderProcessStep(`back_to_pwabuilder_home_${location}_clicked`, AnalyticsBehavior.ProcessCheckpoint);
    Router.go("/")
  }

  backToReportCardPage(){
    recordPWABuilderProcessStep(`back_to_report_card_page_button_clicked`, AnalyticsBehavior.ProcessCheckpoint);
    Router.go(`/reportcard?site=${this.siteURL}`);
  }

  updateSignInState(){
    recordPWABuilderProcessStep(`continue_button_clicked`, AnalyticsBehavior.ProcessCheckpoint);
    this.userSignedIn = true;
  }

  trackLinkClick(linkDescription: string){
    recordPWABuilderProcessStep(`${linkDescription}_link_clicked`, AnalyticsBehavior.ProcessCheckpoint);
  }

  render(){

    if(!this.tokensCampaignRunning){
      return html`
        <div id="over-wrapper">
          <div id="over-main-content">

            ${this.errorGettingToken && this.userAccount.loggedIn?
            html`
              <div class="over-banner">
                <img src="/assets/new/stop.svg" alt="invalid result icon" />
                <p class="end-error-desc"> 
                  <span>Invalid Account:</span> 
                  The account you used to reclaim a code does not one associated with it. Try signing in with a different account or 
                  <a href="https://github.com/pwa-builder/PWABuilder/issues/new/choose" target="_blank" rel="noopener" @click=${() => this.trackLinkClick("campaign_over_reclaim_error_open_issue")}>open an issue</a> 
                  on our GitHub.
                </p>
              </div>
            ` : null }

            ${!this.errorGettingToken? html `
              ${this.userAccount.loggedIn ? html`
                <sl-button class="primary" @click=${() => this.reclaimToken(false)} .loading="${this.claimTokenLoading}" .disabled="${this.claimTokenLoading}">Reclaim token</sl-button>
              ` : html`
                  <sl-button class="primary sign-in-button final-button" @click=${() => this.reclaimToken(false)}>
                        <img class="sign-in-logo" src="assets/new/colorful-logo.svg" alt="Color Windows Logo" />
                          Sign in with a Microsoft account to reclaim your code
                  </sl-button>`
            }` : null}
            ${this.userAccount.loggedIn ? html`
              <p class="sign-out-prompt">You are signed in as ${this.userAccount.email} <a @click=${this.signOut}>Sign out</a></p>`
            : null}

            <h1>This promotion has currently ended.</h1>
            <p>Please check our Twitter handle
              <a href="https://twitter.com/pwabuilder" rel="noopener" target="_blank" @click=${() => this.trackLinkClick("campaign_over_twitter")}>@PWABuilder</a>
              or join our
              <a href="https://aka.ms/pwabuilderdiscord" rel="noopener" target="_blank" @click=${() => this.trackLinkClick("campaign_over_discord")}>Discord</a>
              for more information on the next promotion.
            </p>
            <div id="icons-section">
              <a href="https://twitter.com/pwabuilder" rel="noopener" target="_blank" @click=${() => this.trackLinkClick("campaign_over_twitter_icon")}>
                <img class="twt" src='/assets/new/twitter.svg' alt="twitter logo" />
              </a>
              <a href="https://aka.ms/pwabuilderdiscord" rel="noopener" target="_blank" @click=${() => this.trackLinkClick("campaign_over_discord_icon")}>
                <img class="disc" src='/assets/new/discord.svg' alt="discord logo">
              </a>
            </div>
          </div>
        </div>
      `
    }
    return html`
    <div id="wrapper">
      ${this.errorGettingToken && this.userAccount.loggedIn && this.attemptingReclaimFromHome ?
        html`
          <div class="top-banner-container">
            <div class="feedback-holder type-error top-banner">
              <img src="/assets/new/stop.svg" alt="invalid result icon" />
              <div class="error-info">
                <p class="error-title">No token associated with this account.</p>
                <p class="error-desc"> 
                  The account you used to reclaim a token does not have one associated with it. Try signing in with a different account or open an issue on our GitHub.
                </p>
                <div class="error-actions">
                  <a href="https://github.com/pwa-builder/PWABuilder/issues/new/choose" target="_blank" rel="noopener" @click=${() => this.trackLinkClick("reclaim_error_open_issue")}>Open an Issue</a>
                  <button type="button" @click=${this.signOut}>Sign out</button>
                </div>
              </div>
            </div>
          </div>
        ` : null }
      <div id="hero-section" class=${classMap(this.heroBanners)}>
        <div id="hero-section-content">
          <div id="actions-left">
            ${this.userAccount.loggedIn ? html`<p class="sign-out-prompt">You are signed in as ${this.userAccount.email}</p><a class="sign-out-link" @click=${this.signOut}>Sign out</a>` : null}
          </div>
          <div id="actions-right">
            ${(!this.testsInProgress && !this.siteURL && !this.errorGettingToken) ?
                html`
                  <sl-button class="secondary" @click=${() => this.reclaimToken(true)}>
                      Reclaim Token
                  </sl-button>
                  ` :
                null}
              ${(!this.testsInProgress && this.siteURL) && !this.userSignedIn ?
                html`
                  <sl-button class="secondary" @click=${() => this.enterDifferentURL()}>
                      Enter different URL
                  </sl-button>
                  ` :
                null}
              <button type="button" class="back-to-home" @click=${() => this.backToPWABuilderHome("logo")}><img class="pwabuilder-logo" src="/assets/logos/header_logo.png" alt="PWABuilder logo" /></button>
          </div>
          <div id="hero-section-text">
            ${decideHeroSection(
              this.siteURL,
              {
                testsInProgress: this.testsInProgress,
                testsPassed: this.testsPassed,
                noManifest: this.noManifest,
                denyList: this.isDenyList,
                popUrl: this.isPopularUrl,
                claimed: this.isClaimed
              },
              this.userAccount,
              this.errorGettingToken,
              this.handleEnteredURL,
              this.validURL,
              this
            )}
          </div>
        </div>
      </div>
      ${this.siteURL  ?
        html`
          <div id="app-info-section">
            ${renderAppCard(
              this.siteURL,
              {
                testsInProgress: this.testsInProgress,
                denyList: this.isDenyList,
                popUrl: this.isPopularUrl,
                requiredPassed: this.requiredPassed,
                installablePassed: this.installablePassed,
              },
              this.appCard,
              this.appCardInformationAvailable,
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
              this.errorGettingToken,
              this.isClaimed,
              this
            )}
          </div>
          ${!this.userSignedIn ? html`
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
                      data-card="installable-details"
                      open>
                      <div slot="summary" class="inner-summary">
                        <div class="summary-left">
                          ${this.installablePassed ? html`<img class="" src=${valid_src} alt="installable tests passed icon"/>` : html`<img class="" src=${stop_src} alt="installable tests failed icon"/>`}
                          <h3>Installable PWA</h3>
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
                          <h3>Manifest requirements</h3>
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
                          <h3>Two or more desktop enhancements</h3>
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

      ${ !this.userSignedIn ? html`
      <div id="qual-section">
        <h2>Qualifications</h2>
        <p>To qualify, you must:</p>
        <ul>
          <li>Own a PWA that is installable, contains all required manifest fields, and implements at least two desktop enhancements</li>
          <li>Live in a country or region where the Windows program in Partner Center is offered.
            <a
              href="https://learn.microsoft.com/en-us/windows/apps/publish/partner-center/account-types-locations-and-fees#developer-account-and-app-submission-markets"
              rel="noopener"
              target="_blank"
              @click=${() => this.trackLinkClick("full_country_list")}
              >See here for the full list of countries</a>
          </li>
          <li>Have a valid Microsoft Account to use to sign up for the Microsoft Store on Windows developer account </li>
          <li>Not have an existing Microsoft Store on Windows individual developer/publisher account</li>
          <li>Use the Store Token to create a Microsoft Store on Windows developer account within 30 calendar days of Microsoft sending you the token, using the same Microsoft Account you used to sign in here</li>
          <li>Plan to publish an app in the store this calendar year (prior to 12/31/2023 midnight Pacific Standard Time)</li>
        </ul>
        <p class="FTC" @click=${() => this.showTandC(false)}>Full Terms and Conditions</p>
      </div>` : html``}
      ${this.siteURL ?
        html`
          ${ !this.userSignedIn ?
            html`
              <div id="sign-in-section">
                ${this.testsPassed && !this.isPopularUrl && !this.isDenyList && !this.isClaimed && !this.errorGettingToken ?
                    this.userAccount.loggedIn ?
                    html`<sl-button class="primary" @click=${() => this.updateSignInState()}>Continue</sl-button></div>` :
                    html`
                      <sl-button class="primary sign-in-button final-button" @click=${this.signInUser}>
                      <img class="sign-in-logo" src="assets/new/colorful-logo.svg" alt="Color Windows Logo" />
                        Sign in with a Microsoft account to continue
                      </sl-button>`
                  :
                  html`
                    <div class="back-to-pwabuilder-section">
                      <sl-button class="primary final-button " @click=${() => this.backToReportCardPage()}>Back to PWABuilder</sl-button>
                      ${this.userAccount.loggedIn ? html`<p class="sign-out-prompt">You are signed in as ${this.userAccount.email} <a @click=${this.signOut}>Sign out</a></p>` : null}
                    </div>`}
              </div>
            ` : // this is where the user is signed in
                // not in denyList or popular
                // show terms and conditions
              !this.isDenyList && !this.isPopularUrl ?
            html `
                <div id="terms-and-conditions">
                  <label><input type="checkbox" class="confirm-terms" @click=${() => this.showTandC(true)} /> By clicking this button, you accept the Terms of Service and our Privacy Policy.</label>

                  ${this.acceptedTerms ?
                    html`<sl-button class="primary" @click=${() => this.claimToken()} .loading="${this.claimTokenLoading}" .disabled="${this.claimTokenLoading}">View Token Code</sl-button>` :
                    html`<sl-button class="primary vtc-disabled" disabled>View Token Code</sl-button>`
                  }


                  <p class="sign-out-prompt">You are signed in as ${this.userAccount.email} <a @click=${this.signOut}>Sign out</a></p>
                </div>
            ` :
            html`
              <sl-button class="primary" @click=${() => this.backToReportCardPage()}>Back to PWABuilder</sl-button>
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
                  <sl-button class="primary" @click=${() => this.backToPWABuilderHome("button")} >PWABuilder</sl-button>
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

    <sl-dialog class=${classMap({dialog: true, withoutAccept: this.showTermsNoAccept})} label=${"Full Terms and Conditions"} .open=${this.showTerms || this.showTermsNoAccept} @sl-request-close=${() => this.handleTermsResponse(false)}>

      <p>Thank you for your interest in the Microsoft Store on Windows Free Developer account offer! We would like to empower PWA developers to bring their ideas and experiences to Windows.</p>
      <h2>Offer details, terms, and conditions</h2>
      <p>A limited number of Microsoft Store on Windows developer account tokens (value approximately $20 USD each) are available and will be distributed to qualified developers while supplies last. This token will enable you to create an account through which you can publish your own apps to the Microsoft Store on Windows 10 and Windows 11.</p>
      <p>To qualify, you must:</p>
      <ul>
        <li>Own a PWA that is installable, contains all required manifest fields, and implements at least two desktop enhancements</li>
        <li>Live in a country or region where the Windows program in Partner Center is offered.
          <a
            href="https://learn.microsoft.com/en-us/windows/apps/publish/partner-center/account-types-locations-and-fees#developer-account-and-app-submission-markets"
            rel="noopener"
            target="_blank"
            @click=${() => this.trackLinkClick("full_country_list")}
            >See here for the full list of countries</a>
        </li>
        <li>Have a valid Microsoft Account to use to sign up for the Microsoft Store on Windows developer account </li>
        <li>Not have an existing Microsoft Store on Windows individual developer/publisher account</li>
        <li>Use the Store Token to create a Microsoft Store on Windows developer account within 30 calendar days of Microsoft sending you the token, using the same Microsoft Account you used to sign in here</li>
        <li>Plan to publish an app in the store this calendar year (prior to 12/31/2023 midnight Pacific Standard Time)</li>
      </ul>
      <p>Offer open to signups from August 15th, 2023 through September 15th, 2023 midnight Pacific Standard Time, or when the limited supply of tokens run out, whichever comes first. Limit one free account token per developer and PWA.</p>
      <p>If you qualify and tokens are available, you will be given a token on this page when you submit the form. You can come back to this page to retrieve your token again at any time by signing in with your Microsoft Account. Free developer account tokens are not valid if transferred, sold, or otherwise used by any Microsoft Account other than the one which signed up here. These tokens are for individual, not corporate, Microsoft Store on Windows developer accounts.</p>
      <h2>Privacy and communications</h2>
      <p>When you sign up, we will securely retain an anonymous account id and your PWA URL to enforce the above requirements. We will not store your name or email and we will not contact you.</p>
      <p>All data is retained in accordance with the Microsoft Privacy Policy found here:
        <a
          href="https://go.microsoft.com/fwlink/?LinkId=521839"
          rel="noopener"
          target="_blank"
          @click=${() => this.trackLinkClick("privacy_policy")}
        >https://go.microsoft.com/fwlink/?LinkId=521839</a>.</p>
      ${!this.showTermsNoAccept ? html`<sl-button class="primary accept-terms" @click=${() => this.handleTermsResponse(true)}>Accept Terms</sl-button>` : null}
    </sl-dialog>
    `

  }
}

const valid_src = "/assets/new/valid.svg";
const stop_src = "/assets/new/stop.svg";