import { css, customElement, html, LitElement } from 'lit-element';
import '../components/app-header';
import '../components/app-sidebar';
import { testManifest } from '../services/tests/manifest';
import { testServiceWorker } from '../services/tests/service-worker';
@customElement('app-publish')
export class AppPublish extends LitElement {
  constructor() {
    super();
  }

  async firstUpdated() {
    const search = new URLSearchParams(location.search);
    const site = search.get('site');

    if (site) {
      const manifestTestresults = await testManifest(site);
      console.log('manifest test results', manifestTestresults);

      const swTestResults = await testServiceWorker(site);
      console.log('sw test results', swTestResults);
    }
  }

  static get styles() {
    return css`
      content-header::part(main-container) {
        display: flex;
        justify-content: center;
        padding-top: 5.2em;
      }

      .header {
        padding: 1rem 3rem;
      }

      .header p {
        max-width: min(100%, 600px);
      }

      .main-container {
        width: 100%;
        display: flex;
        flex-direction: column;
        justify-items: center;
        align-items: center;
      }

      .container {
        width: min(100%, 1440px);
        padding: 0 2rem;
      }

      .container p {
        max-width: min(100%, 80%);
        color: #808080;
      }

      .content,
      .content-card {
        margin: 2rem;
        border-bottom: 0.67681px solid #e5e5e5;
      }

      .content-card {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .action-buttons {
        display: flex;
        justify-content: center;
        align-items: center;
      }

      .action-buttons > app-button {
        margin: 1rem;
      }
    `;
  }

  renderContentCards() {
    return platforms.map(
      platform =>
        html` <div class="content-card">
          <div>
            <h3>${platform.title}</h3>
            <p>${platform.description}</p>
          </div>
          <div>
            <app-button appearance="lightweight">Publish</app-button>
          </div>
        </div>`
    );
  }

  render() {
    return html`
      <div>
        <content-header heroImg="/assets/images/store_fpo.png">
          <div class="header" slot="hero-container">
            <h1>
              Nice! <br />
              You're on your way!
            </h1>
            <p>
              Description about what is going to take place below and how they
              are on their way to build their PWA. Mention nav bar for help.
            </p>
          </div>
        </content-header>
        <section class="main-container">
          <div class="container">
            <div class="content">
              <h3>Publish your PWA for Stores</h3>
              <p>
                Ready to build your PWA? Tap "Build My PWA" to package your PWA
                for the app stores or tap "Feature Store" to check out the
                latest web components from the PWABuilder team to improve your
                PWA even further!
              </p>
            </div>
            <div>${this.renderContentCards()}</div>
            <div class="content">
              <h3>Up next</h3>
              <p>
                Ready to build your PWA? Tap "Build My PWA" to package your PWA
                for the app stores or tap "Feature Store" to check out the
                latest web components from the PWABuilder team to improve your
                PWA even further!
              </p>
            </div>
            <div class="action-buttons">
              <app-button>Back</app-button>
              <app-button>Next</app-button>
            </div>
          </div>
        </section>
      </div>
    `;
  }
}

export interface ICardData {
  title: string;
  description: string;
}
const platforms: ICardData[] = [
  {
    title: 'Windows',
    description:
      'Publish your PWA to the Microsoft Store to make it available to the 1 billion Windows and XBox users worldwide.',
  },
  {
    title: 'Android',
    description:
      'Publish your PWA to the Google Play Store to make your app more discoverable for Android users.',
  },
  {
    title: 'Samsung',
    description:
      'Publish your PWA to the Google Play Store to make your app more discoverable for Android users.',
  },
];
