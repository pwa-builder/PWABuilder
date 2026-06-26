import { css } from "lit";

export const appPackageFormBaseStyles = css`
      #form-layout input {
        border: 1px solid rgba(194, 201, 209, 1);
        border-radius: var(--input-border-radius);
        color: var(--font-color);
      }

      #form-layout input:not([type='color']) {
        padding: 10px;
      }

      input::placeholder {
        color: var(--placeholder-color);
        font-style: italic;
      }

      #form-extras wa-button::part(base) {
        background-color: var(--font-color);
        color: #ffffff;
        font-size: 14px;
        height: 3em;
        width: 25%;
        border-radius: var(--button-border-radius);
      }

      #form-extras wa-button::part(label){
        display: flex;
        align-items: center;
      }

      #form-layout {
        overflow-y: auto;
        padding: 0em 1.5em 0 1em;
      }

      .tooltip {
        margin-left: 10px;
      }

      .form-group .tooltip a {
        color: #fff;
      }

      .form-group {
        display: flex;
        flex-direction: column;
      }

      .form-group label {
        font-size: var(--small-medium-font-size);
        font-weight: bold;
        line-height: 40px;
        display: flex;
        align-items: center;
      }

      .form-group label a {
        text-decoration: none;
        color: var(--font-color);
      }

      /* Inline required asterisk, matching WebAwesome's required-indicator tokens. */
      .required-indicator {
        color: var(--wa-form-control-required-content-color);
        margin-inline-start: var(--wa-form-control-required-content-offset);
      }

      /* Suppress wa-input's built-in required asterisk: we render no label inside
         wa-input, so its asterisk would otherwise appear alone on its own line.
         We show the asterisk inline next to our own <label> instead. */
      wa-input.form-control {
        --wa-form-control-required-content: '';
      }

      wa-input.form-control::part(label) {
        display: none;
      }

      #form-options-actions {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        gap: .25em;
      }

      #form-details-block {
        display: flex;
        align-items: flex-start;
        flex-direction: column;
        justify-content: space-between;
        width: 55%;
        gap: .25em;
      }

      #form-details-block p {
        font-weight: 300;
        font-size: 14px;
        color: #808080;
        margin: 0;
      }

      .select-group {
        display: flex;
        margin-bottom: 10px;
        padding-left: 2em;
      }

      #all-settings-header {
        color: var(--font-color);
        font-weight: var(--font-bold);
        font-size: 18px;

        display: flex;
        align-items: center;
      }

      .form-check {
        display: flex;
        align-items: center;
      }

      /* The checkbox label text and its trailing info-circle-tooltip are both
         slotted into wa-checkbox's "label" part, which defaults to display:block
         and sizes to content width, causing the tooltip to wrap onto a second
         line. Lay the label part out as an inline row so they stay on one line. */
      .form-check wa-checkbox::part(label) {
        display: inline-flex;
        align-items: center;
      }

      .form-check label {
        font-weight: normal;
        margin-left: 8px;
      }

      #form-layout input:invalid {
        color: var(--error-color);
        border: 1px solid var(--error-color);
      }

      input:disabled {
        cursor: no-drop;
      }

      wa-color-picker {
        --grid-width: 315px;
      }

      /*
        WebAwesome's wa-color-picker includes an internal form-control label area
        in its shadow DOM. We render our own label outside the picker, so hide the
        empty internal one; otherwise it reserves vertical space and (combined with
        a fixed host height) crushes the trigger swatch to a thin sliver.
      */
      wa-color-picker::part(form-control-label) {
        display: none;
      }

      wa-color-picker::part(trigger){
        border-radius: 0;
        height: 25px;
        width: 75px;
        display: flex;
      }

      .colorPickerAndValue {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .colorPickerAndValue p {
        margin: 0;
        color: var(--secondary-font-color);
      }


      @media (min-height: 760px) and (max-height: 1000px) {
        form {
          width: 100%;
        }
      }
    `;
