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
      
      #resource-header {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding-top: 80px;
        padding-left: 4em;
        padding-right: 4em;
      }

      #resource-header h4 {
        font-weight: var(--font-bold);

        font-size: 36px;
        line-height: 39px;
        letter-spacing: -0.015em;
        margin-top: 0;
      }

      #resource-header p {
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
        margin-right: 12px;
        margin-left: 12px;

        color: black;
        background: white;
      }

      fast-card img {
        width: 100%;
        object-fit: none;
        height: 188px;
      }

      fast-card h3 {
        font-size: 22px;
        line-height: 24px;
        font-weight: var(--font-bold);
      }

      fast-card p {
        color: #A6A4A4;
      }

      .card-actions fast-button::part(control) {
        font-weight: bold;
        font-size: 14px;
        line-height: 20px;
        color: black;
      }

      #resource-hub-actions {
        display: flex;
        align-items: center;
        justify-content: center;

        margin-top: 54px;
        margin-bottom: 54px;
      }

      #resource-hub-actions fast-button {
        background: white;
        color: black;
      }
      
      #resource-hub-actions fast-button::part(control) {
        font-size: 16px;
        font-weight: var(--font-bold);
      }
    `;
  }

  constructor() {
    super();
  }

  render() {
    return html`
      <section>
        <div id="resource-header">
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

            <div class="card-actions">
              <fast-button appearance="lightweight">View</fast-button>
            </div>
          </fast-card>

          <fast-card>
            <img src="/assets/icons/icon_120.png" alt="card header image">
            <h3>Demos</h3>

            <p>
              Card description. Lorem ipsum dolor sit amet, consectetur elit adipiscing
            </p>

            <div class="card-actions">
              <fast-button appearance="lightweight">View</fast-button>
            </div>
          </fast-card>

          <fast-card>
            <img src="/assets/icons/icon_120.png" alt="card header image">
            <h3>Components</h3>

            <p>
              Card description. Lorem ipsum dolor sit amet, consectetur elit adipiscing
            </p>

            <div class="card-actions">
              <fast-button appearance="lightweight">View</fast-button>
            </div>
          </fast-card>

          <fast-card>
            <img src="/assets/icons/icon_120.png" alt="card header image">
            <h3>Documentation</h3>

            <p>
              Card description. Lorem ipsum dolor sit amet, consectetur elit adipiscing
            </p>

            <div class="card-actions">
              <fast-button appearance="lightweight">View</fast-button>
            </div>
          </fast-card>
        </div>

        <div id="resource-hub-actions">
          <fast-button>View all resources</fast-button>
        </div>
      </section>
    `;
  }
}
