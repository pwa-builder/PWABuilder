import { LitElement, css, html, customElement } from 'lit-element';

import '../components/content-header';
import '../components/resource-hub';

// For more info on the @pwabuilder/pwainstall component click here https://github.com/pwa-builder/pwa-install
import '@pwabuilder/pwainstall';

@customElement('app-home')
export class AppHome extends LitElement {

  static get styles() {
    return css`
      content-header::part(mainContainer) {
        display: flex;
        justify-content: center;
        padding-left: 2em;
        padding-right: 2em;
        padding-top: 5.2em;
      }

      h2 {
        font-size: 38.9187px;
        line-height: 46px;
        letter-spacing: -0.015em;
        max-width: 481px;
      }

      #heroP {
        font-size: 16px;
        line-height: 24px;
        letter-spacing: -0.015em;
        color: #A6A4A4;
        max-width: 406px;
      }

      ul {
        padding: 0;
        margin: 0;
        display: grid;
        grid-template-columns: auto auto;
      }

      .introGridItem {
        max-width: 200px;
      }

      .introGridItem h3 {
        margin-bottom: 5px;
      }

      .introGridItem p {
        margin-top: 0;
        color: #A6A4A4;
      }

      #inputForm {
        display: flex;
      }

      #inputForm fast-text-field {
        flex: 0.8;
        margin-right: 10px;
      }

      #inputForm fast-button {
        flex: 0.2;
      }

      #inputForm fast-text-field::part(root) {
        border: 1.93407px solid #E5E5E5;
        border-radius: 3px;
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
        <h2 slot="heroContainer">Transform your website to an app at lightning speed.</h2>
        <p id="heroP" slot="heroContainer">Ready to build your PWA? Tap "Build My PWA" to package your PWA for the app stores or tap "Feature Store".</p>

        <ul slot="gridContainer">
          <div class="introGridItem">
            <h3>Test</h3>

            <p>Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut.</p>
          </div>

          <div class="introGridItem">
            <h3>Manage</h3>

            <p>Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut.</p>
          </div>

          <div class="introGridItem">
            <h3>Package</h3>

            <p>Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut.</p>
          </div>

          <div class="introGridItem">
            <h3>Explore</h3>

            <p>Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut.</p>
          </div>
        </ul>

        <form id="inputForm" slot="inputContainer">
          <fast-text-field slot="inputContainer" type="text" placeholder="Enter the URL to your site to start building your PWA"></fast-text-field>
          <fast-button>Start</fast-button>
        </form>
      </content-header>

      <resource-hub></resource-hub>
    `;
  }
}
