/* eslint-disable no-fallthrough */
import { LitElement, css, html, customElement, property } from 'lit-element';
import { classMap } from 'lit-html/directives/class-map';
import { Router } from '@vaadin/router';

export enum AppCardModes {
  default = 'default',
  blog = 'blog',
  micro = 'micro',
}

@customElement('app-card')
export class AppCard extends LitElement {
  @property({ type: String }) modes = AppCardModes.default;

  @property({ attribute: 'bordered', type: Boolean })
  imageBordered = undefined;
  @property({ type: String }) imageUrl = undefined;
  @property({ type: String }) title = undefined;
  @property({ type: String }) description = undefined;
  @property({ type: String }) date = undefined;
  @property({ type: String }) linkText = undefined;
  @property({ type: String }) linkRoute = undefined;
  @property({ type: Boolean }) shareLink = false;

  static get styles() {
    const defaultCardCss = css`
      fast-card {
        color: var(--font-color);
        font-size: var(--font-size);
        background: white;
        min-width: 278px;
        max-width: 416px;
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

      .img-overlay {
        position: fixed;
      }

      .img-overlay,
      fast-card img {
        width: 100%;
        object-fit: none;
        max-height: 184px;
      }

      .img-overlay.bordered,
      fast-card img.bordered {
        margin: 16px;
        width: calc(100% - 32px);
      }

      fast-card .card-actions {
        margin: 0 16px;
      }
    `;

    const blogCardCss = css`
      fast-card.blog {
      }
    `;

    const microCardCss = css`
      fast-card.micro {
        display: grid;
        width: 280px;
        margin: 16px;

        grid-template-columns: 72px auto;
      }

      fast-card.micro img {
        object-fit: fill;
        height: 72px;
        width: 73px;
      }

      fast-card.micro .content {
        display: inline-flex;
        flex-direction: column;
        justify-content: space-between;
        margin: 8px;
      }

      fast-card.micro h3 {
        margin: 0;
        line-height: 20px;
        font-size: 14px;
      }

      fast-card.micro p {
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
        background: var(--primary-color);
        display: flex;
        color: white;
        justify-content: center;
      }

      ${defaultCardCss}
      ${blogCardCss}
      ${microCardCss}
    `;
  }

  constructor() {
    super();
  }

  render() {
    switch (this.modes) {
      case AppCardModes.blog:
      // return this.renderBlogCard();
      case AppCardModes.micro:
        return this.renderMicroCard();
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
          >
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
          <p>${this.description}</p>
        </div>
      </fast-card>
    `;
  }

  imageClasses() {
    return classMap({
      bordered: this.imageBordered,
    });
  }
}
