import { html } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { SlDetails } from "@shoelace-style/shoelace";
import { AnalyticsBehavior, recordPWABuilderProcessStep } from '../../utils/analytics';
import { AppToken } from './app-token';

export function decideHeroSection(
  siteURL: string,
  tests: {
    testsInProgress: boolean;
    testsPassed: boolean;
    noManifest: boolean;
    denyList: boolean;
    popUrl: boolean;
    claimed: boolean;
  },
  userAccount: { loggedIn: boolean; name: string },
  errorGettingToken: boolean,
  handleEnteredURL: (e: SubmitEvent, shadowRoot: ShadowRoot) => unknown,
  validURL: boolean,
  root: any
) {
  let message = html``;
  if(!validURL){
    message = html`
      <p class="invalid-url">The URL you attempted to enter is invalid. Please try again by entering a new URL. </p>
    `;
  }

  // no site in query params
  if (!siteURL) {
    return html`
      <h1>Get a Free Windows Developer Account on the Microsoft Store</h1>
      <p class="hero-message with-input">Check below to see if your PWA qualifies</p>
      <div class="input-area">
        <form @submit=${(e: SubmitEvent) => handleEnteredURL(e, root)}>
          <sl-input placeholder="Enter URL" class="url-input" type="text" name="site"></sl-input>
          <sl-button
            type="submit"
            class="primary"
            >Start</sl-button
          >
        </form>
        ${message}
      </div>
    `;
  }

  // if site in query params and testing in progress
  if (siteURL && tests.testsInProgress) {
    return html`
      <h1>Validation in progress..</h1>
      <p class="hero-message">We are checking to see if this URL qualifies for a free token</p>
    `;
  }

  // if tests complete but its a url on the denyList
  if (!tests.testsInProgress && tests.denyList) {
    return html`
      <h1>Oops!</h1>
      <p class="hero-message">This PWA is already in the Microsoft Store.</p>
    `;
  }

  // if tests complete but its a url on the popular list
  if (!tests.testsInProgress && tests.popUrl) {
    return html`
      <h1>Oops!</h1>
      <p class="hero-message">This PWA belongs to an organization or company.</p>
    `;
  }

  if(!tests.testsInProgress && tests.claimed){
    return html`
      <h1>Oops!</h1>
      <p class="hero-message">This PWA has already been claimed.</p>
    `;
  }

  // if tests complete and validations pass
  if (!tests.testsInProgress && tests.noManifest) {
    return html`
      <h1>Oops!</h1>
      <p class="hero-message">
        You must at least have a manifest for us to run our tests! Go back to
        PWABuilder to create your manifest now!
      </p>
    `;
  }

  // if tests complete and validations pass
  if (!tests.testsInProgress && tests.testsPassed) {
    if (userAccount.loggedIn) {
      if (errorGettingToken) {
        return html`
          <h1>Oops, ${userAccount.name}!</h1>
          <p class="hero-message">
            URL already used in another account. Please use another URL and try
            again.
          </p>
        `;
      }
      return html`
        <h1>Congratulations ${userAccount.name}!</h1>
        <p class="hero-message">
          This URL has passed our tests! You qualify for a free Microsoft Store developer account!
        </p>
      `;
    }
    return html`
      <h1>Congratulations!</h1>
      <p class="hero-message">
        This URL has passed our tests! You may qualify for a free Microsoft Store developer account!
      </p>
    `;
  }

  // if tests complete and validations fail
  if (!tests.testsInProgress && !tests.testsPassed) {
    return html`
      <h1>Almost there!</h1>
      <p class="hero-message">
        In order to qualify for a free Microsoft developer account check the
        technical qualifications below.
      </p>
    `;
  }

  return html``;
}

