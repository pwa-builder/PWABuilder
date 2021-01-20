import { LitElement, css, html, customElement } from 'lit-element';
import { testManifest } from '../services/tests/manifest';
import { testSecurity } from '../services/tests/security';
import { testServiceWorker } from '../services/tests/service-worker';

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
      console.log("manifest test results", manifestTestresults);

      const swTestResults = await testServiceWorker(site);
      console.log("sw test results", swTestResults);

      const securityTestResults = await testSecurity(site);
      console.log("security test results", securityTestResults);
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
