import { LitElement, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { Router, Route } from '@vaadin/router';
import { isUserLoggedIn, signInUser, signOutUser } from '../services/sign-in';
import './app-home';

import '../components/app-footer';
import '../components/app-header';
import '../components/app-button';
import '../components/cookie-banner';
import '../components/discord-box';
import { recordPageView } from '../utils/analytics';

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

      #user-dashboard {
        visibility: false;
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

  private dashboardClick() {
    Router.go('/userDashboard');
  }

  firstUpdated() {
    // this method is a lifecycle even in lit-element
    // for more info check out the lit-element docs https://lit-element.polymer-project.org/guide/lifecycle

    // For more info on using the @vaadin/router check here https://vaadin.com/router
    const router = new Router(this.shadowRoot?.querySelector('#router-outlet'));
    const pwaAuth = this.shadowRoot?.querySelector('#signin');
    console.log('Inside first updated');
    pwaAuth?.addEventListener('signin-completed', async ev => {
      const signIn = ev;
      console.log('ev', ev);
      const token = (signIn as any).detail.providerData.accessToken;
      if (!isUserLoggedIn()) {
        signInUser(token, true);
      } else {
        signInUser(token, false);
      }
      (
        this.shadowRoot?.querySelector('#user-dashboard') as HTMLButtonElement
      ).style.visibility = 'true';
      this.setNameAfterLogin(pwaAuth, signIn);
    });

    pwaAuth?.addEventListener('signout-completed', async ev => {
      this.requestUpdate();
      signOutUser();
      this.resetSignInAfterLogout(pwaAuth);
    });

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
              await import('./app-testing.js');
            },
          },
          {
            path: '/reportcard',
            component: 'app-report',
            action: async () => {
              await import('./app-report.js');
            },
          },
          {
            path: '/publish',
            component: 'app-publish',
            action: async () => {
              await import('./app-publish.js');
            },
          },
          {
            path: '/basepackage',
            component: 'app-basepack',
            action: async () => {
              await import('./app-basepack.js');
            },
          },
          {
            path: '/congrats',
            component: 'app-congrats',
            action: async () => {
              await import('./app-congrats.js');
            },
          },
          {
            path: 'imageGenerator',
            component: 'image-generator',
            action: async () => {
              await import('./image-generator.js');
            },
          },
          {
            path: '/portals',
            component: 'portals-publish',
            action: async () => {
              await import('./portals-publish.js');
            },
          },
          {
            path: '/userDashboard',
            component: 'user-dashboard',
            action: async () => {
              await import('./user-dashboard.js');
            },
          },
        ] as Route[],
      },
    ]);
  }

  private setNameAfterLogin(pwaAuth: Element, signIn: Event) {
    const signInButton = pwaAuth?.shadowRoot?.querySelector('div > button');
    signInButton
      ? (signInButton.innerHTML = (signIn as any).detail.name)
      : null;
  }

  private resetSignInAfterLogout(pwaAuth: Element) {
    const signInButton = pwaAuth?.shadowRoot?.querySelector('div > button');
    signInButton ? (signInButton.innerHTML = 'Sign In') : null;
  }

  render() {
    return html`
      <div>
        <!--required cookie banner-->
        <cookie-banner></cookie-banner>
        <pwa-auth
          id="signin"
          microsoftkey="ce35509c-2864-42e6-90d2-ce25c3c536e9"
          credentialmode="silent"
        >
        </pwa-auth>
        <button id="user-dashboard" @click=${() => this.dashboardClick()}>
          User dashboard
        </button>
        <div>
          <div id="router-outlet"></div>
        </div>
        <discord-box></discord-box>
        <app-footer></app-footer>
      </div>
    `;
  }
}
