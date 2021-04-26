import { LitElement, css, html, customElement } from 'lit-element';
import { Router } from '@vaadin/router';
import './app-home';
import './app-report';

import '../components/app-footer';
import '../components/app-header';

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

      #router-otlet > .entering {
        animation: 160ms fadeIn linear;
      }

      @media(min-width: 1920px) {
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
  }

  firstUpdated() {
    // this method is a lifecycle even in lit-element
    // for more info check out the lit-element docs https://lit-element.polymer-project.org/guide/lifecycle

    // For more info on using the @vaadin/router check here https://vaadin.com/router
    const router = new Router(this.shadowRoot?.querySelector('#router-outlet'));
    router.setRoutes([
      // temporarily cast to any because of a Type bug with the router
      {
        path: '',
        animate: true,
        children: [
          { path: '/', component: 'app-home' },
          {
            path: '/testing',
            component: 'app-testing',
            action: async () => {
              await import('./app-testing.js');
            },
          },
          {
            path: '/reportcard',
            component: 'app-report',
          },
          {
            path: '/publish',
            component: 'app-publish',
            action: async () => {
              await import('./app-publish');
            },
          },
          {
            path: '/basepackage',
            component: 'app-basepack',
            action: async () => {
              await import('./app-basepack');
            }
          },
          {
            path: '/congrats',
            component: 'app-congrats',
            action: async () => {
              await import('./app-congrats');
            }
          }
        ],
      } as any,
    ]);
  }

  render() {
    return html`
      <div>
        <main>
          <div id="router-outlet"></div>
        </main>

        <app-footer></app-footer>
      </div>
    `;
  }
}
