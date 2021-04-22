import {
  LitElement,
  css,
  html,
  customElement,
  property,
  internalProperty,
} from 'lit-element';
import { Icon, Lazy } from '../utils/interfaces';
import { AppButtonElement } from '../utils/interfaces.components';

import './app-button';

@customElement('app-button')
export class AppGallery extends LitElement {
  @property({ type: Array }) images: Lazy<Array<Icon>>;
  @property({ type: Number }) index = 0;

  static get styles() {
    return css`
      :host {
      }
    `;
  }

  constructor() {
    super();
  }

  render() {
    return html`
      <div class="gallery ${this.className}">
        <app-button
          @click=${this.navigateBack}
          .disabled=${this.backDisabled()}
        >
          <ion-icon name="chevron-back-outline"></ion-icon>
        </app-button>
        <span class="image-container">
          <img .src=${this.images[this.index].src} />
        </span>
        <app-button
          @click=${this.navigateForward}
          .disabled=${this.forwardDisabled()}
        >
          <ion-icon name="chevron-forward-outline"></ion-icon>
        </app-button>
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
    return this.index == this.images.length - 1;
  }
}
