/* eslint-disable no-fallthrough */
import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { largeBreakPoint, BreakpointValues } from '../utils/css/breakpoints';
import { fastButtonCss } from '../utils/css/fast-elements';
import { Lazy } from '../utils/interfaces';

export enum AppCardModes {
  default = 'default',
  blog = 'blog',
  micro = 'micro',
  microDescription = 'micro-description',
  contentCard = 'content-card',
}

@customElement('app-card')
export class AppCard extends LitElement {
  @property({ attribute: 'bordered', type: Boolean })
  imageBordered = false;
  @property({ type: String }) imageUrl: Lazy<string>;
  @property({ type: String }) cardTitle: Lazy<string>;
  @property({ type: String }) description: Lazy<string>;
  @property({ type: String }) date: Lazy<string>;
  @property({ type: String }) linkText: Lazy<string>;
  @property({ type: String }) linkRoute: Lazy<string>;

  @property({ type: Boolean }) featured = false;
  @property({ type: Boolean }) shareLink = false;
  @property({ type: Array }) tags: Array<string> = [];
  @property({ type: Boolean }) isActionCard = false;

  static get styles() {
    return [
      // host
      css`
        :host {
          background: transparent;
          display: flex;
          color: var(--primary-color);
          justify-content: center;
          border-radius: 4px;
        }
      `,
      // default card
      css`
        fast-card {
          color: var(--font-color);
          font-size: var(--font-size);
          background: white;
          border-radius: 4px;
        }

        fast-card h3,
        fast-card p {
          white-space: initial;
        }

        fast-card.default {
          min-width: 200px;
          max-width: 280px;
          padding-bottom: 16px;
        }

        fast-card.default h3 {
          font-size: 24px;
          line-height: 24px;
          font-weight: var(--font-bold);
          margin: 16px 16px 0px;
        }

        fast-card.default p {
          color: var(--secondary-font-color);
          margin: 8px 16px 0 16px;

          line-height: 20px;
        }

        fast-card.default app-button::part(underlying-button) {
          color: var(--link-color);
        }

        fast-card.default app-button:focus {
          outline: solid;
          outline-width: 2px;
        }

        fast-card .card-actions {
          margin: 0 16px;
        }

        fast-card .tag-list {
          display: inline-block;
        }

        img {
          width: 100%;
          object-fit: none;
          height: 188px;
        }

        .image-block {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .image-block img {
          width: 60%;
          object-fit: contain;
        }

        h3 {
          font-size: 24px;
          line-height: 24px;
          font-weight: var(--font-bold);
          margin: 16px 16px 0 16px;
        }

        p {
          color: var(--secondary-font-color);
          margin: 8px 16px 0 16px;

          font-size: 14px;
          line-height: 20px;
        }

        .card-actions {
          margin-top: 8px;
        }

        .card-actions a {
          font-weight: bold;
          font-size: 14px;
          line-height: 40px;
          color: var(--link-color);
          padding: 0;
        }

        .card-actions a:hover {
          cursor: pointer;
        }

        card-actions a:focus {
          outline: 1px solid black;
        }

        .card-actions a span {
          display: inline-block;
          height: 28px;
          border-bottom: 1px solid var(--link-color);
        }
      `,
      // overlay
      css`
        .img-overlay {
          position: fixed;
        }

        .img-overlay,
        fast-card img {
          width: calc(100% - 16px);
          object-fit: none;
          max-height: 184px;
        }

        .img-overlay.bordered,
        fast-card img.bordered {
          padding: 8px;
          width: calc(100% - 48px);
        }

        .img-overlay .overlay-top {
          display: flex;
          flex-direction: row;
          justify-content: space-between;
        }

        .blog.featured img,
        .blog.featured .img-overlay {
          max-height: none;
          height: calc(100% - 32px);
        }
      `,
      // blog card
      css`
        .blog {
          background: white;
          color: var(--font-color);
          padding-bottom: 16px;
        }

        .blog img {
          height: 200px;
          width: 100%;
          object-fit: none;
        }

        .blog h3 {
          /* line-height: 34px; */
          line-height: 20px;
          font-size: 24px;
          font-weight: var(--font-bold);
          margin: 16px 16px 0 16px;
        }

        .blog p {
          color: var(--secondary-font-color);

          font-size: 14px;
          line-height: 20px;
        }

        .blog .overlay-top {
          display: flex;
          flex-direction: row;
          justify-content: space-between;
        }

        .blog .img-overlay {
          position: absolute;
          width: calc(100% - 32px);
          padding: 16px;
        }

        .blog .content {
          display: flex;
          justify-content: space-between;
          vertical-align: text-top;
          margin-top: 8px;
          padding: 8px 16px 0 16px;
        }

        .blog .content app-button::part(underlying-button) {
          text-align: text-top;
          align-items: baseline;
        }

        .blog .content h2 {
          display: inline-block;
          font-size: 18px;
          margin: 0;
        }

        .img-overlay p {
          margin: 0;
        }

        .blog .content {
          display: flex;
          flex-direction: row;
          justify-content: space-between;

          padding: 8px;
        }

        .blog .content h3 {
          font-size: 24px;
          margin: 0;
        }

        .blog.featured {
          padding: 0;
        }

        .blog.featured h3 {
          line-height: 34px;
          font-size: 28px;
          margin: 16px 0 8px 0;
        }

        .blog.featured p {
          font-size: 18px;
          line-height: 24px;
          font-weight: 500px;
          color: var(--font-color);
        }

        .blog.featured img {
          height: 100%;
        }

        .blog.featured .tag-list {
          position: absolute;
          right: unset;
          margin: 0 16px 8px 0;
          bottom: 0;
          right: 0;
        }

        .tag {
          margin: 8px 8px 0 16px;
          padding: 2px 6px;
          border-radius: 2px;
          background-color: var(--primary-background-color);
        }

        .blog.featured .img-overlay {
          display: inline-block;
        }

        .blog.featured .img-overlay .share::part(underlying-button) {
          font-size: 14px;
          color: var(--font-color);
          vertical-align: middle;
        }

        .blog.featured .tag-list {
          position: absolute;
          right: unset;
          margin: 0 16px 8px 0;
          bottom: 0;
          right: 0;
        }

        .blog.featured .tag-list .tag {
          margin: 8px 0 0 8px;
        }

        .share-button-text {
          color: var(--font-color);
          font-weight: 700;
        }

        fast-button.share.link {
          --desktop-button-font-size: 16px;
          box-shadow: none;
        }

        fast-button.share::part(control) {
          font-size: 14px;
          color: var(--font-color);
          vertical-align: top;
        }

        .blog .tag,
        .blog .date,
        .blog .share::part(control) {
          display: inline-block;
          vertical-align: middle;
        }

        .blog .share::part(control),
        .blog .tag::part(control) {
          color: var(--font-color);
          font-size: var(--desktop-button-font-size);
          font-weight: 400;
          height: fit-content;
        }

        .blog .img-overlay .date,
        .blog .img-overlay .tag::part(underlying-button),
        .blog .img-overlay .share::part(control),
        .blog .content .share::part(control) {
          display: inline-block;
          font-size: var(--desktop-button-font-size);
        }

        .blog .date {
          --desktop-button-font-size: 16px;
          font-weight: 700;
          line-height: 21px;
          color: var(--font-color);
        }

        .blog.featured fast-badge::part(control) {
          --badge-fill-primary: white;
          color: var(--font-color);
        }

        .blog .card-anchor {
          text-decoration: none;
          color: initial;
        }

        fast-badge::part(control) {
          --badge-color-dark: var(--font-color);
          --badge-fill-primary: var(--primary-background-color);
          color: var(--font-color);
        }
      `,
      largeBreakPoint(
        css`
          .blog .img-overlay {
            height: 142px;
          }

          .blog.featured {
            min-width: 220px;
          }

          .blog {
            min-width: 200px;
          }
        `
      ),
      // micro card
      css`
        .micro {
          display: grid;
          width: 100%;
          max-width: 416px;
          margin: 16px;

          grid-template-columns: 72px auto;
        }

        .micro img {
          object-fit: fill;
          height: 72px;
          width: 73px;
        }

        .micro .content {
          display: inline-flex;
          flex-direction: column;
          justify-content: center;
          margin: 8px;
        }

        .micro.micro-description .content {
          justify-content: space-between;
        }

        .micro h3 {
          margin: 0;
          line-height: 24px;
          font-size: 24px;
        }

        .micro p {
          overflow: hidden;
          text-overflow: ellipsis;
          height: 32px;
          margin: 0;

          line-height: 16px;
          font-size: 12px;
        }
      `,
      // content card
      css`
        fast-card.content-card {
          background-color: var(--primary-background-color);
          padding: 1rem 0;
          width: 100%;
          max-width: 1024px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          align-items: center;
          box-shadow: none;
          border-radius: 0;
          border-bottom: 0.67681px solid #e5e5e5;
        }

        .content-card .header {
          margin-right: 0;
        }

        .content-card .header p {
          color: #808080;
        }

        .content-card app-button {
          margin-top: 1rem;
        }
      `,
      largeBreakPoint(
        css`
          fast-card.content-card {
            width: calc(100vw - 30vw);
            flex-direction: row;
          }

          .content-card .header {
            margin-right: 1rem;
          }

          .content-card app-button {
            margin-top: 0;
          }
        `,
        'no-upper'
      ),
      fastButtonCss,
    ];
  }

