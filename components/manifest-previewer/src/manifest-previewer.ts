import { LitElement, css, html } from 'lit';
import { customElement, state, property, query } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { getSuitableIcon } from './utils.js';

import './screens/install-screen.js';
import './screens/splash-screen.js';
import './screens/name-screen.js';
import './screens/shortname-screen.js';
import './screens/themecolor-screen.js';
import './screens/shortcuts-screen.js';
import './screens/display-screen.js';
import './screens/categories-screen.js';
import './screens/sharetarget-screen.js';
import {
  PreviewStage,
  PREVIEW_STAGES,
  Manifest,
  Platform,
  ScreenDescriptions,
  ScreenTitles
} from './models';

@customElement('manifest-previewer')
export class ManifestPreviewer extends LitElement {
  static styles = css`
    :host {
      font-family: var(--font-family, Arial);
      color: var(--font-color, #292C3A);
      --card-box-shadow: 0px 3px 5.41317px rgba(0, 0, 0, 0.25);
    }

    .card {
      background: #FFF;
      box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
      border-radius: 6px;
      height: 792px;
      position: relative;
      display: flex;
      flex-direction: column;
    }

    .title {
      margin: 23px auto 40px;
      font-weight: 700;
      font-size: 18px;
      width: fit-content;
      text-decoration: underline solid var(--secondary-font-color, #808080);
      text-underline-position: under;
      text-decoration-thickness: 2px;
    }

    .buttons-div {
      display: flex;
      justify-content: space-between;
      margin: 0 auto;
      width: 272px;
    }

    .platform-button {
      height: 35px;
      border-radius: 33px;
      font-size: 12.5751px;
      line-height: 19px;
      width: 80px;
      background: #FFF;
      box-shadow: 0px 3px 3.02588px rgba(0, 0, 0, 0.25);
      font-weight: 600;
      border: none;
      cursor: pointer;
    }

    button:focus-visible, .nav-arrow-left:focus-visible, .nav-arrow-right:focus-visible {
      outline: 2px solid #000;
      outline-offset: 3px;
    }

    .platform-button.selected {
      background: #292C3A;
      box-shadow: 0px 0.75647px 3.02588px rgba(0, 0, 0, 0.25);
      color: #FFF;
    }

    .name {
      background: rgba(194, 194, 194, 0.4);
      border-radius: 4px;
      font-weight: 700;
      font-size: 14px;
      text-align: center;
      color: #000;
      margin: 20px auto 0;
      width: fit-content;
      padding: 0 5px;
    }

    .preview-text {
      position: absolute;
      bottom: 10px;
      left: calc(50% - 55px);
      font-weight: 400;
      font-size: 10px;
      line-height: 16px;
      text-align: center;
      color: var(--secondary-font-color, #808080);
      width: 110px;
    }

    .preview-button {
      position: absolute;
      bottom: 15px;
      left: calc(50% - 75px);
      font-weight: 400;
      font-size: 10px;
      text-align: center;
      color: var(--secondary-font-color, #808080);
      width: 150px;
      background: none;
      border: none;
      cursor: pointer;
    }

    .nav-arrow-right {
      position: absolute;
      width: 19px;
      height: 38px;
      top: 377px;
      right: 16px;
      cursor: pointer;
    }

    .nav-arrow-left {
      position: absolute;
      width: 19px;
      height: 38px;
      top: 377px;
      left: 16px;
      transform: rotate(180deg);
      cursor: pointer;
    }

    .screen-title {
      margin: 10px auto;
      width: fit-content;
      font-weight: 600;
      font-size: 14px;
      text-align: center;
    }

    .screen-info {
      margin: 0 auto;
      font-weight: 400;
      font-size: 12px;
      line-height: 1.5;
      text-align: center;
      color: var(--secondary-font-color, #808080);
      width: 230px;
    }

    /* 800 designs */
    @media(min-width: 800px) and (max-width: 1024px) {
      .card {
        width: 354px;
      }
    }

    /* 1024 designs */
    @media(min-width: 1024px) and (max-width: 1366px) {
      .card {
        width: 366px;
      }
    }

    /* 1366 designs */
    @media(min-width: 1366px) {
      .card {
        width: 479.03px;
      }

      img.nav-arrow-right {
        right: 30px;
      }

      img.nav-arrow-left {
        left: 30px;
      }
    }
  `;

