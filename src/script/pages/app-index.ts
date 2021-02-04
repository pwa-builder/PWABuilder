import { BreakpointValues } from './../utils/breakpoints';
import { classMap } from 'lit-html/directives/class-map';
import { styleMap } from 'lit-html/directives/style-map';
import { LitElement, css, html, customElement } from 'lit-element';

import { Router } from '@vaadin/router';
import './app-home';
import './app-report';
import '../components/app-sidebar';
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

      #container {
        display: grid;
        margin: 0 auto;
        height: 100%;
        position: relative;
        grid-template-rows: minmax(71px, auto);
      }

      .sidebar-layout {
        grid-template-areas:
          'header'
          'main';
      }

      .no-sidebar-layout {
        grid-template-columns: auto;
        grid-template-areas:
          'header'
          'main';
      }

      @media (min-width: ${BreakpointValues.largeUpper}px) {
        .sidebar-layout {
          grid-template-columns: minmax(280px, auto);
          grid-template-areas:
            'header header'
            'sidebar main';
        }
      }

      #container > .header {
        grid-area: header;
      }

      #container > .sidebar {
        grid-area: sidebar;
      }

      #container > .main {
        grid-area: main;
      }
    `;
  }

  constructor() {
    super();
  }

  getParsedUrl() {
    const parsedUrl = new URL(window?.location?.href);
    return parsedUrl;
  }

  isHomePage() {
    return this.getParsedUrl().pathname === '/';
  }

  classMap() {
    return classMap({
      'no-sidebar-layout': this.isHomePage(),
      'sidebar-layout': !this.isHomePage(),
    });
  }

  styleMap() {
    return {
      display: this.isHomePage() ? 'none' : 'block',
    };
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
        ],
      } as any,
    ]);
  }

  render() {
    return html`
      <div id="container" class=${this.classMap()}>
        <app-header class="header" part="header"></app-header>
        <app-sidebar
          class="sidebar"
          style="${styleMap(this.styleMap())}"
        ></app-sidebar>
        <main class="main">
          <div id="router-outlet"></div>
        </main>
      </div>
    `;
  }
}
