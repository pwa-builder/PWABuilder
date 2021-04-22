import {
  LitElement,
  css,
  html,
  customElement,
  property,
  internalProperty,
  query,
} from 'lit-element';
import { Lazy } from '../utils/interfaces';

import './app-modal';
import './app-button';

@customElement('app-gallery')
export class AppGallery extends LitElement {
  @property({ attribute: 'images', type: Array }) images: Lazy<Array<string>>;
  @property({ type: Number }) index = 0;
  @internalProperty() modalOpened = false;

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

      .image-container {
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
        <span class="image-container" @click=${this.openModal}>
          <!-- <img
            class="current-image"
            decoding="async"
            loading="lazy"
            .src=${this.currentImage}
          /> -->
          <div style="background-color: red; width: 100px; height: 100px">
            ${this.index}
          </div>
        </span>
        <app-button
          class="round"
          @click=${this.navigateForward}
          ?disabled=${this.forwardDisabled()}
        >
          <ion-icon name="chevron-forward-outline"></ion-icon>
        </app-button>
        <app-modal ?open=${this.modalOpened}>
          <!-- <img
            slot="modal-image"
            class="modal-image"
            decoding="async"
            loading="lazy"
            .src=${this.currentImage}
          /> -->
          <div style="background-color: red; width: 100px; height: 100px">
            ${this.index}
          </div>
          <div slot="modal-actions">
            <app-button @click=${this.closeModal}> Close </app-button>
          </div>
        </app-modal>
      </div>
    `;
  }

  navigateBack() {
    this.index -= 1;
  }

  navigateForward() {
    this.index += 1;
  }

  backDisabled() {
    return this.index === 0;
  }

  forwardDisabled() {
    return this.index == this.images?.length - 1;
  }

  openModal() {
    this.modalOpened = true;
  }

  closeModal() {
    this.modalOpened = false;
  }
}
