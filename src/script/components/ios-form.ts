import { LitElement, css, html } from 'lit';

import { customElement, property, state } from 'lit/decorators.js';

import { Manifest } from '../utils/interfaces';
import { getManifest } from '../services/manifest';

//@ts-ignore
import style from '../../../styles/form-styles.css';
//@ts-ignore
import ModalStyles from '../../../styles/modal-styles.css';

import { tooltip, styles as ToolTipStyles } from '../components/tooltip';
import { createIOSPackageOptionsFromManifest } from '../services/publish/ios-publish';
import { capturePageAction } from '../utils/analytics';

/**
 * 
App name - required (defaults to manifest name)
App URL - required (defaults to absolute URL of manifest's URL being base URL part and start_url being the relative URL part)
App image URL - required (defaults to 512x512 or larger PNG image from manifest)
Splash color - optional (defaults to manifest background_color)
Progress bar color - optional (defaults to manifest theme_color)
Status bar color - optional (defaults to manifest background_color)
Permitted URLs - optional. Allow user to specify one or more URLs (e.g. for 3rd party authentication, etc.) which the app can navigate to outside of the PWA scope. This is needed for things like "Sign in with Google". Defaults to empty string.

 */

@customElement('ios-form')
export class iosForm extends LitElement {

  @property({ type: Boolean }) generating: boolean = false;

  @state() default_options: any | undefined;

  form: HTMLFormElement | undefined;
  currentManifest: Manifest | undefined;

  static get styles() {
    return [style, ModalStyles, ToolTipStyles, css``];
  }

  constructor() {
    super();
  }

  async firstUpdated() {
    const form = this.shadowRoot?.querySelector(
      '#ios-options-form'
    ) as HTMLFormElement;

    if (form) {
      this.form = form;
    }

    this.currentManifest = await getManifest();

    this.default_options = await createIOSPackageOptionsFromManifest();
  }

  initGenerate() {
    this.dispatchEvent(
      new CustomEvent('init-ios-gen', {
        detail: {
          form: this.form,
        },
        composed: true,
        bubbles: true,
      })
    );

    capturePageAction({
      pageName: 'ios-form-used',
      uri: `${location.pathname}`,
      pageHeight: window.innerHeight
    });
  }

  render() {
    return html`
      <form id="ios-options-form" slot="modal-form" style="width: 100%">
        <div id="form-layout">
          <div class="basic-settings">
            <div class="form-group">
              <label for="iosPackageIdInput">
                <a
                  target="_blank"
                  href="https://github.com/pwa-builder/pwabuilder-ios-chromium-docs/blob/master/find-publisher.md"
                >
                  App Name
                  <i
                    class="fas fa-info-circle"
                    title="The name of your app."
                    aria-label="The name of your app."
                    role="definition"
                  ></i>
                </a>

                ${tooltip(
                  'ios-package-id',
                  'The name of your App',
                )}
              </label>
              <fast-text-field
                id="iosAppNameInput"
                class="form-control"
                placeholder="Contoso App"
                type="text"
                name="appName"
                required
              ></fast-text-field>
            </div>

            <div class="form-group">
              <label for="iosDisplayNameInput">
                <a
                  target="_blank"
                  href="https://github.com/pwa-builder/pwabuilder-ios-chromium-docs/blob/master/find-publisher.md"
                >
                  App URL
                  <i
                    class="fas fa-info-circle"
                    title="The URL to your App."
                    aria-label="The URL to your App."
                    role="definition"
                  ></i>
                </a>

                ${tooltip(
                  'ios-app-url',
                  'The URL to your App'
                )}
              </label>
              <fast-text-field
                type="text"
                class="form-control"
                for="iosAppURLInput"
                required
                placeholder="/"
                name="appURL"
              ></fast-text-field>
            </div>

            <div class="form-group">
              <label for="iosPublisherIdInput">
                <a
                  target="_blank"
                  href="https://github.com/pwa-builder/pwabuilder-ios-chromium-docs/blob/master/find-publisher.md"
                >
                  App Icon URL
                  <i
                    class="fas fa-info-circle"
                    title="The URL to the Icon of your app (defaults to 512x512 or larger PNG image from manifest)"
                    aria-label="The URL to the Icon of your app (defaults to 512x512 or larger PNG image from manifest)"
                    role="definition"
                  ></i>
                </a>

                ${tooltip(
                  'ios-publisher-id',
                  'The URL to the Icon of your app (defaults to 512x512 or larger PNG image from manifest)'
                )}
              </label>
              <fast-text-field
                type="text"
                class="form-control"
                id="iosPublisherIdInput"
                required
                placeholder="/"
                name="publisherId"
              ></fast-text-field>
            </div>

            <div class="form-group">
              <label for="iosPublisherIdInput">
                <a
                  target="_blank"
                  href="https://github.com/pwa-builder/pwabuilder-ios-chromium-docs/blob/master/find-publisher.md"
                >
                  Splash Screen Color
                  <i
                    class="fas fa-info-circle"
                    title="The color of the splash screen for your app (defaults to the background_color from the manifest)"
                    aria-label="The color of the splash screen for your app (defaults to the background_color from the manifest)"
                    role="definition"
                  ></i>
                </a>

                ${tooltip(
                  'ios-publisher-id',
                  'The color of the splash screen for your app (defaults to the background_color from the manifest)'
                )}
              </label>
              <fast-text-field
                type="text"
                class="form-control"
                id="iosSplashScreenInput"
                required
                placeholder="/"
                name="splashScreenColor"
              ></fast-text-field>
            </div>

            <div class="form-group">
              <label for="iosPublisherIdInput">
                <a
                  target="_blank"
                  href="https://github.com/pwa-builder/pwabuilder-ios-chromium-docs/blob/master/find-publisher.md"
                >
                  Status Bar Color
                  <i
                    class="fas fa-info-circle"
                    title="The color of the status bar for your app (defaults to the background_color from the manifest)"
                    aria-label="The color of the status bar for your app (defaults to the background_color from the manifest)"
                    role="definition"
                  ></i>
                </a>

                ${tooltip(
                  'ios-publisher-id',
                  'The color of the status bar for your app (defaults to the background_color from the manifest)'
                )}
              </label>
              <fast-text-field
                type="text"
                class="form-control"
                id="iosStatusBarColorInput"
                required
                placeholder="/"
                name="statusBarColor"
              ></fast-text-field>
            </div>

          </div>
        </div>
      </form>
    `;
  }
}
