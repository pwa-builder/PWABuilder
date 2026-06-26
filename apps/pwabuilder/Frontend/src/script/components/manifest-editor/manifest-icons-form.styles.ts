import { css } from "lit";

export const manifestIconsFormStyles = css`

    :host {
      --wa-input-font-family: Hind, sans-serif;
    }
    

      wa-checkbox::part(base),
      wa-checkbox::part(control),
      wa-button::part(base) {
        --wa-button-font-size-medium: 14px;
        --wa-input-font-size-medium: 16px;
        --wa-toggle-size: 16px;
      }
      #form-holder {
        display: flex;
        flex-direction: column;
        row-gap: 1em;
      }
      .form-field {
        width: 50%;
        row-gap: .25em;
        display: flex;
        flex-direction: column;
      }
      .form-field {
        display: flex;
        column-gap: 1em;
        width: 100%;
      }
      .form-field h3 {
        font-size: 18px;
        margin: 0;
      }
      .form-field p:not(.toolTip) {
        font-size: 14px;
        margin: 0;
        color: #717171;
      }

      .field-header{
        display: flex;
        align-items: center;
        justify-content: space-between;
        column-gap: 10px;
      }

      .header-left{
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
      #icon-section {
        display: flex;
        flex-direction: column;
        margin: 10px 0;
      }
      #input-file {
        display: none;
      }
      .icon {
        max-width: 115px;
      }
      .icon-gallery {
        display: flex;
        gap: 7px;
        flex-wrap: wrap;
      }
      .icon-box {
        display: flex;
        flex-direction: column;
      }
      .icon-box p {
        margin: 0 10px;
      }
      #icon-options {
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-template-rows: 1fr .25fr;
        place-items: center;
        gap: .5em;
      }

      #icon-options wa-button {
        grid-column: 2;
      }

      #selected-icon {
        max-width: 115px;
      }
      #platforms-to-generate {
        display: flex;
        flex-direction: column;
        row-gap: 5px;
      }
      .error {
        color: #292c3a;
      }

      wa-button::part(base):hover {
        background-color: rgba(79, 63, 182, 0.06);
        border-color: rgba(79, 63, 182, 0.46);
        color: rgb(79, 63, 182);
      }

      wa-checkbox[checked]::part(control) {
        background-color: #4f3fb6;
        border-color: #4f3fb6;
        color: #ffffff;
      }

      .focus {
        color: #4f3fb6;
      }

      .center_text {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 5px;
        font-size: 16px;
      }

      @media(max-width: 765px){
        wa-checkbox::part(base),
        wa-checkbox::part(control) {
          --wa-input-font-size-medium: 14px;
          --wa-toggle-size: 14px;
        }
      }

      @media(max-width: 600px){
        .icon {
            max-width: 90px;
        }

        #icon-options {
          grid-template-columns: .25fr 1fr;
        }

        #selected-icon {
          max-width: 90px;
        }
        
      }

      @media(max-width: 480px){

        wa-button::part(base) {
          --wa-button-font-size-medium: 12px;
        }

        .form-field p {
          font-size: 12px;
        }

        .form-field h3 {
          font-size: 16px;
        }

        #selected-icon {
          max-width: 70px;
        }

        .field-header a:after {
          content: "";
          position: absolute;
          left: -13px;
          top: -13px;
          z-index: -1;
          width: 40px;
          height: 40px;
        }
        
      }

    `;