  // Putting this here so that we can use it as default enlarge callback
  private handleToggleEnlarge() {
    this.content.requestFullscreen();
  }

  /**
   * The website's URL.
   */
  @property() private siteUrl = '';

  /**
   * The current preview screen.
   */
  @property() stage: PreviewStage = 'themeColor';

  /**
   * The input web manifest.
   */
  @property({
    type: Object,
    converter: value => {
      if (!value) {
        return { } as Manifest;
      }

      if (typeof value === "string") {
        return JSON.parse(value);
      }

      return value;
    }
  })
  manifest = {} as Manifest;

  /**
   * The url where the manifest resides.
   */
  @property() manifestUrl = '';

  /**
   * The currently selected platform.
   */
  @property() platform: Platform = 'android';

  /**
   * The screen description texts.
   */
  @property({ type: Object }) descriptions = {} as ScreenDescriptions;

  /**
   * The titles of each preview screen.
   */
  @property({ type: Object }) titles = {} as ScreenTitles;

  /**
   * Text of the enlarge screen feature.
   */
  @property() enlargeText = 'Click to enlarge Preview';

  /**
   * Callback fired when requesting to enlarge the preview.
   */
  @property() onEnlarge = this.handleToggleEnlarge;

  /**
   * The component's main title.
   */
  @property() cardTitle = 'Preview';

  /**
   * Platforms that shouldn't be previewed.
   */
  @property() disabledPlatforms = '';

  /**
   * The URL used for icon previews.
   */
  @state() private iconUrl = '';

  /**
   * If true, the preview content is displayed in full screen.
   */
  @state() isInFullScreen = false;

  /**
   * The content to display when in full screen.
   */
  @query('#content') content!: Element;

  firstUpdated() {
    this.updateIconUrl();

    // Set the site URL if not defined (assuming it can be derived from the manifest's URL)
    if (!this.siteUrl) {
      this.siteUrl = this.manifestUrl.substring(0, this.manifestUrl.lastIndexOf('manifest.json'));
    }

    // Set default values
    this.setDefaultDescriptions();
    this.setDefaultTitles();
  }

  update(changedProperties: Map<string | number | symbol, unknown>) {
    // If the manifest changed, update the icon URL
    if (changedProperties.get("manifest")) {
      this.updateIconUrl();
    }

    super.update(changedProperties);
  }

  private updateIconUrl() {
    const suitableIcon = getSuitableIcon(this.manifest?.icons || []);
    if (suitableIcon) {
      const absoluteUrl = new URL(suitableIcon.src, this.manifestUrl).href;
      this.iconUrl = `https://pwabuilder-safe-url.azurewebsites.net/api/getsafeurl?url=${encodeURIComponent(absoluteUrl)}`;
    } else {
      this.iconUrl = '';
    }
  }

