import { css } from "lit";

export const manifestShareFormStyles = css`

      :host {
        --wa-input-focus-ring-width: 3px;
        --wa-input-focus-ring-color: #4f3fb670;
        --wa-input-focus-ring: 0 0 0 var(--wa-input-focus-ring-width) var(--wa-input-focus-ring-color);
        --wa-input-border-color-focus: #4F3FB6ac;
        --wa-input-font-family: Hind, sans-serif;
      }

      wa-input::part(base),
      wa-select::part(form-control),
      wa-option::part(base),
      wa-button::part(base) {
        --wa-input-font-size-medium: 16px;
        --wa-font-size-m: 16px;
        --wa-font-size-s: 14px;
        --wa-input-height-medium: 3em;
        --wa-toggle-size: 16px;
        --wa-toggle-size-small: 16px;
        --wa-input-font-size-small: 16px;
        --wa-button-font-size-medium: 14px;
      }
      wa-input::part(base),
      wa-select::part(combobox){
        background-color: #fbfbfb;
      }
    
      #form-holder {
        display: flex;
        flex-direction: column;
        row-gap: 1em;
      }

      #share-target-form {
        display: flex;
        flex-direction: column;
        row-gap: 1em;
      }

      #action-holder {
        width: 100%;
      }

      .toggle-button {
        width: 100%;
      }

      .toggle-button::part(base) {
        background-color: #F2F3FB;
        border: 1px dashed #4F3FB6;
        border-radius: 5.5px;
      }

      .toggle-button::part(label) {
        color: #292C3A;
        font-size: 14px;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .form-row {
        display: flex;
        column-gap: 1em;
      }
      .long .form-field {
        width: 100%;
      }
      .multi {
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-template-rows: 1fr 1fr;
        gap: 10px;
        margin-top: -15px;
      }
      .multi .form-field {
        width: 100%;
      }
      .form-row h3 {
        font-size: 18px;
        margin: 0;
      }
      .sub {
        font-size: 18px;
        margin: 0;
        color: #757575;
      }
      .field-desc {
        font-size: 14px;
        margin: 0;
        color: #717171;
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

      .remove-file {
        position: absolute;
        top: 5px;
        right: 5px;
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

      wa-button::part(base):hover {
        background-color: rgba(79, 63, 182, 0.06);
        border-color: rgba(79, 63, 182, 0.46);
        color: rgb(79, 63, 182);
      }

      wa-button::part(base):focus {
        outline: 1px solid black;
      }

      .focus {
        color: #4f3fb6;
      }

      .confirm {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        background-color: #ffffff;
        border: 1px dashed #4f3fb67f;
        border-radius: 5.5px;
        gap: 10px;
        padding: 3.5px;
      }

      #class-actions {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        gap: 10px;
      }

      .confirm p {
        margin: 0;
        font-size: 14px;
        font-weight: 600;
      }

      .confirm wa-button::part(base){
        padding: 10px;
        height: 25px;
        border-color: #4f3fb6;
        background-color: #F2F3FB;
      }

      .confirm wa-button::part(base):hover{
        background-color: #dfe2f5;
      }

      .confirm wa-button::part(label){
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
      }

      #extra-step{
        display: flex;
        gap: 10px;
        align-items: center;
        width: 100%;
        justify-content: flex-start;
      }

      .arrow_link {
        margin: 0;
        border-bottom: 1px solid var(--primary-color);
        white-space: nowrap;
      }

      .arrow_anchor {
        text-decoration: none;
        font-size: var(--arrow-link-font-size);
        font-weight: bold;
        margin: 0px 0.5em 0px 0px;
        line-height: 1em;
        color: var(--primary-color);
        display: flex;
        column-gap: 10px;
        width: fit-content;
      }

      .arrow_anchor:visited {
        color: var(--primary-color);
      }

      .arrow_anchor:hover {
        cursor: pointer;
      }

      .arrow_anchor:hover img {
        animation: bounce 1s;
      }

      #add-new-file {
        width: fit-content
      }

      #add-new-file::part(base){
        padding: 15px 20px;
        height: 30px;
        border-color: #4f3fb6;
        background-color: #F2F3FB;
        min-width: 15%;
        width: fit-content;
      }

      #add-new-file::part(base):hover{
        background-color: #dfe2f5;
      }

      #add-new-file::part(label){
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        font-weight: 600;
        color: #4f3fb6;
      }

      .method wa-option::part(base){
        font-size: var(--body-font-size);
        color: #757575;
      }

      .method wa-option:focus-within::part(base) {
        color: #ffffff;
        background-color: #4F3FB6;
      }

      .method wa-option::part(base):hover{
        color: #ffffff;
        background-color: #4F3FB6;
      }

      .method::part(display-label){
        font-size: var(--body-font-size);
        color: #757575;
      }
        
      @keyframes bounce {
          0%,
          20%,
          50%,
          80%,
          100% {
            transform: translateY(0);
          }
          40% {
            transform: translateX(-5px);
          }
          60% {
            transform: translateX(5px);
          }
      }

      @media(max-width: 600px){
        .form-row {
           flex-direction: column;
        }
        .form-field {
          width: 100%;
        }

        .multi {
          display: flex;
        }

        .confirm {
          flex-direction: column;
          gap: 5px;
          padding: 10px;
        }
      }

      @media(max-width: 480px){

        wa-button::part(base) {
          --wa-button-font-size-medium: 12px;
        }
        
      }

    `;
