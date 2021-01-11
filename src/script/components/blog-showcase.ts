import { LitElement, css, html, customElement, property } from 'lit-element';
import { completeCards, landingCards } from './resource-hub-cards';
import {
  largeBreakPoint,
  mediumBreakPoint,
  smallBreakPoint,
} from '../utils/breakpoints';

type ResourceHubPages = 'home' | 'complete';

@customElement('blog-showcase')
export class ResourceHub extends LitElement {
  @property({ attribute: 'all', type: Boolean }) showViewAllButton = false;
  @property({ attribute: 'page', type: String }) pageName: ResourceHubPages =
    'home';

  static get styles() {
    return css`
      :host {
        background: var(--primary-color);
        display: flex;
        color: white;
      }

      ::slotted(h2) {
        margin: 0;
      }

      #resource-header {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding-top: 80px;
        padding-left: 4em;
        padding-right: 4em;
      }

      #resource-header h2 {
        font-weight: var(--font-bold);

        font-size: 36px;
        line-height: 39px;
        letter-spacing: -0.015em;
        margin-top: 0;
      }

      #resource-header p {
        font-weight: var(--font-bold);
        text-align: center;
      }

      #cards {
        display: flex;
        padding-left: 4em;
        padding-right: 4em;
        margin-top: 1em;
      }

      #cards fast-card {
        padding-bottom: 16px;
        margin-right: 12px;
        margin-left: 12px;

        color: var(--font-color);
        background: white;
      }

      fast-card img {
        width: 100%;
        object-fit: none;
        height: 188px;
      }

      fast-card h3 {
        font-size: 24px;
        line-height: 24px;
        font-weight: var(--font-bold);
        margin: 16px 16px 0 16px;
      }

      fast-card p {
        color: var(--secondary-font-color);
        margin: 8px 16px 0 16px;

        font-size: 14px;
        line-height: 20px;
      }

      .card-actions {
        margin-top: 8px;
      }

      .card-actions fast-button::part(control) {
        font-weight: bold;
        font-size: 14px;
        line-height: 20px;
        color: #679bd5;
        padding: 0 16px;
      }

      #resource-hub-actions {
        display: flex;
        align-items: center;
        justify-content: center;

        margin-top: 32px;
        margin-bottom: 64px;
      }

      #resource-hub-actions fast-button {
        background: white;
        color: var(--font-color);
        border-radius: 44px;
        width: 188px;
      }

      #resource-hub-actions fast-button::part(control) {
        font-size: 16px;
        font-weight: var(--font-bold);
      }

      ${smallBreakPoint(css`
        #cards {
          flex-direction: column;
          align-items: center;
          padding: 0;
        }

        #cards fast-card {
          margin-bottom: 16px;
        }
      `)}

      ${mediumBreakPoint(css`
        #cards {
          flex-direction: column;
          align-items: center;
          padding: 0;
        }

        #cards fast-card {
          margin-bottom: 16px;
        }
      `)}

      ${largeBreakPoint(css`
        #cards {
          flex-direction: column;
          align-items: center;
          padding: 0;
        }

        #cards fast-card {
          margin-bottom: 16px;
        }
      `)}
    `;
  }

  constructor() {
    super();
  }

  render() {
    return html`
      <section>
        <div id="blog-header">Blog post recommended for you...</div>

        <div id="posts">${this.renderCards()}</div>

        <div id="blog-actions">
          <fast-button>View PWA Builder Blog</fast-button>
        </div>
        ;
      </section>
    `;
  }

  renderCards() {
    return blogPosts.map((post, i) => {
      if (i === 0) {
        return html`
          <fast-card class="focused">
            <img src="${post.imageUrl}" alt="${post.title} card header image" />
            <p class="date">${post.date}</p>
            <fast-button appearance="lightweight"></fast-button>

            <h2>${post.title}</h2>
          </fast-card>
        `;
      }

      return html`
        <fast-card>
          <img src="${post.imageUrl}" alt="${post.title} card header image" />
          <p class="date">${post.date}</p>

          <fast-button appearance="lightweight"></fast-button>;
        </fast-card>
      `;
    });
  }
}

interface BlogPost {
  title: string;
  description: string;
  date: string; // make into Date object?
  imageUrl: string;
  shareUrl: string;
  clickUrl: string;
}

const blogPosts: Array<BlogPost> = [
  {
    title: '',
    description: '',
    date: '',
    imageUrl: '',
    shareUrl: '',
    clickUrl: '',
  },
];
