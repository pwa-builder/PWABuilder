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
    return [
      style,
      ModalStyles,
      ToolTipStyles,
      css`
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
      `
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
        minlength="${ifDefined(formInput.minLength)}" pattern="${ifDefined(formInput.pattern)}"
        spellcheck="${ifDefined(formInput.spellcheck)}" @input="${(e: UIEvent) => this.inputChanged(e, formInput)}" />
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

  private inputChanged(e: UIEvent, formInput: FormInput) {
    const inputElement = e.target as HTMLInputElement | null;
    if (formInput.inputHandler) {
      formInput.inputHandler(inputElement?.value || '');
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
  pattern?: string;
  spellcheck?: boolean;
  inputHandler?: (val: string) => void;
}

/**
 * <label for='bundleIdInput'>
                Bundle ID
                <i
                  class='fas fa-info-circle'
                  title='The unique identifier of your app. It should contain only letters, numbers, and periods. Apple recommends a reverse-domain style string: com.domainname.appname. You'll need this value when uploading your app to the iOS App Store.'
                  aria-label='The unique identifier of your app. It should contain only letters, numbers, and periods. Apple recommends a reverse-domain style string: com.domainname.appname. You'll need this value when uploading your app to the iOS App Store.'
                  role='definition'
                ></i>

                ${tooltip(
                  'ios-bundleId-name',
                  `The unique identifier of your app. It should be at least 3 characters in length, and cannot contain asterisks. Apple recommends a reverse-domain style string: com.domainname.appname. You'll need this value when uploading your app to the iOS App Store.`
                )}
              </label>
              <input
                id='bundleIdInput'
                class='form-control'
                placeholder='com.domainname.app'
                value='${this.defaultOptions.bundleId || 'com.domainname.appname'}'
                type='text'
                required
                minlength='3'
                pattern='^[\*]*$'
                name='bundleId'
                @input='${(e: UIEvent) => this.bundleId = this.getInputValue(e.target)}'
              />
 * 
 */