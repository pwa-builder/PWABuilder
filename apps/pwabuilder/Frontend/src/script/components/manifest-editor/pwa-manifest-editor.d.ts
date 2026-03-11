import { LitElement } from 'lit';
import "./manifest-info-form";
import "./manifest-settings-form";
import "./manifest-platform-form";
import "./manifest-icons-form";
import "./manifest-screenshots-form";
import "./manifest-share-form";
import "./manifest-code-form";
import SlDropdown from '@shoelace-style/shoelace/dist/components/dropdown/dropdown.js';
import '@shoelace-style/shoelace/dist/components/dropdown/dropdown.js';
import '@shoelace-style/shoelace/dist/components/tab-group/tab-group.js';
import '@shoelace-style/shoelace/dist/components/tab/tab.js';
import '@shoelace-style/shoelace/dist/components/tab-panel/tab-panel.js';
import { Manifest } from "@pwabuilder/manifest-validation";
import "./manifest-share-form";
/**
 * @since 0.1
 * @status stable
 *
 * @property initialManifest - the initial manifest to be edited/tested.
 * @property manifestURL - used to fetch images (screenshots & icons).
 *
 * @event manifestUpdated - Emitted when any field in the manifest.
 * @event iconsUpdated - Emitted when changes are made to the icons field.
 * @event screenshotsUpdated - Emitted when changes are made to the screenshots field.
 *
 * @method resetManifest - Resets the manifest back to value of initialManifest.
 * @method downloadManifest - Writes and downloads the manifest to a file called manifest.json.
 * @method getIcons - Returns a list of the blobs all the icons.
 * @method getScreenshots - Returns a list of the blobs of all the screenshots.
 **/
export declare class PWAManifestEditor extends LitElement {
    private _initialManifest;
    set initialManifest(manifest: Manifest);
    get initialManifest(): Manifest;
    manifestURL: string;
    baseURL: string;
    startingTab: string;
    focusOn: string;
    analysisId: string;
    imageProxyUrl: string;
    manifest: Manifest;
    selectedTab: string;
    openTooltips: SlDropdown[];
    static get styles(): import("lit").CSSResult;
    constructor();
    updated(): Promise<void>;
    private removeEmptyFields;
    private updateManifest;
    resetManifest(): void;
    downloadManifest(): void;
    getScreenshots(): import("@pwabuilder/manifest-validation").Screenshot[] | undefined;
    errorInTab(e: CustomEvent): void;
    cleanUrl(url: string): string;
    isValidURL(str: string): boolean;
    setSelectedTab(e: any): void;
    handleShowingTooltip(e: CustomEvent): void;
    render(): import("lit-html").TemplateResult<1>;
}
