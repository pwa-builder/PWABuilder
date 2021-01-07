import { LitElement, css, html, customElement } from 'lit-element';

@customElement('app-sidebar')
export class AppSidebar extends LitElement {

  static get styles() {
    return css`
      
    `;
  }

  constructor() {
    super();
  }

  render() {
    return html`
      <aside>
        <div>
          <h4>PWAB Assistant</h4>
          <h5>URL Tested: <span>webboard.app</span></h5>
        </div>

        <fast-menu>
          <fast-menu-item>Menu item 1</fast-menu-item>
          <fast-menu-item>Menu item 2</fast-menu-item>
          <fast-menu-item>Menu item 3</fast-menu-item>
        </fast-menu>
      </aside>
    `;
  }
}
