import { LitElement, PropertyValueMap } from 'lit';
import { Manifest } from '@pwabuilder/manifest-validation';
import "./manifest-field-tooltip";
import '@shoelace-style/shoelace/dist/components/input/input.js';
import '@shoelace-style/shoelace/dist/components/select/select.js';
import '@shoelace-style/shoelace/dist/components/option/option.js';
import '@shoelace-style/shoelace/dist/components/details/details.js';
import '@shoelace-style/shoelace/dist/components/menu/menu.js';
import '@shoelace-style/shoelace/dist/components/menu-item/menu-item.js';
import '@shoelace-style/shoelace/dist/components/divider/divider.js';
import '@shoelace-style/shoelace/dist/components/checkbox/checkbox.js';
export declare class ManifestSettingsForm extends LitElement {
    manifest: Manifest;
    private shouldValidateAllFields;
    private validationPromise;
    focusOn: string;
    errorMap: any;
    activeOverrideItems: string[];
    static get styles(): import("lit").CSSResult;
    constructor();
    firstUpdated(): void;
    protected updated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): Promise<void>;
    private requestValidateAllFields;
    validateAllFields(): Promise<void>;
    initOverrideList(): void;
    handleInputChange(event: InputEvent): Promise<void>;
    parseLangCode(code: string): string;
    toggleOverrideList(label: string, origin: string): Promise<void>;
    validatePlatformList(field: string, updatedValue: any[]): Promise<void>;
    decideFocus(field: string): {
        focus: boolean;
    };
    render(): import("lit-html").TemplateResult<1>;
}
