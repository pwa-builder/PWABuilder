import { LitElement, css, html, customElement, property } from 'lit-element';

@customElement('app-header')
export class AppHeader extends LitElement {
  @property({ type: String }) title = 'PWA Starter';

  static get styles() {
    return css`
      header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-left: 16px;
        padding-right: 16px;
        background: var(--app-color-primary);
        color: white;
        height: 4em;
      }

      header h1 {
        margin-top: 0;
        margin-bottom: 0;
        font-size: 20px;
        font-weight: bold;
      }

      nav {
        width: 9em;
        display: flex;
        justify-content: space-between;
      }

      nav fast-anchor {
        margin-left: 10px;
      }

      @media(prefers-color-scheme: light) {
        header {
          color: black;
        }
      }
    `;
  }

  constructor() {
    super();
  }

  render() {
    return html`
      <header>
        <h1>${this.title}</h1>

        <nav>
          <fast-anchor href="./" appearance="button">Home</fast-anchor>
          <fast-anchor href="./about" appearance="button">About</fast-anchor>
        </nav>
      </header>
    `;
  }
}
