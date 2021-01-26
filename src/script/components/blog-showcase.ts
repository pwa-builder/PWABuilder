import { LitElement, css, html, customElement } from 'lit-element';
import {
  smallBreakPoint,
  mediumBreakPoint,
  largeBreakPoint,
  xxxLargeBreakPoint,
  BreakpointValues,
} from '../utils/breakpoints';
import { hidden_all } from '../utils/css/hidden';

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

      .blog-actions {
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .blog-actions app-button {
        border-radius: 44px;
        width: 216px;
      }

      .blog-actions app-button::part(underlying-button) {
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
        `
      )}

      ${mediumBreakPoint(
        css`
          #posts {
            flex-direction: column;
            align-items: center;
            padding: 0 32px;
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

          .blog-actions {
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

      ${hidden_all}
    `;
  }

  constructor() {
    super();
  }

  render() {
    return html`
      <section>
        <div id="blog-header">${this.renderBlogHeader()}</div>

        <div id="posts">${this.renderCards()}</div>
        <div id="blog-actions" class="blog-actions hidden-sm">
          ${this.renderBlogActionButton()}
        </div>
      </section>
    `;
  }

  renderCards() {
    return blogPosts.map((post, i) => {
      return html`
        <app-card
          title=${post.title}
          description=${post.description}
          date=${post.date}
          imageUrl=${post.imageUrl}
          linkRoute=${post.clickUrl}
          mode="blog"
          shareLink
          .tags=${post.tags}
          .featured=${i === 0 &&
          window.innerWidth >= BreakpointValues.largeLower}
        >
        </app-card>
      `;
    });
  }

  renderBlogHeader() {
    return html`
      <h2 class="hidden-xlrg hidden-xxlrg hidden-xxxlrg">
        Blog Posts for you...
      </h2>
      <h2 class="hidden-sm hidden-med hidden-lrg">
        Blog posts recommended for you...
      </h2>
    `;
  }

  renderBlogActionButton() {
    return html`
      <app-button>
        <span class="hidden-xlrg hidden-xxlrg hidden-xxxlrg">View Blog</span>
        <span class="hidden-sm hidden-med hidden-lrg"
          >View PWA Builder Blog</span
        >
      </app-button>
    `;
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