  private setDefaultDescriptions() {
    this.descriptions = {
      install: {
        windows: this.descriptions.install?.windows || "Windows includes the application's icon, name, and website URL in its installation dialog.",
        android: this.descriptions.install?.android || 'When installing a PWA on Android, the description, name, icon and screenshots are used for giving a preview of the application.',
        iOS: this.descriptions.install?.iOS || "iOS uses the application's icon, name, and website URL in its installation screen."
      },
      splashScreen: {
        windows: this.descriptions.splashScreen?.windows || 'Splash screens are used to provide a smooth transition between the loading state and the initial launch of the application.',
        android: this.descriptions.splashScreen?.android || 'When launching the PWA, Android uses the background color, theme color, name and icon for displaying the splash screen.',
        iOS: this.descriptions.splashScreen?.iOS || 'When launching the PWA, iOS uses the background color, name and icon for displaying the splash screen while the content loads.'
      },
      name: {
        windows: this.descriptions.name?.windows || "The name of the web application is displayed on Window's start menu, application preferences, title bar, etc.",
        android: this.descriptions.name?.android || 'The name of the web application will be included in the app info screen on Android.',
        iOS: this.descriptions.name?.iOS || 'On iOS, the name of the web application will be used on settings.'
      },
      shortName: {
        windows: this.descriptions.shortName?.windows || 'Windows uses the short name as a fallback when the manifest does not specify a value for the name attribute.',
        android: this.descriptions.shortName?.android || "On Android, the application's short name is used in the home screen as a label for the icon.",
        iOS: this.descriptions.shortName?.iOS || "On iOS, the application's short name is used in the home screen as a label for the icon."
      },
      themeColor: {
        windows: this.descriptions.themeColor?.windows || "The theme color defines the default color theme for the application, and is used for the PWA's title bar.",
        android: this.descriptions.themeColor?.android || 'The theme color defines the default color theme for the application, and affects how the site is displayed.',
        iOS: this.descriptions.themeColor?.iOS || 'The theme color defines the default color theme for the PWA, and defines the background color of the status bar when using the application.'
      },
      shortcuts: {
        windows: this.descriptions.shortcuts?.windows || "This attribute (A.K.A. jump list) assembles a context menu that is shows when a user right-clicks on the app's icon on the taskbar.",
        android: this.descriptions.shortcuts?.android || "This attribute (A.K.A. jump list) assembles a context menu that is shows when a user long-presses the app's icon on the home screen.",
        iOS: this.descriptions.shortcuts?.iOS || "This attribute (A.K.A. jump list) defines a list of shortcuts/links to key tasks or pages within a web app, assembling a context menu when a user interacts with the app's icon."
      },
      display: {
        windows: this.descriptions.display?.windows || "The display mode changes how much of the browser's UI is shown to the user. It can range from browser (the full browser window is shown) to fullscreen (the app is full-screened).",
        android: this.descriptions.display?.android || "The display mode changes how much of the browser's UI (like the status bar and navigation buttons) is shown to the user.",
        iOS: this.descriptions.display?.iOS || "The display mode changes how much of the browser's UI is shown to the user. It can range from browser (the full browser window is shown) to fullscreen (the app is full-screened)."
      },
      categories: {
        windows: this.descriptions.categories?.windows || "The Microsoft Store uses the indicated categories as tags in the app's product description page.",
        android: this.descriptions.categories?.android || "Google Play includes the categories specified in the manifest in the app's product description page.",
        iOS: this.descriptions.categories?.iOS || "On iOS, your application's categories are set from a predetermined set of options and enhance the discoverability of your app."
      },
      shareTarget: {
        windows: this.descriptions.shareTarget?.windows || 'As a share target, your app can receive text, links, and files from other Windows apps.',
        android: this.descriptions.shareTarget?.android || 'As a share target, your app can receive text, links, and files from other Android apps.',
        iOS: this.descriptions.shareTarget?.iOS || 'By using the share target attribute, you can quickly share and receive links and files like a native iOS application. '
      },
      description: {
        windows: this.descriptions.description?.windows || "The Microsoft Store shows the app's description in the app's product description page.",
        android: this.descriptions.description?.android || "Google Play shows the app's description in the app's product description page.",
        iOS: this.descriptions.description?.iOS || "The iOS App Store shows your app's description in the app's product description page."
      }
    }
  }

  private setDefaultTitles() {
    this.titles = {
      install: this.titles.install || 'Installation dialog',
      splashScreen: this.titles.splashScreen || 'Splash screen',
      name: this.titles.name || 'The name attribute',
      shortName: this.titles.shortName || 'The short name attribute',
      themeColor: this.titles.themeColor || 'The theme color attribute',
      shortcuts: this.titles.shortcuts || 'The shortcuts attribute',
      display: this.titles.display || 'The display attribute',
      categories: this.titles.categories || 'The categories attribute',
      shareTarget: this.titles.shareTarget || 'The share target attribute',
      description: this.titles.description || 'The description attribute'
    };
  }

  /**
   * Changes the platform currently being previewed.
   */
  private handlePlatformChange(event: Event) {
    const platform = (event.target as HTMLButtonElement).name;
    this.platform = platform as Platform;
  }

