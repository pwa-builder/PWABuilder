import { css } from "lit";
import {
    smallBreakPoint,
    mediumBreakPoint,
    largeBreakPoint,
    xLargeBreakPoint,
    xxxLargeBreakPoint,
} from '../utils/css/breakpoints';

export const manifestEditorFrameStyles = css`
      * {
        box-sizing: border-box;
      }
      
      #frame-wrapper {
        display: flex;
        flex-direction: column;
        row-gap: .5em;
        width: 100%;
      }
      #frame-content {
        display: flex;
        flex-direction: column;
        row-gap: 1em;
        padding: 1.5em;
      }
      #frame-header {
        display: flex;
        flex-direction: column;
        row-gap: .5em;
      }
      #frame-header > * {
        margin: 0;
      }
      #frame-header h1 {
        font-size: 24px;
      }
      #frame-header p {
        font-size: 14px;
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

      #add-to-pack {
        white-space: nowrap;
      }

      .dialog {
        --footer-spacing: 0;
      }
      
      .dialog::part(body){
        padding: 0;
      }
      .dialog::part(title){
        display: none;
      }
      .dialog::part(panel) {
        position: relative;
        border-radius: var(--card-border-radius);
      }
      .dialog::part(overlay){
          backdrop-filter: blur(10px);
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

      @media(max-width: 480px){  
        #frame-header h1 {
          font-size: 22px;
        }
        #frame-header p {
          font-size: 12px;
        }
        .arrow_anchor {
          font-size: 12px;
        }
      }

      /* < 480px */
      ${smallBreakPoint(css`
          
      `)}
      /* 480px - 639px */
      ${mediumBreakPoint(css`
      `)}
      /* 640px - 1023px */
      ${largeBreakPoint(css`
      `)}
      /*1024px - 1365px*/
      ${xLargeBreakPoint(css`
      `)}
      /* > 1920 */
      ${xxxLargeBreakPoint(css`
          
      `)}
    `;
