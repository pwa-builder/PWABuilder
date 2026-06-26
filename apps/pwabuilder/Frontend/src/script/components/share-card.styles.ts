import { css } from "lit";
import { smallBreakPoint } from '../utils/css/breakpoints';
export const shareCardStyles = css`
      .dialog::part(header){
        height: 0;
        min-height: 0;
        padding: 0;
        border: none;
      }
      .dialog::part(body){
        padding: 0;
        width: 100%;
        flex: 0 0 auto;
      }
      .dialog::part(title){
        display: none;
      }
      .dialog::part(dialog) {
        width: 460px;
        max-width: calc(100vw - 2em);
        height: fit-content;
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        border-radius: 10px;
        padding: 20px;
      }
      .dialog::part(close-button__base){
        position: absolute;
        padding: 0;
        top: 5px;
        right: 5px;
        z-index: 1000;
        color: #000000;
      }
      .dialog::part(close-button__base):focus-visible {
        outline: 2px solid #4f3fb6;
        outline-offset: 2px;
      }
      .dialog_header {
        height: 12px !important;
      }
      .share-modal-header {
        font-weight: 600;
        font-size: 16px;
        line-height: 22px;
        text-align: center;
        color: #292C3A;
      }
      #frame-wrapper {
        display: flex;
        flex-direction: column;
        width: 100%;
      }
      #frame-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
      }

      #canvas-holder {
        display: flex;
        align-items: center;
        justify-content: center;
      }

      #myCanvas {
        width: 413px;
        height: 322px;
        margin: 20px 0;
      }

      #share-actions {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        margin-bottom: 15px;
        gap: 10px;
        text-align: center;
      }
      .standard-button {
        padding: 12px 40px;
        white-space: nowrap;
        width: 80px;
        height: 45px;
        font-size: var(--button-font-size);
        font-weight: bold;
        border-radius: var(--button-border-radius);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 5px;
      }

      #share-button {
        padding: 12px 30px;
      }

      .standard-button-label {
        font-size: 14px;
        font-weight: bold;
        color: #292C3A;
      }

      .standard-button:hover {
        cursor: pointer;
        box-shadow: var(--button-box-shadow);
      }
      .standard-button:focus-visible {
        outline: 2px solid #4f3fb6;
        outline-offset: 2px;
      }
      .primary {
        background-color: var(--font-color);
        border-color: var(--font-color);
        color: var(--primary-color);
      }

      .secondary {
        border: 1px solid var(--primary-color);
        color: var(--primary-color);
        background-color: transparent;
      }

      .actions-icons {
        width: 25px;
        height: auto;
      }

      ${smallBreakPoint(css`

        #myCanvas {
          width: 313px;
          height: auto;
        }

        #share-actions {
          justify-content: space-evenly;
        }

        .standard-button {
          margin-bottom: 8px;
        }

      `)}
    `;