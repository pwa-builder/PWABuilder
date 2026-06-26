import { css } from "lit";

export const swSelectorStyles = css`

      wa-tab-group {
        --indicator-color: #4F3FB6;
      }
      wa-tab {
        display: flex;
      }
      wa-tab::part(base) {
        --wa-font-size-s: 14px;
        --wa-space-m: .75rem;
        --wa-space-l: 1rem;
        max-width: 190px;
        white-space: unset;
        text-align: center;
        align-self: flex-end;
      }
      wa-tab[active]::part(base) {
        color: #4F3FB6;
      }
      wa-tab::part(base):hover {
        color: #4F3FB6;
      }
      wa-tab::part(base):focus-visible{
        color: #4F3FB6;
        outline: 1px solid black;
      }
      wa-tab-panel::part(base){
        overflow-y: auto;
        overflow-x: hidden;
        height: 500px;
        padding: .5em 0;
      }
      #selector-header {
        display: flex;
        flex-direction: column;
        gap: .5em;
        padding-top: 1em;
      }
      #selector-header h1 {
        margin: 0;
        font-size: 24px;
      }
      #selector-header p {
        margin: 0;
        font-size: 14px;
      }
      .dialog {
        --footer-spacing: 0;
      }
      .dialog::part(body){
        padding-top: 0;
      }
      .dialog::part(title){
        display: none;
      }
      .dialog::part(overlay){
          backdrop-filter: blur(10px);
        }
      .dialog::part(panel) {
        position: relative;
        border-radius: var(--card-border-radius);
      }
      /* Collapse the header's footprint (no white gap) while keeping the
         floating default close button (X), which lives inside the header. */
      .dialog::part(header){
        height: 0;
        min-height: 0;
        padding: 0;
        border: none;
      }
      .dialog::part(close-button__base){
        position: absolute;
        top: 5px;
        right: 5px;
        z-index: 1000;
      }
      .dialog::part(close-button__base):focus-visible{
        outline: 1px solid black;
      }

      #frame-footer {
        background-color: #F2F3FB;
        padding: 1.5em 2em;
        border-bottom-left-radius: var(--card-border-radius);
        border-bottom-right-radius: var(--card-border-radius);
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .arrow_link {
        margin: 0;
        border-bottom: 1px solid #4F3FB6;
      }
      .arrow_anchor {
        text-decoration: none;
        font-size: 14px;
        font-weight: bold;
        margin: 0px 0.5em 0px 0px;
        line-height: 1em;
        color: rgb(79, 63, 182);
        display: flex;
        column-gap: 10px;
        white-space: nowrap;
        width: fit-content;
      }
      .arrow_anchor:visited {
        color: #4F3FB6;
      }
      .arrow_anchor:hover {
        cursor: pointer;
      }
      .arrow_anchor:hover img {
        animation: bounce 1s;
      }
      @keyframes bounce {
        0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
        }
        40% {
          transform: translateX(-5px);
        }
        60% {
            transform: translateX(5px);
        }
      }
      #footer-links {
        display: flex;
        flex-direction: column;
        row-gap: 1em;
        width: 50%;
      }
      #footer-links #instructions {
        font-size: 14px;
        color: #808080;
        text-align: left;
        margin: 0;
      }
      #footer-actions {
        display: flex;
        flex-direction: column;
        row-gap: .5em;
        align-items: center;
        width: 50%;
      }
      #footer-actions wa-checkbox::part(base){
        --wa-input-font-size-medium: 12px;
      }
      .primary {
        background: black;
        color: white;
        border: none;
        font-size: 16px;
        font-weight: bold;
        border-radius: 50px;
        padding: 1em 1em;
        width: 75%;
      }
      .primary:hover {
        cursor: pointer;
      }

      @media(max-width: 600px){  
        
        #frame-footer {
          flex-direction: column-reverse;
          gap: 1em;
        }
        #footer-actions {
          width: 100%;
        }
        #footer-links {
          width: 100%;
          align-items: center;
        }
        .primary {
          font-size: 14px;
          white-space: nowrap;
          width: 100%;
        }
      }
    `;