  /**
   * Navigates to the next preview screen.
   */
  private handleNavigateRight(event: Event) {
    // If using the keyboard, make sure event was triggered by space or enter
    if (event instanceof KeyboardEvent && event.key !== ' ' && event.key !== 'Enter') {
      return;
    }

    const currentIdx = PREVIEW_STAGES.indexOf(this.stage);
    const nextIdx = (currentIdx + 1) % PREVIEW_STAGES.length;
    this.stage = PREVIEW_STAGES[nextIdx]!;
  }

  /**
   * Navigates to the previous preview screen.
   */
  private handleNavigateLeft(event: Event) {
    // If using the keyboard, make sure event was triggered by space or enter
    if (event instanceof KeyboardEvent && event.key !== ' ' && event.key !== 'Enter') {
      return;
    }

    const currentIdx = PREVIEW_STAGES.indexOf(this.stage);
    const nextIdx = (currentIdx + PREVIEW_STAGES.length - 1) % PREVIEW_STAGES.length;
    this.stage = PREVIEW_STAGES[nextIdx]!;
  }

  // Let the rest of the application know when the screen changes.
  updated(changedProps: Map<string, any>) {
    if (changedProps.has('stage')) {
      this.dispatchEvent(new CustomEvent('previewscreenchange', {
        bubbles: true,
        composed: true,
        detail: { screen: this.stage }
      }));
    }
  }

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener('fullscreenchange', this.handleFullScreenChange);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('fullscreenchange', this.handleFullScreenChange);
  }

  private handleFullScreenChange = () => {
    this.isInFullScreen = Boolean(document.fullscreenElement);
  }

  private screenContent() {
    switch (this.stage) {
      case 'install':
        return html`
          <install-screen
          .isInFullScreen=${this.isInFullScreen}
          .platform=${this.platform}
          .iconUrl=${this.iconUrl}
          .siteUrl=${this.siteUrl}
          .appName=${this.manifest.name}
          .appShortName=${this.manifest.short_name}
          .description=${this.manifest.description}
          .screenshots=${this.manifest.screenshots}
          .manifestUrl=${this.manifestUrl}>
          </install-screen>
        `;
      case 'splashScreen':
        return html`
          <splash-screen
          .isInFullScreen=${this.isInFullScreen}
          .platform=${this.platform}
          .iconUrl=${this.iconUrl}
          .backgroundColor=${this.manifest.background_color}
          .themeColor=${this.manifest.theme_color}
          .appName=${this.manifest.name}>
          </splash-screen>
        `;
      case 'name':
        return html`
          <name-screen
          .isInFullScreen=${this.isInFullScreen}
          .platform=${this.platform}
          .appName=${this.manifest.name}
          .iconUrl=${this.iconUrl}>
          </name-screen>
        `;
      case 'shortName':
        return html`
          <shortname-screen
          .isInFullScreen=${this.isInFullScreen}
          .platform=${this.platform}
          .shortName=${this.manifest.short_name}
          .iconUrl=${this.iconUrl}>
          </shortname-screen>
        `;
      case 'themeColor':
        return html`
          <themecolor-screen
          .isInFullScreen=${this.isInFullScreen}
          .platform=${this.platform}
          .themeColor=${this.manifest.theme_color || ''}
          .appName=${this.manifest.name}
          .iconUrl=${this.iconUrl}>
          </themecolor-screen>
        `;
      case 'shortcuts':
        return html`
          <shortcuts-screen
          .isInFullScreen=${this.isInFullScreen}
          .platform=${this.platform}
          .shortcuts=${this.manifest.shortcuts}
          .iconUrl=${this.iconUrl}
          .manifestUrl=${this.manifestUrl}>
          </shortcuts-screen>
        `;
      case 'display':
        return html`
          <display-screen
          .isInFullScreen=${this.isInFullScreen}
          .platform=${this.platform}
          .display=${this.manifest.display || 'standalone'}
          .themeColor=${this.manifest.theme_color || ''}
          .backgroundColor=${this.manifest.background_color || ''}
          .iconUrl=${this.iconUrl}
          .appName=${this.manifest.name}
          .siteUrl=${this.siteUrl}>
          </display-screen>
        `;
      case 'categories':
        return html`
          <categories-screen
          highlight='categories'
          .isInFullScreen=${this.isInFullScreen}
          .platform=${this.platform}
          .categories=${this.manifest.categories}
          .appName=${this.manifest.name}
          .iconUrl=${this.iconUrl}
          .description=${this.manifest.description}
          .screenshots=${this.manifest.screenshots}
          .manifestUrl=${this.manifestUrl}>
          </categories-screen>
        `;
      case 'shareTarget':
        return html`
          <share-target
          .isInFullScreen=${this.isInFullScreen}
          .platform=${this.platform}
          .iconUrl=${this.iconUrl}
          .appName=${this.manifest.name}
          .shortName=${this.manifest.short_name}
          .siteUrl=${this.siteUrl}>
          </share-target>
        `;
      case 'description':
        return html`
          <categories-screen highlight='description' .isInFullScreen=${this.isInFullScreen} .platform=${this.platform}
            .categories=${this.manifest.categories} .appName=${this.manifest.name} .iconUrl=${this.iconUrl}
            .description=${this.manifest.description} .screenshots=${this.manifest.screenshots} .manifestUrl=${this.manifestUrl}>
          </categories-screen>
        `;
      default: return null;
    }
  }

  render() {
    if (!this.manifest) {
      return html``;
    }

    return html`
      <div part="card" class="card">
        <h1 part="card-title" class="title">${this.cardTitle}</h1>
        <div part="platform-buttons" class="buttons-div">
          ${this.disabledPlatforms.includes('windows') ?
            null :
            html`
            <button
            part="platform-button"
            aria-pressed=${this.platform === 'windows'}
            class=${classMap({
              'platform-button': true,
              selected: this.platform === 'windows'
            })}
            name="windows"
            @click=${this.handlePlatformChange}>
              Windows
            </button>`}
          ${this.disabledPlatforms.includes('android') ?
            null :
            html`
            <button
            part="platform-button"
            aria-pressed=${this.platform === 'android'}
            class=${classMap({
              'platform-button': true,
              selected: this.platform === 'android'
            })}
            name="android"
            @click=${this.handlePlatformChange}>
              Android
            </button>`}
          ${this.disabledPlatforms.includes('iOS') ?
            null :
            html`
            <button
            part="platform-button"
            aria-pressed=${this.platform === 'iOS'}
            class=${classMap({
              'platform-button': true,
              selected: this.platform === 'iOS'
            })}
            name="iOS"
            @click=${this.handlePlatformChange}>
              iOS
            </button>`}
        </div>
        <div part="app-name" class="name">${this.manifest.name || 'PWA App'}</div>
        <p aria-live="polite" part="screen-title" class="screen-title">${this.titles[this.stage]}</p>
        <p part="screen-description" class="screen-info">
          ${this.descriptions[this.stage] ? this.descriptions[this.stage]![this.platform] : ''}
        </p>
        <div id="content">${this.screenContent()}</div>
        <img
        part="nav-arrow"
        class="nav-arrow-right"
        role="button"
        tabindex="0"
        src="../assets/images/nav-arrow.svg"
        alt="Navigate right"
        @click=${this.handleNavigateRight}
        @keydown=${this.handleNavigateRight} />
        <img
        part="nav-arrow"
        class="nav-arrow-left"
        role="button"
        tabindex="0"
        src="../assets/images/nav-arrow.svg"
        alt="Navigate left"
        @click=${this.handleNavigateLeft}
        @keydown=${this.handleNavigateLeft} />
        ${this.enlargeText ?
        html`
        <button
        part="enlarge-toggle"
        class="preview-button"
        @click=${this.onEnlarge}>
          ${this.enlargeText}
        </button>` : null}
      </div>
    `;
  }
}

// declare global {
//   interface HTMLElementTagNameMap {
//     'manifest-previewer': ManifestPreviewer
//   }
// }