  constructor() {
    super();
  }

  render() {
    const className = this.className;

    if (className.includes(AppCardModes.blog)) {
      return this.renderBlogCard();
    } else if (className.includes(AppCardModes.micro)) {
      return this.renderMicroCard();
    } else if (className.includes(AppCardModes.microDescription)) {
      return this.renderMicroDescriptionCard();
    } else if (className.includes(AppCardModes.contentCard)) {
      return this.renderContentCard();
    }

    return this.renderDefault();
  }

  renderDefault() {
    return html`
      <fast-card class="${classMap({
        featured: this.featured || this.className.includes('featured'),
        [AppCardModes.default]: this.className.includes(AppCardModes.default),
        [AppCardModes.blog]: this.className.includes(AppCardModes.blog),
        [AppCardModes.micro]: this.className.includes(AppCardModes.micro),
        [AppCardModes.microDescription]: this.className.includes(
          AppCardModes.microDescription
        ),
        [AppCardModes.contentCard]: this.className.includes(
          AppCardModes.contentCard
        ),
      })}" part="card">
        <div class="${classMap({
          'bordered': this.imageBordered,
          'img-overlay': true,
        })}">
          <slot name="overlay"></slot>
        </div>
      
        <div class="image-block">
          <img class="${classMap({
            bordered: this.imageBordered,
          })}" src="${ifDefined(this.imageUrl)}" alt="${
      this.cardTitle
    } card header image" role="presentation"/>
        </div>
      
        <h3>${this.cardTitle}</h3>
        <p>${this.description}</p>
      
        <div class="card-actions">
          <a @click=${this.route} tabindex="0"><span>View ${this.cardTitle}</span></a>
        </div>
      </fast-card>
    `;
  }

