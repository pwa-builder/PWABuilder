import { LitElement, PropertyValueMap } from 'lit';
import { Manifest } from '@pwabuilder/manifest-validation';
import "./manifest-field-tooltip";
import '@shoelace-style/shoelace/dist/components/input/input.js';
import '@shoelace-style/shoelace/dist/components/textarea/textarea.js';
import '@shoelace-style/shoelace/dist/components/color-picker/color-picker.js';
export declare class ManifestInfoForm extends LitElement {
    manifest: Manifest;
    focusOn: string;
    bgText: string;
    themeText: string;
    errorMap: any;
    private shouldValidateAllFields;
    private validationPromise;
    static styles: import("lit").CSSResult[];
    protected updated(_changedProperties: PropertyValueMap<this>): Promise<void>;
    private requestValidateAllFields;
    validateAllFields(): Promise<void>;
    initMissingColors(): void;
    handleInputChange(event: InputEvent): Promise<void>;
    handleColorSwitch(field: string): void;
    decideFocus(field: string): {
        focus: boolean;
    };
    render(): import("lit-html").TemplateResult<1>;
}
