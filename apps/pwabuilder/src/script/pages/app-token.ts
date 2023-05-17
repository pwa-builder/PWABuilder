import { LitElement, css, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';

@customElement('app-token')
export class AppToken extends LitElement {
  static get styles() {
    return [
      css`
      
      `
    ]
  }

  async firstUpdated() {

  }

  render(){
    return html`
      GIVEAWAY
    `
  }
}