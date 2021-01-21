import { LitElement, css, html, customElement } from 'lit-element';
import { testManifest } from '../services/tests/manifest';
import { testServiceWorker } from '../services/tests/service-worker';

// double import needed to get full impl
// and type
import '../components/app-alert';
import { AppAlert } from '../components/app-alert';

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
      console.log('manifest test results', manifestTestresults);

      const swTestResults = await testServiceWorker(site);
      console.log('sw test results', swTestResults);
    }
  }

  testAlert(ev: any) {
    console.log(ev);
    const alert: AppAlert | null | undefined = this.shadowRoot?.querySelector("app-alert");

    if (alert) {
      alert.openAlert(ev.clientX, ev.clientY);
    }
  }

  render() {
    return html`
      <div>
        <h2>About Page</h2>

        <fast-button @click="${(ev: any) => this.testAlert(ev)}">test alert</fast-button>

        <app-alert title="Test Alert">
          <p>Info description. Lorem ipsum dolor sit amet, consectetur elit adipiscing, sed do eiusm tem. Ipsum dolor sit.</p>

          <fast-anchor slot="actions">Test</fast-anchor>
        </app-alert>
      </div>
    `;
  }
}
