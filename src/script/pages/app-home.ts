import {
  LitElement,
  css,
  html,
  customElement,
  internalProperty,
} from 'lit-element';

import {
  smallBreakPoint,
  mediumBreakPoint,
  largeBreakPoint,
  xxLargeBreakPoint,
} from '../utils/breakpoints';
import { fetchManifest } from '../services/manifest';

import '../components/content-header';
import '../components/resource-hub';
import '../components/loading-button';
import '../components/app-modal';

// For more info on the @pwabuilder/pwainstall component click here https://github.com/pwa-builder/pwa-install
import '@pwabuilder/pwainstall';
import { Router } from '@vaadin/router';

@customElement('app-home')
export class AppHome extends LitElement {
  @internalProperty() siteURL: string | null = null;
  @internalProperty() gettingManifest: boolean = false;

  static get styles() {
    return css`
      content-header::part(main-container) {
        display: flex;
        justify-content: center;
        padding-top: 5.2em;
      }

      h2 {
        font-size: 38.9187px;
        line-height: 46px;
        letter-spacing: -0.015em;
        max-width: 526px;
      }

      #hero-p {
        font-size: 16px;
        line-height: 24px;
        letter-spacing: -0.015em;
        color: var(--secondary-font-color);
        max-width: 406px;
      }

      ul {
        padding: 0;
        margin: 0;
        display: grid;
        grid-template-columns: auto auto;
      }

      .intro-grid-item {
        max-width: 200px;
      }

      .intro-grid-item h3 {
        margin-bottom: 5px;
      }

      .intro-grid-item p {
        margin-top: 0;
        color: var(--secondary-font-color);
      }

      #input-form {
        display: flex;
        margin-top: 1em;
      }

      #input-form fast-text-field {
        flex: 0.8;
        margin-right: 10px;
      }

      #input-form loading-button {
        flex: 0.21;
      }

      #input-form loading-button::part(underlying-button) {
        display: flex;

        box-shadow: var(--button-shadow);
        border-radius: var(--button-radius);
        font-size: var(--desktop-button-font-size);
        font-weight: var(--font-bold);
      }

      #input-form fast-text-field::part(root) {
        border: 1.93407px solid #e5e5e5;
        border-radius: var(--input-radius);
      }

      #input-form fast-text-field::part(control) {
        color: var(--font-color);
      }

      ${smallBreakPoint(css`
        content-header::part(main-container) {
          padding-top: initial;
        }

        content-header::part(grid-container) {
          display: none;
        }

        h2 {
          font-size: 32px;
          line-height: 34px;
          margin-top: 0;
        }

        #hero-p {
          line-height: 22px;
        }

        #input-form {
          flex-direction: column;
          width: 100%;
          align-items: center;
        }

        #input-form fast-text-field {
          width: 100%;
          margin-right: 0;
        }

        #input-form fast-text-field::part(root) {
          height: 64px;
        }

        #input-form fast-text-field::part(control) {
          font-size: 22px;
        }

        #input-form loading-button {
          margin-top: 54px;
        }

        #input-form loading-button::part(underlying-button) {
          display: flex;

          box-shadow: var(--button-shadow);
          border-radius: var(--button-radius);
          font-size: var(--desktop-button-font-size);
          font-weight: var(--font-bold);
        }
      `)}

      ${mediumBreakPoint(css`
        content-header::part(main-container) {
          padding-top: initial;
        }

        content-header::part(grid-container) {
          display: none;
        }

        h2 {
          font-size: 32px;
          line-height: 34px;
          margin-top: 0;
        }

        #hero-p {
          line-height: 22px;
          text-align: center;
          max-width: initial;
        }

        #input-form {
          flex-direction: column;
          width: 100%;
          align-items: center;
        }

        #input-form fast-text-field {
          width: 100%;
          margin-right: 0;
        }

        #input-form fast-text-field::part(root) {
          height: 64px;
        }

        #input-form fast-text-field::part(control) {
          font-size: 22px;
        }

        #input-form loading-button {
          width: 216px;
          margin-top: 44px;
          border-radius: var(--mobile-button-radius);
          height: var(--mobile-button-height);
        }
      `)}

      ${largeBreakPoint(css`
        content-header::part(main-container) {
          padding-left: 16px;
          padding-top: 0%;
        }
      `)}

      ${xxLargeBreakPoint(css`
        .intro-grid-item {
          max-width: 280px;
        }

        #input-form {
          width: 32em;
        }

        h2 {
          max-width: 600px;
        }
      `)}
    `;
  }

  constructor() {
    super();
  }

  handleURL(inputEvent: InputEvent) {
    if (inputEvent) {
      this.siteURL = (inputEvent.target as any).value;
    }
  }

  async start(inputEvent: InputEvent) {
    inputEvent.preventDefault();

    if (this.siteURL) {
      this.gettingManifest = true;

      try {
        const data = await fetchManifest(this.siteURL);
        
        if (data) {
          Router.go(`/about?site=${this.siteURL}`);
        }
      } catch (err) {
        console.error(err);
      }

      this.gettingManifest = false;
    }
  }

  render() {
    return html`
      <content-header>
        <h2 slot="hero-container">
          Transform your website to an app at lightning speed.
        </h2>
        <p id="hero-p" slot="hero-container">
          Ready to build your PWA? Tap "Build My PWA" to package your PWA for
          the app stores or tap "Feature Store".
        </p>

        <ul slot="grid-container">
          <div class="intro-grid-item">
            <h3>Test</h3>

            <p>
              Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit
              aut.
            </p>
          </div>

          <div class="intro-grid-item">
            <h3>Manage</h3>

            <p>
              Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit
              aut.
            </p>
          </div>

          <div class="intro-grid-item">
            <h3>Package</h3>

            <p>
              Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit
              aut.
            </p>
          </div>

          <div class="intro-grid-item">
            <h3>Explore</h3>

            <p>
              Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit
              aut.
            </p>
          </div>
        </ul>

        <form
          id="input-form"
          slot="input-container"
          @submit="${(e: InputEvent) => this.start(e)}"
        >
          <fast-text-field
            slot="input-container"
            type="text"
            placeholder="Enter a URL"
            @change="${(e: InputEvent) => this.handleURL(e)}"
          ></fast-text-field>
          <loading-button
            ?loading="${this.gettingManifest}"
            type="submit"
            @click="${(e: InputEvent) => this.start(e)}"
            >Start</loading-button
          >
        </form>
      </content-header>

      <app-modal
        title="Modal Title"
        body="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Urna, sit scelerisque vestibulum magnis. Auctor dolor, tincidunt enim."
        ?open="${true}"
      >
        <div slot="modal-actions">
          <fast-button>Button</fast-button>
        </div>
      </app-modal>

      <resource-hub page="home" all>
        <h2 slot="header">PWABuilder Resource Hub</h2>
        <p slot="description">
          Ready to build your PWA? Tap "Build My PWA" to package your PWA for
          the app stores or tap "Feature Store" to check out the latest web
          components from the PWABuilder team to improve your PWA even further!
        </p>
      </resource-hub>
    `;
  }
}
