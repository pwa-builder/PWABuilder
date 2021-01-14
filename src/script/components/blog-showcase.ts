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
        max-width: 1060px;
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
        max-width: 1069px;
      }

      #posts fast-card {
        padding-bottom: 16px;

        color: var(--font-color);
        background: white;
      }

      /* Card Basics */
      fast-card img {
        height: 142px;
        width: 100%;
        object-fit: none;
        height: 200px;
      }

      fast-card h3 {
        font-size: 24px;
        line-height: 24px;
        font-weight: var(--font-bold);
        margin: 16px 16px 0 16px;
      }

      fast-card p {
        color: var(--secondary-font-color);

        font-size: 14px;
        line-height: 20px;
      }

      fast-card .top {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
      }

      /* Featured Card */
      #posts fast-card.featured {
        padding: 0;
      }

      fast-card .overlay {
        position: absolute;
        width: calc(100% - 32px);
        padding: 16px;
      }

      .overlay p {
        margin: 0;
      }

      .overlay .date,
      .overlay .tag-list::part(control),
      .overlay .share::part(control) {
        display: inline-block;
        font-size: var(--desktop-button-font-size);
      }

      .featured .overlay .share {
        display: inline-block;
      }

      .featured .overlay .share::part(control) {
        vertical-align: middle;
      }

      fast-card.featured .tag-list {
        position: absolute;
        right: unset;
        margin: 0 16px 8px 0;
        bottom: 0;
        right: 0;
      }

      fast-card.featured .tag-list .tag {
        margin: 8px 0 0 8px;
      }

      .featured fast-badge::part(control) {
        --badge-fill-primary: white;
      }

      fast-card.featured .share {
      }

      fast-card.featured img {
        height: 100%;
      }

      /* Secondary Components */
      fast-badge::part(control) {
        --badge-color-dark: var(--font-color);
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

          #posts fast-card.featured {
            grid-area: 1 / 1 / 3 / 4;
            max-width: 612px;
          }

          #posts fast-card {
            grid-column: 4 / 6;
            max-width: 425px;
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

    window.addEventListener('resize', () => {
      console.log('resize in window');
    });
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
            <div class="overlay">
              <div class="top">
                <span class="date">${post.date}</span>
                <fast-button id="share" class="share" appearance="lightweight"
                  >Share</fast-button
                >
              </div>

              <h2 class="title">${post.title}</h2>
              <p class="description">${post.description}</p>
            </div>

            <div class="tag-list">
              ${post.tags.map(
                tag => html` <fast-badge class="tag">${tag}</fast-badge> `
              )}
            </div>
            <img src="${post.imageUrl}" alt="${post.title} card header image" />
          </fast-card>
        `;
      }

      return html`
        <fast-card>
          <div class="overlay top">
            <p class="date">${post.date}</p>
            <div class="tag-list">
              ${post.tags.map(
                tag => html` <fast-badge class="tag">${tag}</fast-badge> `
              )}
            </div>
          </div>
          <img src="${post.imageUrl}" alt="${post.title} card header image" />

          <fast-button id="share" class="share" appearance="lightweight"
            >Share</fast-button
          >

          <h2 class="title">${post.title}</h2>
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
    title: 'temp a',
    description: 'description post',
    date: 'january 13, 2021',
    imageUrl: '/assets/icons/icon_120.png',
    shareUrl: '',
    clickUrl: '',
    tags: ['a', 'b'],
  },
  {
    title: 'temp b',
    description: 'description post',
    date: 'january 13, 2021',
    imageUrl: '/assets/icons/icon_120.png',
    shareUrl: '',
    clickUrl: '',
    tags: ['a', 'b'],
  },
  {
    title: 'temp c',
    description: 'description post',
    date: 'january 13, 2021',
    imageUrl: '/assets/icons/icon_120.png',
    shareUrl: '',
    clickUrl: '',
    tags: ['a', 'b'],
  },
];
