export const pageCode: string = `import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { styles as sharedStyles } from '../styles/shared-styles'
import '@shoelace-style/shoelace/dist/components/card/card.js';

const styles = css\`
  @media(min-width: 1000px) {
    sl-card {
      max-width: 70vw;
    }
  }
\`;

@customElement('#DEFAULT#')
export class #CLASS_NAME# extends LitElement {
  static styles = [
    sharedStyles,
    styles
  ]

  constructor() {
    super();
  }

  render() {
    return html\`
      <app-header ?enableBack="\${true}"></app-header>

      <main>
        <h2>Welcome to #DEFAULT#</h2>

        <sl-card>
          <h2>Did you know?</h2>

          <p>PWAs have access to many useful APIs in modern browsers! These
            APIs have enabled many new types of apps that can be built as PWAs, such as advanced graphics editing apps, games,
            apps that use machine learning and more!
          </p>

          <p>Check out <a
              href="https://docs.microsoft.com/en-us/microsoft-edge/progressive-web-apps-chromium/how-to/handle-files">these
              docs</a> to learn more about the advanced features that you can use in your PWA</p>
        </sl-card>
  </main>
    \`;
  }
}
`

export const pageRouteCodeSnippet: string = `
{
  path: '#DEFAULT#',
  component: '#DEFAULT#',
  action: async () => {
    await import('./pages/#DEFAULT#.js');
  }
},
/* ROUTE GENERATION MARKER */`