import { LitElement, css, html } from 'lit';
import { customElement, state, property, query } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import { classMap } from 'lit/directives/class-map.js';

import './screens/install-screen.js';
import './screens/splash-screen.js';
import './screens/name-screen.js';
import './screens/shortname-screen.js';
import './screens/themecolor-screen.js';
import './screens/shortcuts-screen.js';
import './screens/display-screen.js';
import './screens/categories-screen.js';
import './screens/sharetarget-screen.js';
import { Manifest } from '../../utils/interfaces';
import { 
  PREVIEW_STAGES,
  PreviewStage, 
  Platform, 
  ScreenDescriptions, 
  ScreenTitles 
} from '../../utils/interfaces.previewer';

@customElement('manifest-previewer')
export class ManifestPreviewer extends LitElement {
  static styles = css`
    .card {
      background: #FFF;
      box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
      border-radius: 6px;
      height: 792px;
      display: none;
      margin-left: 90px;
    }

    .title {
      position: absolute;
      left: calc(50% - 33px);
      top: 23px;
      margin: 0;
      width: 66px;
      font-weight: 700;
      font-size: 18px;
      line-height: 24px;
      color: var(--font-color);
      text-decoration: underline solid var(--secondary-font-color);
      text-underline-position: under;
      text-decoration-thickness: 2px;
    }

    .buttons-div {
      display: flex;
      justify-content: space-between;
      margin: 71px auto 0;
      width: 272px;
    }

    fast-button.platform-button {
      height: 35px;
      border-radius: 33px;
      font-size: 12.5751px;
      line-height: 19px;
      width: 80px;
      background: #FFF;
      box-shadow: 0px 3px 3.02588px rgba(0, 0, 0, 0.25);
      color: var(--font-color);
    }
    
    fast-button::part(control) {
      font-weight: 700;
    }

    .platform-button.selected {
      background: #292C3A;
      box-shadow: 0px 0.75647px 3.02588px rgba(0, 0, 0, 0.25);
      color: #FFF;
    }

    .name {
      background: rgba(194, 194, 194, 0.4);
      border-radius: 4px;
      height: 24px;
      font-weight: 700;
      font-size: 16px;
      line-height: 25px;
      text-align: center;
      color: #000;
      margin: 20px auto 0;
      width: fit-content;
      padding: 0 5px;
    }

    .preview-text {
      position: absolute;
      bottom: 25px;
      left: calc(50% - 55px);
      font-weight: 400;
      font-size: 10px;
      line-height: 16px;
      text-align: center;
      color: var(--secondary-font-color);
      width: 110px;
    }

    img.nav-arrow-right {
      position: absolute;
      width: 19px;
      height: 38px;
      top: 377px;
      right: 16px;
      cursor: pointer;
    }
    
    img.nav-arrow-left {
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
      line-height: 16px;
      text-align: center;
      color: var(--secondary-font-color);
      width: 230px;
      display: block;
    }

    /* The card is hidden for smaller screens */
    @media(min-width: 800px) {
      .card {
        display: block;
      }
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

  /**
   * The website's URL.
   */
  @property() private siteUrl = '';
  
  /**
   * The current preview screen.
   */
  @property() stage: PreviewStage = 'name';
  
  /**
   * The input web manifest.
   */
  @property({ 
    type: Object,
    converter: value => {
      if (!value) {
        return undefined;
      }
      
      return JSON.parse(value);
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
  @property() platform: Platform = 'windows';
  
  /**
   * The screen description texts.
   */
  @property({ type: Object }) descriptions = {} as ScreenDescriptions;
  
  /**
   * The titles of each preview screen.
   */
  @property({ type: Object }) titles = {} as ScreenTitles;
  
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
    // Set the icon URL.
    if (this.manifest.icons && this.manifest.icons.length > 0) {
      // Try to get the largest icon so that it looks good everywhere, or the first one by default
      let iconUrl = this.manifest.icons.find(icon => icon.sizes?.includes('512x512'))?.src;
      if (!iconUrl) {
        iconUrl = this.manifest.icons[0]?.src;
      }
      if (iconUrl) {
        const absoluteUrl = new URL(iconUrl, this.manifestUrl).href;
        this.iconUrl = `https://pwabuilder-safe-url.azurewebsites.net/api/getsafeurl?url=${absoluteUrl}`;
      }
    }

    // Set the site URL if needed (assuming it can be derived from the manifest's URL)
    if (!this.siteUrl) {
      this.siteUrl = this.manifestUrl.substring(0, this.manifestUrl.lastIndexOf('manifest.json'));
    }

    // Set default texts
    this.setDefaultDescriptions();
    this.setDefaultTitles();
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
        windows: this.descriptions.categories?.windows || "The Microsoft store uses the indicated categories as tags in the app's listing.",
        android: this.descriptions.categories?.android || "Google Play includes the categories specified in the manifest in the application's listing page.",
        iOS: this.descriptions.categories?.iOS || "On iOS, your application's categories are set from a predetermined set of options and enhance the discoverability of your app."
      },
      shareTarget: {
        windows: this.descriptions.shareTarget?.windows || 'This attribute allows your application to easily share and receive media content on Windows.',
        android: this.descriptions.shareTarget?.android || 'By using the share target attribute, you can quickly share and receive links and files like a native Android application.',
        iOS: this.descriptions.shareTarget?.iOS || 'By using the share target attribute, you can quickly share and receive links and files like a native iOS application. '
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
      display:  this.titles.display || 'The display attribute',
      categories: this.titles.categories || 'The categories attribute',
      shareTarget: this.titles.shareTarget || 'The share target attribute'
    }
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
  private handleNavigateRight() {
    const currentIdx = PREVIEW_STAGES.indexOf(this.stage);
    const nextIdx = (currentIdx + 1) % PREVIEW_STAGES.length;
    this.stage = PREVIEW_STAGES[nextIdx]!;
  }

  /**
   * Navigates to the previous preview screen.
   */
  private handleNavigateLeft() {
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

  private handleToggleEnlarge() {
    this.content.requestFullscreen();
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
          .themeColor=${this.manifest.theme_color}
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
          .themeColor=${this.manifest.theme_color}
          .backgroundColor=${this.manifest.background_color}
          .iconUrl=${this.iconUrl}
          .appName=${this.manifest.name}
          .siteUrl=${this.siteUrl}>
          </display-screen>
        `;
      case 'categories':
        return html`
          <categories-screen
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
      default: return null;
    }
  }

  render() {
    return html`
      <fast-card class="card">
        <h4 part="card-title" class="title">Preview</h4>
        <div part="platform-buttons" class="buttons-div">
          <fast-button 
          part="platform-button"
          class=${classMap({ 
            'platform-button': true, 
            selected: this.platform === 'windows' 
          })} 
          name="windows"
          @click=${this.handlePlatformChange}>
            Windows
          </fast-button>
          <fast-button 
          part="platform-button"
          class=${classMap({ 
            'platform-button': true, 
            selected: this.platform === 'android' 
          })} 
          name="android"
          @click=${this.handlePlatformChange}>
            Android
          </fast-button>
          <fast-button
          part="platform-button"
          class=${classMap({
            'platform-button': true,
            selected: this.platform === 'iOS'
          })}
          name="iOS"
          @click=${this.handlePlatformChange}>
            iOS
          </fast-button>
        </div>
        <div part="app-name" class="name">${this.manifest.name}</div>
        <p part="screen-title" class="screen-title">${this.titles[this.stage]}</p>
        <p part="screen-description" class="screen-info">
          ${this.descriptions[this.stage] ? this.descriptions[this.stage]![this.platform] : ''}
        </p>
        <div id="content">${this.screenContent()}</div>
        <img 
        part="nav-arrow"
        src="../../../../assets/previewer-images/nav-arrow.svg" 
        alt="Navigate right" 
        class="nav-arrow-right"
        @click=${this.handleNavigateRight} />
        <img 
        part="nav-arrow"
        src="../../../../assets/previewer-images/nav-arrow.svg" 
        alt="Navigate left" 
        class="nav-arrow-left"
        @click=${this.handleNavigateLeft} />
        <p 
        part="preview-text"
        class="preview-text" 
        style=${styleMap({ cursor: 'pointer' })} 
        @click=${this.handleToggleEnlarge}>
          Click to enlarge Preview
        </p>
      </fast-card>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'manifest-previewer': ManifestPreviewer;
  }
}
