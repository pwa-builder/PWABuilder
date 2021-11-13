import { css, html, LitElement, TemplateResult } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { smallBreakPoint, xxLargeBreakPoint } from '../utils/css/breakpoints';
//@ts-ignore
import style from '../../../styles/form-styles.css';
//@ts-ignore
import ModalStyles from '../../../styles/modal-styles.css';
import { styles as ToolTipStyles } from '../components/tooltip';
import '../components/hover-tooltip';
import { customElement } from 'lit/decorators.js';

@customElement('app-package-form-base')
export class AppPackageFormBase extends LitElement {
  static get styles() {
    const localStyles = css`
        #form-layout input {
          border: 1px solid rgba(194, 201, 209, 1);
          border-radius: var(--input-radius);
          color: var(--font-color);
        }

        #form-layout input:not([type='color']) {
          padding: 10px;
        }

        input::placeholder {
          color: var(--placeholder-color);
          font-style: italic;
        }

        #generate-submit {
          background: transparent;
          color: var(--button-font-color);
          font-weight: bold;
          border: none;
          cursor: pointer;

          height: var(--desktop-button-height);
          width: var(--button-width);
        }

        @media (min-height: 760px) and (max-height: 1000px) {
          form {
            width: 100%;
          }
        }

        ${xxLargeBreakPoint(
      css`
            #form-layout {
              max-height: 17em;
            }
          `
    )}

      ${smallBreakPoint(
      css`
          #form-layout {
            max-height: 20em;
          }
        `
    )}
    `;

    return [
      style,
      ModalStyles,
      ToolTipStyles,
      localStyles
    ];
  }

  constructor() {
    super();
  }

  protected renderFormInput(formInput: FormInput): TemplateResult {
    const inputType = formInput.type || 'text';
    return html`
      <label for="${formInput.inputId}">
        ${formInput.label}
        ${this.renderTooltip(formInput)}
      </label>
      <input id="${formInput.inputId}" class="form-control" placeholder="${formInput.placeholder || ''}"
        value="${formInput.value || ''}" type="${inputType}" ?required="${formInput.required}"
        minlength="${ifDefined(formInput.minLength)}" maxlength="${ifDefined(formInput.maxLength)}"
        pattern="${ifDefined(formInput.pattern)}" spellcheck="${ifDefined(formInput.spellcheck)}"
        custom-validation-error-message="${ifDefined(formInput.validationErrorMessage)}"
        @input="${(e: UIEvent) => this.inputChanged(e, formInput)}" @invalid=${this.inputInvalid} />
    `;
  }

  protected renderTooltip(formInput: FormInput): TemplateResult {
    if (!formInput.tooltip) {
      return html``;
    }

    return html`
      <i class='fas fa-info-circle' title='${formInput.tooltip}' aria-label='${formInput.tooltip}' role='definition'></i>
      
      <hover-tooltip text="${formInput.tooltip}" link="${ifDefined(formInput.tooltipLink)}">
      </hover-tooltip>
    `;
  }

  protected toggleAccordion(targetEl: EventTarget | null) {
    if (targetEl) {
      const flipperButton = (targetEl as Element).classList.contains(
        'flipper-button'
      )
        ? (targetEl as Element)
        : (targetEl as Element).querySelector('.flipper-button');

      if (flipperButton) {
        if (flipperButton.classList.contains('opened')) {
          flipperButton.animate(
            [
              {
                transform: 'rotate(0deg)',
              },
            ],
            {
              duration: 200,
              fill: 'forwards',
            }
          );

          flipperButton.classList.remove('opened');
        } else {
          flipperButton.classList.add('opened');

          flipperButton.animate(
            [
              {
                transform: 'rotate(0deg)',
              },
              {
                transform: 'rotate(90deg)',
              },
            ],
            {
              duration: 200,
              fill: 'forwards',
            }
          );
        }
      }
    }
  }

  private inputChanged(e: UIEvent, formInput: FormInput) {
    const inputElement = e.target as HTMLInputElement | null;
    if (inputElement) {
      // Fire the input handler
      if (formInput.inputHandler) {
        formInput.inputHandler(inputElement?.value || '');
      }

      // Run validation if necessary.
      if (formInput.validationErrorMessage) {
        const errorMessage = this.inputHasValidationErrors(inputElement) ? formInput.validationErrorMessage : '';
        inputElement.setCustomValidity(errorMessage);
        inputElement.title = errorMessage;
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
  type?: 'hidden' | 'text' | 'search' | 'tel' | 'url' | 'email' | 'password' | 'datetime' | 'date' | 'month' | 'week' | 'time' | 'datetime-local' | 'number' | 'range' | 'color' | 'checkbox' | 'radio' | 'file' | 'submit' | 'image' | 'reset' | 'button'
  placeholder?: string;
  value?: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  spellcheck?: boolean;
  validationErrorMessage?: string;
  inputHandler?: (val: string) => void;
}