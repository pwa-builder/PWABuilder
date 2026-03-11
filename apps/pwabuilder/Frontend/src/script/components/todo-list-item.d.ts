import { LitElement, TemplateResult } from 'lit';
import './manifest-info-card';
import './sw-info-card';
import "@shoelace-style/shoelace/dist/components/details/details.js";
import "@shoelace-style/shoelace/dist/components/button/button.js";
export declare class TodoItem extends LitElement {
    field: string;
    card: "ServiceWorker" | "WebAppManifest" | "Https" | "General" | "";
    fix: string;
    status: "Required" | "Recommended" | "Optional" | "Feature" | "Retest" | "";
    error: string | null;
    description: string;
    docsUrl: string | null;
    imageUrl: string | null;
    clickable: boolean;
    isOpen: boolean;
    darkMode: boolean;
    static styles: import("lit").CSSResult[];
    constructor();
    connectedCallback(): void;
    renderIcon(): TemplateResult;
    render(): TemplateResult;
    renderError(): TemplateResult;
    renderLearnMore(): TemplateResult;
    renderEditInManifest(): TemplateResult;
    openManifestEditor(): void;
}
