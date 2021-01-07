import { LitElement, css, html, customElement } from 'lit-element';

@customElement('content-header')
export class ContentHeader extends LitElement {

  static get styles() {
    return css`
      
    `;
  }

  constructor() {
    super();
  }

  render() {
    return html`
      <section>
        <h2>Transform your website to an app at lightning speed!</h2>
        <p>Ready to build your PWA? Tap "Build My PWA" to package your PWA for the app stores or tap "Feature Store".</p>
      </section>
    `;
  }
}