export function renderAppCard(
  siteURL: string,
  tests: {
    testsInProgress: boolean;
    installablePassed: boolean;
    requiredPassed: boolean;
    denyList: boolean;
    popUrl: boolean;
  },
  appCard: {
    siteName: string;
    siteUrl: string;
    description: string;
    iconURL: string;
    iconAlt: string;
  },
  infoAvailable: boolean,
	classMaps: {
		installableClassMap: Record<string, boolean>;
		requiredClassMap: Record<string, boolean>;
		enhancementsClassMap: Record<string, boolean>;
	},
	ratios: {
		installableRatio: number;
		requiredRatio: number;
		enhancementsRatio: number;
		enhancementsIndicator: string;
	},
  errorGettingToken: boolean,
  isClaimed: boolean,
  appToken: AppToken
  //userAccount: { loggedIn: boolean; name: string }
) {
  // no site in query params
  if (!siteURL) {
    return html``;
  }

  // if site in query params and testing in progress
  if (siteURL && tests.testsInProgress) {
    return html`
    <div id="app-info">
      ${infoAvailable ? 
      html`
        <!-- Show card with info -->
        <div id="logo-and-text">
          <div id="img-holder">
            <img
              class="square"
              src="${appCard.iconURL}"
              alt="${appCard.iconAlt}"
            />
          </div>
          <div id="words">
            <p>${appCard.siteName}</p>
            <p>${appCard.siteUrl}</p>
            <p class="app-desc">${appCard.description}</p>
          </div>
        </div>
      ` : 
      html`
      <!-- Show card with skeleton -->
      <div id="logo-and-text">
        <sl-skeleton class="square" effect="sheen"></sl-skeleton>
        <div id="words">
          <sl-skeleton effect="sheen"></sl-skeleton>
          <sl-skeleton effect="sheen"></sl-skeleton>
          <sl-skeleton effect="sheen"></sl-skeleton>
          <sl-skeleton effect="sheen"></sl-skeleton>
        </div>
      </div>
      `
    }
      

        <div id="rings">
          <div class="card-holder">
            <div class="loader-round"></div>
            <p>Installable</p>
          </div>
          <div class="card-holder">
            <div class="loader-round"></div>
            <p>Required Fields</p>
          </div>
          <div class="card-holder">
            <div class="loader-round"></div>
            <p>Enhancements</p>
          </div>
        </div>
      </div>
    `;
  }

  let banner = html``;

  // tests complete but its a denyList url
  if(!tests.testsInProgress && tests.denyList){
    banner = html`
      <!-- error banner -->
      <div class="feedback-holder type-error">
        <img src="/assets/new/stop.svg" alt="invalid result icon" />
        <div class="error-info">
          <p class="error-title">URL already in use</p>
          <p class="error-desc">
            We noticed this PWA has already been linked to an account in the Microsoft Store. Please check the URL you are using or open an issue on our GitHub.        
          </p>
          <div class="error-actions">
            <a href="https://github.com/pwa-builder/PWABuilder/issues/new/choose" target="_blank" rel="noopener" @click=${() => trackLinkClick("denyList_error_open_issue")}>Open an Issue</a>
          </div>
        </div>
      </div>
    `;
  
    // tests complete but its a popular url
  } else if (!tests.testsInProgress && tests.popUrl) {
    banner = html`
    <!-- error banner -->
    <div class="feedback-holder type-error">
      <img src="/assets/new/stop.svg" alt="invalid result icon" />
      <div class="error-info">
        <p class="error-title"> This is a known PWA belonging to an organization or business</p>
        <p class="error-desc">
          This is a known PWA belonging to an organization or business. Tokens are only available to individuals. See full terms and conditions. 
        </p>
        <div class="error-actions">
            <a href="https://github.com/pwa-builder/PWABuilder/issues/new/choose" target="_blank" rel="noopener" @click=${() => trackLinkClick("popular_pwa_error_open_issue")}>Open an Issue</a>
          </div>
      </div>
    </div>
  `;

  } else if(!tests.testsInProgress && isClaimed && !errorGettingToken){
    banner = html`
    <!-- error banner -->
    <div class="feedback-holder type-error">
      <img src="/assets/new/stop.svg" alt="invalid result icon" />
      <div class="error-info">
        <p class="error-title">URL already claimed</p>
        <p class="error-desc">
          We noticed this PWA has already been claimed. Please check the URL you are using or try another.
        </p>
        <div class="error-actions">
            <button type="button" @click=${(e: Event) => {
              e.preventDefault();
              appToken.reclaimToken(false);
            }}>Reclaim token</button>
            <a href="https://github.com/pwa-builder/PWABuilder/issues/new/choose" target="_blank" rel="noopener" @click=${() => trackLinkClick("already_claimed_error_open_issue")}>Open an Issue</a>
          </div>
      </div>
    </div>
  `;  
    
  } else if (!tests.testsInProgress && errorGettingToken){
    banner = html`
      <div class="feedback-holder type-error top-banner">
        <img src="/assets/new/stop.svg" alt="invalid result icon" />
        <div class="error-info">
          <p class="error-title">No token associated with this account.</p>
          <p class="error-desc"> 
            The account you used to reclaim a token does not have one associated with it. Try signing in with a different account or open an issue on our GitHub.
          </p>
          <div class="error-actions">
            <a href="https://github.com/pwa-builder/PWABuilder/issues/new/choose" target="_blank" rel="noopener" @click=${() => trackLinkClick("reclaim_error_open_issue")}>Open an Issue</a>
            <button type="button" @click=${appToken.signOut}>Sign out</button>
          </div>
        </div>
      </div>
    `;
  }

  // else: tests are complete
  // Show card with app info + results
  return html`
    ${banner}
    <!-- Error Banner + the results below -->
    <!-- Show card with results + error banner -->
    <div id="app-info">
      <div id="logo-and-text">
        <div id="img-holder">
          <img
            class="square"
            src="${appCard.iconURL}"
            alt="${appCard.iconAlt}"
          />
        </div>
        <div id="words">
          <p>${appCard.siteName}</p>
          <p>${appCard.siteUrl}</p>
          <p class="app-desc">${appCard.description}</p>
        </div>
      </div>
      <div id="rings">
        <div class="card-holder">
          <sl-progress-ring
            class=${classMap(classMaps.installableClassMap)}
            value=${ratios.installableRatio}
          >
            ${tests.installablePassed
              ? html`<img class="macro" src="assets/new/macro_passed.svg" alt="macro error icon" />`
              : html`<img class="macro" src="assets/new/macro_error.svg" alt="macro error icon" />`}
          </sl-progress-ring>
          <p>Installable</p>
        </div>
        <div class="card-holder">
          <sl-progress-ring
            class=${classMap(classMaps.requiredClassMap)}
            value=${ratios.requiredRatio}
          >
            ${tests.requiredPassed
              ? html`<img class="macro" src="assets/new/macro_passed.svg" alt="macro error icon" />`
              : html`<img class="macro" src="assets/new/macro_error.svg" alt="macro error icon" />`}
          </sl-progress-ring>
          <p>Required Fields</p>
        </div>
        <div class="card-holder">
          <sl-progress-ring
            class=${classMap(classMaps.enhancementsClassMap)}
            value=${ratios.enhancementsRatio}
          >
            <img class="macro" src=${ratios.enhancementsIndicator} alt="macro error icon" />
          </sl-progress-ring>
          <p>Enhancements</p>
        </div>
      </div>
    </div>
  `;
}

