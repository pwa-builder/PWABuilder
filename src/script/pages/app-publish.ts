import { css, customElement, html, LitElement } from 'lit-element';
import '../components/app-header';
import '../components/app-sidebar';
import '../components/app-card';
@customElement('app-publish')
export class AppPublish extends LitElement {
  constructor() {
    super();
  }

  static get styles() {
    return css`
      content-header::part(main-container) {
        display: flex;
        justify-content: center;
        padding: 5.2rem 1rem 1rem;
      }

      .header {
        padding: 1rem 3rem;
      }

      .header p {
        width: min(100%, 600px);
      }

      .container {
        padding: 0 2rem;
        display: flex;
        flex-direction: column;
        justify-items: center;
        align-items: center;
      }

      .container .action-buttons {
        display: flex;
        justify-content: center;
        align-items: center;
      }

      .container .action-buttons > app-button {
        margin: 1rem;
      }
    `;
  }

  renderContentCards() {
    return platforms.map(
      platform =>
        html`<app-card
          linkText="Publish"
          mode="content-card"
          title="${platform.title}"
          ?isActionCard=${platform.isActionCard}
          description="${platform.description}"
        >
        </app-card>`
    );
  }

  render() {
    return html`
      <div>
        <content-header
          heroImg="/assets/images/store_fpo.png"
          mobileHeroImg="assets/images/mobile_header_logo.png"
        >
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
        <section class="container">
          <div>${this.renderContentCards()}</div>
          <div class="action-buttons">
            <app-button>Back</app-button>
            <app-button>Next</app-button>
          </div>
        </section>
      </div>
    `;
  }
}

export interface ICardData {
  title: string;
  description: string;
  isActionCard: boolean;
}
const platforms: ICardData[] = [
  {
    title: 'Publish your PWA for Stores',
    description:
      'Ready to build your PWA? Tap "Build My PWA" to package your PWA for the app stores or tap "Feature Store" to check out the latest web components from the PWABuilder team to improve your PWA even further!',
    isActionCard: false,
  },
  {
    title: 'Windows',
    description:
      'Publish your PWA to the Microsoft Store to make it available to the 1 billion Windows and XBox users worldwide.',
    isActionCard: true,
  },
  {
    title: 'Android',
    description:
      'Publish your PWA to the Google Play Store to make your app more discoverable for Android users.',
    isActionCard: true,
  },
  {
    title: 'Samsung',
    description:
      'Publish your PWA to the Google Play Store to make your app more discoverable for Android users.',
    isActionCard: true,
  },
  {
    title: 'Up next',
    description:
      'Ready to build your PWA? Tap "Build My PWA" to package your PWA for the app stores or tap "Feature Store" to check out the latest web components from the PWABuilder team to improve your PWA even further!',
    isActionCard: false,
  },
];
