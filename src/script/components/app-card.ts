/* eslint-disable no-fallthrough */
import { LitElement, css, html, customElement, property } from 'lit-element';
import { classMap } from 'lit-html/directives/class-map';
import { Router } from '@vaadin/router';
import {
  smallBreakPoint,
  mediumBreakPoint,
  largeBreakPoint,
  BreakpointValues,
} from '../utils/breakpoints';

export enum AppCardModes {
  default = 'default',
  blog = 'blog',
  micro = 'micro',
  microDescription = 'micro-description',
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

  static get styles() {
    const defaultCardCss = css`
      fast-card {
        color: var(--font-color);
        font-size: var(--font-size);
        background: white;
        border-radius: calc(var(--corner-radius) * 1px);
        min-width: 278px;
        max-width: 416px;
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

      .card-actions app-button::part(underlying-button) {
        font-weight: bold;
        font-size: 14px;
        line-height: 20px;
        color: var(--link-color);
        padding: 0;
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
    `;

    const blogCardCss = css`
      .blog {
        background: white;
        color: var(--font-color);
        padding-bottom: 16px;
      }

      .blog img {
        height: 142px;
        width: 100%;
        object-fit: none;
        height: 200px;
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
        font-size: 18px;
        margin: 0;
      }

      .blog.featured {
        padding: 0;
      }

      .blog.featured h3 {
        line-height: 34px;
        font-size: 30px;
        margin: 16px 0 8px 0;
      }

      .blog.featured p {
        font-size: 18px;
        line-height: 34px;
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

      .blog.featured .tag-list .tag {
        margin: 8px 0 0 8px;
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

      .blog .share::part(underlying-button),
      .blog .tag::part(control) {
        color: var(--font-color);
      }

      .blog .img-overlay .date,
      .blog .img-overlay .tag::part(underlying-button),
      .blog .img-overlay .share::part(underlying-button),
      .blog .content .share::part(underlying-button) {
        display: inline-block;
        font-size: var(--desktop-button-font-size);
      }

      .blog.featured fast-badge::part(control) {
        --badge-fill-primary: white;
        color: var(--font-color);
      }

      fast-badge::part(control) {
        --badge-color-dark: var(--font-color);
        --badge-fill-primary: white;
        color: var(--font-color);
      }

      ${smallBreakPoint(
        css`
          .blog {
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
          .blog {
            margin-bottom: 32px;
          }
        `
      )}

      ${largeBreakPoint(
        css`
          .blog.featured {
            grid-area: 1 / 1 / 3 / 4;
            max-width: 612px;
          }

          .blog {
            grid-column: 4 / 6;
            max-width: 425px;
          }

          .blog .img-overlay {
            height: 142px;
          }
        `
      )}
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

    return css`
      :host {
        display: flex;
        color: white;
        justify-content: center;
      }

      ${defaultCardCss}
      ${overlayCss}
      ${blogCardCss}
      ${microCardCss}
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
