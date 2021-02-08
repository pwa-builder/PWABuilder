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
      .header {
        padding: 1rem 3rem;
      }

      .header p {
        width: min(100%, 600px);
      }

      #summary-block {
        padding: 16px;
        border-bottom: var(--list-border);
      }

      h2 {
        font-size: var(--xlarge-font-size);
        line-height: 46px;
        max-width: 526px;
      }

      #hero-p {
        font-size: var(--font-size);
        line-height: 24px;
        max-width: 406px;
      }

      h3,
      h5 {
        font-size: var(--medium-font-size);
        margin-bottom: 8px;
      }

      h4 {
        margin-bottom: 8px;
        margin-top: 0;
      }

      .container {
        padding: 16px;
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

      #up-next {
        width: 100%;
      }

      ul {
        list-style: none;
        margin: 0;
        padding: 0;

        width: 100%;
      }

      li {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-top: 35px;
        padding-bottom: 35px;
        border-bottom: var(--list-border);
      }

      li h4 {
        font-size: var(--small-medium-font-size);
      }

      p {
        font-size: var(--font-size);
        color: var(--font-color);
        max-width: 767px;
      }

      content-header::part(header) {
        --header-background: white;
      }
    `;
  }

  renderContentCards() {
    return platforms.map(
      platform =>
        html`<li>
          <div id="title-block">
            <h4>${platform.title}</h4>
            <p>${platform.description}</p>
          </div>

          <app-button>Publish</app-button>
        </li>`
    );
  }

  render() {
    return html`
      <content-header>
        <h2 slot="hero-container">Small details go a long way.</h2>
        <p id="hero-p" slot="hero-container">
          Description about what is going to take place below and how they are
          on their way to build their PWA. Mention nav bar for help.
        </p>

        <img
          slot="picture-container"
          src="/assets/images/reportcard-header.svg"
          alt="report card header image"
        />
      </content-header>

      <div>
        <section id="summary-block">
          <h3>Publish your PWA to stores</h3>

          <p>
            Ready to build your PWA? Tap "Build My PWA" to package your PWA for
            the app stores or tap "Feature Store" to check out the latest web
            components from the PWABuilder team to improve your PWA even
            further!
          </p>
        </section>

        <section class="container">
          <ul>
            ${this.renderContentCards()}
          </ul>

          <div id="up-next">
            <h5>Up next</h5>

            <p>
              Ready to build your PWA? Tap "Build My PWA" to package your PWA
              for the app stores or tap "Feature Store" to check out the latest
              web components from the PWABuilder team to improve your PWA even
              further!
            </p>
          </div>

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
];
