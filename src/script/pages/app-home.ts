import { LitElement, css, html, customElement } from 'lit-element';

import '../components/content-header';
import '../components/resource-hub';

// For more info on the @pwabuilder/pwainstall component click here https://github.com/pwa-builder/pwa-install
import '@pwabuilder/pwainstall';

@customElement('app-home')
export class AppHome extends LitElement {

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

      #input-form fast-button {
        flex: 0.2;
        box-shadow: var(--button-shadow);
        border-radius: var(--button-radius);
      }

      #input-form fast-button::part(control) {
        font-size: 16px;
        font-weight: var(--font-bold);
      }

      #input-form fast-text-field::part(root) {
        border: 1.93407px solid #E5E5E5;
        border-radius: var(--input-radius);
      }

      @media(max-width: 542px) {
        content-header::part(main-container) {
          padding-top: initial;
        }
      }
    `;
  }

  constructor() {
    super();
  }

  async firstUpdated() {
    // this method is a lifecycle even in lit-element
    // for more info check out the lit-element docs https://lit-element.polymer-project.org/guide/lifecycle
    console.log('This is your home page');
  }

  render() {
    return html`
      <content-header>
        <h2 slot="hero-container">Transform your website to an app at lightning speed.</h2>
        <p id="hero-p" slot="hero-container">Ready to build your PWA? Tap "Build My PWA" to package your PWA for the app stores or tap "Feature Store".</p>

        <ul slot="grid-container">
          <div class="intro-grid-item">
            <h3>Test</h3>

            <p>Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut.</p>
          </div>

          <div class="intro-grid-item">
            <h3>Manage</h3>

            <p>Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut.</p>
          </div>

          <div class="intro-grid-item">
            <h3>Package</h3>

            <p>Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut.</p>
          </div>

          <div class="intro-grid-item">
            <h3>Explore</h3>

            <p>Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut.</p>
          </div>
        </ul>

        <form id="input-form" slot="input-container">
          <fast-text-field slot="input-container" type="text" placeholder="Enter the URL to your site to start building your PWA"></fast-text-field>
          <fast-button color="primary">Start</fast-button>
        </form>
      </content-header>

      <resource-hub page="home" all>
        <h2 slot="header">PWABuilder Resource Hub</h2>
        <p slot="description">Ready to build your PWA? Tap "Build My PWA" to package your PWA for the app stores or tap "Feature Store" to check out the latest web components from the PWABuilder team to improve your PWA even further!</p>
      </resource-hub>
    `;
  }
}
