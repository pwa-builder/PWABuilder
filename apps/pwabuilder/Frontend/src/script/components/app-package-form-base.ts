import { html, LitElement, TemplateResult } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
//@ts-ignore
import style from '../../../styles/form-styles.css';
//@ts-ignore
import ModalStyles from '../../../styles/modal-styles.css';
import '../components/info-circle-tooltip';
import { customElement } from 'lit/decorators.js';
import { PackageOptions } from '../utils/interfaces';
import '@awesome.me/webawesome/dist/components/color-picker/color-picker.js';
import "@awesome.me/webawesome/dist/components/input/input.js";
import "@awesome.me/webawesome/dist/components/tooltip/tooltip.js";
import "@awesome.me/webawesome/dist/components/checkbox/checkbox.js";
import { appPackageFormBaseStyles } from './app-package-form-base.styles';
import '@awesome.me/webawesome/dist/components/radio-group/radio-group.js';
import '@awesome.me/webawesome/dist/components/radio/radio.js';


/**
 * Base class for app package forms, e.g. the Windows package form, the Android package form, the iOS package form, etc.
 * Shares styles across forms and shares common code, such as form label + input rendering, accordion toggling, etc.
 */
@customElement('app-package-form-base')
export class AppPackageFormBase extends LitElement {

    static styles = [appPackageFormBaseStyles];

    constructor() {
        super();
    }

    getPackageOptions(): PackageOptions {
        return {};
    }

    getForm(): HTMLFormElement | undefined {
        return undefined;
    }

    protected renderFormInput(formInput: FormInput): TemplateResult {
        // Ensure a stable id so the <label for> association and any disabled-state
        // <wa-tooltip for> can reference this control. WebAwesome tooltips anchor to
        // their trigger via the `for` attribute (resolved by getElementById), so the
        // id must exist before the label and tooltip are rendered.
        if (!formInput.inputId) {
            formInput.inputId = Math.random().toString(36).replace('0.', 'form-input-');
        }

        // Checkboxes render as a WebAwesome checkbox with the label slotted inside.
        if (formInput.type === 'checkbox') {
            return this.renderFormCheckbox(formInput);
        }

        if (formInput.type === 'color') {
            return html`
                ${this.renderFormInputLabel(formInput)}
                ${this.renderFormColorPicker(formInput)}
            `;
        }

        // For all others, the label comes first.
        return html`
            ${this.renderFormInputLabel(formInput)}
            ${this.renderFormInputTextbox(formInput)}
        `;
    }

    private renderFormColorPicker(formInput: FormInput) {
        return html`
    <div class="colorPickerAndValue">
      <wa-color-picker
              id="${formInput.inputId}"
              class="form-control"
              placeholder="${formInput.placeholder || ''}"
              .value="${(formInput.value as string) ?? ''}"
              type="color"
              ?required="${formInput.required}"
              name="${ifDefined(formInput.name)}"
              minlength="${ifDefined(formInput.minLength)}"
              maxlength="${ifDefined(formInput.maxLength)}"
              min=${ifDefined(formInput.minValue)}
              max="${ifDefined(formInput.maxValue)}"
              pattern="${ifDefined(formInput.pattern)}"
              spellcheck="${ifDefined(formInput.spellcheck)}"
              ?checked="${formInput.checked}"
              ?readonly="${formInput.readonly}"
              custom-validation-error-message="${ifDefined(formInput.validationErrorMessage)}"
              ?disabled=${formInput.disabled}
              @change="${(e: UIEvent) => this.colorChanged(e, formInput)}"
              @wa-invalid=${this.inputInvalid}
            ></wa-color-picker>
            <p>${formInput.value}</p>
  </div>`;
    }

