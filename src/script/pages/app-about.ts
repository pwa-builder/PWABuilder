import { LitElement, css, html, customElement } from 'lit-element';
import { testManifest } from '../services/tests/manifest';

@customElement('app-about')
export class AppAbout extends LitElement {
  static get styles() {
    return css``;
  }

  constructor() {
    super();
  }

  async firstUpdated() {
    const search = new URLSearchParams(location.search);
    const site = search.get("site");

    if (site) {
      const manifestTestresults = await testManifest(site);
      console.log(manifestTestresults);
    }
  }

  render() {
    return html`
      <div>
        <h2>About Page</h2>
      </div>
    `;
  }
}
