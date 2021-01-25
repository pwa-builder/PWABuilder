import { LitElement, css, html, customElement } from 'lit-element';
import {
  smallBreakPoint,
  mediumBreakPoint,
  largeBreakPoint,
  xxxLargeBreakPoint,
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

      .share::part(underlying-button),
      .tag::part(control) {
        color: var(--font-color);
      }

      .overlay .date,
      .overlay .tag-list::part(underlying-button),
      .overlay .share::part(underlying-button) {
        display: inline-block;
        font-size: var(--desktop-button-font-size);
      }

      .featured .overlay h2 {
        font-size: 32px;
        line-height: 34px;
        margin: 0;
      }

      .featured .overlay p {
        font-size: 18px;
        line-height: 34px;
      }

      .featured .overlay .share {
        display: inline-block;
      }

      .featured .overlay .share::part(underlying-button) {
        font-size: 14px;
        color: var(--font-color);
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
        color: var(--font-color);
      }

      fast-card.featured img {
        height: 100%;
      }

      /* Secondary Components */
      fast-badge::part(control) {
        --badge-color-dark: var(--font-color);
      }

      .card-content {
        display: flex;
        justify-content: space-between;
        vertical-align: text-top;
        margin-top: 8px;
        padding: 8px 16px 0 16px;
      }

      .card-content app-button::part(underlying-button) {
        text-align: text-top;
        align-items: baseline;
      }

      .card-content h2 {
        display: inline-block;
        font-size: 18px;
        margin: 0;
      }

      #blog-actions {
        display: flex;
        align-items: center;
        justify-content: center;
      }

      #blog-actions app-button {
        border-radius: 44px;
        width: 216px;
      }

      #blog-actions app-button::part(underlying-button) {
        font-size: 14px;
        font-weight: var(--font-bold);
      }

      ${smallBreakPoint(
        css`
          #posts {
            display: block;
            overflow-x: scroll;
            scroll-snap-type: x proximity;
            white-space: nowrap;

            align-items: center;
            padding: 0 16px;
            margin-bottom: 16px;
          }

          #posts fast-card {
            display: inline-block;
            min-width: calc(100% - 32px);
            margin-right: 32px;
            margin-bottom: 16px;
            scroll-snap-align: center;
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

          fast-card .overlay {
            height: 142px;
          }

          #blog-actions {
            flex-direction: row-reverse;
            justify-content: flex-start;
            padding: 0 36px;
            margin-top: 32px;
          }

          .blog-actions app-button {
            display: block;
            float: right;
          }
        `,
        'no-upper'
      )}

      ${xxxLargeBreakPoint(
        css`
          :host {
            display: block;
          }

          #blog-header {
            align-items: normal;
          }
        `
      )}
    `;
  }

  constructor() {
    super();

    window.addEventListener('resize', () => {
      this.requestUpdate();
    });
  }

  render() {
    return html`
      <section>
        <div id="blog-header">
          <h2>${this.h2Text()}</h2>
        </div>

        <div id="posts">${this.renderCards()}</div>
        ${this.renderBlogActions()}
      </section>
    `;
  }

  renderCards() {
    return blogPosts.map((post, i) => {
      if (i === 0 && window.innerWidth >= BreakpointValues.largeLower) {
        return html`
          <fast-card class="featured">
            <div class="overlay">
              <div class="top">
                <span class="date">${post.date}</span>
                <app-button id="share" class="share" appearance="lightweight"
                  >Share</app-button
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
            ${window.innerWidth < BreakpointValues.mediumLower
              ? html`
                  <div class="tag-list">
                    ${post.tags.map(
                      tag => html` <fast-badge class="tag">${tag}</fast-badge> `
                    )}
                  </div>
                `
              : undefined}
          </div>
          <img src="${post.imageUrl}" alt="${post.title} card header image" />
          <div class="card-content">
            <h2 class="title">${post.title}</h2>
            <app-button id="share" class="share" appearance="lightweight"
              >Share</app-button
            >
          </div>
        </fast-card>
      `;
    });
  }

  renderBlogActions() {
    if (window.innerWidth > BreakpointValues.smallUpper) {
      return html`
        <div id="blog-actions">
          <app-button>${this.viewBlogButtonText()}</app-button>
        </div>
      `;
    }
  }

  h2Text() {
    if (window.innerWidth < BreakpointValues.largeLower) {
      return 'Blog Posts for you...';
    }

    return 'Blog posts recommended for you...';
  }

  viewBlogButtonText() {
    if (window.innerWidth < BreakpointValues.largeLower) {
      return 'View Blog';
    }

    return 'View PWA Builder Blog';
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
    title: 'Title of Post',
    description: 'description post',
    date: 'Date of Post',
    imageUrl: '/assets/icons/icon_120.png',
    shareUrl: '',
    clickUrl: '',
    tags: ['a', 'b'],
  },
  {
    title: 'Title of Post',
    description: 'description post',
    date: 'Date of Post',
    imageUrl: '/assets/icons/icon_120.png',
    shareUrl: '',
    clickUrl: '',
    tags: ['a', 'b'],
  },
  {
    title: 'Title of Post',
    description: 'description post',
    date: 'Date of Post',
    imageUrl: '/assets/icons/icon_120.png',
    shareUrl: '',
    clickUrl: '',
    tags: ['a', 'b'],
  },
];
