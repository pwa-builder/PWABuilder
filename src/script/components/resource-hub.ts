import { LitElement, css, html, customElement } from 'lit-element';

@customElement('resource-hub')
export class ResourceHub extends LitElement {

  static get styles() {
    return css`
      :host {
        background: var(--primary-color);
        display: flex;
        color: white;
      }
      
      #resourceHeader {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding-top: 80px;
        padding-left: 4em;
        padding-right: 4em;
      }

      #resourceHeader h4 {
        font-weight: var(--font-bold);

        font-size: 36px;
        line-height: 39px;
        letter-spacing: -0.015em;
        margin-top: 0;
      }

      #resourceHeader p {
        font-weight: var(--font-bold);
        text-align: center;
      }

      #cards {
        display: flex;
        padding-left: 4em;
        padding-right: 4em;
        margin-top: 2em
      }

      #cards fast-card {
        padding-left: 16px;
        padding-right: 16px;
        padding-bottom: 16px;
        margin-right: 24px;
      }

      fast-card img {
        width: 100%;
        object-fit: none;
        height: 188px;
      }
    `;
  }

  constructor() {
    super();
  }

  render() {
    return html`
      <section>
        <div id="resourceHeader">
          <h4>PWABuilder Resource Hub</h4>
          <p>Ready to build your PWA? Tap "Build My PWA" to package your PWA for the app stores or tap "Feature Store" to check out the latest web components from the PWABuilder team to improve your PWA even further!</p>
        </div>

        <div id="cards">
          <fast-card>
            <img src="/assets/icons/icon_120.png" alt="card header image">
            <h3>Blog</h3>

            <p>
              Card description. Lorem ipsum dolor sit amet, consectetur elit adipiscing
            </p>

            <div class="cardActions">
              <fast-button>View</fast-button>
            </div>
          </fast-card>

          <fast-card>
            <img src="/assets/icons/icon_120.png" alt="card header image">
            <h3>Demos</h3>

            <p>
              Card description. Lorem ipsum dolor sit amet, consectetur elit adipiscing
            </p>

            <div class="cardActions">
              <fast-button>View</fast-button>
            </div>
          </fast-card>

          <fast-card>
            <img src="/assets/icons/icon_120.png" alt="card header image">
            <h3>Components</h3>

            <p>
              Card description. Lorem ipsum dolor sit amet, consectetur elit adipiscing
            </p>

            <div class="cardActions">
              <fast-button>View</fast-button>
            </div>
          </fast-card>

          <fast-card>
            <img src="/assets/icons/icon_120.png" alt="card header image">
            <h3>Documentation</h3>

            <p>
              Card description. Lorem ipsum dolor sit amet, consectetur elit adipiscing
            </p>

            <div class="cardActions">
              <fast-button>View</fast-button>
            </div>
          </fast-card>
        </div>
      </section>
    `;
  }
}