  renderBlogCard() {
    // Featured Card Html
    if (this.featured && window.innerWidth > BreakpointValues.mediumUpper) {
      return html`
        <fast-card
          class="${classMap({
            featured: this.featured || this.className.includes('featured'),
            [AppCardModes.default]: this.className.includes(
              AppCardModes.default
            ),
            [AppCardModes.blog]: this.className.includes(AppCardModes.blog),
            [AppCardModes.micro]: this.className.includes(AppCardModes.micro),
            [AppCardModes.microDescription]: this.className.includes(
              AppCardModes.microDescription
            ),
            [AppCardModes.contentCard]: this.className.includes(
              AppCardModes.contentCard
            ),
          })}"
          part="card"
        >
          <a
            class="card-anchor"
            .href="${this.linkRoute}"
            target="_blank"
            rel="noopener"
          >
            <div class="img-overlay">
              <div class="overlay-top">
                <span class="date">${this.date}</span>
                ${this.renderShareButton()}
              </div>
              <h3>${this.cardTitle}</h3>
              <p>${this.description}</p>
              <slot name="overlay"></slot>

              <div class="tag-list">${this.renderTagList()}</div>
            </div>
            <img
              src="${ifDefined(this.imageUrl)}"
              alt="${this.cardTitle} card header image"
            />
          </a>
        </fast-card>
      `;
    }

    return html`
      <fast-card
        class="${classMap({
          featured: this.featured || this.className.includes('featured'),
          [AppCardModes.default]: this.className.includes(AppCardModes.default),
          [AppCardModes.blog]: this.className.includes(AppCardModes.blog),
          [AppCardModes.micro]: this.className.includes(AppCardModes.micro),
          [AppCardModes.microDescription]: this.className.includes(
            AppCardModes.microDescription
          ),
          [AppCardModes.contentCard]: this.className.includes(
            AppCardModes.contentCard
          ),
        })}"
        part="card"
      >
        <a
          class="card-anchor"
          .href="${this.linkRoute}"
          target="_blank"
          rel="noopener"
        >
          <div class="img-overlay">
            <div class="overlay-top">
              <span class="date">${this.date}</span>
              <div class="tag-list">${this.renderTagList()}</div>
              ${this.renderShareButton()}
            </div>
            <slot name="overlay"></slot>
          </div>
          <img
            src="${ifDefined(this.imageUrl)}"
            alt="${this.cardTitle} card header image"
          />
          <div class="content">
            <h3>${this.cardTitle}</h3>
          </div>
        </a>
      </fast-card>
    `;
  }

