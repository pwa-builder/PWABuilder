import { LitElement, css, html, customElement } from 'lit-element';

@customElement('app-sidebar')
export class AppSidebar extends LitElement {
  static get styles() {
    return css`
      aside.sidebar {
        color: #ffffff;
        background: var(--primary-color);
        height: 100vh;
        width: 280px;
        position: fixed;
        display: flex;
        flex-direction: column;
        place-items: center;
        overflow-x: auto;
        z-index: 1;
      }
      aside.sidebar img {
        width: calc(100% - 150px);
        margin: 1rem auto;
      }
      aside.sidebar fast-menu {
        width: 280px;
        margin: 0;
        padding: 0;
        border: none;
        border-radius: 0;
        box-shadow: none;
      }
      aside.sidebar h1,
      aside.sidebar h4,
      aside.sidebar h5,
      aside.sidebar p {
        margin: 0;
      }
      aside.sidebar h4 {
        margin-bottom: 1rem;
      }
      aside.sidebar > hr {
        background-color: #ffffff;
        width: 240px;
      }
      fast-menu.menu > fast-menu-item {
        width: 100%;
        color: rgba(255, 255, 255, 0.6);
        background: var(--primary-color);
        margin: 0;
        padding: 1.1rem 2rem;
        border: none;
        border-radius: 0;
        box-shadow: none;
        display: flex;
        place-content: left;
        text-align: left;
      }
      .scores-container {
        text-align: center;
      }
      .scores-container h1 {
        font-size: 4rem;
      }
      .score-message {
        color: #a2f4cc;
      }
      fast-menu.menu > fast-menu-item.heading {
        font-weight: bold;
        background: rgba(41, 44, 58, 0.8);
      }
      fast-menu.menu > fast-menu-item.active {
        font-weight: bold;
        color: var(--primary-color);
        background: #ffffff;
      }
      fast-menu.menu > fast-menu-item.active-cell {
        font-weight: bold;
        color: #ffffff;
      }
      fast-menu.menu > fast-menu-item.active-cell::before {
        margin-right: 0.5rem;
        content: url('/assets/images/active-cell.svg');
      }
      fast-menu.menu > fast-menu-item.done::before {
        margin-right: 0.5rem;
        content: url('/assets/images/green-tick.svg');
      }
    `;
  }

  constructor() {
    super();
  }

  render() {
    return html`
      <aside class="sidebar">
        <img src="/assets/images/sidebar-icon.svg" alt="pwd-icon" />
        <hr />
        <h4>URL tested:</h4>
        <h5>www.websitetested.com</h5>
        <hr />
        <div class="scores-container">
          <h5>Your PWA Score:</h5>
          <h1>100</h1>
          <h4 class="score-message">Excellent score!</h4>
        </div>
        <hr />
        <h4>PWAB Progress</h4>
        <fast-menu class="menu">
          <fast-menu-item class="heading done">Section</fast-menu-item>
          <fast-menu-item class="done">Step</fast-menu-item>
          <fast-menu-item class="done">Step</fast-menu-item>
          <fast-menu-item class="heading active"
            >Current Section</fast-menu-item
          >
          <fast-menu-item class="active-cell">Current Step</fast-menu-item>
          <fast-menu-item>Sub Section</fast-menu-item>
          <fast-menu-item>Sub Section</fast-menu-item>
          <fast-menu-item class="heading">Section</fast-menu-item>
          <fast-menu-item>Step</fast-menu-item>
          <fast-menu-item>Step</fast-menu-item>
          <fast-menu-item class="heading">Section</fast-menu-item>
        </fast-menu>
      </aside>
    `;
  }
}
