import { LitElement, css, html, customElement } from 'lit-element';
import {
  largeBreakPoint,
  mediumBreakPoint,
  smallBreakPoint,
  BreakpointValues,
} from '../utils/breakpoints';

@customElement('blog-showcase')
export class ResourceHub extends LitElement {
  static get styles() {
    return css`
      :host {
        background: white;
        justify-content: center;
        display: flex;
        color: var(--font-color);
      }

      section {
        width: 100%;
      }

      #blog-header {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 80px 32px 0 32px;
      }

      #blog-header h2 {
        font-weight: var(--font-bold);

        font-size: 36px;
        line-height: 39px;
        letter-spacing: -0.015em;
        margin-top: 0;
      }

      #blog-header p {
        font-weight: var(--font-bold);
        text-align: center;
      }

      #posts {
        display: flex;
        padding-left: 32px;
        padding-right: 32px;
        margin-top: 1em;
      }

      #posts fast-card {
        padding-bottom: 16px;

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

      #blog-actions {
        display: flex;
        align-items: center;
        justify-content: center;
      }

      #blog-actions fast-button {
        color: white;
        border-radius: 44px;
        width: 216px;
      }

      #blog-actions fast-button::part(control) {
        font-size: 14px;
        font-weight: var(--font-bold);
      }

      ${smallBreakPoint(
        css`
          #posts {
            flex-direction: column;
            align-items: center;
            padding: 0 16px;
          }

          #posts fast-card {
            margin-bottom: 32px;
          }
        `
      )}

      ${mediumBreakPoint(
        css`
          #posts {
            flex-direction: column;
            align-items: center;
            padding: 0 32px;
          }

          #posts fast-card {
            margin-bottom: 32px;
          }
        `
      )}

      ${largeBreakPoint(
        css`
          #posts {
            display: grid;
            justify-content: center;
            grid-template-columns: repeat(5, 1fr);
            grid-template-rows: repeat(2, 1fr);
            column-gap: 16px;
            row-gap: 16px;
          }

          #posts .featured {
            grid-area: 1 / 1 / 3 / 4;
          }

          #posts fast-card {
            grid-column: 4 / 6;
          }

          #blog-actions {
            flex-direction: row-reverse;
            justify-content: flex-start;
            padding: 0 36px;
            margin-top: 32px;
          }

          .blog-actions fast-button {
            display: block;
            float: right;
          }
        `,
        'no-upper'
      )}
    `;
  }

  constructor() {
    super();
  }

  render() {
    return html`
      <section>
        <div id="blog-header">
          <h2>${this.h2Text()}</h2>
        </div>

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
          <fast-card class="featured">
            <div class="image-container">
              <span class="date">${post.date}</span>
              ${post.tags.map(
                tag => html` <fast-badge class="tag">${tag}</fast-badge> `
              )}
              <img
                src="${post.imageUrl}"
                alt="${post.title} card header image"
              />
            </div>

            <fast-button appearance="lightweight">Share</fast-button>

            <h2>${post.title}</h2>
          </fast-card>
        `;
      }

      return html`
        <fast-card>
          <img src="${post.imageUrl}" alt="${post.title} card header image" />
          <p class="date">${post.date}</p>

          <fast-button appearance="lightweight">Share</fast-button>

          <h2>${post.title}</h2>
        </fast-card>
      `;
    });
  }

  h2Text() {
    if (window.innerWidth < BreakpointValues.largeLower) {
      return 'Blog Posts for you...';
    }

    return 'Blog posts recommended for you...';
  }
}

interface BlogPost {
  title: string;
  description: string;
  date: string; // make into Date object?
  imageUrl: string;
  shareUrl: string;
  clickUrl: string;
  tags: Array<string>;
}

const blogPosts: Array<BlogPost> = [
  {
    title: 'temp',
    description: 'temp',
    date: 'temp',
    imageUrl: '/assets/icons/icon_120.png',
    shareUrl: '',
    clickUrl: '',
    tags: ['a', 'b'],
  },
  {
    title: 'temp',
    description: 'temp',
    date: 'temp',
    imageUrl: '/assets/icons/icon_120.png',
    shareUrl: '',
    clickUrl: '',
    tags: ['a', 'b'],
  },
  {
    title: 'temp',
    description: 'temp',
    date: 'temp',
    imageUrl: '/assets/icons/icon_120.png',
    shareUrl: '',
    clickUrl: '',
    tags: ['a', 'b'],
  },
];