  renderMicroCard() {
    return html`
      <fast-card
        class="${classMap({
          featured: this.featured || this.className.includes('featured'),
          [AppCardModes.default]: this.className.includes(AppCardModes.default),
          [AppCardModes.blog]: this.className.includes(AppCardModes.blog),
          [AppCardModes.micro]: this.className.includes(AppCardModes.micro),
          [AppCardModes.microDescription]: this.className.includes(
            AppCardModes.microDescription
          ),
          [AppCardModes.contentCard]: this.className.includes(
            AppCardModes.contentCard
          ),
        })}"
        part="card"
        @click=${this.route}
      >
        <img
          src="${ifDefined(this.imageUrl)}"
          alt="${this.cardTitle} card header image"
        />
        <div class="content">
          <h3>${this.cardTitle}</h3>
        </div>
      </fast-card>
    `;
  }

  renderMicroDescriptionCard() {
    return html`
      <fast-card
        class="${classMap({
          featured: this.featured || this.className.includes('featured'),
          [AppCardModes.default]: this.className.includes(AppCardModes.default),
          [AppCardModes.blog]: this.className.includes(AppCardModes.blog),
          [AppCardModes.micro]: this.className.includes(AppCardModes.micro),
          [AppCardModes.microDescription]: this.className.includes(
            AppCardModes.microDescription
          ),
          [AppCardModes.contentCard]: this.className.includes(
            AppCardModes.contentCard
          ),
        })}"
        part="card"
        @click=${this.route}
      >
        <img
          src="${ifDefined(this.imageUrl)}"
          alt="${this.cardTitle} card header image"
        />
        <div class="content">
          <h3>${this.cardTitle}</h3>
          <p>${this.description}</p>
        </div>
      </fast-card>
    `;
  }

  renderContentCard() {
    return html`<fast-card
      class="${classMap({
        featured: this.featured || this.className.includes('featured'),
        [AppCardModes.default]: this.className.includes(AppCardModes.default),
        [AppCardModes.blog]: this.className.includes(AppCardModes.blog),
        [AppCardModes.micro]: this.className.includes(AppCardModes.micro),
        [AppCardModes.microDescription]: this.className.includes(
          AppCardModes.microDescription
        ),
        [AppCardModes.contentCard]: this.className.includes(
          AppCardModes.contentCard
        ),
      })}"
      part="card"
    >
      <div class="header">
        <h3>${this.cardTitle}</h3>
        <p>${this.description}</p>
      </div>
      ${this.isActionCard
        ? html`<div>
            <app-button>${this.linkText}</app-button>
          </div>`
        : html``}
    </fast-card>`;
  }
  renderShareButton() {
    return html`
      <fast-button
        class="share link"
        appearance="lightweight"
        @click=${this.share}
      >
        <span class="share-button-text">SHARE</span>
      </fast-button>
    `;
  }

  renderTagList() {
    return this.tags.map(
      tag => html`<fast-badge class="tag">${tag}</fast-badge>`
    );
  }

  share() {
    console.log('share');
  }

  route() {
    if (this.linkRoute) {
      window.open(this.linkRoute, '_blank');
    }
  }
}
