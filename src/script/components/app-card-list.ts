import { LitElement, css, html, customElement, property } from 'lit-element';
import { classMap } from 'lit-html/directives/class-map';

type ResourceHubPages = 'home' | 'publish';

@customElement('app-card-list')
export class AppCardList extends LitElement {
  @property({ type: String }) pageName: ResourceHubPages = 'home';

  static get styles() {
    const resourceListCss = css`
      .cards-default {
        font-size: 40px;
      }

      .cards-blog {
      }

      .cards-resource {
      }
    `;

    const blogListCss = css``;

    return css`
      :host {
      }

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
        <header>
          <slot name="title"></slot>
          <slot name="description"></slot>
        </header>

        <slot id="cards" class="cards ${this.cardsClassMap()}" name="cards">
        </slot>

        <div class="actions">
          <slot name="action"></slot>
        </div>
      </section>
    `;
  }

  cardsClassMap() {
    return classMap({
      'cards-resource': false,
      'cards-blog': false,
    });
  }
}
