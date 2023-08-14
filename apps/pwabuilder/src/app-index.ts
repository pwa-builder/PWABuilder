import { LitElement, css, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { Router, Route } from '@vaadin/router';

import './shoelace';
import './script/pages/app-home';
import './script/components/app-footer';
import './script/components/app-header';
import './script/components/app-button';
//import './script/components/cookie-banner';
import './script/components/discord-box';
import { recordPageView } from './script/utils/analytics';

@customElement('app-index')
export class AppIndex extends LitElement {

  @state() pageName: string = '';

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
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('DOMContentLoaded', this.handlePageChange);
    window.addEventListener('popstate', this.handlePageChange);
  }

  disconnectedCallback() {
    window.removeEventListener('DOMContentLoaded', this.handlePageChange);
    window.removeEventListener('popstate', this.handlePageChange);
    super.disconnectedCallback();
  }

  handlePageChange = () => {
    
    var urlObj = new URL(location.href);

    // Get the pathname (page name)
    var pathname = urlObj.pathname;

    // Remove leading slash if present
    this.pageName = pathname.replace(/^\//, '');

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
            path: '/reportcard',
            component: 'app-report',
            action: async () => {
              await import('./script/pages/app-report.js');
            },
          },
          {
            path: '/portals', // used by the power platform team
            component: 'powerplatform-publish',
            action: async () => {
              await import('./script/pages/powerplatform-publish.js');
            },
          },
          {
            path: '/imageGenerator', // used by Edge dev tools
            component: 'image-generator',
            action: async () => {
              await import('./script/pages/image-generator.js');
            },
          },
          {

            path: '/congratulations/:token/:appurl/:appname/:appicon/:username/:email',
            component: 'token-congratulations',
            action: async () => {
              await import('./script/pages/qualification/token-congratulations.js');
            }
          },
          {

            path: '/congratulations/:token/:username/:email',
            component: 'token-congratulations',
            action: async () => {
              await import('./script/pages/qualification/token-congratulations.js');
            }
          },
          {
            path: '/freeToken', // token giveaway page
            component: 'app-token',
            action: async () => {
              await import('./script/pages/qualification/app-token.js');
            }
          }
        ] as Route[],
      },
    ]);
  }

  render() {
    return html`
      <div id="wrapper">
        <!-- cookie banner not required so long as we only have essential cookies -->
        <!-- <cookie-banner></cookie-banner> -->

        <div id="content">
          <div id="router-outlet"></div>
        </div>
        ${this.pageName === "freeToken" || this.pageName === "congratulations" ? null : html`<discord-box></discord-box>`}
        <app-footer></app-footer>
      </div>

    `;
  }
}
