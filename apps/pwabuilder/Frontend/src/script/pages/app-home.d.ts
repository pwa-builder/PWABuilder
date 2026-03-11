import { LitElement } from 'lit';
import '../components/app-header';
import '../components/companies-packaged';
import '../components/resource-hub';
import '../components/success-stories';
import '../components/community-hub';
import { Lazy, ProgressList } from '../utils/interfaces';
import '@shoelace-style/shoelace/dist/components/input/input.js';
import '@shoelace-style/shoelace/dist/components/button/button.js';
export declare class AppHome extends LitElement {
    siteURL: Lazy<string>;
    gettingManifest: boolean;
    errorGettingURL: boolean;
    errorMessage: string | undefined;
    disableStart: boolean;
    static styles: import("lit").CSSResult;
    constructor();
    firstUpdated(): Promise<void>;
    handleURL(inputEvent: InputEvent): void;
    start(inputEvent: InputEvent): Promise<void>;
    analyzeSite(): Promise<void>;
    updateProgress(progressData: ProgressList): void;
    placeDemoURL(): void;
    render(): import("lit-html").TemplateResult<1>;
}
