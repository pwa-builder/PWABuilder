import { LitElement, css, html, customElement } from 'lit-element';

@customElement('resource-hub')
export class ResourceHub extends LitElement {

  static get styles() {
    return css`
      
    `;
  }

  constructor() {
    super();
  }

  render() {
    return html`
      <section>
        <h4>PWABuilder Resource Hub</h4>
      </section>
    `;
  }
}
