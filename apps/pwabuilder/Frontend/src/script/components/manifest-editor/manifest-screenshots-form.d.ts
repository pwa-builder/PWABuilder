import { Manifest, Screenshot, Icon } from '@pwabuilder/manifest-validation';
import { LitElement, PropertyValueMap } from 'lit';
import "./manifest-field-tooltip";
import "@shoelace-style/shoelace/dist/components/icon/icon.js";
export declare class ManifestScreenshotsForm extends LitElement {
    manifest: Manifest;
    manifestURL: string;
    baseURL: string;
    focusOn: string;
    screenshotUrlList: Array<string | undefined>;
    screenshotListValid: Array<boolean>;
    protected addScreenshotUrlDisabled: boolean;
    protected generateScreenshotButtonDisabled: boolean;
    protected awaitRequest: boolean;
    protected screenshotsList: Screenshot[];
    initialScreenshotLength: number;
    srcList: any;
    newSrcList: any;
    protected showSuccessMessage: boolean;
    protected showErrorMessage: boolean;
    private shouldValidateAllFields;
    private validationPromise;
    private errorCount;
    static get styles(): import("lit").CSSResult;
    constructor();
    protected updated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): Promise<void>;
    private requestValidateAllFields;
    validateAllFields(): Promise<void>;
    screenshotSrcListParse(): Promise<void>;
    testImage(url: string): Promise<unknown>;
    handleImageUrl(icon: Icon): string | undefined;
    decideFocus(field: string): {
        focus: boolean;
    };
    render(): import("lit-html").TemplateResult<1>;
}
