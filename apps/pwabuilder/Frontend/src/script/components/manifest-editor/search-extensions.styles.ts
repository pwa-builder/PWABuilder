import { css } from "lit";

export const searchExtensionsStyles = css`

      :host {
        --wa-input-focus-ring-width: 3px;
        --wa-input-focus-ring-color: #4f3fb670;
        --wa-input-focus-ring: 0 0 0 var(--wa-input-focus-ring-width) var(--wa-input-focus-ring-color);
        --wa-input-border-color-focus: #4F3FB6ac;
        --wa-input-font-family: Hind, sans-serif;
      }

      wa-input::part(base) {
        --wa-input-font-size-medium: 16px;
        --wa-font-size-m: 16px;
        --wa-font-size-s: 14px;
        --wa-input-height-medium: 3em;
        --wa-toggle-size: 16px;
        --wa-toggle-size-small: 16px;
        --wa-input-font-size-small: 16px;
        --wa-button-font-size-medium: 14px;
      }
      wa-input::part(base){
        background-color: #fbfbfb;
      }
      .error::part(base){
        border-color: #eb5757;
        --wa-input-focus-ring-color: #eb575770;
        --wa-input-focus-ring-width: 3px;
        --wa-input-focus-ring: 0 0 0 var(--wa-input-focus-ring-width) var(--wa-input-focus-ring-color);
        --wa-input-border-color-focus: #eb5757ac;
      }

      .error::part(control){
        border-color: #eb5757;
      }

      .error-message {
        color: #eb5757;
        margin: 5px 0;
        font-size: 14px;
        display: none;
      }

      .form-row {
        display: flex;
        column-gap: 1em;
      }
      .long .form-field {
        width: 100%;
      }
      
      .type-box {
        max-width: 265px;
        min-height: 40px;
        border: 1px solid #d4d4d8;
        border-radius: .25rem;
        padding: 2px;
        transition: all .1s ease-in-out;
        display: flex;
        gap: 5px;
        flex-wrap: wrap;
        align-items: center;
        position: relative;
      }

      .type-box input {
        border: none;
        font-size: 16px;
        width: 2ch;
      }

      .type-box input:focus, input:active, input:focus-visible {
        border: none;
        outline: none;
      }

      .type-box:hover {
        border: 1px solid #a1a1aa;
      }

      .focused {
        border: 1px solid #4F3FB6ac;
        outline: 3px solid #4f3fb670;
      }

      .form-field p {
        font-size: 14px;
      }
      
      .suggestions {
        display: none;
        position: absolute;
        top: 105%;
        height: fit-content;
        max-height: 200px;
        width: 100%;
        border-radius: 8px;
        z-index: 1;
        overflow-y: scroll;
        flex-direction: column;
        gap: 10px;
        border: 1px solid #C5C5C5;
        background-color: #ffffff;
      }

      .suggestion:first-child{
        margin-top: 5px;
      }

      .suggestions p {
        font-size: 16px;
        margin: 0;
        padding: 11px 22px;
      }

      .suggestions p:hover {
        cursor: pointer;
        background-color: #4f3fb6;
        color: #ffffff;
      }

      .file-holder {
        background: #FBFBFB;
        border: 1px solid #C0C0C0;
        border-radius: 8px;
        padding: 10px;
        position: relative;
      }

      .sub {
        font-size: 18px;
        margin: 0;
        color: #757575;
      }

      .form-field {
        width: 50%;
        min-width: 0;
        row-gap: .25em;
        display: flex;
        flex-direction: column;
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
      
      .remove-file {
        position: absolute;
        top: 0;
        right: 0;
      }

      .remove-file::part(base):hover {
        color: #4f3fb6;
      }

      .error:not(wa-input){
        border: 1px solid #eb5757ac;
      }

      .focused.error  {
        border: 1px solid #eb5757ac;
        outline: 3px solid #eb575770;
      }

      .error-message {
        color: #eb5757;
        margin: 5px 0;
        font-size: 14px;
        display: none;
      }

      @media(max-width: 600px){
        .form-row {
          flex-direction: column;
          gap: 10px;
        }
        .form-field {
          width: 100%;
        }
        .type-box{
          max-width: unset;
          width: 100%;
        }
      }
      
    `;
