import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { AnalyticsBehavior, recordPWABuilderProcessStep } from '../utils/analytics';
import { manifest_fields } from '@pwabuilder/manifest-information';
import {
  smallBreakPoint,
} from '../utils/css/breakpoints';
import { SlDropdown } from '@shoelace-style/shoelace';

@customElement('manifest-info-card')
export class ManifestInfoCard extends LitElement {
  @property({ type: String }) field: string = "";
  @property({ type: String }) placement:  "" |"top" | "top-start" | "top-end" | "right" | "right-start" | "right-end" | "bottom" | "bottom-start" | "bottom-end" | "left" | "left-start" | "left-end" = "";
  @state() currentlyHovering: boolean = false;
  @state() currentlyOpen: boolean = false;

  static get styles() {
    return [
    css`

      .mic-wrapper {
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .info-box {
        background-color: var(--font-color);
        width: 340px;
        color: #ffffff;
        padding: 10px;
        border-radius: var(--card-border-radius);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 10px;
      }

      .info-box p {
        margin: 0;
        font-size: 16px;
        font-family: var(--font-family);
      }

      .right {
        background-color: transparent;
        border: none;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .right:hover {
        cursor: pointer;
      }

      .image-section {
        background: linear-gradient(93.16deg, #EAECF4 16%, #CED0EC 87.75%);
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .image-section img {
        padding: 10px 20px;
        width: 300px;
        height: auto;
      }

      .mic-actions {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        width: 100%;
        gap: 15px;
        margin: 5px 0;
      }

      .mic-actions > * {
        color: #ffffff;
        font-size: var(--card-body-font-size);
        font-weight: bold;
        font-family: var(--font-family);
      }

      .mic-actions a {
        line-height: 17px;
      }

      .mic-actions a:visited, .mic-actions a:active, .mic-actions a:link {
        color: #ffffff;
      }

      .mic-actions button {
        background-color: transparent;
        border: none;
        color: #ffffff;
        padding: 0;
        text-decoration: underline;
        height: 16px;
        display: flex;
        align-items: center;
      }

      .mic-actions button:hover {
        cursor: pointer;
      }

      /* < 480px */
      ${smallBreakPoint(css`
        .info-box{
          width: 240px;
        }

        .image-section img {
          width: 200px;
        }
      `)}

    `
    ];
  }

  constructor() {
    super();
  }

  firstUpdated(){

  }

  openME(){
    // general counter
    recordPWABuilderProcessStep(`manifest_tooltip.open_editor_clicked`, AnalyticsBehavior.ProcessCheckpoint);
    // specific counter
    recordPWABuilderProcessStep(`manifest_tooltip.${this.field}_open_editor_clicked`, AnalyticsBehavior.ProcessCheckpoint);

    (this.shadowRoot!.querySelector(".tooltip") as unknown as SlDropdown).hide()
    let tab: string = manifest_fields[this.field].location!;
    let event: CustomEvent = new CustomEvent('open-manifest-editor', {
      detail: {
          field: this.field,
          tab: tab
      },
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(event);
  }

  trackLearnMoreAnalytics(){
    // general counter
    recordPWABuilderProcessStep(`manifest_tooltip.learn_more_clicked`, AnalyticsBehavior.ProcessCheckpoint);
    //specific field counter
    recordPWABuilderProcessStep(`manifest_tooltip.${this.field}_learn_more_clicked`, AnalyticsBehavior.ProcessCheckpoint);
  }


  // opens tooltip
  handleHover(entering: boolean){
    console.log("debug: jhererere")
    this.currentlyHovering = entering;
    let tooltip = (this.shadowRoot!.querySelector("sl-dropdown") as unknown as SlDropdown)
    let myEvent = new CustomEvent('trigger-hover',
      {
        detail: {
          tooltip: tooltip,
          entering: entering
        },
        bubbles: true,
        composed: true
      });
    if(!entering){
      setTimeout(() => { this.closeTooltip(myEvent) }, 500)
    } else {
      this.dispatchEvent(myEvent);
    }
  }

  handleClick(){
    let tooltip = (this.shadowRoot!.querySelector("sl-dropdown") as unknown as SlDropdown);
    if(!tooltip.open){
      tooltip.show();
    }
    this.currentlyOpen = tooltip.open;
  }

  closeTooltip(e: CustomEvent){
    if(!this.currentlyHovering){
      this.dispatchEvent(e);
    }
  }

  render() {
    return html`
    <div class="mic-wrapper" @click=${() => this.handleClick()}>
      ${this.placement !== "" ?
        html`
          <sl-dropdown
            distance="10"
            placement="${this.placement}"
            class="tooltip"
            .stayOpenOnSelect=${true}
          >
          <slot name="trigger" slot="trigger"></slot>
          <div class="info-box">
            ${manifest_fields[this.field].description.map((line: String) => html`<p class="info-blurb">${line}</p>`)}
            ${manifest_fields[this.field].image ?

              html`
                <div class="image-section">
                    <img src="${manifest_fields[this.field].image!}" alt=${`example of ${this.field} in use.`} />
                </div>
              ` :
              html``

            }
            <div class="mic-actions">
              <sl-menu>
                <sl-menu-item><a class="learn-more" href="${manifest_fields[this.field].docs_link ?? "https://docs.pwabuilder.com"}" target="blank" rel="noopener noreferrer" @click=${() => this.trackLearnMoreAnalytics()}>Learn More</a></sl-menu-item>
                ${manifest_fields[this.field].location ? html`<sl-menu-item><button type="button" @click=${() => this.openME()}>Edit in Manifest</button></sl-menu-item>` : html``}
              </sl-menu>
            </div>
          </div>
        </sl-dropdown>
        ` :
        html`
          <sl-dropdown
            distance="10"
            class="tooltip"
            .stayOpenOnSelect=${true}
          >
          <slot name="trigger" slot="trigger"></slot>
          <div class="info-box">
            ${manifest_fields[this.field].description.map((line: String) => html`<p class="info-blurb">${line}</p>`)}
            ${manifest_fields[this.field].image ?

              html`
                <div class="image-section">
                    <img src="${manifest_fields[this.field].image!}" alt=${`example of ${this.field} in use.`} />
                </div>
              ` :
              html``

            }
            <div class="mic-actions">
              <sl-menu>
                <sl-menu-item><a class="learn-more" href="${manifest_fields[this.field].docs_link ?? "https://docs.pwabuilder.com"}" target="blank" rel="noopener noreferrer" @click=${() => this.trackLearnMoreAnalytics()}>Learn More</a></sl-menu-item>
                ${manifest_fields[this.field].location ? html`<sl-menu-item><button type="button" @click=${() => this.openME()}>Edit in Manifest</button></sl-menu-item>` : html``}
              </sl-menu>
            </div>
          </div>
        </sl-dropdown>
        `}


    </div>
    `;
  }
}
