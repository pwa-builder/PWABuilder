import { LitElement, css, html, customElement, property } from 'lit-element';

export enum AppCardListModes {
  resource = 'resource',
  blog = 'blog',
}

@customElement('app-card-list')
export class AppCardList extends LitElement {
  @property({ type: String }) modes = AppCardListModes.resource;

  static get styles() {
    return css`
      ${resourceListCss}
      ${blogListCss}
    `;
  }

  constructor() {
    super();
  }

  render() {
    return html`
      <section>
        <slot name="title"></slot>
        <slot name="description"></slot>
      </section>
    `;
  }
}

const resourceListCss = css``;

const resourceListHtml = html``;

const blogListCss = css``;
