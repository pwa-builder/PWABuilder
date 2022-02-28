import { LitElement, css, html } from 'lit';

import { customElement, state } from 'lit/decorators.js';

@customElement('discord-box')
export class DiscordBox extends LitElement {
  @state() show = true;

  static get styles() {
    return css`
      #discord-box {
        display: flex;
        align-items: flex-start;
        position: fixed;
        z-index: 1;
        bottom: 0;
        right: 0;
        width: 200px;
        height: 30px;
        background-color: #F5F7FA;
        padding: 10px;
        border-top-left-radius: 10px;
        column-gap: 10px;
        align-items: center;
      }

      #discord-box #logo {
        height: 29px;
        width: 29px;
      }

      #discord-box #close {
        height: 13px;
        width: 13px;
        align-self: flex-start;
      }

      #discord-box p {
        font-size: 14px;
        line-height: 14px;
        color: black;
        font-weight: bold;
      }
      #discord-box a {
        text-decoration: none;
        border-bottom: 1px solid black;
        display: inline-block;
        height: 12px;
      }
      #discord-box a:visited{
        color: black;
      }
      #close:hover {
        cursor: pointer;
      }
    `;
  }

  constructor() {
    super();
  }

  firstUpdated() {
  }

  close() {
    this.show = false;
  }

  render() {
    return html`
      ${this.show
        ? html`
        <div id="discord-box">
          <img id="logo" src="/assets/images/discord_logo.svg" alt="discord logo"/>
          <p>Want to chat? Join us on <a href="https://aka.ms/pwabuilderdiscord" target="_blank" rel="noopener">Discord</a></p>
          <img id="close" src="/assets/images/Close_desk.png" @click=${() => this.close()} alt="close button"/>
        </div>`
        : null}
    `;
  }
}