function trackLinkClick(linkDescription: string){
  recordPWABuilderProcessStep(`${linkDescription}_link_clicked`, AnalyticsBehavior.ProcessCheckpoint);
}

// Rotates the icon on each details drop down to 0 degrees
export function rotateZero(card: string, shadowRoot: Element["shadowRoot"], e?: Event){
	recordPWABuilderProcessStep(card + "_details_expanded", AnalyticsBehavior.ProcessCheckpoint);
	e?.stopPropagation();
	let icon: HTMLImageElement = shadowRoot!.querySelector('img[data-card="' + card + '"]')!;

	if(icon){
		icon!.style.transform = "rotate(0deg)";
	}
}

// Rotates the icon on each details drop down to 90 degrees
export function rotateNinety(card: string, shadowRoot: Element["shadowRoot"], e?: Event){
	recordPWABuilderProcessStep(card + "_details_closed", AnalyticsBehavior.ProcessCheckpoint);
	e?.stopPropagation();
	let icon: HTMLImageElement = shadowRoot!.querySelector('img[data-card="' + card + '"]')!;

	if(icon){
		icon!.style.transform = "rotate(90deg)";
	}

	// only allow one details to be open at a time
	let details = shadowRoot!.querySelectorAll("sl-details");
	details.forEach((detail: SlDetails) => {
		if(detail.dataset.card !== card){
			detail.hide();
		}
	})
}

export const qualificationStrings: string[] = [
        'own a PWA that is installable, contains all required manifest fields, and implements at least two desktop enhancements',
        'live in a country or region where the Windows program in Partner Center is offered.',
        'have a valid Microsoft Account to use to sign up for the Microsoft Store on Windows developer account ',
        'not have an existing Microsoft Store on Windows individual developer/publisher account',
        'use the Store Token to create a Microsoft Store on Windows developer account within 30 calendar days of Microsoft sending you the token, using the same Microsoft Account you used to sign in here',
        'plan to publish an app in the store this calendar year (prior to 12/31/2023 midnight Pacific Standard Time)'
      
];
