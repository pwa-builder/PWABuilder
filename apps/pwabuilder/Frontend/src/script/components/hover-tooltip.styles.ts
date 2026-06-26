import { css } from "lit";
import { smallBreakPoint } from "../utils/css/breakpoints";

export const hoverTooltipStyles = css`
      .tooltip-dialog {
        position: absolute;
        margin: 0px;
        box-shadow: 0 0 5px gray;
        background-color: #000;
        opacity: 0;
        transform: translate(10px, 5px); /* shift it down and to the right a bit */
        transition: opacity 0.2s ease-in-out;
        visibility: collapse;
        border-radius: 0.25rem;
        z-index: 1000;
        width: max-content;
        max-width: 250px;
      }

      .tooltip-dialog.show {
        opacity: 1;
        pointer-events: auto;
        visibility: visible;
      }

      .tooltip-inner {
        position: relative;
        color: #fff;
        font-size: 14px;
        font-weight: normal;
        padding: 0px 15px 0px 15px;
        line-height: 21px;
      }

      ${smallBreakPoint(
        css`
          .tooltip-inner {
            max-width: 200px;
          }
        `
      )}

      a, a:hover, a:active {
        color: white;
        display: block;
        margin-bottom: 15px;
      }
    `;
