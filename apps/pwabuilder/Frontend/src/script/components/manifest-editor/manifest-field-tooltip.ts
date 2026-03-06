import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { manifest_fields } from '@pwabuilder/manifest-information';
import '@shoelace-style/shoelace/dist/components/dropdown/dropdown.js';
import SlDropdown from '@shoelace-style/shoelace/dist/components/dropdown/dropdown.js';
import { manifestFieldTooltipStyles } from "./manifest-field-tooltip.styles";

@customElement('manifest-field-tooltip')
export class ManifestFieldTooltip extends LitElement {
    @property({ type: String }) field: string = "";
    @state() currentlyHovering: boolean = false;

    static styles = [manifestFieldTooltipStyles];

    trackTooltipOpened() {
    }

    trackLearnMoreAnalytics() {
        // general counter
        //recordPWABuilderProcessStep(`action_item_tooltip.learn_more_clicked`, AnalyticsBehavior.ProcessCheckpoint);

        //specific field counter
        //recordPWABuilderProcessStep(`action_item_tooltip.${this.field}_learn_more_clicked`, AnalyticsBehavior.ProcessCheckpoint);
    }

    // opens tooltip 
    handleHover(entering: boolean) {
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
        if (!entering) {
            setTimeout(() => { this.closeTooltip(myEvent) }, 500)
        } else {
            this.dispatchEvent(myEvent);
        }

    }

    closeTooltip(e: CustomEvent) {
        if (!this.currentlyHovering) {
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