import { LitElement, css, html } from 'lit';
import { customElement, property, state, query } from 'lit/decorators.js';
import { Lazy } from '../utils/interfaces';

import './app-modal';
import './app-button';

@customElement('app-gallery')
export class AppGallery extends LitElement {
  @property({ attribute: 'images', type: Array }) images: Lazy<Array<string>>;
  @property({ type: Number }) index = 0;
  @state() modalOpened = false;

  @query('.gallery') gallery: Lazy<HTMLElement>;

  static get styles() {
    return css`
      :host {
      }

      .gallery {
        display: flex;
        flex-direction: row;
        vertical-align: middle;
        align-items: center;
      }

      .image-container,
      .image-container img {
        max-height: 216px;
        max-width: 344px;
      }
    `;
  }

  get currentImage() {
    if (!this.images) {
      return undefined;
    }

    return this.images[this.index] ?? undefined;
  }

  constructor() {
    super();
  }

  render() {
    return html`
      <div class="gallery ${this.className}">
        <app-button
          class="round"
          @click=${this.navigateBack}
          ?disabled=${this.backDisabled()}
        >
          <ion-icon name="chevron-back-outline"></ion-icon>
        </app-button>
        <div class="image-container" @click=${this.openModal}>
          <img
            class="current-image"
            alt="current image selected"
            decoding="async"
            loading="lazy"
            src=${this.currentImage}
          />
        </div>
        <app-button
          class="round"
          @click=${this.navigateForward}
          ?disabled=${this.forwardDisabled()}
        >
          <ion-icon name="chevron-forward-outline"></ion-icon>
        </app-button>
        <app-modal
          ?open=${this.modalOpened}
          @app-modal-close=${this.closeModal}
        >
          <img
            slot="modal-image"
            class="modal-image"
            alt="current image selected in a modal"
            decoding="async"
            loading="lazy"
            src=${this.currentImage}
          />
          <div slot="modal-actions">
            <app-button @click=${this.closeModal}> Close </app-button>
          </div>
        </app-modal>
      </div>
    `;
  }

  navigateBack() {
    if (!this.backDisabled()) {
      this.index -= 1;
    }
  }

  navigateForward() {
    if (!this.forwardDisabled()) {
      this.index += 1;
    }
  }

  backDisabled() {
    return this.index <= 0;
  }

  forwardDisabled() {
    if (this.images) {
      return this.index >= this.images.length - 1;
    } else {
      // no images so we are going to disable going forward
      return false;
    }
  }

  openModal() {
    this.modalOpened = true;
  }

  closeModal() {
    this.modalOpened = false;
  }
}
