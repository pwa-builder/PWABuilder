import { LitElement, css, html, customElement } from 'lit-element';
import { runAllTests } from '../services/tests';

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
    const site = search.get('site');

    if (site) {
      const testResults = await runAllTests(site);
      console.log(testResults);
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
