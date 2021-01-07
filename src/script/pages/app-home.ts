import { LitElement, css, html, customElement } from 'lit-element';

import '../components/content-header';
import '../components/resource-hub';

// For more info on the @pwabuilder/pwainstall component click here https://github.com/pwa-builder/pwa-install
import '@pwabuilder/pwainstall';

@customElement('app-home')
export class AppHome extends LitElement {

  static get styles() {
    return css`

    `;
  }

  constructor() {
    super();
  }

  async firstUpdated() {
    // this method is a lifecycle even in lit-element
    // for more info check out the lit-element docs https://lit-element.polymer-project.org/guide/lifecycle
    console.log('This is your home page');
  }

  render() {
    return html`
      <content-header></content-header>

      <resource-hub></resource-hub>
    `;
  }
}