    private renderFormInputTextbox(formInput: FormInput): TemplateResult {
        const inputType = formInput.type || 'text';
        const allInputClasses = 'form-control' + (formInput.classes ? ` ${formInput.classes}` : '');

        const input = html`
            <wa-input id="${formInput.inputId}"
                class="${allInputClasses}"
                placeholder="${formInput.placeholder || ''}"
                value="${ifDefined(formInput.value as string)}"
                type="${inputType}"
                ?required="${formInput.required}"
                name="${ifDefined(formInput.name)}"
                minlength="${ifDefined(formInput.minLength)}"
                maxlength="${ifDefined(formInput.maxLength)}"
                min=${ifDefined(formInput.minValue)}
                max="${ifDefined(formInput.maxValue)}"
                pattern="${ifDefined(formInput.pattern)}"
                spellcheck="${ifDefined(formInput.spellcheck)}"
                ?readonly="${formInput.readonly}"
                ?disabled=${formInput.disabled}
                @input="${(e: UIEvent) => this.onInput(e, formInput)}"
                @change="${(e: UIEvent) => this.onChange(e, formInput)}"
                @wa-invalid=${this.inputInvalid}></wa-input>
        `;

        return formInput.disabled
            ? html`${input}<wa-tooltip for="${formInput.inputId}">${formInput.disabledTooltipText || ""}</wa-tooltip>`
            : input;
    }

    private renderFormCheckbox(formInput: FormInput): TemplateResult {
        const allInputClasses = 'form-check-input' + (formInput.classes ? ` ${formInput.classes}` : '');

        const checkbox = html`
      <wa-checkbox id="${formInput.inputId}"
        class="${allInputClasses}"
        name="${ifDefined(formInput.name)}"
        value="${ifDefined(formInput.value as string)}"
        ?checked="${formInput.checked}"
        ?required="${formInput.required}"
        ?disabled=${formInput.disabled}
        @input="${(e: UIEvent) => this.onInput(e, formInput)}"
        @change="${(e: UIEvent) => this.onChange(e, formInput)}"
        @wa-invalid=${this.inputInvalid}>
        ${formInput.label}
        ${this.renderTooltip(formInput)}
      </wa-checkbox>
    `;

        return formInput.disabled
            ? html`${checkbox}<wa-tooltip for="${formInput.inputId}">${formInput.disabledTooltipText || ""}</wa-tooltip>`
            : checkbox;
    }

    /**
     * Renders a set of mutually-exclusive options as a WebAwesome radio group.
     * The <wa-radio-group> owns selection state and keyboard navigation; its change
     * event reports the selected value, which is forwarded to valueChangedHandler.
     */
    protected renderFormRadioGroup(radioGroup: FormRadioGroup): TemplateResult {
        return html`
      <wa-radio-group
        name="${ifDefined(radioGroup.name)}"
        .value=${radioGroup.value}
        ?disabled=${radioGroup.disabled}
        @change=${(e: Event) => radioGroup.valueChangedHandler((e.target as HTMLInputElement).value)}
        @wa-invalid=${this.inputInvalid}>
        ${radioGroup.radios.map(radio => html`
          <wa-radio value="${radio.value}">
            ${radio.label}
            ${this.renderTooltip({ label: radio.label, inputId: radio.inputId ?? '', tooltip: radio.tooltip, tooltipLink: radio.tooltipLink })}
          </wa-radio>
        `)}
      </wa-radio-group>
    `;
    }


    private renderFormInputLabel(formInput: FormInput): TemplateResult {
        // We render the required asterisk inline next to our own label text (rather than
        // letting wa-input render it on its empty internal label, which appears on a new
        // line). wa-input's built-in indicator is suppressed via component styles.
        return html`
      <label for="${formInput.inputId}">
        ${formInput.label}${formInput.required ? html`<span class="required-indicator">*</span>` : ''}
        ${this.renderTooltip(formInput)}
      </label>
    `;
    }

    protected renderTooltip(formInput: FormInput): TemplateResult {
        if (!formInput.tooltip) {
            return html``;
        }

        // Ensure we have an ID for this element. If not, add one.
        // We need it for the tooltip.
        if (!formInput.inputId) {
            formInput.inputId = Math.random().toString(36).replace('0.', 'form-input-');
        }

        return html`
      <info-circle-tooltip text="${formInput.tooltip}" link="${ifDefined(formInput.tooltipLink)}" ?disabled=${formInput.disabled}>
      </info-circle-tooltip>
    `;
    }

