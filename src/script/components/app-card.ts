/* eslint-disable no-fallthrough */
import { LitElement, css, html, customElement, property } from 'lit-element';
import { classMap } from 'lit-html/directives/class-map';
import { Router } from '@vaadin/router';
import { BreakpointValues, largeBreakPoint } from '../utils/breakpoints';
export enum AppCardModes {
  default = 'default',
  blog = 'blog',
  micro = 'micro',
  microDescription = 'micro-description',
  contentCard = 'content-card',
}

@customElement('app-card')
export class AppCard extends LitElement {
  @property({ type: String }) mode = AppCardModes.default;

  @property({ attribute: 'bordered', type: Boolean })
  imageBordered = undefined;
  @property({ type: String }) imageUrl = undefined;
  @property({ type: String }) title = undefined;
  @property({ type: String }) description = undefined;
  @property({ type: String }) date = undefined;
  @property({ type: String }) linkText = undefined;
  @property({ type: String }) linkRoute = undefined;

  @property({ type: Boolean }) featured = false;
  @property({ type: Boolean }) shareLink = false;
  @property({ type: Array }) tags = [];
  @property({ type: Boolean }) isActionCard = false;

  static get styles() {
    const defaultCardCss = css`
      fast-card {
        color: var(--font-color);
        font-size: var(--font-size);
        background: white;
        min-width: 278px;
        max-width: 416px;
        margin: 16px;
      }

      fast-card.default {
        margin-right: 12px;
        margin-left: 12px;
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

      fast-card .card-actions {
        margin: 0 16px;
      }

      fast-card .tag-list {
        display: inline-block;
      }
    `;

    const overlayCss = css`
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
        margin: 16px;
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
        height: calc(100% - 16px);
      }
    `;

    const blogCardCss = css`
      .blog {
        color: var(--font-color);
      }

      .blog h3 {
        line-height: 34px;
      }

      .blog .content {
        display: flex;
        flex-direction: row;
        justify-content: space-between;

        padding: 8px;
      }

      .blog .content h3 {
        font-size: 18px;
        margin: 0;
      }

      .blog.featured h3 {
        font-size: 30px;
      }

      .blog.featured p {
        font-size: 18px;
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

      app-button.share::part(underlying-button) {
        font-size: 14px;
        color: var(--font-color);
      }

      .blog .tag,
      .blog .date,
      .blog .share::part(underlying-button) {
        display: inline-block;
        line-height: 34px;
        font-size: var(--desktop-button-font-size);
        vertical-align: middle;
      }

      fast-badge::part(control) {
        --badge-fill-primary: white;
        color: var(--font-color);
      }
    `;

    const microCardCss = css`
      .micro {
        display: grid;
        width: 280px;
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
        line-height: 20px;
        font-size: 14px;
      }

      .micro p {
        overflow: hidden;
        text-overflow: ellipsis;
        height: 32px;
        margin: 0;

        line-height: 16px;
        font-size: 12px;
      }
    `;

    const contentCardcss = css`
      :host {
        background: white;
        display: flex;
        color: var(--primary-color);
        justify-content: center;
      }

      fast-card.content-card {
        background-color: white;
        padding: 1rem 0;
        width: min(1024px, 100%);
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

      ${largeBreakPoint(
        css`
          fast-card.content-card {
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
      )}
    `;

    return css`
      :host {
        background: var(--primary-color);
        display: flex;
        color: white;
        justify-content: center;
      }

      ${defaultCardCss}
      ${overlayCss}
      ${blogCardCss}
      ${microCardCss}
      ${contentCardcss}
    `;
  }

  constructor() {
    super();
  }

  render() {
    switch (this.mode) {
      case AppCardModes.blog:
        return this.renderBlogCard();
      case AppCardModes.micro:
        return this.renderMicroCard();
      case AppCardModes.microDescription:
        return this.renderMicroDescriptionCard();
      case AppCardModes.contentCard:
        return this.renderContentCard();
      case AppCardModes.default:
      default:
        return this.renderDefault();
    }
  }

  renderDefault() {
    return html`
      <fast-card class="default" part="card">
        <div class="img-overlay ${this.imageClasses()}">
          <slot name="overlay"></slot>
        </div>
        <img
          class=${this.imageClasses()}
          src="${this.imageUrl}"
          alt="${this.title} card header image"
        />
        <h3>${this.title}</h3>
        <p>${this.description}</p>

        <div class="card-actions">
          <app-button
            appearance="lightweight"
            @click=${() => Router.go(this.linkRoute)}
            >View ${this.title}</fast-button
          ></app-button>
        </div>
      </fast-card>
    `;
  }

  renderBlogCard() {
    // Featured Card Html
    if (this.featured && window.innerWidth > BreakpointValues.mediumUpper) {
      // TODO featured card
      return html`
        <fast-card class="blog featured" part="card">
          <div class="img-overlay">
            <div class="overlay-top">
              <span class="date">${this.date}</span>
              ${this.renderShareButton()}
            </div>
            <h3>${this.title}</h3>
            <p>${this.description}</p>
            <slot name="overlay"></slot>

            <div class="tag-list">${this.renderTagList()}</div>
          </div>
          <img src="${this.imageUrl}" alt="${this.title} card header image" />
        </fast-card>
      `;
    }

    return html`
      <fast-card class="blog" part="card">
        <div class="img-overlay">
          <div class="overlay-top">
            <span class="date">${this.date}</span>
            <div class="tag-list">${this.renderTagList()}</div>
          </div>
          <slot name="overlay"></slot>
        </div>
        <img src="${this.imageUrl}" alt="${this.title} card header image" />
        <div class="content">
          <h3>${this.title}</h3>
          ${this.renderShareButton()}
        </div>
      </fast-card>
    `;
  }

  renderMicroCard() {
    return html`
      <fast-card
        class="micro"
        part="card"
        @click=${() => Router.go(this.linkRoute)}
      >
        <img src="${this.imageUrl}" alt="${this.title} card header image" />
        <div class="content">
          <h3>${this.title}</h3>
        </div>
      </fast-card>
    `;
  }

  renderMicroDescriptionCard() {
    return html`
      <fast-card
        class="micro micro-description"
        part="card"
        @click=${() => Router.go(this.linkRoute)}
      >
        <img src="${this.imageUrl}" alt="${this.title} card header image" />
        <div class="content">
          <h3>${this.title}</h3>
          <p>${this.description}</p>
        </div>
      </fast-card>
    `;
  }

  renderContentCard() {
    return html` <fast-card class="content-card" part="card">
      <div class="header">
        <h3>${this.title}</h3>
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
      <app-button class="share" appearance="lightweight" @click=${this.share}>
        Share
      </app-button>
    `;
  }

  renderTagList() {
    return this.tags.map(
      tag => html` <fast-badge class="tag">${tag}</fast-badge> `
    );
  }

  share() {
    console.log('share');
  }

  imageClasses() {
    return classMap({
      bordered: this.imageBordered,
    });
  }
}
