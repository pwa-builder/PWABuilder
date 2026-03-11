import { LitElement } from 'lit';
import '../components/app-header';
import '../components/publish-pane';
import '../components/test-publish-pane';
import '@shoelace-style/shoelace/dist/components/skeleton/skeleton.js';
export declare class AppReport extends LitElement {
    static get styles(): import("lit").CSSResult[];
    firstUpdated(): Promise<void>;
    delay(ms: number): Promise<unknown>;
    openPublishModal(): Promise<void>;
    render(): import("lit-html").TemplateResult<1>;
}
