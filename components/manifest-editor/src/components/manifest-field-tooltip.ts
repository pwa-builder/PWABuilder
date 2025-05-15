import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { manifest_fields } from '@pwabuilder/manifest-information';
import '@shoelace-style/shoelace/dist/components/dropdown/dropdown.js';
import SlDropdown from '@shoelace-style/shoelace/dist/components/dropdown/dropdown.js';

@customElement('manifest-field-tooltip')
export class ManifestFieldTooltip extends LitElement {
  @property({ type: String }) field: string = "";
  @state() currentlyHovering: boolean = false;

  static get styles() {
    return [
    css`

      .mic-wrapper {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 16px;
        width: 16px;
      }

      .info-box {
        background-color: #292c3a;
        width: 220px;
        color: #ffffff;
        padding: 10px;
        border-radius: 10px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 10px;
      }

      .info-box p {
        margin: 0;
        font-size: 16px;
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

      .mic-actions {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        width: 100%;
        gap: 5px;
        margin-bottom: 5px;
      }

      .mic-actions > * {
        color: #ffffff;
        font-size: 14px;
        font-weight: bold;
        font-family: var(--font-family);
      }

      .mic-actions a {
        line-height: 17px;
      }

      .mic-actions a:visited, .mic-actions a:active, .mic-actions a:link {
        color: #ffffff;
      }

    `
    ];
  }

  constructor() {
    super();
  }

  firstUpdated(){
  }

  trackTooltipOpened(){
  }

  trackLearnMoreAnalytics(){
    // general counter
    //recordPWABuilderProcessStep(`action_item_tooltip.learn_more_clicked`, AnalyticsBehavior.ProcessCheckpoint);

    //specific field counter
    //recordPWABuilderProcessStep(`action_item_tooltip.${this.field}_learn_more_clicked`, AnalyticsBehavior.ProcessCheckpoint);
  }

  // opens tooltip 
  handleHover(entering: boolean){
    this.trackTooltipOpened();
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

  closeTooltip(e: CustomEvent){
    if(!this.currentlyHovering){
      this.dispatchEvent(e);
    }
  }

  render() {
    return html`
      <div class="mic-wrapper" @mouseenter=${() => this.handleHover(true)} @mouseleave=${() => this.handleHover(false)}>
        <sl-dropdown distance="10" placement="right" class="tooltip">
          <button slot="trigger" type="button" class="right" class="nav_link nav_button" @click=${() => this.trackTooltipOpened()} aria-label="Required field">
            <img src="assets/tooltip.svg" alt="info symbol, additional information available on hover" />
          </button>
          <div class="info-box">
            ${manifest_fields[this.field].description.map((line: String) => html`<p class="info-blurb">${line}</p>`)}
            ${manifest_fields[this.field].docs_link ? 
              html`
                <div class="mic-actions">
                  <a class="learn-more" href="${manifest_fields[this.field].docs_link ?? "https://docs.pwabuilder.com"}" target="blank" rel="noopener noreferrer" @click=${() => this.trackLearnMoreAnalytics()}>Learn More</a>
                </div>
              ` : 
              html``
            }
            
          </div>
        </sl-dropdown>
      </div>
    `;
  }
}