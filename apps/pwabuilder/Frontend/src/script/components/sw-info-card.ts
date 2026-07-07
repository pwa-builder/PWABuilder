import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { AnalyticsBehavior, recordPWABuilderProcessStep } from '../utils/analytics';

import { swInfoCardStyles } from "./sw-info-card.styles";
import type WaDropdown from '@awesome.me/webawesome/dist/components/dropdown/dropdown.js';
import '@awesome.me/webawesome/dist/components/dropdown-item/dropdown-item.js';
@customElement('sw-info-card')
export class ServiceWorkerInfoCard extends LitElement {
    @property({ type: String }) field: string = "";
    @property({ type: String }) capabilityId: string = "";
    @property({ type: String }) description = "";
    @property({ type: String }) docsUrl = "";
    @property({ type: String }) placement: "" | "top" | "top-start" | "top-end" | "right" | "right-start" | "right-end" | "bottom" | "bottom-start" | "bottom-end" | "left" | "left-start" | "left-end" = "";
    @state() currentlyHovering: boolean = false;
    @state() hoverTimer: any;

    static styles = [swInfoCardStyles];

    constructor() {
        super();
    }

    firstUpdated() {

    }

    trackLearnMoreAnalytics() {
        // general counter
        recordPWABuilderProcessStep(`service_worker.learn_more_clicked`, AnalyticsBehavior.ProcessCheckpoint);

        //specific field counter
        recordPWABuilderProcessStep(`service_worker.${this.capabilityId}_learn_more_clicked`, AnalyticsBehavior.ProcessCheckpoint);
    }

    // opens tooltip
    handleHover(entering: boolean) {
        this.currentlyHovering = entering;
        let tooltip = (this.shadowRoot!.querySelector("wa-dropdown") as unknown as WaDropdown)
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
            setTimeout(() => { this.closeTooltip(myEvent) }, 250)
        } else {
            this.hoverTimer = setTimeout(() => { this.dispatchEvent(myEvent) }, 750)
        }
    }

    closeTooltip(e: CustomEvent) {
        if (!this.currentlyHovering) {
            clearTimeout(this.hoverTimer);
            this.dispatchEvent(e);
        }
    }

    // hacky work around for clicking links with keyboard that are nested in menu items
    // in the future, Web Awesome may make <wa-dropdown-item href> a thing but for now this works.
    handleClickingLink(linkTag: string) {
        const anchor: HTMLAnchorElement = this.shadowRoot!.querySelector('a[data-tag="' + linkTag + '"]')!;
        anchor.click();
        this.trackLearnMoreAnalytics();
    }

    render() {
        return html`
    <div class="mic-wrapper" @mouseenter=${() => this.handleHover(true)} @mouseleave=${() => this.handleHover(false)}>
      ${this.placement !== "" ?
                html`
        <wa-dropdown
          distance="10"
          class="tooltip"
          placement=${this.placement}
          @wa-hide=${() => this.handleHover(false)}
        >
          <slot name="trigger" slot="trigger"></slot>
          <div class="info-box">
            <p class="info-blurb">${this.description}</p>
          </div>
          <div class="info-actions">
            <wa-dropdown-item @click=${() => this.handleClickingLink(this.capabilityId)}><a class="learn-more" data-tag=${this.capabilityId} href="${this.docsUrl || "https://docs.pwabuilder.com"}" target="blank" rel="noopener noreferrer">Learn More</a></wa-dropdown-item>
          </div>
        </wa-dropdown>
        ` :
                html`
          <wa-dropdown
            distance="10"
            class="tooltip"
            aria-label="Information about ${this.capabilityId}"
            @wa-hide=${() => this.handleHover(false)}
          >
          <slot name="trigger" slot="trigger"></slot>
          <div class="info-box">
            <p class="info-blurb">${this.description}</p>
          </div>
          <div class="info-actions">
            <wa-dropdown-item @click=${() => this.handleClickingLink(this.capabilityId)}>
              <a class="learn-more" data-tag=${this.capabilityId} href="${this.docsUrl || "https://docs.pwabuilder.com"}" target="blank" rel="noopener noreferrer">Learn More</a>
            </wa-dropdown-item>
          </div>
        </wa-dropdown>
        `
            }

    </div>
    `;
    }
}
