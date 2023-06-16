import { html } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { SlDetails } from "@shoelace-style/shoelace";

export function decideHeroSection(
  siteURL: string,
  tests: {
    testsInProgress: boolean;
    testsPassed: boolean;
    noManifest: boolean;
    dupeURL: boolean;
  },
  userAccount: { loggedIn: boolean; name: string },
  errorGettingToken: boolean,
  handleEnteredURL: () => unknown
) {
  // no site in query params
  if (!siteURL) {
    return html`
      <h1>Get a Free Windows Developer Account on the Microsoft Store</h1>
      <p>Check below to see if your PWA qualifies</p>
      <div class="input-area">
        <sl-input placeholder="Enter URL" class="url-input" required></sl-input>
        <sl-button
          type="button"
          class="primary"
          @click=${() => handleEnteredURL()}
          >Start</sl-button
        >
      </div>
    `;
  }

  // if site in query params and testing in progress
  if (siteURL && tests.testsInProgress) {
    return html`
      <h1>Validation in progress..</h1>
      <p>We are checking to see if this URL qualifies for a free token</p>
    `;
  }

  // if tests complete but its a dupe url
  if (!tests.testsInProgress && tests.dupeURL) {
    return html`
      <h1>Oops!</h1>
      <p>Something is wrong. Please use another URL and try again.</p>
    `;
  }

  // if tests complete and validations pass
  if (!tests.testsInProgress && tests.noManifest) {
    return html`
      <h1>Oops!</h1>
      <p>
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
          <h1>Oops!</h1>
          <p>
            URL already used in another account. Please use another URL and try
            again.
          </p>
        `;
      }
      return html`
        <h1>Congratulations ${userAccount.name}!</h1>
        <p>
          You have qualified for a free account on the Microsoft developer
          platform. Get your token code below.
        </p>
      `;
    }
    return html`
      <h1>Congratulations!</h1>
      <p>
        You have qualified for a free account on the Microsoft developer
        platform. Get your token code after signing in below.
      </p>
    `;
  }

  // if tests complete and validations fail
  if (!tests.testsInProgress && !tests.testsPassed) {
    return html`
      <h1>Almost there!</h1>
      <p>
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
    dupeURL: boolean;
  },
  appCard: {
    siteName: string;
    siteUrl: string;
    description: string;
    iconURL: string;
    iconAlt: string;
  },
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
	}
) {
  // no site in query params
  if (!siteURL) {
    return html``;
  }

  // if site in query params and testing in progress
  if (siteURL && tests.testsInProgress) {
    return html`
      <!-- Show card with skeleton -->
      <div id="app-info">
        <div id="logo-and-text">
          <sl-skeleton class="square" effect="sheen"></sl-skeleton>
          <div id="words">
            <sl-skeleton effect="sheen"></sl-skeleton>
            <sl-skeleton effect="sheen"></sl-skeleton>
            <sl-skeleton effect="sheen"></sl-skeleton>
            <sl-skeleton effect="sheen"></sl-skeleton>
          </div>
        </div>

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

  // if tests complete but its a dupe url
  if (!tests.testsInProgress && tests.dupeURL) {
    banner = html`
      <!-- error banner -->
      <div class="feedback-holder type-error">
        <img src="/assets/new/stop.svg" alt="invalid result icon" />
        <div class="error-info">
          <p class="error-title">URL already in use</p>
          <p class="error-desc">
            We noticed this PWA has already been linked to an account in the
            Microsoft store. Please check the URL you are using or try another.
          </p>
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
          <p>${appCard.description}</p>
        </div>
      </div>
      <div id="rings">
        <div class="card-holder">
          <sl-progress-ring
            class=${classMap(classMaps.installableClassMap)}
            value=${ratios.installableRatio}
          >
            ${tests.installablePassed
              ? html`<img class="macro" src="assets/new/macro_passed.svg" />`
              : html`<img class="macro" src="assets/new/macro_error.svg" />`}
          </sl-progress-ring>
          <p>Installable</p>
        </div>
        <div class="card-holder">
          <sl-progress-ring
            class=${classMap(classMaps.requiredClassMap)}
            value=${ratios.requiredRatio}
          >
            ${tests.requiredPassed
              ? html`<img class="macro" src="assets/new/macro_passed.svg" />`
              : html`<img class="macro" src="assets/new/macro_error.svg" />`}
          </sl-progress-ring>
          <p>Required Fields</p>
        </div>
        <div class="card-holder">
          <sl-progress-ring
            class=${classMap(classMaps.enhancementsClassMap)}
            value=${ratios.enhancementsRatio}
          >
            <img class="macro" src=${ratios.enhancementsIndicator} />
          </sl-progress-ring>
          <p>Enhancements</p>
        </div>
      </div>
    </div>
  `;
}


// Rotates the icon on each details drop down to 0 degrees
export function rotateZero(card: string, shadowRoot: Element["shadowRoot"], e?: Event){
	//recordPWABuilderProcessStep(card + "_details_expanded", AnalyticsBehavior.ProcessCheckpoint);
	e?.stopPropagation();
	let icon: HTMLImageElement = shadowRoot!.querySelector('img[data-card="' + card + '"]')!;

	if(icon){
		icon!.style.transform = "rotate(0deg)";
	}
}

// Rotates the icon on each details drop down to 90 degrees
export function rotateNinety(card: string, shadowRoot: Element["shadowRoot"], e?: Event){
	//recordPWABuilderProcessStep(card + "_details_closed", AnalyticsBehavior.ProcessCheckpoint);
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
  'Own a PWA that meets the technical requirements listed above',
  'You are legally residing in [what countries can we say?]',
  'Have a valid Microsoft Account to use to sign up for the Microsoft Store on Windows developer account',
  'Not have an existing Microsoft Store on Windows individual developer/publisher account',
  'Use the Store Token to create a Microsoft Store on Windows developer account within 30 calendar days of Microsoft sending you the token, using the same Microsoft Account you used to sign in here',
  'Plan to publish an app in the store this calendar year (prior to 12/31/2023 midnight Pacific Standard Time)',
];
