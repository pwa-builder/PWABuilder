import { LitElement, TemplateResult, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { manifestInfoCardStyles } from "./manifest-info-card.styles";
import { AnalyticsBehavior, recordPWABuilderProcessStep } from '../utils/analytics';
import type WaDropdown from '@awesome.me/webawesome/dist/components/dropdown/dropdown.js';
import { manifest_fields } from "../models/manifest-fields";
import '@awesome.me/webawesome/dist/components/dropdown-item/dropdown-item.js';

@customElement('manifest-info-card')
export class ManifestInfoCard extends LitElement {
    @property({ type: String }) field: string = "";
    @property({ type: String }) description = "";
    @property({ type: String }) docsUrl = "";
    @property({ type: String }) imageUrl = "";
    @property({ type: String }) placement: "" | "top" | "top-start" | "top-end" | "right" | "right-start" | "right-end" | "bottom" | "bottom-start" | "bottom-end" | "left" | "left-start" | "left-end" = "";
    @property({ type: String }) error = "";
    @state() currentlyHovering: boolean = false;
    @state() currentlyOpen: boolean = false;
    @state() hoverTimer: any;
    static styles = [manifestInfoCardStyles];

    constructor() {
        super();
    }

    openME() {
        // general counter
        recordPWABuilderProcessStep(`manifest_tooltip.open_editor_clicked`, AnalyticsBehavior.ProcessCheckpoint);
        // specific counter
        recordPWABuilderProcessStep(`manifest_tooltip.${this.field}_open_editor_clicked`, AnalyticsBehavior.ProcessCheckpoint);

        (this.shadowRoot!.querySelector(".tooltip") as unknown as WaDropdown).open = false;
        let tab: string = manifest_fields[this.field]?.location || "info";
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

    trackLearnMoreAnalytics() {
        // general counter
        recordPWABuilderProcessStep(`manifest_tooltip.learn_more_clicked`, AnalyticsBehavior.ProcessCheckpoint);
        //specific field counter
        recordPWABuilderProcessStep(`manifest_tooltip.${this.field}_learn_more_clicked`, AnalyticsBehavior.ProcessCheckpoint);
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

    handleClick() {
        let tooltip = (this.shadowRoot!.querySelector("wa-dropdown") as unknown as WaDropdown);
        if (!tooltip.open) {
            tooltip.open = true;
        }
        this.currentlyOpen = tooltip.open;
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
                placement="${this.placement}"
                class="tooltip"
                @wa-hide=${() => this.handleHover(false)}
            >
            <slot name="trigger" slot="trigger"></slot>
            <div class="info-box">
                <p class="info-blurb">
                    ${this.description}
                    ${this.renderError()}
                </p>
                ${this.renderImage()}            
            </div>
            <div class="info-actions">
                <wa-dropdown-item  @click=${() => this.handleClickingLink(this.field)}><a class="learn-more" data-tag=${this.field} href="${this.docsUrl || "https://docs.pwabuilder.com"}" target="blank" rel="noopener noreferrer">Learn More</a></wa-dropdown-item>
                ${manifest_fields[this.field]?.location ? html`<wa-dropdown-item @click=${() => this.openME()}>Edit in Manifest</wa-dropdown-item>` : null}
            </div>
            </wa-dropdown>
            ` :
                html`
            <wa-dropdown
                distance="10"
                class="tooltip"
                aria-label="Information about ${this.field}"
                @wa-hide=${() => this.handleHover(false)}
            >
            <slot name="trigger" slot="trigger"></slot>
            <div class="info-box">
                <p class="info-blurb">
                    ${this.description}
                    ${this.renderError()}
                </p>
                ${this.renderImage()}
                <div class="info-actions">
                <wa-dropdown-item  @click=${() => this.handleClickingLink(this.field)}><a class="learn-more" data-tag=${this.field} href="${this.docsUrl || "https://docs.pwabuilder.com"}" target="blank" rel="noopener noreferrer">Learn More</a></wa-dropdown-item>
                ${manifest_fields[this.field]?.location ? html`<wa-dropdown-item @click=${() => this.openME()}>Edit in Manifest</wa-dropdown-item>` : null}
            </div>
            </div>
            </wa-dropdown>
        `}


    </div>
    `;
    }

    renderImage(): TemplateResult {
        if (!this.imageUrl) {
            return html``;
        }

        return html`
            <div class="image-section">
                <img src="${this.imageUrl}" alt="Visual example of the feature" />
            </div>
        `;
    }

    renderError(): TemplateResult {
        if (!this.error) {
            return html``;
        }

        return html`
            <br>
            <div>
                <p>${this.error}</p>
            </div>
        `;
    }
}
