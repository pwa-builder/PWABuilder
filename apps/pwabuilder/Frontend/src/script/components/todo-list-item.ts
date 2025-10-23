import { LitElement, TemplateResult, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { manifest_fields } from '@pwabuilder/manifest-information';
//import { recordPWABuilderProcessStep } from '../utils/analytics';
import './manifest-info-card'
import './sw-info-card'
import { todoListItemStyles } from './todo-list-item.styles';
import "@shoelace-style/shoelace/dist/components/details/details";
import "@shoelace-style/shoelace/dist/components/button/button";
import { AnalyticsBehavior, recordPWABuilderProcessStep } from "../utils/analytics";

@customElement('todo-item')
export class TodoItem extends LitElement {
    @property({ type: String }) field: string = "";
    @property({ type: String }) card: "ServiceWorker" | "WebAppManifest" | "Https" | "General" | "" = "";
    @property({ type: String }) fix: string = "";
    @property({ type: String }) status: "Required" | "Recommended" | "Optional" | "Feature" | "Retest" | "" = "";
    @property({ type: String }) error: string | null = null;
    @property({ type: String }) description: string = "";
    @property({ type: String }) docsUrl: string | null = null;
    @property({ type: String }) imageUrl: string | null = null;

    @state() clickable: boolean = false;
    @state() isOpen: boolean = false;

    @state() darkMode: boolean = false;

    static styles = [todoListItemStyles];

    constructor() {
        super();
    }

    connectedCallback() {
        super.connectedCallback();

        const result = window.matchMedia('(prefers-color-scheme: dark)');
        this.darkMode = result.matches;
    }

    renderIcon(): TemplateResult {
        const yield_src = "/assets/new/yield.svg";
        const stop_src = "/assets/new/stop.svg";
        const enhancement_src = "/assets/new/enhancement.svg";
        const info_src = "/assets/new/info-circle.png";
        const retest_src = "/assets/new/retest-icon.svg";
        const retest_src_light = "/assets/new/retest-icon_light.svg";
        switch (this.status) {
            case "Required":
                return html`<img class="status-icon" src=${stop_src} alt=""/>`
            case "Recommended":
                return html`<img class="status-icon" src=${yield_src} alt=""/>`
            case "Feature":
                return html`<img class="status-icon" src=${enhancement_src} alt=""/>`
            case "Optional":
                return html`<img class="status-icon" src=${info_src} alt=""/>`
            case "Retest":
                return html`<img class="status-icon" src=${this.darkMode ? retest_src_light : retest_src} style="color: black" alt="retest site icon"/>`
        }

        return html`<img class="status-icon" src=${yield_src} alt="yield result icon"/>`
    }


    render(): TemplateResult {
        return html`
            <sl-details>
                <div class="summary" slot="summary">
                    ${this.renderIcon()}
                    ${this.fix}
                </div>
                <p>${this.description}</p>
                ${this.renderError()}
                <div class="footer">
                    ${this.renderLearnMore()}
                    ${this.renderEditInManifest()}
                </div>
            </sl-details>  
        `;
    }

    renderError(): TemplateResult {
        if (!this.error) {
            return html``;
        }

        return html`
            <p><strong>Error:</strong> ${this.error}</p>
        `;
    }

    renderLearnMore(): TemplateResult {
        if (!this.docsUrl) {
            return html``;
        }

        return html`
            <sl-button href="${this.docsUrl}" target="_blank" variant="text" size="small">Learn more</sl-button>
        `;
    }

    renderEditInManifest(): TemplateResult {
        if (!this.field || this.card !== "WebAppManifest") {
            return html``;
        }

        return html`
            <sl-button @click=${this.openManifestEditor} variant="text" size="small">Edit in manifest</sl-button>
        `;
    }

    openManifestEditor() {
        // general counter
        recordPWABuilderProcessStep(`manifest_tooltip.open_editor_clicked`, AnalyticsBehavior.ProcessCheckpoint);
        recordPWABuilderProcessStep(`manifest_tooltip.${this.field}_open_editor_clicked`, AnalyticsBehavior.ProcessCheckpoint);

        // (this.shadowRoot!.querySelector(".tooltip") as unknown as SlDropdown).hide()
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
}
