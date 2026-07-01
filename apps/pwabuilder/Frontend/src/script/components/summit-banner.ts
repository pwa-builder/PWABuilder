import { LitElement, html } from 'lit';

import { customElement, state } from 'lit/decorators.js';


import { summitBannerStyles } from "./summit-banner.styles";
@customElement('summit-banner')
export class SummitBanner extends LitElement {
  @state() show = true;

  static styles = [summitBannerStyles];

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
        <div id="summit-banner">
          <div id="spacer"></div>
          <div id="banner-content">

            <div id="banner-text">
              <p id="bold-text">Upcoming: PWA Summit on October 5th! 😄</p>
              <p>
                <a href="https://pwasummit.org/" target="_blank" rel="noopener">PWA Summit</a> is an online conference dedicated entirely to helping developers succeed with Progressive Web Apps. 
                Register to attend <a href="https://pwasummit.org/register/" target="_blank" rel="noopener">here.</a>
              </p>
            </div>

          </div>
          <div id="closer" @click="${() => this.close()}">
            <img id="desk_close" src="assets/images/Close_desk.png" alt="gift box image"/>
            <img id="mobile_close" src="assets/images/Close_mobile.png" alt="gift box image"/>
          </div>
        </div>`
        : null}
    `;
  }
}
