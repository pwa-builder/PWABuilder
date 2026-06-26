import { css } from "lit";

export const manifestSettingsFormStyles = css`

      :host {
        --wa-input-focus-ring-width: 3px;
        --wa-input-focus-ring-color: #4f3fb670;
        --wa-input-focus-ring: 0 0 0 var(--wa-input-focus-ring-width) var(--wa-input-focus-ring-color);
        --wa-input-border-color-focus: #4F3FB6ac;
        --wa-input-font-family: Hind, sans-serif;
      }

      wa-input::part(base),
      wa-select::part(form-control),
      wa-dropdown-item::part(label),
      wa-option::part(base),
      .override-menu-label,
      wa-checkbox::part(base) {
        --wa-input-font-size-medium: 16px;
        --wa-font-size-m: 16px;
        --wa-font-size-s: 14px;
        --wa-input-height-medium: 3em;
        --wa-toggle-size: 16px;
        --wa-toggle-size-small: 16px;
        --wa-input-font-size-small: 16px;
      }
      wa-input::part(base),
      wa-select::part(combobox),
      wa-details::part(base){
        background-color: #fbfbfb;
      }
      #form-holder {
        display: flex;
        flex-direction: column;
        row-gap: 1em;
      }
      .form-row {
        display: flex;
        column-gap: 1em;
      }
      .form-row h3 {
        font-size: 18px;
        margin: 0;
      }
      /* Inline required asterisk, matching WebAwesome's required-indicator tokens. */
      .required-asterisk {
        color: var(--wa-form-control-required-content-color);
        margin-inline-start: var(--wa-form-control-required-content-offset);
      }
      /* Suppress wa-input's built-in required asterisk: it renders on the input's
         empty internal label line (its own line). We show it inline in our <h3> instead. */
      wa-input[required]::part(label) {
        display: none;
      }
      .field-desc {
        font-size: 14px;
        margin: 0;
        color: #717171;
      }
      wa-input::part(input), 
      wa-select::part(display-input), 
      wa-details::part(summary){
        color: #717171;
      }
      .long .form-field {
        width: 100%;
      }
      .form-field {
        width: 50%;
        min-width: 0;
        row-gap: .25em;
        display: flex;
        flex-direction: column;
      }
      .form-field p {
        font-size: 14px;
      }
      .field-header{
        display: flex;
        align-items: center;
        justify-content: space-between;
        column-gap: 5px;
      }

      .header-left{
        display: flex;
        align-items: center;
        column-gap: 10px;
      }
      .color_field {
        display: flex;
        flex-direction: column;
      }
      .color-holder {
        display: flex;
        align-items: center;
        column-gap: 10px;
      }
      .toolTip {
        font-size: 14px;
        visibility: hidden;
        width: 150px;
        background: black;
        color: white;
        font-weight: 500;
        text-align: center;
        border-radius: 6px;
        padding: .75em;
        /* Position the tooltip */
        position: absolute;
        top: 20px;
        left: -25px;
        z-index: 1;
        box-shadow: 0px 2px 20px 0px #0000006c;
      }
      .field-header a {
        display: flex;
        align-items: center;
        position: relative;
        color: black;
      }
      a:hover .toolTip {
        visibility: visible;
      }
      a:visited, a:focus {
        color: black;
      }
      .override-menu {
        width: 100%;
      }
      .override-menu-label {
        font-weight: bold;
        padding: 6px 12px;
      }

      .error::part(base){
        border-color: #eb5757;
        --wa-input-focus-ring-color: ##eb575770;
        --wa-input-focus-ring-width: 3px;
        --wa-input-focus-ring: 0 0 0 var(--wa-input-focus-ring-width) var(--wa-input-focus-ring-color);
        --wa-input-border-color-focus: #eb5757ac;
      }

      .error::part(control){
        border-color: #eb5757;
      }

      #override-list {
        display: flex;
        flex-direction: column;
        row-gap: 5px;
      }
      #override-item {
        display: flex;
        align-items: center;
        column-gap: 10px;
      }

      #override-item::part(label){
        font-size: 16px;
      }

      wa-details {
        width: 100%;
      }
      wa-details::part(base){
        width: 100%;
        max-height: fit-content
      }
      wa-details::part(header){
        padding: 10px 15px;
        font-size: 16px;
      }

      wa-details:focus {
        outline: 5px solid var(--wa-input-focus-ring-color);
        border-radius: 5px;
      }

      wa-details.error:focus {
        outline: 5px solid #eb575770;
        border-radius: 5px;
      }

      .menu-prefix {
        padding: 0 .5em;
        font-weight: 600;
        padding-top: 3px;
        font-size: 14px;
        margin: 0;
      }

      #override-options-grid{
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: center;
        gap: .25em .5em;
      }

      #override-options-grid wa-checkbox::part(label) {
        font-size: 16px;
        line-height: 16px;
        margin-left: .25em;
      }

      .focus {
        color: #4f3fb6;
      }

      wa-dropdown-item:focus-within::part(label) {
        color: #ffffff;
        background-color: #4F3FB6;
      }
      
      wa-dropdown-item:hover::part(label) {
        color: #ffffff;
        background-color: #4F3FB6;
      }

      wa-option:focus-within::part(base) {
        color: #ffffff;
        background-color: #4F3FB6;
      }
      
      wa-option::part(base):hover {
        color: #ffffff;
        background-color: #4F3FB6;
      }

      wa-checkbox[checked]::part(control) {
        background-color: #4f3fb6;
        border-color: #4f3fb6;
        color: #ffffff;
      }


      @media(max-width: 765px){
        .form-row {
          flex-direction: column;
          row-gap: 1em;
        }
        .form-field {
          width: 100%;
        }
      }

      @media(max-width: 480px){
        wa-input::part(base),
        wa-select::part(control),
        wa-dropdown-item::part(label),
        wa-option::part(base) {
          --wa-input-font-size-medium: 14px;
          --wa-font-size-m: 14px;
          --wa-input-height-medium: 2.5em;
        }

        .form-row p {
          font-size: 12px;
        }

        .form-row h3 {
          font-size: 16px;
        }
        .field-header a:after {
          content: "";
          position: absolute;
          left: -13px;
          top: -13px;
          z-index: -1;
          width: 40px;
          height: 40px;
          border-radius: 7px;
        }
      }
    `;
