import { LitElement, css, html } from 'lit';
import { customElement} from 'lit/decorators.js';

import '../components/app-header';
import '../components/publish-pane';
import '../components/test-publish-pane';

import { getManifest } from '../services/manifest';
import { Router } from '@vaadin/router';

@customElement('powerplatform-publish')
export class AppReport extends LitElement {

  static get styles() {
    return [
      css`
        * {
          box-sizing: border-box;
          font-family: inherit;
        }

        app-header::part(header) {
          position: sticky;
          top: 0;
        }


        #report-wrapper {
          width: 100%;
          display: flex;
          flex-direction: column;
          row-gap: 1.5em;
          align-items: center;
          background-color: #f2f3fb;
          padding: 20px;
        }
        #content-holder {
          max-width: 1300px;
          width: 100%;
          display: flex;
          flex-flow: row wrap;
          gap: 1em;
        }

        .skeleton-shapes sl-skeleton {
          display: inline-flex;
          width: 50px;
          height: 50px;
        }

        .skeleton-shapes .square::part(indicator) {
          --border-radius: var(--sl-border-radius-medium);
        }

        .skeleton-shapes .circle::part(indicator) {
          --border-radius: var(--sl-border-radius-circle);
        }

        .skeleton-shapes .triangle::part(indicator) {
          --border-radius: 0;
          clip-path: polygon(50% 0, 0 100%, 100% 100%);
        }

        .skeleton-shapes .cross::part(indicator) {
          --border-radius: 0;
          clip-path: polygon(
            20% 0%,
            0% 20%,
            30% 50%,
            0% 80%,
            20% 100%,
            50% 70%,
            80% 100%,
            100% 80%,
            70% 50%,
            100% 20%,
            80% 0%,
            50% 30%
          );
        }

        .skeleton-shapes .comment::part(indicator) {
          --border-radius: 0;
          clip-path: polygon(0% 0%, 100% 0%, 100% 75%, 75% 75%, 75% 100%, 50% 75%, 0% 75%);
        }

        .skeleton-shapes sl-skeleton:not(:last-child) {
          margin-right: 0.5rem;
        }

      `,
    ];
  }

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

    await dialog.show()
  }

  render() {
    return html`
      <app-header></app-header>
      <div id="report-wrapper">
      <div class="skeleton-shapes">
        <sl-skeleton effect="pulse" class="square"></sl-skeleton>
        <sl-skeleton effect="pulse" class="circle"></sl-skeleton>
        <sl-skeleton effect="pulse" class="triangle"></sl-skeleton>
        <sl-skeleton effect="pulse" class="cross"></sl-skeleton>
        <sl-skeleton effect="pulse" class="comment"></sl-skeleton>
      </div>
      </div>

      <publish-pane .preventClosing=${true}></publish-pane>
    `;
  }
}
