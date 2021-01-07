import { LitElement, css, html, customElement, property } from 'lit-element';

// For more info on the @pwabuilder/pwainstall component click here https://github.com/pwa-builder/pwa-install
import '@pwabuilder/pwainstall';

@customElement('app-home')
export class AppHome extends LitElement {
  // For more information on using properties in lit-element
  // check out this link https://lit-element.polymer-project.org/guide/properties#declare-with-decorators
  @property() message = 'Welcome!';

  static get styles() {
    return css`
      #welcomeBar {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
      }

      #welcomeBar fast-card {
        margin-bottom: 12px;
      }

      #welcomeCard,
      #infoCard {
        padding: 18px;
        padding-top: 0px;
      }

      pwa-install {
        position: absolute;
        bottom: 16px;
        right: 16px;
      }

      button {
        cursor: pointer;
      }

      @media (min-width: 1200px) {
        #welcomeCard,
        #infoCard {
          width: 40%;
        }
      }

      @media (screen-spanning: single-fold-vertical) {
        #welcomeBar {
          flex-direction: row;
          align-items: flex-start;
          justify-content: space-between;
        }

        #welcomeCard {
          margin-right: 64px;
        }
      }

      @media(prefers-color-scheme: light) {
        fast-card {
          --background-color: white;
        }
      }
    `;
  }

  constructor() {
    super();
  }

  async firstUpdated() {
    // this method is a lifecycle even in lit-element
    // for more info check out the lit-element docs https://lit-element.polymer-project.org/guide/lifecycle
    console.log('This is your home page');
  }

  share() {
    if ((navigator as any).share) {
      (navigator as any).share({
        title: 'PWABuilder pwa-starter',
        text: 'Check out the PWABuilder pwa-starter!',
        url: 'https://github.com/pwa-builder/pwa-starter',
      });
    }
  }

  render() {
    return html`
      <div>
        <div id="welcomeBar">
          <fast-card id="welcomeCard">
            <h2>${this.message}</h2>

            <p>
              For more information on the PWABuilder pwa-starter, check out the
              <fast-anchor
                href="https://github.com/pwa-builder/pwa-starter/blob/master/README.md"
                appearance="hypertext"
                >README</fast-anchor
              >.
            </p>

            <p>
              Welcome to the
              <fast-anchor href="https://pwabuilder.com" appearance="hypertext"
                >PWABuilder</fast-anchor
              >
              pwa-starter! Be sure to head back to
              <fast-anchor href="https://pwabuilder.com" appearance="hypertext"
                >PWABuilder</fast-anchor
              >
              when you are ready to ship this PWA to the Microsoft, Google Play
              and Samsung Galaxy stores!
            </p>

            ${'share' in navigator
              ? html`<fast-button appearance="primary" @click="${this.share}"
                  >Share this Starter!</fast-button
                >`
              : null}
          </fast-card>

          <fast-card id="infoCard">
            <h2>Technology Used</h2>

            <ul>
              <li>
                <fast-anchor
                  href="https://www.typescriptlang.org/"
                  appearance="hypertext"
                  >TypeScript</fast-anchor
                >
              </li>

              <li>
                <fast-anchor
                  href="https://lit-element.polymer-project.org/"
                  appearance="hypertext"
                  >lit-element</fast-anchor
                >
              </li>

              <li>
                <fast-anchor
                  href="https://www.fast.design/docs/components/getting-started"
                  appearance="hypertext"
                  >FAST Components</fast-anchor
                >
              </li>

              <li>
                <fast-anchor
                  href="https://vaadin.github.io/vaadin-router/vaadin-router/demo/#vaadin-router-getting-started-demos"
                  appearance="hypertext"
                  >Vaadin Router</fast-anchor
                >
              </li>
            </ul>
          </fast-card>
        </div>

        <pwa-install>Install PWA Starter</pwa-install>
      </div>
    `;
  }
}
