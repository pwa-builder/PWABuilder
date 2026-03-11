import { LitElement, TemplateResult } from 'lit';
import '../components/info-circle-tooltip';
import { PackageOptions } from '../utils/interfaces';
import '@shoelace-style/shoelace/dist/components/color-picker/color-picker.js';
/**
 * Base class for app package forms, e.g. the Windows package form, the Android package form, the iOS package form, etc.
 * Shares styles across forms and shares common code, such as form label + input rendering, accordion toggling, etc.
 */
export declare class AppPackageFormBase extends LitElement {
    static get styles(): import("lit").CSSResult[];
    constructor();
    getPackageOptions(): PackageOptions;
    getForm(): HTMLFormElement | undefined;
    protected renderFormInput(formInput: FormInput): TemplateResult;
    private renderFormColorPicker;
    private renderFormInputTextbox;
    private renderFormInputLabel;
    protected renderTooltip(formInput: FormInput): TemplateResult;
    private colorChanged;
    private onInput;
    private onChange;
    private inputInvalid;
    private inputHasValidationErrors;
    private expandParentAccordionIfNeeded;
}
export interface FormInput {
    label: string;
    tooltip?: string;
    tooltipLink?: string;
    inputId: string;
    name?: string;
    type?: 'hidden' | 'text' | 'search' | 'tel' | 'url' | 'email' | 'password' | 'datetime' | 'date' | 'month' | 'week' | 'time' | 'datetime-local' | 'number' | 'range' | 'color' | 'checkbox' | 'radio' | 'file' | 'submit' | 'image' | 'reset' | 'button';
    placeholder?: string;
    value?: string | string[];
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    minValue?: number;
    maxValue?: number;
    pattern?: string;
    spellcheck?: boolean;
    readonly?: boolean;
    validationErrorMessage?: string;
    checked?: boolean;
    disabled?: boolean;
    classes?: string;
    disabledTooltipText?: string;
    inputHandler?: (val: string, checked: boolean, input: HTMLInputElement) => void;
    changedHandler?: (val: string, checked: boolean, input: HTMLInputElement) => void;
}
