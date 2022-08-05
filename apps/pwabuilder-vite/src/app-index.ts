import { LitElement, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { Router, Route } from '@vaadin/router';
import './script/pages/app-home';

import './script/components/app-footer';
import './script/components/app-header';
import './script/components/app-button';
import './script/components/cookie-banner';
import './script/components/summit-banner';
import './script/components/discord-box';
import { recordPageView } from './script/utils/analytics';

@customElement('app-index')
export class AppIndex extends LitElement {
  static get styles() {
    return css`
      #router-outlet > * {
        width: 100% !important;
      }

      #router-outlet > .leaving {
        animation: 160ms fadeOut ease-in-out;
      }

      #router-outlet > .entering {
        animation: 160ms fadeIn linear;
      }

      #router-outlet {
        position: relative;
      }

      #wrapper {
        display: flex;
        min-height: 100vh;
        flex-direction: column;
      }

      #content {
        flex: 1;
        background-color: rgb(242, 243, 251);
      }

      @media (min-width: 1920px) {
        #router-outlet {
          background: var(--primary-purple);
        }
      }

      @keyframes fadeOut {
        from {
          opacity: 1;
        }

        to {
          opacity: 0;
        }
      }

      @keyframes fadeIn {
        from {
          opacity: 0.2;
        }

        to {
          opacity: 1;
        }
      }
      /* To handle sidebar & main */
      .container {
        display: grid;
        grid-template-columns: minmax(280px, auto);
        grid-template-areas: 'sidebar main';
        margin: 0 auto;
        height: 100%;
        position: relative;
      }
      .container > .main {
        width: calc(100vw - 280px);
        grid-area: main;
      }
      .container > .sidebar {
        grid-area: sidebar;
      }
    `;
  }

  constructor() {
    super();

    window.addEventListener('vaadin-router-location-changed', ev => {
      window.scrollTo({ top: 0, behavior: 'smooth' });

      recordPageView(
        ev.detail.location.pathname, // path
        ev.detail.location.route?.component // page name
      );
    });

    console.info('[VI]{version} - {date}[/VI]');
  }

  firstUpdated() {
    // this method is a lifecycle even in lit-element
    // for more info check out the lit-element docs https://lit-element.polymer-project.org/guide/lifecycle

    // For more info on using the @vaadin/router check here https://vaadin.com/router
    const router = new Router(this.shadowRoot?.querySelector('#router-outlet'));
    router.setRoutes([
      {
        path: '',
        animate: true,
        children: [
          { path: '/', component: 'app-home' },
          {
            path: '/testing',
            component: 'app-testing',
            action: async () => {
              await import('./script/pages/app-testing.js');
            },
          },
          {
            path: '/reportcard',
            component: 'app-report',
            action: async () => {
              await import('./script/pages/app-report.js');
            },
          },
          {
            path: '/publish',
            component: 'app-publish',
            action: async () => {
              await import('./script/pages/app-publish.js');
            },
          },
          {
            path: '/basepackage',
            component: 'app-basepack',
            action: async () => {
              await import('./script/pages/app-basepack.js');
            },
          },
          {
            path: '/congrats',
            component: 'app-congrats',
            action: async () => {
              await import('./script/pages/app-congrats.js');
            },
          },
          {
            path: 'imageGenerator',
            component: 'image-generator',
            action: async () => {
              await import('./script/pages/image-generator.js');
            },
          },
          {
            path: '/portals',
            component: 'portals-publish',
            action: async () => {
              await import('./script/pages/portals-publish.js');
            },
          },
        ] as Route[],
      },
    ]);
  }

  render() {
    return html`
      <div id="wrapper">
        <summit-banner></summit-banner>
        <!--required cookie banner-->
        <cookie-banner></cookie-banner>

        <div id="content">
          <div id="router-outlet"></div>
        </div>
        <discord-box></discord-box>
        <app-footer></app-footer>
      </div>

    `;
  }
}
