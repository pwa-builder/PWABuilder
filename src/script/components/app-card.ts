/* eslint-disable no-fallthrough */
import { LitElement, css, html, customElement, property } from 'lit-element';
import { Router } from '@vaadin/router';

export enum AppCardModes {
  default = 'default',
  blog = 'blog',
  micro = 'micro',
}

@customElement('app-card')
export class AppCard extends LitElement {
  @property({ type: String }) modes = AppCardModes.default;

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
      }

      fast-card .card-actions {
      }
    `;

    const blogCardCss = css`
      fast-card.blog {
      }
    `;

    const microCardCss = css`
      fast-card.micro {
      }
    `;

    return css`
      :host {
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
      // return this.renderMicroCard();
      case AppCardModes.default:
      default:
        return this.renderDefault();
    }
  }

  renderDefault() {
    return html`
      <fast-card class="default" part="card">
        <img src="${this.imageUrl}" alt="${this.title} card header image" />
        <h3>${this.title}</h3>
        <p>${this.description}</p>

        <div class="card-actions">
          <fast-button
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
      <fast-card class="micro" part="card">
        <img src="${this.imageUrl}" alt="${this.title} card header image" />
        <h3>${this.title}</h3>
      </fast-card>
    `;
  }

  renderBlogCard() {
    return html``;
  }
}