    private colorChanged(e: UIEvent, formInput: FormInput) {
        interface HTMLSlColorPicker extends HTMLInputElement {
            getFormattedValue(format?: 'hex' | 'hexa' | 'rgb' | 'rgba' | 'hsl' | 'hsla' | 'hsv' | 'hsva'): string;
        }
        const inputElement = e.target as HTMLSlColorPicker;

        if (!inputElement || !inputElement.nextElementSibling) return;

        const formattedValue = inputElement.getFormattedValue('hex').toLocaleUpperCase();
        const colorValue = inputElement.nextElementSibling;
        const newValue = document.createElement('p');
        newValue.textContent = formattedValue;

        colorValue.replaceWith(newValue);

        // Run validation if necessary.
        if (formInput.validationErrorMessage) {
            const errorMessage = this.inputHasValidationErrors(inputElement) ? formInput.validationErrorMessage : '';
            inputElement.setCustomValidity(errorMessage);
            inputElement.title = errorMessage;
        }

        // Fire the input handler
        if (formInput.inputHandler) {
            formInput.inputHandler(formattedValue, inputElement.checked, inputElement);
        }
    }

    private onInput(e: UIEvent, formInput: FormInput) {
        const inputElement = e.target as HTMLInputElement | null;
        if (inputElement) {
            // Run validation if necessary.
            if (formInput.validationErrorMessage) {
                const errorMessage = this.inputHasValidationErrors(inputElement) ? formInput.validationErrorMessage : '';
                inputElement.setCustomValidity(errorMessage);
                inputElement.title = errorMessage;
            }

            // Fire the input handler
            if (formInput.inputHandler) {
                formInput.inputHandler(inputElement.value || '', inputElement.checked, inputElement);
            }
        }
    }

    private onChange(e: UIEvent, formInput: FormInput) {
        const inputElement = e.target as HTMLInputElement | null;
        if (inputElement) {
            // Fire the changed handler
            if (formInput.changedHandler) {
                formInput.changedHandler(inputElement.value || '', inputElement.checked, inputElement);
            }
        }
    }

    private inputInvalid(e: UIEvent) {
        const element = e.target as HTMLInputElement;
        if (element) {
            this.expandParentAccordionIfNeeded(element);
        }
    }

    private inputHasValidationErrors(input: HTMLInputElement): boolean {
        const statesChecked = [
            input.validity.badInput,
            input.validity.patternMismatch,
            input.validity.rangeOverflow,
            input.validity.rangeUnderflow,
            input.validity.stepMismatch,
            input.validity.tooLong,
            input.validity.tooShort,
            input.validity.typeMismatch,
            input.validity.valueMissing
        ];

        return statesChecked.some(s => s === true);
    }

    private expandParentAccordionIfNeeded(element: HTMLInputElement) {
        // If the accordion is hiding any invalid inputs, open it.
        const isInvalid = !element.validity.valid;
        const parentAccordion = element.closest('fast-accordion-item');
        if (parentAccordion && (parentAccordion as any).expanded === false && isInvalid) {
            const accordionFlipper = parentAccordion.querySelector<HTMLElement>(".flipper-button");
            accordionFlipper?.click();
            setTimeout(() => {
                element.scrollIntoView();
                element.reportValidity();
            }, 0);
        }
    }
}

export interface FormInput {
    label: string;
    tooltip?: string;
    tooltipLink?: string;
    inputId: string;
    name?: string;
    type?: 'hidden' | 'text' | 'search' | 'tel' | 'url' | 'email' | 'password' | 'datetime' | 'date' | 'month' | 'week' | 'time' | 'datetime-local' | 'number' | 'range' | 'color' | 'checkbox' | 'radio' | 'file' | 'submit' | 'image' | 'reset' | 'button'
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

/**
 * A group of mutually-exclusive radio options rendered via <wa-radio-group>.
 */
export interface FormRadioGroup {
    name?: string;
    value: string;
    disabled?: boolean;
    valueChangedHandler: (value: string) => void;
    radios: FormRadio[];
}

/**
 * A single option within a {@link FormRadioGroup}.
 */
export interface FormRadio {
    label: string;
    value: string;
    tooltip?: string;
    tooltipLink?: string;
    inputId?: string;
}