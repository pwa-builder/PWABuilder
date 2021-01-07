import { LitElement, css, html, customElement } from 'lit-element';

@customElement('app-about')
export class AppAbout extends LitElement {
  static get styles() {
    return css``;
  }

  constructor() {
    super();
  }

  render() {
    return html`
      <div>
        <h2>About Page</h2>
      </div>
    `;
  }
}
