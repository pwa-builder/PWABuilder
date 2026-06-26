import { LitElement, html } from 'lit';

import { customElement, state } from 'lit/decorators.js';
import { discordBoxStyles } from './discord-box.styles';
import { AnalyticsBehavior, recordPWABuilderProcessStep } from '../utils/analytics';
import '@awesome.me/webawesome/dist/components/icon/icon.js';

@customElement('discord-box')
export class DiscordBox extends LitElement {
  @state() show = true;

  static styles = [discordBoxStyles];

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
          <p>Want to chat? Join us on <a @click=${() => recordPWABuilderProcessStep("discord_box_link_clicked", AnalyticsBehavior.ProcessCheckpoint)} href="https://aka.ms/pwabuilderdiscord" target="_blank" rel="noopener" aria-label="Click to join us on Discord">Discord</a></p>
          <button id="close-wrapper" @click=${() => this.close()} aria-label="discord modal close" type="button"><wa-icon id="close" name="x-lg"></wa-icon></button>
        </div>`
        : null}
    `;
  }
}
