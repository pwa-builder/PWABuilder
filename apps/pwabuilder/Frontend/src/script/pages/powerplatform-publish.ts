import { LitElement, html } from 'lit';
import { customElement} from 'lit/decorators.js';
import { powerplatformPublishStyles } from "./powerplatform-publish.styles";

import '../components/app-header';
import '../components/publish-pane';
import '../components/test-publish-pane';

import { getManifest } from '../services/manifest';
import { Router } from '@vaadin/router';
import '@awesome.me/webawesome/dist/components/skeleton/skeleton.js';


@customElement('powerplatform-publish')
export class AppReport extends LitElement {

  static styles = [powerplatformPublishStyles];

  async firstUpdated() {
    const search = new URLSearchParams(location.search);
    const site = search.get('site');
    if (site) {
      if (await getManifest(site)) {
        this.openPublishModal();
      } else {
        Router.go(`/reportcard?site=${site}`);
      }
    } else {
      Router.go('/');
    }
  }

  delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async openPublishModal() {
    let dialog: any = this.shadowRoot!.querySelector("publish-pane")!.shadowRoot!.querySelector(".dialog");

    dialog.open = true;
  }

  render() {
    return html`
      <app-header></app-header>
      <div id="report-wrapper">
      <div class="skeleton-shapes">
        <wa-skeleton effect="pulse" class="square"></wa-skeleton>
        <wa-skeleton effect="pulse" class="circle"></wa-skeleton>
        <wa-skeleton effect="pulse" class="triangle"></wa-skeleton>
        <wa-skeleton effect="pulse" class="cross"></wa-skeleton>
        <wa-skeleton effect="pulse" class="comment"></wa-skeleton>
      </div>
      </div>

      <publish-pane .preventClosing=${true}></publish-pane>
    `;
  }
}
